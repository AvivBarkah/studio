import { z } from 'zod';

export const PersonalDetailsSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nisn: z.string().length(10, "NISN harus 10 digit").optional().or(z.literal('')),
  gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Jenis kelamin harus dipilih" }),
  birthPlace: z.string().min(1, "Tempat lahir harus diisi"),
  birthDate: z.date({ required_error: "Tanggal lahir harus diisi" }),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit").optional().or(z.literal('')),
});

export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>;

export const AcademicHistorySchema = z.object({
  previousSchool: z.string().min(3, "Asal sekolah minimal 3 karakter"),
  graduationYear: z.number().min(2000, "Tahun lulus minimal 2000").max(new Date().getFullYear() + 1, `Tahun lulus maksimal ${new Date().getFullYear() + 1}`),
  averageScore: z.number().min(0).max(100).optional(),
});

export type AcademicHistory = z.infer<typeof AcademicHistorySchema>;

export const ParentGuardianInfoSchema = z.object({
  fatherName: z.string().min(3, "Nama Ayah minimal 3 karakter"),
  fatherOccupation: z.string().optional(),
  motherName: z.string().min(3, "Nama Ibu minimal 3 karakter"),
  motherOccupation: z.string().optional(),
  guardianName: z.string().optional(),
  guardianOccupation: z.string().optional(),
  parentPhoneNumber: z.string().min(10, "Nomor telepon orang tua/wali minimal 10 digit"),
});

export type ParentGuardianInfo = z.infer<typeof ParentGuardianInfoSchema>;

export const ApplicationFormSchema = z.object({
  personalDetails: PersonalDetailsSchema,
  academicHistory: AcademicHistorySchema,
  parentGuardianInfo: ParentGuardianInfoSchema,
});

export type ApplicationFormData = z.infer<typeof ApplicationFormSchema>;

export type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "ADDITIONAL_INFO_REQUIRED" | "ACCEPTED" | "REJECTED" | "UNKNOWN";

export interface ApplicationData extends ApplicationFormData {
  applicationId: string;
  status: ApplicationStatus;
  submissionDate: Date;
  aiReviewNotes?: string;
}

export const InquiryFormSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

export type InquiryFormData = z.infer<typeof InquiryFormSchema>;
