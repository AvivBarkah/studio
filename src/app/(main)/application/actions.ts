'use server';

import { z } from 'zod';
import { ApplicationFormSchema, type ApplicationFormData, type DocumentUpload } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { reviewApplication } from '@/ai/flows/review-application'; // Assuming path is correct

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

// Helper to generate a unique application ID
function generateApplicationId(): string {
  const prefix = "MG"; // Madrasah Gateway
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
  const applicationDataForDb = {
    ...validatedFields.data,
    applicationId,
    status: "SUBMITTED" as const,
    submissionDate: serverTimestamp(),
    documents: documents.map(doc => ({ name: doc.name, type: doc.type, size: doc.size })),
  };

  try {
    // Store application in Firestore
    await setDoc(doc(db, "applications", applicationId), applicationDataForDb);

    // Prepare data for AI review
    const formDataForAI = {
      // Pass relevant parts of the form for AI review
      // This should match what the AI expects as `formData`
      ...validatedFields.data.personalDetails,
      ...validatedFields.data.academicHistory,
      ...validatedFields.data.parentGuardianInfo,
      // You might want to flatten or select specific fields for the AI
    };
    const documentDataUrisForAI = documents.map(d => d.dataUrl).filter(Boolean) as string[];

    // Call AI flow
    // Note: The AI flow's output structure might need to be handled (e.g., storing review notes)
    // For now, we'll just log the result or store a summary.
    // The prompt says "advises a human administrator", so the AI result primarily goes to admin view.
    // We can store a summary note in the application document.
    const aiReviewResult = await reviewApplication({
      formData: formDataForAI,
      documentDataUris: documentDataUrisForAI,
    });

    // Example: Storing a summary of AI review (actual structure depends on aiReviewResult)
    // This part would typically update the document or store AI notes for admin.
    // For simplicity, we'll assume aiReviewResult has a 'summary' or 'notes' field.
    if (aiReviewResult) {
      // This is a placeholder for how you might update the document with AI feedback.
      // In a real scenario, you'd update the Firestore document with these notes.
      // For example:
      // await updateDoc(doc(db, "applications", applicationId), {
      //   aiReviewNotes: aiReviewResult.summary || "AI review completed.",
      //   status: aiReviewResult.needsAttention ? "ADDITIONAL_INFO_REQUIRED" : "UNDER_REVIEW"
      // });
      console.log("AI Review Result:", aiReviewResult);
       // For now, just add a note that AI review happened.
       // A real app would integrate this more deeply, possibly changing status.
       await setDoc(doc(db, "applications", applicationId), { 
         aiReviewNotes: JSON.stringify(aiReviewResult) // Storing full AI result as string for now
       }, { merge: true });
    }
    
    return { success: true, applicationId, message: "Pendaftaran berhasil!" };

  } catch (error) {
    console.error("Error submitting application:", error);
    // TODO: More specific error handling (e.g., AI flow error vs. Firestore error)
    return { success: false, message: "Gagal mengirim pendaftaran. Silakan coba lagi." };
  }
}
