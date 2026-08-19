import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { OnboardingCase } from '@/demo-data/seedData';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building,
  UserPlus,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Download,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  User,
  Phone,
  Mail,
  Home,
  HeartHandshake,
  CheckSquare,
  FileCheck,
  Eye,
  Lock,
  XCircle,
  AlertOctagon,
} from 'lucide-react';

export const OnboardingCasesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const [cases, setCases] = useState<OnboardingCase[]>(() =>
    mockStorage.getOnboardingCases(currentTenant.id)
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Verification documentation submitted is illegible or failed compliance check.');
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    fileName: string;
    fileSize: string;
    fileDataUrl?: string;
    fileType?: string;
    candidateName?: string;
  } | null>(null);

  const reloadCases = () => {
    setCases(mockStorage.getOnboardingCases(currentTenant.id));
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || null;

  const handleApprove = (caseItem: OnboardingCase) => {
    setIsApproving(true);
    setTimeout(() => {
      const updated = mockStorage.approveOnboardingCase(caseItem.id, currentUser.name);
      setIsApproving(false);
      if (updated) {
        toast.success(`🎉 ${caseItem.candidateName} approved! Successfully converted to permanent active employee.`);
        reloadCases();
      } else {
        toast.error('Failed to approve onboarding case.');
      }
    }, 400);
  };

  const handleReject = (caseItem: OnboardingCase) => {
    setIsRejecting(true);
    setTimeout(() => {
      const updated = mockStorage.rejectOnboardingCase(caseItem.id, rejectReason, currentUser.name);
      setIsRejecting(false);
      setShowRejectModal(false);
      if (updated) {
        toast.error(`Onboarding for ${caseItem.candidateName} has been rejected & access revoked.`);
        reloadCases();
      } else {
        toast.error('Failed to reject onboarding case.');
      }
    }, 400);
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.designationName.toLowerCase().includes(search.toLowerCase()) ||
      c.departmentName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'REVIEW'
        ? c.status === 'SUBMITTED_FOR_REVIEW'
        : statusFilter === 'IN_PROGRESS'
        ? c.status === 'IN_PROGRESS'
        : statusFilter === 'APPROVED'
        ? c.status === 'APPROVED'
        : statusFilter === 'REJECTED'
        ? c.status === 'REJECTED'
        : true;

    return matchesSearch && matchesStatus;
  });

  const totalCases = cases.length;
  const readyForReview = cases.filter((c) => c.status === 'SUBMITTED_FOR_REVIEW').length;
  const approvedCount = cases.filter((c) => c.status === 'APPROVED').length;
  const inProgressCount = cases.filter((c) => c.status === 'IN_PROGRESS').length;
  const rejectedCount = cases.filter((c) => c.status === 'REJECTED').length;

  const calculateProgress = (c: OnboardingCase) => {
    let done = 0;
    if (c.personalDetailsCompleted) done++;
    if (c.offerSignedUploaded) done++;
    if (c.requiredDocsUploaded) done++;
    if (c.acknowledgementSigned) done++;
    return Math.round((done / 4) * 100);
  };

  // ==========================================
  // FULL-PAGE DETAILED CASE REVIEW VIEW
  // ==========================================
  if (selectedCase) {
    const isReady = selectedCase.status === 'SUBMITTED_FOR_REVIEW';
    const isApproved = selectedCase.status === 'APPROVED';
    const isRejected = selectedCase.status === 'REJECTED';
    const progress = calculateProgress(selectedCase);

    return (
      <div className="space-y-6 animate-in fade-in duration-200 w-full max-w-full">
        {/* Top Back Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <button
            onClick={() => setSelectedCaseId(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Onboarding Cases</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Case ID: {selectedCase.id}</span>
            {isApproved ? (
              <Badge variant="emerald" size="md">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PERMANENT EMPLOYEE ACTIVE
              </Badge>
            ) : isRejected ? (
              <Badge variant="rose" size="md">
                <XCircle className="w-3.5 h-3.5 mr-1" /> ACCESS REVOKED & REJECTED
              </Badge>
            ) : isReady ? (
              <Badge variant="amber" size="md">
                <Clock className="w-3.5 h-3.5 mr-1" /> READY FOR HR APPROVAL
              </Badge>
            ) : (
              <Badge variant="neutral" size="md">
                IN PROGRESS ({progress}%)
              </Badge>
            )}
          </div>
        </div>

        {/* Rejection Alert Banner if Rejected */}
        {isRejected && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-4 shadow-xs text-rose-950">
            <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold text-rose-900">Onboarding Case Rejected & Permissions Revoked</h3>
              <p className="font-medium">
                Reason: <em>"{selectedCase.rejectionReason || 'Compliance requirements not fulfilled.'}"</em>
              </p>
              <p className="text-rose-700">
                Recorded by {selectedCase.rejectedBy || currentUser.name} on{' '}
                {selectedCase.rejectedAt ? new Date(selectedCase.rejectedAt).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>
        )}

        {/* Hero Candidate Profile Banner */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <Avatar src={selectedCase.avatarUrl} name={selectedCase.candidateName} size="xl" className="shrink-0 ring-4 ring-slate-100" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{selectedCase.candidateName}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedCase.designationName}
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedCase.employeeId || 'EMP-1012'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedCase.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedCase.phone || 'Phone pending'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {selectedCase.departmentName}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Manager: <strong className="text-slate-800">{selectedCase.managerName}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joining Date: <strong className="text-slate-800">{selectedCase.joiningDate}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action on Header */}
          <div className="shrink-0 flex items-center gap-2.5 self-start lg:self-center">
            {isApproved ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Converted & Access Active</span>
              </div>
            ) : isRejected ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Case Rejected</span>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowRejectModal(true)}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Reject / Revoke
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold px-5 py-2.5 text-sm shadow-md"
                  onClick={() => handleApprove(selectedCase)}
                  isLoading={isApproving}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Approve & Make Permanent
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 4-Step Visual Progress Bar */}
        <Card className="p-4 bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Onboarding Checklist Completion ({progress}%)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isApproved
                ? 'Approved by HR'
                : isRejected
                ? 'Application Rejected'
                : selectedCase.status === 'SUBMITTED_FOR_REVIEW'
                ? 'All 4 tasks completed and submitted for review'
                : `${progress}% submitted so far`}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isApproved
                  ? 'bg-emerald-500'
                  : isRejected
                  ? 'bg-rose-500'
                  : isReady
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        {/* Grid: Left column (Artifacts & Documents), Right Column (Parameters & Sign-off) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Submitted Artifacts & Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artifact 1: Signed Offer Document */}
            <Card className="shadow-xs border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>1. Official Offer Letter & External Signed Copy</span>
                </CardTitle>
                <Badge variant={selectedCase.offerSignedUploaded ? 'emerald' : 'amber'}>
                  {selectedCase.offerSignedUploaded ? 'SIGNED COPY ATTACHED' : 'PENDING CANDIDATE UPLOAD'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {selectedCase.offerSignedUploaded ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100/80 text-indigo-700 rounded-xl shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {selectedCase.offerSignedFileName || `Signed_Offer_${selectedCase.candidateName.replace(' ', '_')}.pdf`}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Executed Digital e-Signature • Signed on {selectedCase.offerSignedAt ? new Date(selectedCase.offerSignedAt).toLocaleString() : 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success('Signed offer document downloaded successfully')}
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                        >
                          Download PDF
                        </Button>
                      </div>
                    </div>

                    {/* Embedded Signature Preview Stamp */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Candidate Electronic Signature & Verification Stamp
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                          SHA-256 e-Sign Verified
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500">Signer: <strong className="text-slate-900">{selectedCase.candidateName}</strong></p>
                          <p className="text-xs text-slate-500">Email: <strong className="text-slate-900">{selectedCase.email}</strong></p>
                          <p className="text-xs text-slate-500">Signed At: <strong className="text-slate-900">{selectedCase.offerSignedAt ? new Date(selectedCase.offerSignedAt).toLocaleString() : '2026-08-19 11:35 UTC'}</strong></p>
                        </div>

                        {selectedCase.offerSignatureDataUrl ? (
                          <div className="bg-white p-2 rounded-lg border border-slate-300 shadow-2xs">
                            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Handwritten Signature:</span>
                            <img
                              src={selectedCase.offerSignatureDataUrl}
                              alt="Captured Candidate Signature"
                              className="h-12 max-w-[180px] object-contain"
                            />
                          </div>
                        ) : (
                          <div className="bg-white p-2 rounded-lg border border-slate-300 shadow-2xs">
                            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Executed Signature:</span>
                            <span className="font-serif italic text-xl text-slate-800 tracking-wider">
                              {selectedCase.candidateName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Awaiting candidate signature</p>
                    <p className="text-slate-400 mt-0.5">The candidate has not yet signed their offer letter on the digital canvas.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Artifact 2: Required Identification, Tax & Compliance Documents */}
            <Card className="shadow-xs border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>2. Uploaded Compliance & Identification Documents</span>
                </CardTitle>
                <Badge variant={selectedCase.requiredDocsUploaded ? 'emerald' : 'amber'}>
                  {selectedCase.requiredDocsUploaded ? 'DOCUMENTS SUBMITTED' : 'INCOMPLETE / PENDING'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {selectedCase.uploadedDocs && selectedCase.uploadedDocs.length > 0 ? (
                  selectedCase.uploadedDocs.map((doc, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                          <FileCheck className="w-5 h-5" />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{doc.title}</h4>
                          <p className="text-xs text-slate-500 font-mono">
                            {doc.fileName} • {doc.fileSize}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          CLEAN SCAN
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPreviewDoc({
                              title: doc.title,
                              fileName: doc.fileName,
                              fileSize: doc.fileSize,
                              fileDataUrl: doc.fileDataUrl,
                              fileType: doc.fileType,
                              candidateName: selectedCase.candidateName,
                            })
                          }
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No compliance documents uploaded yet</p>
                    <p className="text-slate-400 mt-0.5">Government ID, Form W-4/16, and Educational certificates pending candidate upload.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Artifact 3: Policy Acknowledgement & Consent */}
            <Card className="shadow-xs border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                  <span>3. Policy Acknowledgement & Compliance Agreement</span>
                </CardTitle>
                <Badge variant={selectedCase.acknowledgementSigned ? 'emerald' : 'amber'}>
                  {selectedCase.acknowledgementSigned ? 'ELECTRONICALLY SIGNED' : 'PENDING SIGN-OFF'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {selectedCase.acknowledgementSigned ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200 font-medium">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Signer Legal Name</span>
                        <span className="font-bold text-slate-900">{selectedCase.acknowledgementName || selectedCase.candidateName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Signing Location</span>
                        <span className="font-bold text-slate-900">{selectedCase.acknowledgementPlace || 'Location not specified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Signing Date</span>
                        <span className="font-bold text-slate-900">{selectedCase.acknowledgementDate || selectedCase.joiningDate}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Verified electronic consent to Cyrcalur Code of Conduct, Anti-Harassment Guidelines, and InfoSec policies.</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Awaiting candidate policy signature</p>
                    <p className="text-slate-400 mt-0.5">The candidate has not yet submitted electronic policy consent.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right 1 Col: Official Job Parameters, Personal Info, HR Action */}
          <div className="space-y-6">
            {/* Employment Parameters Card */}
            <Card className="shadow-xs border border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" /> Official Job Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Department</span>
                  <span className="font-bold text-slate-900">{selectedCase.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Designation / Role</span>
                  <span className="font-bold text-slate-900">{selectedCase.designationName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Reporting Manager</span>
                  <span className="font-semibold text-slate-800">{selectedCase.managerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Work Location & Region</span>
                  <span className="font-semibold text-slate-800">{selectedCase.regionName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Joining Date</span>
                  <span className="font-semibold text-slate-800">{selectedCase.joiningDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Submitted Details */}
            <Card className="shadow-xs border border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Candidate Contact & Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Phone Number</span>
                  <span className="font-semibold text-slate-800">{selectedCase.phone || 'Not submitted yet'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Residential Address</span>
                  <span className="font-semibold text-slate-800">{selectedCase.address || 'Not submitted yet'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Emergency Contact</span>
                  <span className="font-semibold text-slate-800">{selectedCase.emergencyContact || 'Not submitted yet'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Team Intro / Fun Fact 🎉</span>
                  {selectedCase.funFact ? (
                    <p className="font-medium text-slate-700 italic mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      "{selectedCase.funFact}"
                    </p>
                  ) : (
                    <p className="text-slate-400 italic mt-0.5">Awaiting candidate introduction note...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Final Sign-Off & HR Decision Action Card */}
            <Card className="shadow-md border-2 border-emerald-500 bg-emerald-50/20 p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>HR Approval Decision</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Approving this case will instantly convert the candidate's account into a permanent active <strong className="text-slate-900">EMPLOYEE</strong> with full platform permissions.
              </p>

              {isApproved ? (
                <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-xl text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
                  <h4 className="text-sm font-bold text-emerald-900">Permanent Employee Access Active</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Approved by {selectedCase.approvedBy || currentUser.name} on{' '}
                    {selectedCase.approvedAt ? new Date(selectedCase.approvedAt).toLocaleDateString() : 'Today'}
                  </p>
                </div>
              ) : isRejected ? (
                <div className="p-4 bg-rose-100/70 border border-rose-300 rounded-xl text-center">
                  <XCircle className="w-7 h-7 text-rose-600 mx-auto mb-1.5" />
                  <h4 className="text-sm font-bold text-rose-900">Access Revoked & Declined</h4>
                  <p className="text-xs text-rose-700 mt-1">
                    Rejected on {selectedCase.rejectedAt ? new Date(selectedCase.rejectedAt).toLocaleDateString() : 'Today'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm shadow-md"
                    onClick={() => handleApprove(selectedCase)}
                    isLoading={isApproving}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Approve & Make Permanent Employee
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-rose-600 border-rose-300 hover:bg-rose-50 text-xs font-semibold py-2"
                    onClick={() => setShowRejectModal(true)}
                  >
                    Reject & Revoke Access
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <Card className="max-w-md w-full p-6 space-y-4 bg-white shadow-2xl rounded-2xl border border-rose-200">
              <div className="flex items-center gap-3 text-rose-700">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <AlertOctagon className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Reject Onboarding Case</h3>
                  <p className="text-xs text-slate-500">Revoke permissions for {selectedCase.candidateName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Rejection Reason / Note to Candidate:</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="Explain why the onboarding case was declined..."
                  required
                />
                <p className="text-[11px] text-slate-400">
                  This note will be shown on the candidate's onboarding screen instructing them to contact HR.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  onClick={() => handleReject(selectedCase)}
                  isLoading={isRejecting}
                >
                  Confirm Rejection & Revoke Access
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* DOCUMENT PREVIEW MODAL FOR HR AUDIT                          */}
        {/* ============================================================ */}
        {previewDoc && (
          <Modal
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            maxWidth="4xl"
            title={`Document Inspection: ${previewDoc.title}`}
            description={`File: ${previewDoc.fileName} (${previewDoc.fileSize}) • Candidate: ${previewDoc.candidateName || selectedCase.candidateName}`}
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
                    Close Inspection
                  </Button>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              {previewDoc.fileDataUrl ? (
                previewDoc.fileDataUrl.startsWith('data:image/') ? (
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center max-h-[620px] overflow-auto">
                    <img
                      src={previewDoc.fileDataUrl}
                      alt={previewDoc.fileName}
                      className="max-h-[580px] w-auto max-w-full rounded-lg shadow-sm object-contain"
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
                        <strong className="text-slate-800">{previewDoc.candidateName || selectedCase.candidateName}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organization</span>
                        <strong className="text-slate-800">{currentTenant.name}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Size</span>
                        <span className="text-slate-800 font-mono">{previewDoc.fileSize}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Antivirus Scan Status</span>
                        <span className="text-emerald-600 font-bold">Passed (Zero Threat Detected)</span>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                      <p className="font-semibold mb-1">Official Compliance Record</p>
                      <p className="text-slate-600">
                        This document has been safely encrypted, anti-malware scanned, and linked to candidate onboarding case for verification.
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
  }

  // ==========================================
  // PIPELINE TABLE & LIST VIEW
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <UserPlus className="w-4 h-4" />
            <span>Candidate Lifecycle & Onboarding Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Onboarding Cases</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track new hire task submissions, inspect uploaded documents, and approve or decline permanent employment access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('New onboarding invitations can be initiated from the Employees tab');
            }}
          >
            + Invite New Hire
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cases</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCases}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Pipeline candidates for {currentTenant.name}</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready for Review</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{readyForReview}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium text-amber-700">
            {readyForReview > 0 ? 'Action required: Awaiting HR sign-off' : 'All submitted cases reviewed'}
          </p>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{inProgressCount}</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Candidates filling checklist</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved & Permanent</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Full platform access active</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by candidate name, email, department, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Button
            variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
          >
            All ({totalCases})
          </Button>
          <Button
            variant={statusFilter === 'REVIEW' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('REVIEW')}
            className={readyForReview > 0 ? 'border-amber-400 font-semibold' : ''}
          >
            Needs Review ({readyForReview})
          </Button>
          <Button
            variant={statusFilter === 'IN_PROGRESS' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            In Progress ({inProgressCount})
          </Button>
          <Button
            variant={statusFilter === 'APPROVED' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('APPROVED')}
          >
            Approved ({approvedCount})
          </Button>
          <Button
            variant={statusFilter === 'REJECTED' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected ({rejectedCount})
          </Button>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <Card className="p-12 text-center">
            <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Onboarding Cases Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter selection.</p>
          </Card>
        ) : (
          filteredCases.map((c) => {
            const progress = calculateProgress(c);
            const isReady = c.status === 'SUBMITTED_FOR_REVIEW';
            const isApproved = c.status === 'APPROVED';
            const isRejected = c.status === 'REJECTED';

            return (
              <Card
                key={c.id}
                className={`p-5 transition-all hover:shadow-md cursor-pointer border ${
                  isReady
                    ? 'border-amber-300 bg-amber-50/20'
                    : isApproved
                    ? 'border-emerald-200 bg-white'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-slate-200 bg-white'
                }`}
                onClick={() => setSelectedCaseId(c.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Avatar & Candidate Info */}
                  <div className="flex items-start gap-4">
                    <Avatar src={c.avatarUrl} name={c.candidateName} size="md" />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-slate-900 text-base">{c.candidateName}</h3>
                        {isReady && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Ready for Approval
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Permanent Employee
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Access Revoked / Rejected
                          </span>
                        )}
                        {!isReady && !isApproved && !isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            In Progress ({progress}%)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>{c.email}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700">{c.designationName}</span>
                        <span>•</span>
                        <span>{c.departmentName}</span>
                        <span>•</span>
                        <span>Manager: <strong className="text-slate-700">{c.managerName}</strong></span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date: <strong>{c.joiningDate}</strong>
                        </span>
                        <span>•</span>
                        <span>Location: <strong>{c.regionName}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Step Status Pill Badges & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:self-center">
                    {/* 4 Steps Indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      <div
                        className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                          c.personalDetailsCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {c.personalDetailsCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        Details
                      </div>

                      <div
                        className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                          c.offerSignedUploaded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {c.offerSignedUploaded ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        Offer Copy
                      </div>

                      <div
                        className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                          c.requiredDocsUploaded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {c.requiredDocsUploaded ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        Docs
                      </div>

                      <div
                        className={`px-2 py-1 rounded-md border flex items-center gap-1 ${
                          c.acknowledgementSigned
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {c.acknowledgementSigned ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        Policies
                      </div>
                    </div>

                    {/* Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        variant={isReady ? 'primary' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseId(c.id);
                        }}
                        className={isReady ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs' : ''}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        {isReady ? 'Review & Decide' : 'Open Case'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* DOCUMENT PREVIEW MODAL FOR HR AUDIT                          */}
      {/* ============================================================ */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          maxWidth="4xl"
          title={`Document Inspection: ${previewDoc.title}`}
          description={`File: ${previewDoc.fileName} (${previewDoc.fileSize}) • Candidate: ${previewDoc.candidateName || 'Candidate'}`}
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
                  Close Inspection
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {previewDoc.fileDataUrl ? (
              previewDoc.fileDataUrl.startsWith('data:image/') ? (
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center max-h-[620px] overflow-auto">
                  <img
                    src={previewDoc.fileDataUrl}
                    alt={previewDoc.fileName}
                    className="max-h-[580px] w-auto max-w-full rounded-lg shadow-sm object-contain"
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
                      <strong className="text-slate-800">{previewDoc.candidateName || 'Candidate'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organization</span>
                      <strong className="text-slate-800">{currentTenant.name}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Size</span>
                      <span className="text-slate-800 font-mono">{previewDoc.fileSize}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Antivirus Scan Status</span>
                      <span className="text-emerald-600 font-bold">Passed (Zero Threat Detected)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <p className="font-semibold mb-1">Official Compliance Record</p>
                    <p className="text-slate-600">
                      This document has been safely encrypted, anti-malware scanned, and linked to candidate onboarding case for verification.
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
