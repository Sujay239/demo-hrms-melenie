import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { mockStorage } from '@/services/mock-storage';
import { Download, Upload, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';

export const OfferReviewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [signedFileUploaded, setSignedFileUploaded] = useState(true);
  const [signedFileName, setSignedFileName] = useState('Signed_Offer_Sam_Lee.pdf');

  const handleDownloadOffer = () => {
    toast.success('Official offer letter PDF downloaded for review');
  };

  const handleSignedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignedFileName(file.name);
      setSignedFileUploaded(true);
      toast.success('Signed copy uploaded as an external artifact!');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Offer Letter Review & Signed Copy</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review your official offer document, sign externally using your preferred PDF application, and upload the signed copy.
        </p>
      </div>

      {/* SRS Mandatory Explicit Boundary Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-bold">External Signing Workflow Notice (Phase 1 Standard):</p>
          <p>
            Cyrcalur HRMS does not host native in-platform e-signatures in Phase 1. Please download the document, execute signing using DocuSign, Adobe Acrobat, or your system software, and upload the completed signed artifact below.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Official Employment Offer Letter</span>
            <Badge variant="emerald">VERIFIED BY HR</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Offer_Letter_Sam_Lee_v1.pdf</h4>
                <p className="text-xs text-slate-500">Immutable Version v1 • 450 KB • Issued by HR</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadOffer}
            >
              Download PDF
            </Button>
          </div>

          {/* Upload Signed Artifact Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-slate-900">Upload Executed Signed Copy</h4>

            {signedFileUploaded ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h5 className="text-xs font-semibold text-emerald-900">{signedFileName}</h5>
                    <p className="text-[11px] text-emerald-700">Uploaded and attached to onboarding case</p>
                  </div>
                </div>

                <label className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">
                  Replace File
                  <input type="file" onChange={handleSignedUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Upload executed signed PDF document</p>
                <input type="file" onChange={handleSignedUpload} className="hidden" id="signed-file-input" />
                <label htmlFor="signed-file-input" className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer block mt-1">
                  Browse Signed Files
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
