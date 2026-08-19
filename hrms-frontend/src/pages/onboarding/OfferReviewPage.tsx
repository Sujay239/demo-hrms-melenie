import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { OnboardingCase } from '@/demo-data/seedData';
import {
  FileText,
  CheckCircle2,
  Download,
  PenTool,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building,
  Calendar,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Stamp,
  Briefcase,
  Lock,
} from 'lucide-react';

export const OfferReviewPage: React.FC = () => {
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

  // Signature state
  const [signatureData, setSignatureData] = useState<string | null>(
    myCase?.offerSignatureDataUrl || null
  );
  const [signedTimestamp, setSignedTimestamp] = useState<string | null>(
    myCase?.offerSignedAt || null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  // Drawing Helpers for Mouse & Touch
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isRejected) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isRejected) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const applySignature = () => {
    if (!hasDrawn) {
      toast.error('Please draw your signature on the pad first.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const now = new Date().toISOString();
    setSignatureData(dataUrl);
    setSignedTimestamp(now);
    toast.success('Signature captured and stamped onto the offer letter!');
  };

  const isPhase1Locked = !myCase?.personalDetailsCompleted;

  const handleFinalSubmit = () => {
    if (!signatureData) {
      toast.error('Please sign the offer letter and apply your signature before submitting.');
      return;
    }

    if (myCase) {
      mockStorage.updateTenantItem<OnboardingCase>(KEYS.ONBOARDING_CASES, myCase.id, {
        offerSignedUploaded: true,
        offerSignedFileName: `Signed_Offer_${myCase.candidateName.replace(' ', '_')}.pdf`,
        offerSignedAt: signedTimestamp || new Date().toISOString(),
        offerSignatureDataUrl: signatureData,
      });
    }

    toast.success('✅ Phase 2 Completed! Proceeding to Phase 3: Required Documents Submission');
    navigate(`/${slug}/onboarding/documents`);
  };

  if (isPhase1Locked) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200 text-center py-12">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Phase 2 is Locked</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You must complete and save <strong>Phase 1: Personal Details & Fun Fact</strong> before you can review and sign your employment offer letter.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate(`/${slug}/onboarding/details`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Phase 1: Personal Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/${slug}/onboarding/dashboard`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Checklist
        </button>

        <div className="flex items-center gap-2">
          {signatureData ? (
            <Badge variant="emerald" size="md">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> SIGNATURE STAMPED
            </Badge>
          ) : (
            <Badge variant="amber" size="md">
              SIGNATURE REQUIRED
            </Badge>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Official Offer Letter & In-App Signing</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review your official employment agreement below, sign directly on the digital pad, and submit without leaving the platform.
        </p>
      </div>

      {isRejected && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-3 text-rose-900 shadow-xs">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-900 text-sm">Onboarding Access Revoked</h4>
            <p>
              Your onboarding case was rejected by HR: <strong>{myCase?.rejectionReason || 'Compliance review declined.'}</strong>
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FORMAL EMPLOYMENT OFFER DOCUMENT PREVIEW (PAPER AESTHETIC) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-8 sm:p-12 space-y-8 text-slate-800 relative">
        {/* Document Watermark / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            {currentTenant.logoUrl ? (
              <img src={currentTenant.logoUrl} alt={currentTenant.name} className="h-10 max-w-[150px] object-contain" />
            ) : (
              <div className="h-10 px-4 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center">
                {currentTenant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentTenant.name}</h3>
              <p className="text-xs text-slate-400">Global People Operations & Talent Department</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p className="font-bold text-slate-700 font-mono">REF: CYR-OFFER-2026-0819</p>
            <p>Date: August 19, 2026</p>
            <p className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Legally Binding Employment Offer
            </p>
          </div>
        </div>

        {/* Candidate Salutation */}
        <div className="space-y-2 text-sm leading-relaxed">
          <p className="font-bold text-slate-900">
            Dear {myCase?.candidateName || currentUser.name},
          </p>
          <p>
            On behalf of <strong>{currentTenant.name}</strong>, we are thrilled to extend this formal offer of employment for the position of{' '}
            <strong className="text-indigo-900">{myCase?.designationName || 'Associate Frontend Developer'}</strong> within the{' '}
            <strong>{myCase?.departmentName || 'Frontend Engineering'}</strong> department.
          </p>
          <p>
            We were very impressed with your skills and background and believe you will make a tremendous impact on our engineering initiatives and company culture.
          </p>
        </div>

        {/* Offer Summary Table */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" /> Summary of Employment Terms
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Designation / Role:</span>
              <span className="font-bold text-slate-900">{myCase?.designationName || 'Associate Frontend Developer'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Department:</span>
              <span className="font-bold text-slate-900">{myCase?.departmentName || 'Frontend Engineering'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Reporting Manager:</span>
              <span className="font-bold text-slate-900">{myCase?.managerName || 'David Chen'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Official Joining Date:</span>
              <span className="font-bold text-slate-900">{myCase?.joiningDate || '2026-08-01'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Work Office / Region:</span>
              <span className="font-bold text-slate-900">{myCase?.regionName || 'North America (US East)'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Annual Base Compensation:</span>
              <span className="font-bold text-emerald-700 font-mono">$115,000 USD / Year</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Equity Grant:</span>
              <span className="font-bold text-indigo-700 font-mono">15,000 Stock Options (4-Yr Vesting)</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500">Health & Benefits:</span>
              <span className="font-bold text-slate-900">Comprehensive Medical, Dental, Vision & 401(k)</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Note */}
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p className="font-semibold text-slate-800">Confidentiality & At-Will Employment:</p>
          <p>
            This offer is contingent upon satisfactory completion of standard pre-employment onboarding verification tasks and background checks. By electronically signing this agreement below, you accept all terms of employment outlined in this document.
          </p>
        </div>

        {/* ============================================================ */}
        {/* DUAL SIGNATURE BLOCK (HR ISSUER + CANDIDATE ACCEPTANCE)     */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* HR Issuance Signature */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Issued on Behalf of Company:
            </span>
            <div className="h-16 flex items-center">
              <span className="font-serif italic text-2xl text-slate-800 tracking-wider">
                Sarah Connor
              </span>
            </div>
            <div className="border-t border-slate-300 pt-2 text-xs">
              <p className="font-bold text-slate-900">Sarah Connor</p>
              <p className="text-slate-500">VP of People Operations, {currentTenant.name}</p>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Signed & Authorized
              </span>
            </div>
          </div>

          {/* Candidate Acceptance Signature */}
          <div className="space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-200">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
              Candidate Acceptance & e-Signature:
            </span>

            {signatureData ? (
              <div className="space-y-2">
                <div className="h-16 flex items-center justify-start">
                  <img
                    src={signatureData}
                    alt="Candidate Drawn Signature"
                    className="h-14 max-w-[220px] object-contain bg-white/70 px-2 py-1 rounded border border-slate-200 shadow-2xs"
                  />
                </div>
                <div className="border-t border-indigo-200 pt-2 text-xs">
                  <p className="font-bold text-slate-900">{myCase?.candidateName || currentUser.name}</p>
                  <p className="text-slate-500">Candidate Signature</p>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                    <Stamp className="w-3 h-3" /> Verified e-Sign • {signedTimestamp ? new Date(signedTimestamp).toLocaleTimeString() : 'Now'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg text-center p-3 bg-white/50">
                <PenTool className="w-5 h-5 text-indigo-500 mb-1" />
                <p className="text-xs font-semibold text-indigo-900">Signature Pad Awaiting Input</p>
                <p className="text-[11px] text-slate-500">Use the interactive signature pad below to sign</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE SIGNATURE DRAWING PAD CANVAS                     */}
      {/* ============================================================ */}
      {!isRejected && (
        <Card className="shadow-md border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              <span>Sign with Mouse or Touch Screen</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Clear Pad
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs text-slate-500">
              Draw your handwritten signature inside the box below using your mouse cursor, stylus, or fingertip on touchscreens:
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/60 p-2 flex justify-center items-center">
              <canvas
                ref={canvasRef}
                width={600}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white rounded-lg border border-slate-200 shadow-inner cursor-crosshair touch-none w-full max-w-[600px] h-[160px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                By clicking "Stamp Signature to Document", your signature is bound to this immutable offer letter version.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={applySignature}
                className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
                leftIcon={<Stamp className="w-4 h-4" />}
              >
                Stamp Signature to Document
              </Button>
            </div>
          </CardContent>

          {/* Final Document Submission Footer */}
          <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 border-t border-slate-200 p-4 rounded-b-xl">
            <div className="text-xs text-slate-500">
              {signatureData ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Signature ready. Click Submit to record signed copy.
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  Draw and stamp your signature above before submitting.
                </span>
              )}
            </div>

            <Button
              onClick={handleFinalSubmit}
              disabled={!signatureData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 shadow-md shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Accept & Proceed to Phase 3: Documents
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
