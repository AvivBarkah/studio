import { InquiryForm } from "@/components/inquiry-form";
import { MailQuestion } from "lucide-react";

export default function InquiryPage() {
  return (
    <div className="py-8">
      <div className="flex flex-col items-center mb-8">
        <MailQuestion className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-headline">Formulir Pertanyaan</h1>
        <p className="text-lg text-foreground/80 text-center max-w-xl">
          Kami siap membantu menjawab pertanyaan Anda seputar proses pendaftaran atau informasi lainnya terkait madrasah kami.
        </p>
      </div>
      <InquiryForm />
    </div>
  );
}
