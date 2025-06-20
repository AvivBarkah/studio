
'use server';

import { z } from 'zod';
import { ApplicationFormSchema, type ApplicationFormData } from '@/types';
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
  };
}

function generateApplicationId(): string {
  const prefix = "MG";
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${year}${randomSuffix}`;
}

export async function submitApplication(
  rawFormData: ApplicationFormData
): Promise<SubmitApplicationState> {

  const validatedFields = ApplicationFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors: SubmitApplicationState['errors'] = {};
    validatedFields.error.errors.forEach(err => {
      const section = err.path[0] as keyof ApplicationFormData;
      const field = err.path[1] as string;
      if (section && field && typeof section === 'string') { // ensure section is a string key
        if (!fieldErrors[section as keyof SubmitApplicationState['errors']]) {
             (fieldErrors[section as keyof SubmitApplicationState['errors']] as any) = {};
        }
        ((fieldErrors[section as keyof SubmitApplicationState['errors']] as any)!)[field] = err.message;
      }
    });
    return {
      success: false,
      message: "Validasi gagal. Harap periksa kembali isian formulir Anda.",
      errors: fieldErrors,
    };
  }

  const applicationId = generateApplicationId();
  const submissionTime = new Date(); 

  const applicationDataForDb = {
    ...validatedFields.data,
    applicationId,
    status: "SUBMITTED" as const,
    submissionDate: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, "applications", applicationId), applicationDataForDb);

    const formDataForAI = {
      ...validatedFields.data.personalDetails,
      ...validatedFields.data.academicHistory,
      ...validatedFields.data.parentGuardianInfo,
    };
    
    let aiReviewResult: ReviewApplicationOutput | null = null;
    try {
      aiReviewResult = await reviewApplication({
        formData: formDataForAI,
      });
      console.log("AI Review Result for", applicationId, ":", aiReviewResult);
      await setDoc(doc(db, "applications", applicationId), { 
        aiReviewNotes: JSON.stringify(aiReviewResult)
      }, { merge: true });
    } catch (aiError) {
      console.error("AI Review Error for", applicationId, ":", aiError);
      await setDoc(doc(db, "applications", applicationId), { 
        aiReviewNotes: JSON.stringify({ error: "AI review failed", details: (aiError as Error).message })
      }, { merge: true });
    }
    
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

    appendToSpreadsheet(sheetData).catch(sheetError => {
      console.error("Error appending to Google Sheets (non-blocking):", sheetError);
    });
    
    return { success: true, applicationId, message: "Pendaftaran berhasil!" };

  } catch (error) {
    console.error("Error submitting application:", applicationId, error);
    return { success: false, message: "Gagal mengirim pendaftaran. Silakan coba lagi." };
  }
}
