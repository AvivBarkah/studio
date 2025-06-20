'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApplicationStatus } from '@/app/(main)/status/actions';
import type { ApplicationStatus as AppStatusType } from '@/types';
import { APPLICATION_STATUSES } from '@/lib/constants';
import { Loader2, Search, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusResult {
  status?: AppStatusType;
  applicantName?: string;
  submissionDate?: string;
  message: string;
  error?: boolean;
}

export function StatusChecker() {
  const [applicationId, setApplicationId] = useState('');
  const [result, setResult] = useState<StatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    const statusResult = await fetchApplicationStatus(applicationId);
    setResult(statusResult);
    setIsLoading(false);
  };

  const getStatusBadge = (status?: AppStatusType) => {
    if (!status) return null;
    const statusInfo = APPLICATION_STATUSES[status] || APPLICATION_STATUSES.UNKNOWN;
    let IconComponent = Info;
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";

    switch (status) {
        case 'SUBMITTED': IconComponent = Info; variant = 'default'; break;
        case 'UNDER_REVIEW': IconComponent = Search; variant = 'secondary'; break;
        case 'ACCEPTED': IconComponent = CheckCircle; variant = 'default'; /* Will use green from APPLICATION_STATUSES */; break;
        case 'REJECTED': IconComponent = XCircle; variant = 'destructive'; break;
        case 'ADDITIONAL_INFO_REQUIRED': IconComponent = AlertTriangle; variant = 'default'; break; /* Will use orange */
        default: IconComponent = Info; variant = 'outline';
    }
    
    return (
      <Badge 
        className={`text-sm px-3 py-1 ${statusInfo.color} text-white`}
      >
        <IconComponent className="mr-2 h-4 w-4" />
        {statusInfo.text}
      </Badge>
    );
  };


  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-headline">Cek Status Pendaftaran</CardTitle>
        <CardDescription className="text-center">
          Masukkan Nomor Pendaftaran Anda untuk melihat status aplikasi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="applicationId">Nomor Pendaftaran</Label>
            <Input
              id="applicationId"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Contoh: MG2024001"
              required
              aria-describedby="applicationId-description"
            />
            <p id="applicationId-description" className="text-sm text-muted-foreground mt-1">
              Nomor unik yang Anda terima setelah submit formulir.
            </p>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-transition">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Cari Status
          </Button>
        </form>
      </CardContent>
      {result && (
        <CardFooter className="flex flex-col items-start space-y-3 pt-6 border-t">
          {result.error ? (
            <p className="text-destructive text-center w-full">{result.message}</p>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-primary">Hasil Pencarian:</h3>
              <p><strong>Nama Pendaftar:</strong> {result.applicantName || 'N/A'}</p>
              <p><strong>Tanggal Pendaftaran:</strong> {result.submissionDate || 'N/A'}</p>
              <div className="flex items-center space-x-2">
                <strong>Status:</strong> {getStatusBadge(result.status)}
              </div>
              {result.status === 'ADDITIONAL_INFO_REQUIRED' && (
                <p className="text-sm text-orange-600">
                  Silakan periksa email Anda atau hubungi panitia untuk informasi lebih lanjut mengenai data yang perlu dilengkapi.
                </p>
              )}
               {result.status === 'ACCEPTED' && (
                <p className="text-sm text-green-600">
                  Selamat! Anda diterima. Informasi mengenai langkah selanjutnya akan dikirimkan melalui email.
                </p>
              )}
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
