
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { ApplicationFormSchema, PersonalDetailsSchema, AcademicHistorySchema, ParentGuardianInfoSchema, type ApplicationFormData, type DocumentUpload } from '@/types';
import { submitApplication } from '@/app/(main)/application/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, User, BookOpen, Users, UploadCloud, FileText, Trash2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from '@/lib/constants';

const steps = [
  { id: 'personal', name: 'Data Pribadi', icon: User, schema: PersonalDetailsSchema },
  { id: 'academic', name: 'Riwayat Akademik', icon: BookOpen, schema: AcademicHistorySchema },
  { id: 'parent', name: 'Data Orang Tua/Wali', icon: Users, schema: ParentGuardianInfoSchema },
  { id: 'documents', name: 'Unggah Dokumen', icon: UploadCloud },
];

function PersonalDetailsForm() {
  const { control, formState: { errors } } = useFormContext<ApplicationFormData>();
  return (
    <div className="space-y-4">
      <FormFieldRHF name="personalDetails.fullName" label="Nama Lengkap (Sesuai Ijazah)" control={control} render={({ field }) => <Input placeholder="Nama Lengkap" {...field} />} />
      <FormFieldRHF name="personalDetails.nisn" label="NISN (Nomor Induk Siswa Nasional)" control={control} render={({ field }) => <Input placeholder="NISN (10 digit)" {...field} />} />
      <FormFieldRHF
        name="personalDetails.gender"
        label="Jenis Kelamin"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
              <SelectItem value="Perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldRHF name="personalDetails.birthPlace" label="Tempat Lahir" control={control} render={({ field }) => <Input placeholder="Tempat Lahir" {...field} />} />
        <FormFieldRHF
          name="personalDetails.birthDate"
          label="Tanggal Lahir"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date > new Date() || date < new Date("1900-01-01")} />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
      <FormFieldRHF name="personalDetails.address" label="Alamat Lengkap (Sesuai KK)" control={control} render={({ field }) => <Input placeholder="Alamat Lengkap" {...field} />} />
      <FormFieldRHF name="personalDetails.phoneNumber" label="Nomor Telepon Siswa (Aktif WhatsApp)" control={control} render={({ field }) => <Input type="tel" placeholder="08xxxxxxxxxx" {...field} />} />
    </div>
  );
}

