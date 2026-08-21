import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormField } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toast";
import { mockStorage, KEYS } from "@/services/mock-storage";
import { OnboardingCase } from "@/demo-data/seedData";
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  AlertOctagon,
  Lock,
  ArrowRight,
} from "lucide-react";

export const AcknowledgementPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const cases = mockStorage.getOnboardingCases(currentTenant.id);
  const myCase =
    cases.find(
      (c) =>
        c.userId === currentUser.id ||
        c.email.toLowerCase() === currentUser.email.toLowerCase(),
    ) || cases[0];

  const isRejected =
    myCase?.status === "REJECTED" || currentUser.status === "SUSPENDED";
  const isPhase3Locked =
    !myCase?.personalDetailsCompleted ||
    !myCase?.offerSignedUploaded ||
    !myCase?.requiredDocsUploaded;

  const [name, setName] = useState(
    myCase?.acknowledgementName || currentUser.name,
  );
  const [place, setPlace] = useState(myCase?.acknowledgementPlace || "");
  const [date, setDate] = useState(
    myCase?.acknowledgementDate || new Date().toISOString().split("T")[0],
  );
  const [confirmed, setConfirmed] = useState(
    myCase?.acknowledgementSigned || false,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRejected) {
      toast.error("Onboarding case is rejected. Submissions are locked.");
      return;
    }

    if (!confirmed) {
      toast.error(
        "Please check the confirmation box to agree to company policies",
      );
      return;
    }

    if (myCase) {
      mockStorage.updateTenantItem<OnboardingCase>(
        KEYS.ONBOARDING_CASES,
        myCase.id,
        {
          acknowledgementSigned: true,
          acknowledgementName: name,
          acknowledgementPlace: place,
          acknowledgementDate: date,
          status: "SUBMITTED_FOR_REVIEW",
          submittedAt: new Date().toISOString(),
        },
      );
    }

    mockStorage.addAuditLog(
      "ONBOARDING_ACKNOWLEDGEMENT_SIGNED",
      "ONBOARDING_CASE",
      myCase?.id || currentUser.id,
    );
    toast.success(
      "🎉 Policy signed! All onboarding tasks submitted for HR review.",
    );
    navigate(`/${slug}/onboarding/dashboard`);
  };

  const handleDownload = () => {
    toast.success("Official Policy Acknowledgement PDF generated & downloaded");
  };

  if (isPhase3Locked) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200 text-center py-12">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Phase 4 is Locked
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You must complete and submit{" "}
            <strong>Phase 3: Required Documents Submission</strong> before
            signing company policy acknowledgements.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate(`/${slug}/onboarding/documents`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Phase 3: Required Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Company Policy Acknowledgement
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review company policies and InfoSec rules, execute electronic sign-off
          with Name, Place & Date, and download your copy.
        </p>
      </div>

      {isRejected && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-3 text-rose-900 shadow-xs">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-900 text-sm">
              Onboarding Access Revoked
            </h4>
            <p>
              Your onboarding was rejected by HR:{" "}
              <strong>
                {myCase?.rejectionReason || "Compliance verification declined."}
              </strong>
            </p>
            <p className="text-rose-700">
              Please contact HR at hr@acme-corp.com.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Formal Policy
              Sign-Off & Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto space-y-2">
              <p className="font-bold text-slate-900">
                Standard Code of Conduct, Anti-Harassment & InfoSec Agreement
              </p>
              <p>
                I hereby acknowledge that I have received, read, and understood
                the Peopleworkplaces HRMS and {currentTenant.name} Code of
                Conduct, Anti-Harassment Guidelines, Acceptable Asset Use, and
                Information Security Policies.
              </p>
              <p>
                I agree to adhere strictly to all organizational security
                procedures, handle company confidential data responsibly, and
                comply with applicable workplace regulations.
              </p>
            </div>

            <FormField
              label="Full Legal Name"
              required
              helperText="As stated on legal government identification"
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Legal Name"
                disabled={isRejected}
                required
              />
            </FormField>

            <FormField label="Signing Location / City & State" required>
              <Input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                disabled={isRejected}
                required
              />
            </FormField>

            <FormField label="Signing Date" required>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="Select signing date"
                disabled={isRejected}
                required
              />
            </FormField>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={isRejected}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600"
                />
                <span>
                  I explicitly confirm, agree to all terms stated above, and
                  submit my onboarding case for HR review.
                </span>
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between bg-slate-50/50 rounded-b-xl border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
            >
              Download PDF Copy
            </Button>
            <Button
              type="submit"
              disabled={isRejected}
              leftIcon={<FileCheck className="w-4 h-4" />}
            >
              Submit for HR Sign-Off
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
