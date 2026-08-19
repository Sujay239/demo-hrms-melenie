import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockStorage } from '@/services/mock-storage';
import {
  CheckCircle2,
  Circle,
  FileText,
  UserCheck,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
  Building,
  ShieldCheck,
  AlertOctagon,
  Mail,
  Phone,
} from 'lucide-react';

export const OnboardingDashboardPage: React.FC = () => {
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

  const phase1Done = myCase?.personalDetailsCompleted || false;
  const phase2Done = myCase?.offerSignedUploaded || false;
  const phase3Done = myCase?.requiredDocsUploaded || false;
  const phase4Done = myCase?.acknowledgementSigned || false;

  const tasks = [
    {
      id: '1',
      phaseNum: 1,
      name: 'Phase 1: Personal Details & Fun Fact',
      desc: 'Contact info, emergency contacts & team welcome note',
      completed: phase1Done,
      isLocked: false,
      path: `/${slug}/onboarding/details`,
    },
    {
      id: '2',
      phaseNum: 2,
      name: 'Phase 2: Offer Letter Review & e-Signature',
      desc: 'Review official offer document and execute digital canvas signature',
      completed: phase2Done,
      isLocked: !phase1Done,
      lockReason: 'Complete Phase 1 first',
      path: `/${slug}/onboarding/offer`,
    },
    {
      id: '3',
      phaseNum: 3,
      name: 'Phase 3: Required Documents Submission',
      desc: 'Upload Government Photo ID, Tax withholding & Education transcripts',
      completed: phase3Done,
      isLocked: !phase1Done || !phase2Done,
      lockReason: 'Complete Phase 2 first',
      path: `/${slug}/onboarding/documents`,
    },
    {
      id: '4',
      phaseNum: 4,
      name: 'Phase 4: Policy Acknowledgement (Name, Place, Date)',
      desc: 'Electronic acknowledgement of InfoSec & Code of Conduct guidelines',
      completed: phase4Done,
      isLocked: !phase1Done || !phase2Done || !phase3Done,
      lockReason: 'Complete Phase 3 first',
      path: `/${slug}/onboarding/acknowledgement`,
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);
  const allTasksDone = completedCount === tasks.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full">
      {/* 1. REJECTED STATE BANNER */}
      {isRejected ? (
        <div className="bg-gradient-to-r from-rose-700 to-red-900 rounded-2xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-300" />
            <span>Onboarding Status: Access Revoked & Rejected</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Onboarding Application Declined</h2>
            <p className="text-sm text-rose-100 mt-1">
              Your onboarding case for {currentTenant.name} has been rejected and all system access permissions have been revoked.
            </p>
          </div>

          {/* Rejection Reason Card */}
          <div className="p-4 bg-black/25 backdrop-blur-xs rounded-xl border border-rose-300/30 text-xs space-y-1">
            <span className="font-bold text-rose-200 uppercase tracking-wider text-[11px] block">
              Reason Provided by HR Administration:
            </span>
            <p className="text-sm text-white font-medium">
              "{myCase?.rejectionReason || 'Compliance documentation verification failed or recruitment offer was revoked.'}"
            </p>
            <p className="text-[11px] text-rose-300 pt-1">
              Decision recorded by {myCase?.rejectedBy || 'HR Admin'} on{' '}
              {myCase?.rejectedAt ? new Date(myCase.rejectedAt).toLocaleDateString() : 'Today'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="mailto:hr@acme-corp.com?subject=Inquiry regarding onboarding case"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-rose-900 font-bold text-xs shadow-md hover:bg-rose-50"
            >
              <Mail className="w-4 h-4" /> Contact HR Administrator (hr@acme-corp.com)
            </a>
          </div>
        </div>
      ) : isApproved ? (
        /* 2. APPROVED STATE BANNER */
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-md text-white border border-white/30 flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Onboarding Approved • Permanent Employee
            </span>
            <h2 className="text-2xl font-bold mt-2">Welcome to the Team, {currentUser.name}!</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Your onboarding case has been verified and approved by HR. You now have full permanent access to all company tools and directories.
            </p>
          </div>

          <Link to={`/${currentTenant.slug}/dashboard`} className="shrink-0">
            <Button variant="secondary" className="bg-white text-emerald-800 font-bold shadow-lg hover:bg-emerald-50 py-3">
              Enter Full Company Portal →
            </Button>
          </Link>
        </div>
      ) : allTasksDone ? (
        /* 3. UNDER REVIEW STATE BANNER */
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-md text-white border border-white/30 flex items-center gap-1.5 w-fit">
              <Clock className="w-3.5 h-3.5" />
              All 4 Phases Completed • Awaiting HR Sign-Off
            </span>
            <h2 className="text-2xl font-bold mt-2">Great job, {currentUser.name}!</h2>
            <p className="text-xs text-amber-100 mt-1">
              You have completed all 4 onboarding requirements. Your HR Admin is reviewing your submitted artifacts to activate permanent access.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider">Status</p>
            <h3 className="text-xl font-bold mt-0.5">Under Review</h3>
            <p className="text-[11px] text-amber-100 mt-0.5">100% submitted</p>
          </div>
        </div>
      ) : (
        /* 4. FRESH IN-PROGRESS STATE BANNER (0% - 75%) */
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-md border border-indigo-500/40">
              Sequential Pre-Employment Onboarding
            </span>
            <h2 className="text-2xl font-bold mt-2">Welcome to {currentTenant.name}, {currentUser.name}!</h2>
            <p className="text-xs text-slate-300 mt-1">
              Complete each onboarding phase in sequential order to unlock subsequent steps and prepare for your first day.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center shrink-0">
            <p className="text-xs font-semibold text-indigo-200 uppercase">Onboarding Completion</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{progressPct}%</h3>
            <p className="text-[11px] text-slate-300 mt-0.5">{completedCount} of {tasks.length} phases done</p>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to={`/${slug}/onboarding/details`}>
          <Card className="p-4 hover:shadow-md transition-all border border-slate-200 group cursor-pointer bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">My Employment Profile & Details</h4>
                  <p className="text-xs text-slate-500">View official job assignment and contact info</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </Link>

        <Link to={`/${slug}/onboarding/preview`}>
          <Card className="p-4 hover:shadow-md transition-all border border-slate-200 group cursor-pointer bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Company Tools (Preview)</h4>
                  <p className="text-xs text-slate-500">Preview modules that unlock after approval</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Task Checklist Progress with Sequential Lock Gating */}
      <Card className={isRejected ? 'opacity-70 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" /> Sequential Onboarding Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                task.completed
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : task.isLocked
                  ? 'bg-slate-50 border-slate-200/80 opacity-75'
                  : 'bg-white border-indigo-200 ring-2 ring-indigo-50 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : task.isLocked ? (
                  <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${task.isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                      {task.name}
                    </h4>
                    {task.isLocked && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200 px-1.5 py-0.2 rounded">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{task.desc}</p>
                  {task.isLocked && (
                    <p className="text-[11px] text-amber-700 font-medium mt-1">
                      🔒 Complete previous phases to unlock this step.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Badge
                  variant={task.completed ? 'emerald' : task.isLocked ? 'neutral' : 'indigo'}
                  size="sm"
                >
                  {task.completed ? 'COMPLETED' : task.isLocked ? 'LOCKED' : 'READY TO START'}
                </Badge>

                {task.isLocked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                    className="opacity-60 cursor-not-allowed whitespace-nowrap shrink-0"
                  >
                    Locked
                  </Button>
                ) : (
                  <Link to={task.path}>
                    <Button
                      variant={task.completed ? 'outline' : 'primary'}
                      size="sm"
                      disabled={isRejected}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {task.completed ? 'Review / Edit' : 'Start Phase'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
