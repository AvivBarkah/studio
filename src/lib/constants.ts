export const APPLICATION_STATUSES = {
  SUBMITTED: { text: "Terkirim", color: "bg-blue-500" },
  UNDER_REVIEW: { text: "Dalam Peninjauan", color: "bg-yellow-500" },
  ADDITIONAL_INFO_REQUIRED: { text: "Membutuhkan Info Tambahan", color: "bg-orange-500" },
  ACCEPTED: { text: "Diterima", color: "bg-green-500" },
  REJECTED: { text: "Ditolak", color: "bg-red-500" },
  UNKNOWN: { text: "Tidak Diketahui", color: "bg-gray-500" },
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
