
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
import { ApplicationFormSchema, PersonalDetailsSchema, AcademicHistorySchema, ParentGuardianInfoSchema, type ApplicationFormData } from '@/types';
import { submitApplication } from '@/app/(main)/application/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, User, BookOpen, Users, Loader2, ArrowRight, ArrowLeft, Send } from 'lucide-react';

const steps = [
  { id: 'personalDetails', name: 'Data Pribadi', icon: User, schema: PersonalDetailsSchema },
  { id: 'academicHistory', name: 'Riwayat Akademik', icon: BookOpen, schema: AcademicHistorySchema },
  { id: 'parentGuardianInfo', name: 'Data Orang Tua/Wali', icon: Users, schema: ParentGuardianInfoSchema },
];

function PersonalDetailsForm() {
  const { control, formState: { errors } } = useFormContext<ApplicationFormData>();
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Initialize birthDate on client to avoid hydration mismatch for Calendar's disabled prop
    // This ensures new Date() is called client-side
    // Default to undefined if not set in form, or use form value
    const currentFormValue = control._getWatch("personalDetails.birthDate");
    if (currentFormValue instanceof Date) {
        setBirthDate(currentFormValue);
    }
  }, [control]);


  return (
    <div className="space-y-4">
      <FormFieldRHF name="personalDetails.fullName" label="Nama Lengkap (Sesuai Ijazah)" control={control} render={({ field }) => <Input placeholder="Nama Lengkap" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="personalDetails.nisn" label="NISN (Nomor Induk Siswa Nasional)" control={control} render={({ field }) => <Input placeholder="NISN (10 digit)" {...field} value={field.value || ''} />} />
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
        <FormFieldRHF name="personalDetails.birthPlace" label="Tempat Lahir" control={control} render={({ field }) => <Input placeholder="Tempat Lahir" {...field} value={field.value || ''} />} />
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
                <Calendar 
                    mode="single" 
                    selected={field.value} 
                    onSelect={(date) => {
                        field.onChange(date);
                        setBirthDate(date);
                    }} 
                    initialFocus 
                    disabled={(date) => {
                        const today = new Date();
                        const minDate = new Date("1900-01-01");
                        today.setHours(0,0,0,0); // normalize today to start of day
                        return date > today || date < minDate;
                    }}
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
      <FormFieldRHF name="personalDetails.address" label="Alamat Lengkap (Sesuai KK)" control={control} render={({ field }) => <Input placeholder="Alamat Lengkap" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="personalDetails.phoneNumber" label="Nomor Telepon Siswa (Aktif WhatsApp)" control={control} render={({ field }) => <Input type="tel" placeholder="08xxxxxxxxxx" {...field} value={field.value || ''} />} />
    </div>
  );
}

function AcademicHistoryForm() {
  const { control } = useFormContext<ApplicationFormData>();
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const generatedYears = Array.from({ length: currentYear - 1999 + 1 }, (_, i) => currentYear - i +1);
    setYears(generatedYears.sort((a,b) => b-a).slice(0, currentYear - 1999 +1)); // Ensure correct range and sort
  }, []);


  return (
    <div className="space-y-4">
      <FormFieldRHF name="academicHistory.previousSchool" label="Asal Sekolah (SMP/MTs Sederajat)" control={control} render={({ field }) => <Input placeholder="Nama Sekolah Sebelumnya" {...field} value={field.value || ''} />} />
      <FormFieldRHF
        name="academicHistory.graduationYear"
        label="Tahun Lulus"
        control={control}
        render={({ field }) => (
          <Select 
            onValueChange={(value) => field.onChange(parseInt(value))} 
            defaultValue={field.value?.toString()}
            value={field.value?.toString()}
          >
            <SelectTrigger><SelectValue placeholder="Pilih Tahun Lulus" /></SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />
      <FormFieldRHF 
        name="academicHistory.averageScore" 
        label="Nilai Rata-rata Rapor Terakhir (Opsional)" 
        control={control} 
        render={({ field }) => (
            <Input 
                type="number" 
                placeholder="Misal: 85.50" 
                {...field} 
                value={field.value === undefined || field.value === null ? '' : field.value}
                onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                        field.onChange(undefined); // Allow clearing the optional field
                    } else {
                        const numVal = parseFloat(val);
                        if (!isNaN(numVal)) {
                            field.onChange(numVal);
                        }
                    }
                }} 
            />
        )} 
      />
    </div>
  );
}

