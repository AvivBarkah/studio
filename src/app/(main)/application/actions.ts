
'use server';

import { z } from 'zod';
import { ApplicationFormSchema, type ApplicationFormData, type DocumentUpload } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { reviewApplication, type ReviewApplicationOutput } from '@/ai/flows/review-application';
import { appendToSpreadsheet, type SheetRowData } from '@/services/google-sheets-service';

interface SubmitApplicationState {
  success: boolean;
  applicationId?: string;
  message: string;
  errors?: {
    personalDetails?: Partial<Record<keyof ApplicationFormData['personalDetails'], string>>;
    academicHistory?: Partial<Record<keyof ApplicationFormData['academicHistory'], string>>;
    parentGuardianInfo?: Partial<Record<keyof ApplicationFormData['parentGuardianInfo'], string>>;
    documents?: string;
  };
}

function generateApplicationId(): string {
  const prefix = "MG";
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${year}${randomSuffix}`;
}

export async function submitApplication(
  rawFormData: ApplicationFormData,
  documents: DocumentUpload[]
): Promise<SubmitApplicationState> {

  const validatedFields = ApplicationFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors: SubmitApplicationState['errors'] = {};
    validatedFields.error.errors.forEach(err => {
      const section = err.path[0] as keyof ApplicationFormData;
      const field = err.path[1] as string;
      if (section && field) {
        if (!fieldErrors[section]) fieldErrors[section] = {};
        (fieldErrors[section] as any)[field] = err.message;
      }
    });
    return {
      success: false,
      message: "Validasi gagal. Harap periksa kembali isian formulir Anda.",
      errors: fieldErrors,
    };
  }

  if (!documents || documents.length === 0) {
    return {
      success: false,
      message: "Minimal satu dokumen harus diunggah.",
      errors: { documents: "Minimal satu dokumen harus diunggah." }
    };
  }

  const applicationId = generateApplicationId();
  const submissionTime = new Date(); // For consistent timestamp across Firestore and Sheets

  const applicationDataForDb = {
    ...validatedFields.data,
    applicationId,
    status: "SUBMITTED" as const,
    submissionDate: serverTimestamp(), // Firestore server timestamp
    documents: documents.map(doc => ({ name: doc.name, type: doc.type, size: doc.size })),
  };

  try {
    await setDoc(doc(db, "applications", applicationId), applicationDataForDb);

    const formDataForAI = {
      ...validatedFields.data.personalDetails,
      ...validatedFields.data.academicHistory,
      ...validatedFields.data.parentGuardianInfo,
    };
    const documentDataUrisForAI = documents.map(d => d.dataUrl).filter(Boolean) as string[];

    let aiReviewResult: ReviewApplicationOutput | null = null;
    try {
      aiReviewResult = await reviewApplication({
        formData: formDataForAI,
        documentDataUris: documentDataUrisForAI,
      });
      console.log("AI Review Result for", applicationId, ":", aiReviewResult);
      await setDoc(doc(db, "applications", applicationId), { 
        aiReviewNotes: JSON.stringify(aiReviewResult)
      }, { merge: true });
    } catch (aiError) {
      console.error("AI Review Error for", applicationId, ":", aiError);
      // Continue without AI review if it fails
      await setDoc(doc(db, "applications", applicationId), { 
        aiReviewNotes: JSON.stringify({ error: "AI review failed", details: (aiError as Error).message })
      }, { merge: true });
    }
    
    // Prepare data for Google Sheets
    const sheetData: SheetRowData = {
      applicationId,
      submissionTimestamp: submissionTime.toISOString(),
      personalDetails: validatedFields.data.personalDetails,
      academicHistory: validatedFields.data.academicHistory,
      parentGuardianInfo: validatedFields.data.parentGuardianInfo,
      applicationStatus: "SUBMITTED",
      aiReviewSummary: aiReviewResult?.summary,
      aiNeedsHumanAttention: aiReviewResult?.needsHumanAttention,
    };

    // Asynchronously append to Google Sheets, don't block submission if this fails
    appendToSpreadsheet(sheetData).catch(sheetError => {
      console.error("Error appending to Google Sheets (non-blocking):", sheetError);
    });
    
    return { success: true, applicationId, message: "Pendaftaran berhasil!" };

  } catch (error) {
    console.error("Error submitting application:", applicationId, error);
    return { success: false, message: "Gagal mengirim pendaftaran. Silakan coba lagi." };
  }
}
