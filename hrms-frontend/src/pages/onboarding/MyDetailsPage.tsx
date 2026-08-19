import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { OnboardingCase } from '@/demo-data/seedData';
import { UserCheck, ShieldCheck, Building2, Briefcase, Calendar, MapPin, User, AlertOctagon, ArrowRight } from 'lucide-react';

export const MyDetailsPage: React.FC = () => {
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

  const [phone, setPhone] = useState(myCase?.phone || '');
  const [address, setAddress] = useState(myCase?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(myCase?.emergencyContact || '');
  const [funFact, setFunFact] = useState(myCase?.funFact || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRejected) {
      toast.error('Your onboarding case has been rejected. Submissions are locked.');
      return;
    }

    if (myCase) {
      mockStorage.updateTenantItem<OnboardingCase>(KEYS.ONBOARDING_CASES, myCase.id, {
        personalDetailsCompleted: true,
        phone,
        address,
        emergencyContact,
        funFact,
      });
    }
    toast.success('✅ Phase 1 Completed! Proceeding to Phase 2: Offer Letter Review');
    navigate(`/${slug}/onboarding/offer`);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Details & Profile</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review your official employment parameters entered by HR and complete your required contact details.
        </p>
      </div>

      {isRejected && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-3 text-rose-900 shadow-xs">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-900 text-sm">Onboarding Access Revoked</h4>
            <p>
              Your onboarding application was rejected by HR: <strong>{myCase?.rejectionReason || 'Compliance review declined.'}</strong>
            </p>
            <p className="text-rose-700">All permissions have been revoked. Please contact HR at hr@acme-corp.com.</p>
          </div>
        </div>
      )}

      {/* Official Employment Parameters (Read-Only) */}
      <Card className="border-l-4 border-l-indigo-600 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Official Employment Assignment
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified details configured during candidate recruitment & provisioning.
            </p>
          </div>
          <Badge variant="indigo">VERIFIED BY HR (READ-ONLY)</Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-medium block">Assigned Designation</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                {myCase?.designationName || 'Associate Frontend Developer'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Department / Squad</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-4 h-4 text-indigo-500" />
                {myCase?.departmentName || 'Frontend Engineering'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Reporting Manager</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <User className="w-4 h-4 text-slate-400" />
                {myCase?.managerName || 'David Chen'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Official Start / Joining Date</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {myCase?.joiningDate || '2026-08-01'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Assigned Region / Office</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {myCase?.regionName || 'North America (US East)'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Employee Reference ID</span>
              <span className="text-sm font-mono font-bold text-indigo-700 mt-0.5 block">
                {myCase?.employeeId || 'EMP-1012'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Contact & Personal Details Form */}
      <form onSubmit={handleSubmit}>
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" /> Candidate Contact & Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name">
                <Input value={currentUser.name} disabled className="bg-slate-100 font-medium text-slate-700" />
              </FormField>

              <FormField label="Work Email Address">
                <Input value={currentUser.email} disabled className="bg-slate-100 font-medium text-slate-700" />
              </FormField>
            </div>

            <FormField label="Personal Phone Number" required helperText="Used for two-factor authentication and urgent alerts">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (415) 555-0123"
                disabled={isRejected}
                required
              />
            </FormField>

            <FormField label="Residential Address" required>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="742 Evergreen Terrace, San Francisco, CA"
                disabled={isRejected}
                required
              />
            </FormField>

            <FormField label="Emergency Contact (Name, Relation & Phone)" required>
              <Input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Jane Doe (+1 415 555-9876) - Spouse / Sibling"
                disabled={isRejected}
                required
              />
            </FormField>

            <FormField label="Fun Fact About You 🎉" required helperText="Shared with the team on your welcome introduction">
              <textarea
                value={funFact}
                onChange={(e) => setFunFact(e.target.value)}
                placeholder="Tell us an interesting hobby, secret talent, or favorite cuisine..."
                rows={3}
                disabled={isRejected}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                required
              />
            </FormField>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-slate-50/50 rounded-b-xl border-t border-slate-100">
            <Button type="submit" disabled={isRejected} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Save & Proceed to Phase 2: Offer Letter
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
