import { ApplicationForm } from "@/components/application-form";
import { FileEdit } from "lucide-react";

export default function ApplicationPage() {
  return (
    <div className="py-8">
       <div className="flex flex-col items-center mb-8">
        <FileEdit className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-headline">Formulir Pendaftaran Online</h1>
        <p className="text-lg text-foreground/80 text-center max-w-xl">
          Silakan isi formulir di bawah ini dengan data yang benar dan lengkap. Pastikan semua dokumen yang diperlukan telah disiapkan.
        </p>
      </div>
      <ApplicationForm />
    </div>
  );
}
