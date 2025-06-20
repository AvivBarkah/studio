import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ListChecks, HelpCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline">
            Selamat Datang di Madrasah Gateway
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Portal Pendaftaran Peserta Didik Baru (PPDB) Online. Mulai perjalanan pendidikan berkualitas bersama kami.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground btn-transition shadow-md">
              <Link href="/application">
                Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="btn-transition shadow-md">
              <Link href="/faq">
                Pelajari Lebih Lanjut
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-10 font-headline">Proses Pendaftaran Mudah</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center card-hover-effect">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="font-headline text-xl">Isi Formulir</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Lengkapi formulir pendaftaran online dengan data diri siswa dan orang tua/wali.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center card-hover-effect">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
              </div>
              <CardTitle className="font-headline text-xl">Unggah Dokumen</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Unggah dokumen persyaratan seperti akta kelahiran, kartu keluarga, dan ijazah terakhir.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center card-hover-effect">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                <ListChecks className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="font-headline text-xl">Pantau Status</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cek status pendaftaran Anda secara real-time melalui portal kami.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 bg-background rounded-lg shadow">
         <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6 font-headline">Kenapa Memilih Madrasah Kami?</h2>
            <ul className="space-y-4 text-foreground/90">
              <li className="flex items-start">
                <CheckIcon className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                <span>Kurikulum terpadu yang menggabungkan ilmu agama dan umum secara seimbang.</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                <span>Lingkungan belajar yang islami, aman, dan mendukung perkembangan karakter siswa.</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                <span>Fasilitas lengkap dan tenaga pendidik profesional serta berpengalaman.</span>
              </li>
               <li className="flex items-start">
                <CheckIcon className="h-6 w-6 text-accent mr-3 mt-1 shrink-0" />
                <span>Program ekstrakurikuler beragam untuk mengembangkan minat dan bakat siswa.</span>
              </li>
            </ul>
            <Button asChild className="mt-8 btn-transition bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/faq">
                Tanya Jawab Umum <HelpCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Madrasah Building" 
              width={600} 
              height={400} 
              className="rounded-lg shadow-lg object-cover"
              data-ai-hint="school building" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