function ParentGuardianInfoForm() {
  const { control } = useFormContext<ApplicationFormData>();
  return (
    <div className="space-y-4">
      <FormFieldRHF name="parentGuardianInfo.fatherName" label="Nama Ayah" control={control} render={({ field }) => <Input placeholder="Nama Ayah" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="parentGuardianInfo.fatherOccupation" label="Pekerjaan Ayah (Opsional)" control={control} render={({ field }) => <Input placeholder="Pekerjaan Ayah" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="parentGuardianInfo.motherName" label="Nama Ibu" control={control} render={({ field }) => <Input placeholder="Nama Ibu" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="parentGuardianInfo.motherOccupation" label="Pekerjaan Ibu (Opsional)" control={control} render={({ field }) => <Input placeholder="Pekerjaan Ibu" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="parentGuardianInfo.guardianName" label="Nama Wali (Jika ada, Opsional)" control={control} render={({ field }) => <Input placeholder="Nama Wali" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="parentGuardianInfo.guardianOccupation" label="Pekerjaan Wali (Jika ada, Opsional)" control={control} render={({ field }) => <Input placeholder="Pekerjaan Wali" {...field} value={field.value || ''} />} />
      <FormFieldRHF name="parentGuardianInfo.parentPhoneNumber" label="Nomor Telepon Orang Tua/Wali (Aktif WhatsApp)" control={control} render={({ field }) => <Input type="tel" placeholder="08xxxxxxxxxx" {...field} value={field.value || ''} />} />
    </div>
  );
}

function FormFieldRHF<T extends ApplicationFormData>({ name, label, control, render }: { name: any, label: string, control: any, render: (props: { field: any }) => JSX.Element }) {
  const { formState: { errors } } = useFormContext<T>();
  const errorPath = name.split('.');
  let error = errors as any; // Type assertion
  for (const path of errorPath) {
    error = error?.[path];
    if (!error) break;
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={name} className={error ? "text-destructive" : ""}>{label}</Label>
      <Controller 
        name={name} 
        control={control} 
        render={render} 
      />
      {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
    </div>
  );
}

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      personalDetails: {
        fullName: '',
        nisn: '',
        gender: undefined, // Let Select component handle placeholder
        birthPlace: '',
        birthDate: undefined, // Let Calendar component handle placeholder
        address: '',
        phoneNumber: '',
      },
      academicHistory: {
        previousSchool: '',
        graduationYear: undefined, // Let Select component handle placeholder
        averageScore: undefined,
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

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    let isValid = true;
    if (steps[currentStep].schema) {
      isValid = await trigger(steps[currentStep].id as keyof ApplicationFormData);
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
    
    const result = await submitApplication(data);
    setIsSubmitting(false);

    if (result.success && result.applicationId) {
      toast({ title: "Pendaftaran Berhasil!", description: `ID Pendaftaran Anda: ${result.applicationId}. Harap simpan ID ini.` });
      router.push(`/application/success/${result.applicationId}`);
    } else {
      toast({ title: "Pendaftaran Gagal", description: result.message, variant: "destructive" });
      if (result.errors) {
        Object.entries(result.errors).forEach(([section, sectionErrors]) => {
          if (sectionErrors) {
            Object.entries(sectionErrors).forEach(([field, message]) => {
              methods.setError(`${section}.${field}` as any, { type: 'server', message });
            });
          }
        });
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
              <Button type="submit" disabled={isSubmitting} className="btn-transition bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Kirim Pendaftaran
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
