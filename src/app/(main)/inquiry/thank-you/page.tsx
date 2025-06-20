import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function InquiryThankYouPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center shadow-lg p-6">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary font-headline">Pesan Terkirim!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg mb-6">
            Terima kasih telah menghubungi kami. Pertanyaan Anda telah berhasil dikirim. Kami akan segera merespons Anda melalui email.
          </CardDescription>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground btn-transition">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
