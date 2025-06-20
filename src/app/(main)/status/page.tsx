import { StatusChecker } from "@/components/status-checker";
import { ClipboardList } from "lucide-react";

export default function StatusPage() {
  return (
    <div className="py-8">
       <div className="flex flex-col items-center mb-8">
        <ClipboardList className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-headline">Status Aplikasi Pendaftaran</h1>
        <p className="text-lg text-foreground/80 text-center max-w-xl">
          Pantau perkembangan proses pendaftaran Anda dengan mudah dan cepat.
        </p>
      </div>
      <StatusChecker />
    </div>
  );
}
