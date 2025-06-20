'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitInquiry } from '@/app/(main)/inquiry/actions';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = { success: false, message: "", errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-transition">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Kirim Pertanyaan
    </Button>
  );
}

export function InquiryForm() {
  const [state, formAction] = useFormState(submitInquiry, initialState);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Sukses!",
        description: state.message,
      });
      router.push('/inquiry/thank-you');
    } else if (state && state.message && !state.success && !state.errors) {
       toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, router, toast]);

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-headline">Hubungi Kami</CardTitle>
        <CardDescription className="text-center">
          Ada pertanyaan? Jangan ragu untuk mengirimkan pesan kepada kami.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" placeholder="Masukkan nama lengkap Anda" required />
            {state?.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" name="email" type="email" placeholder="Masukkan alamat email Anda" required />
            {state?.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="message">Pesan Anda</Label>
            <Textarea id="message" name="message" placeholder="Tuliskan pertanyaan atau pesan Anda di sini" rows={5} required />
            {state?.errors?.message && <p className="text-sm text-destructive mt-1">{state.errors.message}</p>}
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
