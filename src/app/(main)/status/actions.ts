'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { ApplicationData, ApplicationStatus } from '@/types';

interface FetchStatusState {
  status?: ApplicationStatus;
  applicantName?: string;
  submissionDate?: string;
  message: string;
  error?: boolean;
}

export async function fetchApplicationStatus(applicationId: string): Promise<FetchStatusState> {
  if (!applicationId || applicationId.trim() === "") {
    return { message: "ID Aplikasi tidak boleh kosong.", error: true };
  }

  try {
    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, where("applicationId", "==", applicationId.trim()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { message: `Aplikasi dengan ID "${applicationId}" tidak ditemukan.`, error: true };
    }

    const applicationDoc = querySnapshot.docs[0];
    const data = applicationDoc.data() as ApplicationData;

    // Convert Firestore Timestamp to string if necessary
    let submissionDateString = 'N/A';
    if (data.submissionDate) {
      if (typeof data.submissionDate === 'string') {
         submissionDateString = new Date(data.submissionDate).toLocaleDateString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      } else if (data.submissionDate.toDate) { // Firestore Timestamp object
        submissionDateString = data.submissionDate.toDate().toLocaleDateString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      }
    }


    return {
      status: data.status,
      applicantName: data.personalDetails.fullName,
      submissionDate: submissionDateString,
      message: "Status aplikasi berhasil diambil.",
    };

  } catch (error) {
    console.error("Error fetching application status:", error);
    return { message: "Terjadi kesalahan saat mengambil status aplikasi. Silakan coba lagi.", error: true };
  }
}
