import React from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { LayoutDashboard, UserCheck, FileText, CheckSquare, LogOut } from 'lucide-react';
import { mockStorage } from '@/services/mock-storage';
import { ToastContainer } from '@/components/ui/Toast';

export const OnboardingShell: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  const currentUser = mockStorage.getCurrentUser();
  const allTenants = mockStorage.getTenants();
  const activeTenant = allTenants.find((t) => t.slug === slug) || allTenants[0];

  const currentSlug = activeTenant.slug;

  const navItems = [
    { label: 'Onboarding Dashboard', path: `/${currentSlug}/onboarding/dashboard`, icon: LayoutDashboard },
    { label: 'My Details', path: `/${currentSlug}/onboarding/details`, icon: UserCheck },
    { label: 'Offer Letter', path: `/${currentSlug}/onboarding/offer`, icon: FileText },
    { label: 'Required Documents', path: `/${currentSlug}/onboarding/documents`, icon: CheckSquare },
    { label: 'Acknowledgement', path: `/${currentSlug}/onboarding/acknowledgement`, icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with White Logo Surface */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeTenant.logoUrl ? (
              <img src={activeTenant.logoUrl} alt={activeTenant.name} className="h-9 max-w-[140px] object-contain" />
            ) : (
              <div className="h-9 px-3 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center">
                {activeTenant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-700 hidden sm:inline">
              New Hire Onboarding Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-200">
              Welcome, {currentUser.name}
            </span>
            <Link to="/auth/login" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shrink-0',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
};
