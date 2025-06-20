'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy } from "lucide-react";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function ApplicationSuccessPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationId).then(() => {
      toast({ title: "ID Pendaftaran Disalin!", description: "ID telah berhasil disalin ke clipboard." });
    }).catch(err => {
      console.error('Gagal menyalin ID: ', err);
      toast({ title: "Gagal Menyalin", description: "Tidak dapat menyalin ID ke clipboard.", variant: "destructive" });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-lg text-center shadow-xl p-6 md:p-8">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-4 w-fit mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary font-headline">Pendaftaran Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-lg mb-2">
            Terima kasih, pendaftaran Anda telah berhasil kami terima.
          </CardDescription>
          <p className="text-base text-foreground/90">Nomor Pendaftaran Anda adalah:</p>
          <div className="flex items-center justify-center space-x-2 bg-primary/10 p-3 rounded-md">
            <p className="text-2xl font-bold text-primary font-mono tracking-wider" aria-live="polite" aria-atomic="true">
              {applicationId}
            </p>
            <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Salin Nomor Pendaftaran">
              <Copy className="h-5 w-5 text-primary hover:text-primary/80" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Harap simpan Nomor Pendaftaran ini baik-baik. Anda akan membutuhkannya untuk mengecek status pendaftaran.
          </p>
        </CardContent>
        <CardContent className="mt-6 space-y-3">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-transition">
                <Link href="/status">Cek Status Pendaftaran</Link>
            </Button>
            <Button variant="outline" asChild className="w-full btn-transition">
                <Link href="/">Kembali ke Beranda</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
