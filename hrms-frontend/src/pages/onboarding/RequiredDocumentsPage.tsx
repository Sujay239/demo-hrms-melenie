import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import {
  OnboardingCase,
  OnboardingDocumentUpload,
  OnboardingDocRequirement,
  AllowedDocumentType,
  DEFAULT_ONBOARDING_DOCUMENTS,
} from '@/demo-data/seedData';
import {
  CheckCircle2,
  Upload,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Lock,
  Eye,
  Download,
  ExternalLink,
  FileCheck,
  FileSearch,
} from 'lucide-react';

interface FileUploadInfo {
  fileName: string;
  size: string;
  fileDataUrl?: string;
  fileType?: string;
}

export const RequiredDocumentsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const cases = mockStorage.getOnboardingCases(currentTenant.id);
  const myCase = cases.find(
    (c) => c.userId === currentUser.id || c.email.toLowerCase() === currentUser.email.toLowerCase()
  ) || cases[0];

  const isRejected = myCase?.status === 'REJECTED' || currentUser.status === 'SUSPENDED';

  // Dynamically load custom checklist configured by Admin for this employee or fallback to company default
  const categories: OnboardingDocRequirement[] =
    myCase?.requiredDocsChecklist && myCase.requiredDocsChecklist.length > 0
      ? myCase.requiredDocsChecklist
      : mockStorage.getOnboardingDocRequirements(currentTenant?.id);

  const getAcceptPattern = (allowedType: AllowedDocumentType) => {
    switch (allowedType) {
      case 'PDF':
        return '.pdf,application/pdf';
      case 'IMAGE':
        return 'image/png,image/jpeg,image/webp,image/jpg,.png,.jpg,.jpeg,.webp';
      case 'PDF_OR_IMAGE':
        return '.pdf,application/pdf,image/png,image/jpeg,image/webp,image/jpg,.png,.jpg,.jpeg';
      case 'ANY':
      default:
        return '*/*';
    }
  };

  const getFormatBadge = (allowedType: AllowedDocumentType) => {
    switch (allowedType) {
      case 'PDF':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            📄 PDF only
          </span>
        );
      case 'IMAGE':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            🖼️ Image only (PNG/JPG)
          </span>
        );
      case 'PDF_OR_IMAGE':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            📄🖼️ PDF or Image
          </span>
        );
      case 'ANY':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            📁 Any Document
          </span>
        );
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: FileUploadInfo }>(() => {
    const map: { [key: string]: FileUploadInfo } = {};
    if (myCase?.uploadedDocs && myCase.uploadedDocs.length > 0) {
      myCase.uploadedDocs.forEach((d) => {
        map[d.id] = {
          fileName: d.fileName,
          size: d.fileSize,
          fileDataUrl: d.fileDataUrl,
          fileType: d.fileType,
        };
      });
    }
    return map;
  });

  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    title: string;
    fileName: string;
    size: string;
    fileDataUrl?: string;
    fileType?: string;
  } | null>(null);

  const handleUpload = (doc: OnboardingDocRequirement, e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRejected) {
      toast.error('Case is rejected. Document uploads are locked.');
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      const fileNameLower = file.name.toLowerCase();
      const isPdf = fileNameLower.endsWith('.pdf') || file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(fileNameLower);

      // Validate format
      if (doc.allowedType === 'PDF' && !isPdf) {
        toast.error(`Format error: "${doc.title}" must be a PDF document (.pdf).`);
        return;
      }
      if (doc.allowedType === 'IMAGE' && !isImage) {
        toast.error(`Format error: "${doc.title}" must be an image file (PNG, JPG, WEBP).`);
        return;
      }
      if (doc.allowedType === 'PDF_OR_IMAGE' && !isPdf && !isImage) {
        toast.error(`Format error: "${doc.title}" must be a PDF or Image file.`);
        return;
      }

      const sizeFormatted = `${
        file.size / (1024 * 1024) > 0.1
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : (file.size / 1024).toFixed(0) + ' KB'
      }`;

      const reader = new FileReader();
      reader.onloadend = () => {
        const fileDataUrl = reader.result as string;

        const newMap: { [key: string]: FileUploadInfo } = {
          ...uploadedFiles,
          [doc.id]: {
            fileName: file.name,
            size: sizeFormatted || '450 KB',
            fileDataUrl,
            fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          },
        };
        setUploadedFiles(newMap);

        // Save into storage
        const docsArray: OnboardingDocumentUpload[] = Object.entries(newMap).map(([id, info]) => {
          const cat = categories.find((c) => c.id === id);
          return {
            id,
            title: cat?.title || doc.title,
            fileName: info.fileName,
            fileSize: info.size,
            uploadedAt: new Date().toISOString(),
            fileDataUrl: info.fileDataUrl,
            fileType: info.fileType,
          };
        });

        const mandatoryCategories = categories.filter((c) => c.isRequired);
        const allMandatoryUploaded = mandatoryCategories.every((cat) => !!newMap[cat.id]);

        if (myCase) {
          mockStorage.updateTenantItem<OnboardingCase>(KEYS.ONBOARDING_CASES, myCase.id, {
            uploadedDocs: docsArray,
            requiredDocsUploaded: allMandatoryUploaded,
          });
        }

        toast.success(`Uploaded "${file.name}"! Quarantine Anti-Malware scan: CLEAN.`);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleOpenPreview = (catId: string, title: string) => {
    const fileInfo = uploadedFiles[catId];
    if (!fileInfo) return;

    setPreviewDoc({
      id: catId,
      title,
      fileName: fileInfo.fileName,
      size: fileInfo.size,
      fileDataUrl: fileInfo.fileDataUrl,
      fileType: fileInfo.fileType,
    });
  };

  const isPhase2Locked = !myCase?.personalDetailsCompleted || !myCase?.offerSignedUploaded;

  const handleSaveAndReturn = () => {
    const missingMandatory = categories.filter((c) => c.isRequired && !uploadedFiles[c.id]);
    if (missingMandatory.length > 0) {
      toast.error(
        `Please upload all mandatory documents (${missingMandatory.map((m) => m.title).join(', ')}) before proceeding.`
      );
      return;
    }
    toast.success('✅ Phase 3 Completed! Proceeding to Phase 4: Policy Acknowledgement');
    navigate(`/${slug}/onboarding/acknowledgement`);
  };

  if (isPhase2Locked) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200 text-center py-12">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Phase 3 is Locked</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You must complete and sign <strong>Phase 2: Offer Letter & e-Signature</strong> before you can upload compliance identification documents.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate(`/${slug}/onboarding/offer`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Phase 2: Offer Letter & Sign
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Required Documents Checklist</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Please upload legible PDF scans or images for each required compliance category below. All uploaded files undergo automated anti-malware quarantine scanning.
        </p>
      </div>

      {isRejected && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-3 text-rose-900 shadow-xs">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-900 text-sm">Onboarding Access Revoked</h4>
            <p>
              Your onboarding was rejected by HR: <strong>{myCase?.rejectionReason || 'Compliance verification declined.'}</strong>
            </p>
            <p className="text-rose-700">Please contact HR at hr@acme-corp.com.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((cat) => {
          const isUploaded = !!uploadedFiles[cat.id];
          const fileInfo = uploadedFiles[cat.id];

          return (
            <Card key={cat.id} className="p-4 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {isUploaded ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{cat.title}</h4>
                      {getFormatBadge(cat.allowedType)}
                      {cat.isRequired ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                          * Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          Optional
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-500">{cat.description}</p>
                    )}
                    {isUploaded ? (
                      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-mono font-medium text-slate-800">{fileInfo.fileName}</span>
                        <span>•</span>
                        <span className="text-slate-400">{fileInfo.size}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Malware Scan CLEAN
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium">Pending upload</p>
                    )}
                  </div>
                </div>

                <Badge variant={isUploaded ? 'emerald' : cat.isRequired ? 'amber' : 'neutral'}>
                  {isUploaded ? 'SUBMITTED' : cat.isRequired ? 'REQUIRED' : 'OPTIONAL'}
                </Badge>
              </div>

              {!isRejected && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  {isUploaded && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPreview(cat.id, cat.title)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                      className="text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-300"
                    >
                      Preview Document
                    </Button>
                  )}

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 cursor-pointer shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isUploaded ? 'Replace Document' : 'Upload Document Scan'}</span>
                    <input
                      type="file"
                      accept={getAcceptPattern(cat.allowedType)}
                      onChange={(e) => handleUpload(cat, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSaveAndReturn} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Save & Proceed to Phase 4: Policy Sign-Off
        </Button>
      </div>

      {/* ============================================================ */}
      {/* DOCUMENT PREVIEW MODAL                                       */}
      {/* ============================================================ */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          maxWidth="4xl"
          title={`Document Preview: ${previewDoc.title}`}
          description={`File: ${previewDoc.fileName} (${previewDoc.size}) • Verified by Anti-Malware Engine`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE COMPLIANCE RECORD
                </span>
              </div>

              <div className="flex items-center gap-2">
                {previewDoc.fileDataUrl && (
                  <a
                    href={previewDoc.fileDataUrl}
                    download={previewDoc.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Document
                  </a>
                )}
                <Button variant="primary" size="sm" onClick={() => setPreviewDoc(null)}>
                  Close Preview
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Real File Rendering */}
            {previewDoc.fileDataUrl ? (
              previewDoc.fileDataUrl.startsWith('data:image/') ? (
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center max-h-[620px] overflow-auto">
                  <img
                    src={previewDoc.fileDataUrl}
                    alt={previewDoc.fileName}
                    className="max-h-[580px] w-auto max-w-full rounded-lg shadow-sm object-contain"
                  />
                </div>
              ) : previewDoc.fileDataUrl.startsWith('data:application/pdf') ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-slate-900">
                  <iframe
                    src={previewDoc.fileDataUrl}
                    title={previewDoc.fileName}
                    className="w-full h-[620px] border-0"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-slate-900">
                  <iframe
                    src={previewDoc.fileDataUrl}
                    title={previewDoc.fileName}
                    className="w-full h-[620px] border-0"
                  />
                </div>
              )
            ) : (
              /* Simulated Document Preview Canvas for default seed documents */
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{previewDoc.title}</h4>
                        <p className="text-xs text-slate-500 font-mono">{previewDoc.fileName}</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Candidate Name</span>
                      <strong className="text-slate-800">{myCase?.candidateName || currentUser.name}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organization</span>
                      <strong className="text-slate-800">{currentTenant.name}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Size</span>
                      <span className="text-slate-800 font-mono">{previewDoc.size}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Antivirus Scan Status</span>
                      <span className="text-emerald-600 font-bold">Passed (Zero Threat Detected)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <p className="font-semibold mb-1">Official Compliance Record</p>
                    <p className="text-slate-600">
                      This document has been safely encrypted, time-stamped, and linked to candidate onboarding case ID{' '}
                      <strong className="font-mono text-indigo-700">{myCase?.id || 'CASE-1001'}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
