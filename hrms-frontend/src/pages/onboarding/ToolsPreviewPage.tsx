import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockStorage, KEYS } from '@/services/mock-storage';
import { OnboardingCase } from '@/demo-data/seedData';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Ticket,
  DoorOpen,
  BookOpen,
  Users,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  AlertOctagon,
  Mail,
} from 'lucide-react';

export const ToolsPreviewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = mockStorage.getCurrentUser();
  const tenants = mockStorage.getTenants();
  const currentTenant = tenants.find((t) => t.slug === slug) || tenants[0];

  const cases = mockStorage.getOnboardingCases(currentTenant.id);
  const myCase = cases.find(
    (c) => c.userId === currentUser.id || c.email.toLowerCase() === currentUser.email.toLowerCase()
  ) || cases[0];

  const isApproved = currentUser.role === 'EMPLOYEE' || myCase?.status === 'APPROVED';
  const isRejected = myCase?.status === 'REJECTED' || currentUser.status === 'SUSPENDED';

  const previewModules = [
    {
      title: 'Employee Directory & Org Chart',
      desc: 'Browse colleagues across engineering, design, and operations squads with direct email and contact details.',
      icon: Users,
      color: 'indigo',
    },
    {
      title: 'Leave & PTO Management',
      desc: 'Apply for Paid Time Off, view annual balance credits, and track approval status in real-time.',
      icon: Calendar,
      color: 'amber',
    },
    {
      title: 'Time & Attendance Clock-in',
      desc: 'Log daily attendance records, request overtime, and track work shift logs seamlessly.',
      icon: Clock,
      color: 'emerald',
    },
    {
      title: 'Internal Help Desk & IT Support',
      desc: 'Raise IT equipment requests, access VPN permissions, and communicate with workplace operations.',
      icon: Ticket,
      color: 'sky',
    },
    {
      title: 'Meeting Room Reservations',
      desc: 'Reserve smart conference halls and focus pods across office buildings.',
      icon: DoorOpen,
      color: 'violet',
    },
    {
      title: 'Knowledge Base & Policies',
      desc: 'Access architectural guidelines, expense reimbursement workflows, and company standards.',
      icon: BookOpen,
      color: 'rose',
    },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Banner */}
      {isRejected ? (
        <div className="p-6 bg-gradient-to-r from-rose-700 to-red-900 rounded-2xl text-white shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-300" />
            <span>Permissions Revoked</span>
          </div>
          <h2 className="text-2xl font-bold">Onboarding Case Declined</h2>
          <p className="text-sm text-rose-100">
            Your application was rejected by HR: <strong>"{myCase?.rejectionReason || 'Compliance review failed.'}"</strong>
          </p>
          <a
            href="mailto:hr@acme-corp.com"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-rose-900 font-bold text-xs shadow-xs hover:bg-rose-50"
          >
            <Mail className="w-3.5 h-3.5" /> Contact HR (hr@acme-corp.com)
          </a>
        </div>
      ) : isApproved ? (
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Full Software Access Granted</span>
            </div>
            <h2 className="text-2xl font-bold">Onboarding Approved & Finalized!</h2>
            <p className="text-sm text-emerald-100 mt-1">
              You are now a permanent employee of {currentTenant.name}. All modules are unlocked.
            </p>
          </div>
          <Link to={`/${currentTenant.slug}/dashboard`}>
            <Button variant="secondary" className="bg-white text-emerald-800 font-bold shadow-md hover:bg-emerald-50">
              Enter Company Portal →
            </Button>
          </Link>
        </div>
      ) : (
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Pre-Employment Restricted Mode</span>
            </div>
            <h2 className="text-2xl font-bold">Company Tools & Modules (Preview)</h2>
            <p className="text-sm text-slate-300 mt-1">
              These operational modules will unlock automatically once HR reviews and approves your completed onboarding tasks.
            </p>
          </div>
          <Link to={`/${slug}/onboarding/dashboard`}>
            <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-500 font-semibold text-white">
              Back to Checklist →
            </Button>
          </Link>
        </div>
      )}

      {/* Onboarding Status Summary Pill */}
      <Card className="p-4 bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Your Current Status: {currentUser.role}</h4>
              <p className="text-xs text-slate-500">
                {isApproved
                  ? 'Active Permanent Employee with full portal permissions'
                  : isRejected
                  ? 'Application declined — Access revoked by HR'
                  : 'Onboarding in progress — Awaiting HR final review and approval'}
              </p>
            </div>
          </div>
          <Badge variant={isApproved ? 'emerald' : isRejected ? 'rose' : 'amber'}>
            {isApproved ? 'APPROVED & PERMANENT' : isRejected ? 'REJECTED' : 'PRE-EMPLOYMENT'}
          </Badge>
        </div>
      </Card>

      {/* Module Grid Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {previewModules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="p-5 border border-slate-200/80 hover:shadow-xs transition-all relative overflow-hidden">
              {!isApproved && (
                <div className="absolute top-3 right-3 text-slate-400 flex items-center gap-1 text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3 text-slate-400" /> Locked until HR approval
                </div>
              )}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
