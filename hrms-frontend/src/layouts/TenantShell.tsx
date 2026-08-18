import React, { useState } from 'react';
import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Users,
  Building,
  Briefcase,
  UserPlus,
  FileText,
  Calendar,
  CalendarDays,
  Clock,
  BookOpen,
  Megaphone,
  Ticket,
  DoorOpen,
  ShieldCheck,
  LogOut,
  Menu,
  ChevronDown,
  UserCheck,
  Building2,
} from 'lucide-react';
import { mockStorage } from '@/services/mock-storage';
import { Drawer } from '@/components/ui/Drawer';
import { Avatar } from '@/components/ui/Avatar';
import { ToastContainer } from '@/components/ui/Toast';

export const TenantShell: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const currentUser = mockStorage.getCurrentUser();
  const allUsers = mockStorage.getUsers();
  const allTenants = mockStorage.getTenants();

  // Find active tenant by slug
  const activeTenant =
    allTenants.find((t) => t.slug === slug) || allTenants[0];

  const currentSlug = activeTenant.slug;

  const isTenantAdmin = currentUser.role === 'TENANT_ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Navigation Items per role
  const adminNavItems = [
    { label: 'Dashboard', path: `/${currentSlug}/dashboard`, icon: LayoutDashboard },
    { label: 'Employees', path: `/${currentSlug}/employees`, icon: Users },
    { label: 'Onboarding Cases', path: `/${currentSlug}/onboarding/cases`, icon: UserPlus },
    { label: 'Regions', path: `/${currentSlug}/regions`, icon: Building },
    { label: 'Departments', path: `/${currentSlug}/departments`, icon: Building2 },
    { label: 'Designations', path: `/${currentSlug}/designations`, icon: Briefcase },
    { label: 'Documents', path: `/${currentSlug}/documents`, icon: FileText },
    { label: 'Leave Management', path: `/${currentSlug}/leave/requests`, icon: Calendar },
    { label: 'Holidays', path: `/${currentSlug}/holidays`, icon: CalendarDays },
    { label: 'Attendance & OT', path: `/${currentSlug}/attendance/records`, icon: Clock },
    { label: 'Knowledge Base', path: `/${currentSlug}/knowledge-base`, icon: BookOpen },
    { label: 'Announcements', path: `/${currentSlug}/announcements`, icon: Megaphone },
    { label: 'Help Desk Tickets', path: `/${currentSlug}/tickets`, icon: Ticket },
    { label: 'Meeting Rooms', path: `/${currentSlug}/rooms`, icon: DoorOpen },
    { label: 'Audit Logs', path: `/${currentSlug}/audit-logs`, icon: ShieldCheck },
  ];

  const employeeNavItems = [
    { label: 'Dashboard', path: `/${currentSlug}/dashboard`, icon: LayoutDashboard },
    { label: 'Directory', path: `/${currentSlug}/employees`, icon: Users },
    { label: 'My Attendance', path: `/${currentSlug}/attendance`, icon: Clock },
    { label: 'My Leave', path: `/${currentSlug}/leave/balances`, icon: Calendar },
    { label: 'Holidays', path: `/${currentSlug}/holidays`, icon: CalendarDays },
    { label: 'Documents', path: `/${currentSlug}/documents`, icon: FileText },
    { label: 'Knowledge Base', path: `/${currentSlug}/knowledge-base`, icon: BookOpen },
    { label: 'Announcements', path: `/${currentSlug}/announcements`, icon: Megaphone },
    { label: 'Tickets', path: `/${currentSlug}/tickets`, icon: Ticket },
    { label: 'Meeting Rooms', path: `/${currentSlug}/rooms`, icon: DoorOpen },
  ];

  const navItems = isTenantAdmin ? adminNavItems : employeeNavItems;

  const handleRoleSwitch = (userId: string) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      mockStorage.setCurrentUser(targetUser);
      if (targetUser.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (targetUser.role === 'NEW_HIRE') {
        window.location.href = `/${currentSlug}/onboarding/dashboard`;
      } else if (targetUser.tenantId) {
        const tenant = allTenants.find((t) => t.id === targetUser.tenantId);
        window.location.href = `/${tenant?.slug || currentSlug}/dashboard`;
      } else {
        window.location.reload();
      }
    }
  };

  const handleTenantSwitch = (newSlug: string) => {
    navigate(`/${newSlug}/dashboard`);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Mandated Tenant Branding Surface: Logo displayed on WHITE background */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {activeTenant.logoUrl ? (
            <img
              src={activeTenant.logoUrl}
              alt={activeTenant.name}
              className="h-9 max-w-[140px] object-contain"
            />
          ) : (
            <div className="h-9 px-3 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
              {activeTenant.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
          {activeTenant.slug}
        </span>
      </div>

      {/* Tenant Context Selector */}
      {allTenants.length > 1 && (
        <div className="px-3 pt-3 pb-1 border-b border-slate-800">
          <label className="text-[11px] font-medium text-slate-400 px-2 mb-1 block">
            Company Portal Context:
          </label>
          <select
            value={currentSlug}
            onChange={(e) => handleTenantSwitch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {allTenants.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name} ({t.status})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Demo Switcher Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 text-[11px]">
            <UserCheck className="w-3 h-3 text-indigo-400" />
            Switch Active User:
          </span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => handleRoleSwitch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md p-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 z-20">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <Drawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
        <NavContent />
      </Drawer>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm hidden sm:inline">
                {activeTenant.name}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-mono">
                cyrcalur.hr/{currentSlug}
              </span>
            </div>
          </div>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Avatar src={currentUser.avatarUrl} name={currentUser.name} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-xs text-slate-500">{currentUser.role}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                    {currentUser.role}
                  </span>
                </div>
                <Link
                  to="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