function AcademicHistoryForm() {
  const { control, formState: { errors } } = useFormContext<ApplicationFormData>();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i + 1);

  return (
    <div className="space-y-4">
      <FormFieldRHF name="academicHistory.previousSchool" label="Asal Sekolah (SMP/MTs Sederajat)" control={control} render={({ field }) => <Input placeholder="Nama Sekolah Sebelumnya" {...field} />} />
      <FormFieldRHF
        name="academicHistory.graduationYear"
        label="Tahun Lulus"
        control={control}
        render={({ field }) => (
          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
            <SelectTrigger><SelectValue placeholder="Pilih Tahun Lulus" /></SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />
      <FormFieldRHF name="academicHistory.averageScore" label="Nilai Rata-rata Rapor Terakhir (Opsional)" control={control} render={({ field }) => <Input type="number" placeholder="Misal: 85.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />} />
    </div>
  );
}

function ParentGuardianInfoForm() {
  const { control, formState: { errors } } = useFormContext<ApplicationFormData>();
  return (
    <div className="space-y-4">
      <FormFieldRHF name="parentGuardianInfo.fatherName" label="Nama Ayah" control={control} render={({ field }) => <Input placeholder="Nama Ayah" {...field} />} />
      <FormFieldRHF name="parentGuardianInfo.fatherOccupation" label="Pekerjaan Ayah (Opsional)" control={control} render={({ field }) => <Input placeholder="Pekerjaan Ayah" {...field} />} />
      <FormFieldRHF name="parentGuardianInfo.motherName" label="Nama Ibu" control={control} render={({ field }) => <Input placeholder="Nama Ibu" {...field} />} />
      <FormFieldRHF name="parentGuardianInfo.motherOccupation" label="Pekerjaan Ibu (Opsional)" control={control} render={({ field }) => <Input placeholder="Pekerjaan Ibu" {...field} />} />
      <FormFieldRHF name="parentGuardianInfo.guardianName" label="Nama Wali (Jika ada, Opsional)" control={control} render={({ field }) => <Input placeholder="Nama Wali" {...field} />} />
      <FormFieldRHF name="parentGuardianInfo.guardianOccupation" label="Pekerjaan Wali (Jika ada, Opsional)" control={control} render={({ field }) => <Input placeholder="Pekerjaan Wali" {...field} />} />
      <FormFieldRHF name="parentGuardianInfo.parentPhoneNumber" label="Nomor Telepon Orang Tua/Wali (Aktif WhatsApp)" control={control} render={({ field }) => <Input type="tel" placeholder="08xxxxxxxxxx" {...field} />} />
    </div>
  );
}

function DocumentUploadForm({ documents, setDocuments }: { documents: DocumentUpload[], setDocuments: React.Dispatch<React.SetStateAction<DocumentUpload[]>> }) {
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newUploads: DocumentUpload[] = [];
      const filePromises: Promise<void>[] = [];

      filesArray.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          toast({ title: "File Terlalu Besar", description: `File "${file.name}" melebihi batas ${MAX_FILE_SIZE / (1024 * 1024)}MB.`, variant: "destructive" });
          return;
        }
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast({ title: "Format File Tidak Didukung", description: `Format file "${file.name}" tidak didukung.`, variant: "destructive" });
          return;
        }

        const promise = new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newUploads.push({
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: reader.result as string,
            });
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        filePromises.push(promise);
      });
      
      Promise.all(filePromises).then(() => {
         setDocuments(prev => [...prev, ...newUploads]);
      }).catch(error => {
        console.error("Error reading files:", error);
        toast({ title: "Error Membaca File", description: "Terjadi kesalahan saat memproses file.", variant: "destructive" });
      });
      event.target.value = ""; // Reset file input
    }
  };

  const removeFile = (fileName: string) => {
    setDocuments(prev => prev.filter(doc => doc.name !== fileName));
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border-dashed border-2 border-primary/50 rounded-lg text-center bg-primary/5 hover:bg-primary/10 transition-colors">
        <Label htmlFor="file-upload" className="cursor-pointer">
          <UploadCloud className="mx-auto h-12 w-12 text-primary mb-2" />
          <p className="font-semibold text-primary">Klik untuk memilih file atau tarik file ke sini</p>
          <p className="text-xs text-muted-foreground">Format: PDF, JPG, PNG. Maksimal 5MB per file.</p>
        </Label>
        <Input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" accept={ACCEPTED_FILE_TYPES.join(",")} />
      </div>
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Dokumen Terunggah:</h4>
          <ul className="space-y-2">
            {documents.map((doc, index) => (
              <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-card">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm">{doc.name} ({(doc.size / (1024)).toFixed(1)} KB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(doc.name)} aria-label={`Hapus ${doc.name}`}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
       {documents.length === 0 && <p className="text-sm text-destructive text-center mt-2">Minimal unggah satu dokumen (misal: Akta Kelahiran, Kartu Keluarga, Ijazah).</p>}
    </div>
  );
}

function FormFieldRHF<T extends ApplicationFormData>({ name, label, control, render }: { name: any, label: string, control: any, render: (props: { field: any }) => JSX.Element }) {
  const { formState: { errors } } = useFormContext<T>();
  const errorPath = name.split('.');
  let error = errors;
  for (const path of errorPath) {
    error = error?.[path];
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={name} className={error ? "text-destructive" : ""}>{label}</Label>
      <Controller name={name} control={control} render={render} />
      {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
    </div>
  );
}

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      personalDetails: {
        fullName: '',
        nisn: '',
        // gender is a select, handled by its default
        birthPlace: '',
        // birthDate is a calendar, handled by its default
        address: '',
        phoneNumber: '',
      },
      academicHistory: {
        previousSchool: '',
        // graduationYear is a select
        averageScore: '' as any, // Initialize as empty string for controlled input, parseFloat will handle conversion
      },
      parentGuardianInfo: {
        fatherName: '',
        fatherOccupation: '',
        motherName: '',
        motherOccupation: '',
        guardianName: '',
        guardianOccupation: '',
        parentPhoneNumber: '',
      },
    },
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleNext = async () => {
    let isValid = true;
    if (steps[currentStep].schema) {
      isValid = await trigger(steps[currentStep].id as keyof ApplicationFormData);
    } else if (steps[currentStep].id === 'documents' && documents.length === 0) {
       toast({ title: "Dokumen Kosong", description: "Harap unggah minimal satu dokumen.", variant: "destructive" });
       isValid = false;
    }

    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    if (documents.length === 0) {
        toast({ title: "Dokumen Kosong", description: "Harap unggah minimal satu dokumen sebelum submit.", variant: "destructive" });
        setIsSubmitting(false);
        setCurrentStep(steps.findIndex(s => s.id === 'documents')); // Go to document step
        return;
    }
    
    const result = await submitApplication(data, documents);
    setIsSubmitting(false);

    if (result.success && result.applicationId) {
      toast({ title: "Pendaftaran Berhasil!", description: `ID Pendaftaran Anda: ${result.applicationId}. Harap simpan ID ini.` });
      router.push(`/application/success/${result.applicationId}`);
    } else {
      toast({ title: "Pendaftaran Gagal", description: result.message, variant: "destructive" });
      // Handle showing specific field errors from result.errors if necessary
      if (result.errors) {
        // This part can be enhanced to set form errors using methods.setError
        console.error("Validation errors from server:", result.errors);
      }
    }
  };
  
  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <FormProvider {...methods}>
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2",
                      currentStep > index ? "bg-primary border-primary text-primary-foreground" :
                      currentStep === index ? "border-primary text-primary animate-pulse" : "border-border text-muted-foreground"
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className={cn(
                      "text-xs mt-1",
                      currentStep === index ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>{step.name}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("flex-1 h-1 mx-2", currentStep > index ? "bg-primary" : "bg-border")} />
                )}
              </React.Fragment>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-center pt-4 space-x-2">
            <CurrentStepIcon className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold text-center font-headline">{steps[currentStep].name}</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="min-h-[300px]">
            {currentStep === 0 && <PersonalDetailsForm />}
            {currentStep === 1 && <AcademicHistoryForm />}
            {currentStep === 2 && <ParentGuardianInfoForm />}
            {currentStep === 3 && <DocumentUploadForm documents={documents} setDocuments={setDocuments} />}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting} className="btn-transition">
              <ArrowLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting} className="btn-transition bg-accent hover:bg-accent/90 text-accent-foreground">
                Selanjutnya <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || documents.length === 0} className="btn-transition bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Kirim Pendaftaran
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
