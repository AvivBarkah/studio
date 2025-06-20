
'use server';

import { z } from 'zod';
import { ApplicationFormSchema, type ApplicationFormData } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { reviewApplication, type ReviewApplicationOutput, type ReviewApplicationInput } from '@/ai/flows/review-application';
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
      if (section && field && typeof section === 'string') {
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

    const { personalDetails, academicHistory, parentGuardianInfo } = validatedFields.data;

    const formDataForAI: ReviewApplicationInput['formData'] = {
      fullName: personalDetails.fullName,
      nisn: personalDetails.nisn || undefined,
      gender: personalDetails.gender,
      birthPlace: personalDetails.birthPlace,
      birthDate: personalDetails.birthDate.toISOString(), // Ensure birthDate is ISO string
      address: personalDetails.address,
      phoneNumber: personalDetails.phoneNumber || undefined,
      previousSchool: academicHistory.previousSchool,
      graduationYear: academicHistory.graduationYear,
      averageScore: academicHistory.averageScore,
      fatherName: parentGuardianInfo.fatherName,
      fatherOccupation: parentGuardianInfo.fatherOccupation || undefined,
      motherName: parentGuardianInfo.motherName,
      motherOccupation: parentGuardianInfo.motherOccupation || undefined,
      guardianName: parentGuardianInfo.guardianName || undefined,
      guardianOccupation: parentGuardianInfo.guardianOccupation || undefined,
      parentPhoneNumber: parentGuardianInfo.parentPhoneNumber,
    };

    let aiOutcomeForSheet: { summary?: string; needsHumanAttention?: boolean; errorDetails?: string } = {
        summary: "AI Review Not Performed", // Default if something unexpected happens before assignment
        needsHumanAttention: true,
    };

    try {
      const reviewResult = await reviewApplication({
        formData: formDataForAI,
      });
      console.log("AI Review Result for", applicationId, ":", reviewResult);
      await setDoc(doc(db, "applications", applicationId), {
        aiReviewNotes: JSON.stringify(reviewResult)
      }, { merge: true });

      aiOutcomeForSheet = {
        summary: reviewResult.summary,
        needsHumanAttention: reviewResult.needsHumanAttention,
      };

    } catch (aiError) {
      let errorMessage = "AI review encountered an issue.";
      if (aiError instanceof Error) {
        errorMessage = `AI review failed: ${aiError.message}`;
      } else if (typeof aiError === 'string') {
        errorMessage = `AI review failed: ${aiError}`;
      } else {
        errorMessage = "AI review failed with a non-standard error object.";
      }
      console.error("AI Review Error for", applicationId, ":", aiError);

      const aiReviewNotesContent = { error: "AI review failed", details: errorMessage };
      try {
        await setDoc(doc(db, "applications", applicationId), {
          aiReviewNotes: JSON.stringify(aiReviewNotesContent)
        }, { merge: true });
      } catch (dbError) {
        console.error("Failed to save AI error notes to DB for", applicationId, ":", dbError);
      }

      aiOutcomeForSheet = {
        summary: "AI Review Failed",
        needsHumanAttention: true,
        errorDetails: errorMessage,
      };
    }

    const sheetData: SheetRowData = {
      applicationId,
      submissionTimestamp: submissionTime.toISOString(),
      personalDetails: validatedFields.data.personalDetails,
      academicHistory: validatedFields.data.academicHistory,
      parentGuardianInfo: validatedFields.data.parentGuardianInfo,
      applicationStatus: "SUBMITTED",
      aiReviewSummary: aiOutcomeForSheet.summary,
      aiNeedsHumanAttention: aiOutcomeForSheet.needsHumanAttention,
      // If you add an 'aiErrorDetails' column to your SheetRowData and Sheet:
      // aiErrorDetails: aiOutcomeForSheet.errorDetails,
    };

    appendToSpreadsheet(sheetData).catch(sheetError => {
      console.error("Error appending to Google Sheets (non-blocking):", sheetError);
    });

    return { success: true, applicationId, message: "Pendaftaran berhasil!" };

  } catch (error) {
    console.error("Error submitting application:", applicationId, error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, message: `Gagal mengirim pendaftaran: ${errorMessage}. Silakan coba lagi.` };
  }
}
