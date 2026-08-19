import React from 'react';
import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { LayoutDashboard, UserCheck, FileText, CheckSquare, LogOut, Lock, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { mockStorage } from '@/services/mock-storage';
import { ToastContainer, toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export const OnboardingShell: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const currentUser = mockStorage.getCurrentUser();
  const allTenants = mockStorage.getTenants();
  const activeTenant = allTenants.find((t) => t.slug === slug) || allTenants[0];

  const currentSlug = activeTenant.slug;
  const isApproved = currentUser.role === 'EMPLOYEE';

  const cases = mockStorage.getOnboardingCases(activeTenant.id);
  const myCase = cases.find(
    (c) => c.userId === currentUser.id || c.email.toLowerCase() === currentUser.email.toLowerCase()
  ) || cases[0];

  const phase1Done = myCase?.personalDetailsCompleted || false;
  const phase2Done = myCase?.offerSignedUploaded || false;
  const phase3Done = myCase?.requiredDocsUploaded || false;
  const phase4Done = myCase?.acknowledgementSigned || false;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Onboarding Checklist',
      path: `/${currentSlug}/onboarding/dashboard`,
      icon: LayoutDashboard,
      isLocked: false,
      isDone: phase1Done && phase2Done && phase3Done && phase4Done,
    },
    {
      id: 'details',
      label: '1. Personal Details',
      path: `/${currentSlug}/onboarding/details`,
      icon: UserCheck,
      isLocked: false,
      isDone: phase1Done,
    },
    {
      id: 'offer',
      label: '2. Offer Letter & Sign',
      path: `/${currentSlug}/onboarding/offer`,
      icon: FileText,
      isLocked: !phase1Done,
      lockMessage: 'Complete Phase 1 (Personal Details) to unlock Offer Letter signing.',
      isDone: phase2Done,
    },
    {
      id: 'documents',
      label: '3. Required Documents',
      path: `/${currentSlug}/onboarding/documents`,
      icon: CheckSquare,
      isLocked: !phase1Done || !phase2Done,
      lockMessage: 'Complete Phase 2 (Offer Letter Signing) to unlock Document Submission.',
      isDone: phase3Done,
    },
    {
      id: 'acknowledgement',
      label: '4. Policy Sign-Off',
      path: `/${currentSlug}/onboarding/acknowledgement`,
      icon: CheckSquare,
      isLocked: !phase1Done || !phase2Done || !phase3Done,
      lockMessage: 'Complete Phase 3 (Required Documents) to unlock Policy Sign-Off.',
      isDone: phase4Done,
    },
    {
      id: 'preview',
      label: 'Company Tools (Preview)',
      path: `/${currentSlug}/onboarding/preview`,
      icon: Lock,
      isLocked: false,
      isDone: isApproved,
    },
  ];

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.isLocked) {
      e.preventDefault();
      toast.error(item.lockMessage || 'This phase is locked until you complete previous steps.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with White Logo Surface */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeTenant.logoUrl ? (
              <img src={activeTenant.logoUrl} alt={activeTenant.name} className="h-9 max-w-[140px] object-contain" />
            ) : (
              <div className="h-9 px-3 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center">
                {activeTenant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-slate-800">
                New Hire Onboarding Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">cyrcalur.hr/{currentSlug}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isApproved ? (
              <Link to={`/${currentSlug}/dashboard`}>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Enter Company Portal →
                </Button>
              </Link>
            ) : (
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Onboarding: {currentUser.name}
              </span>
            )}
            <Link to="/auth/login" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100" title="Sign out">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar with Locked Indicators */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 select-none',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : item.isLocked
                    ? 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-75 border border-slate-200/50'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {item.isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : item.isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 shrink-0" />
                )}
                <span>{item.label}</span>
                {item.isLocked && (
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                    Locked
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
};
