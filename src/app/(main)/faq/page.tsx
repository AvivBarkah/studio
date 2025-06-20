import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Apa saja persyaratan pendaftaran?",
    answer:
      "Persyaratan umum meliputi pengisian formulir dengan data yang valid seperti data diri, riwayat pendidikan, dan informasi orang tua/wali. Detail persyaratan dapat dilihat pada halaman informasi pendaftaran atau brosur kami.",
  },
  {
    question: "Kapan periode pendaftaran dibuka dan ditutup?",
    answer:
      "Periode pendaftaran biasanya dibuka pada bulan Mei hingga Juli setiap tahunnya. Untuk tanggal pastinya, silakan periksa pengumuman resmi di website kami atau hubungi panitia PPDB.",
  },
  {
    question: "Bagaimana cara mengetahui status pendaftaran saya?",
    answer:
      "Anda dapat mengecek status pendaftaran secara online melalui menu 'Cek Status' di portal ini dengan memasukkan Nomor Pendaftaran unik yang Anda terima setelah berhasil melakukan pendaftaran.",
  },
  {
    question: "Apakah ada tes masuk?",
    answer:
      "Ya, terdapat serangkaian tes seleksi yang meliputi tes akademik dasar, tes baca Al-Qur'an, dan wawancara. Jadwal dan materi tes akan diinformasikan lebih lanjut setelah pendaftaran.",
  },
  {
    question: "Berapa biaya pendaftaran dan biaya pendidikan?",
    answer:
      "Informasi mengenai biaya pendaftaran dan rincian biaya pendidikan dapat diperoleh langsung dari panitia PPDB atau melalui brosur resmi yang tersedia.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="items-center">
          <HelpCircle className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-center font-headline">Pertanyaan Umum (FAQ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left hover:no-underline text-base md:text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-foreground/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
