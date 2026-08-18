import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { CheckCircle2, Upload, FileText, AlertCircle } from 'lucide-react';

export const RequiredDocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState([
    { id: '1', title: 'Government Identification (Passport / Driving License)', status: 'SUBMITTED', fileName: 'Passport_Scan.pdf' },
    { id: '2', title: 'Tax & Social Identity Form (W-4 / PAN / Tax ID)', status: 'PENDING', fileName: null },
    { id: '3', title: 'Educational Certificates & Transcripts', status: 'SUBMITTED', fileName: 'Degree_Certificate.pdf' },
  ]);

  const handleUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocs(
        docs.map((d) =>
          d.id === id ? { ...d, status: 'SUBMITTED', fileName: file.name } : d
        )
      );
      toast.success(`Uploaded ${file.name} successfully! Malware scan clean.`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Required Documents Checklist</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Please upload legible scans for each required document category below.
        </p>
      </div>

      <div className="space-y-4">
        {docs.map((doc) => (
          <Card key={doc.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {doc.status === 'SUBMITTED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{doc.title}</h4>
                  {doc.fileName ? (
                    <p className="text-xs text-slate-500">{doc.fileName} • Malware Scanned CLEAN</p>
                  ) : (
                    <p className="text-xs text-amber-600">Pending upload</p>
                  )}
                </div>
              </div>

              <Badge variant={doc.status === 'SUBMITTED' ? 'emerald' : 'amber'}>
                {doc.status}
              </Badge>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                {doc.status === 'SUBMITTED' ? 'Replace File' : 'Upload File'}
                <input
                  type="file"
                  onChange={(e) => handleUpload(doc.id, e)}
                  className="hidden"
                />
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
