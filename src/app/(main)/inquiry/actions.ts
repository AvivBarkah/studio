'use server';

import { z } from 'zod';
import { InquiryFormSchema, type InquiryFormData } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SubmitInquiryState {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof InquiryFormData, string>>;
}

export async function submitInquiry(
  prevState: SubmitInquiryState | null,
  formData: FormData
): Promise<SubmitInquiryState> {
  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = InquiryFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors: Partial<Record<keyof InquiryFormData, string>> = {};
    validatedFields.error.errors.forEach(err => {
      if (err.path[0]) {
        fieldErrors[err.path[0] as keyof InquiryFormData] = err.message;
      }
    });
    return {
      success: false,
      message: "Validasi gagal. Harap periksa kembali isian Anda.",
      errors: fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, "inquiries"), {
      ...validatedFields.data,
      submissionDate: serverTimestamp(),
    });
    return { success: true, message: "Pesan berhasil dikirim!" };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return { success: false, message: "Gagal mengirim pesan. Silakan coba lagi." };
  }
}
