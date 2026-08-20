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
  Lock,
  User,
} from 'lucide-react';
import { mockStorage } from '@/services/mock-storage';
import { Drawer } from '@/components/ui/Drawer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/Toast';

export const TenantShell: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const currentUser = mockStorage.getCurrentUser();
  const allUsers = mockStorage.getUsers();
  const visibleTenants = mockStorage.getVisibleTenantsForUser(currentUser);

  // Find active tenant by slug and user authorization scope.
  const activeTenant = mockStorage.getAccessibleTenant(currentUser, slug);

  if (!activeTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md p-6 text-center space-y-3">
          <Lock className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No Company Access</h2>
          <p className="text-sm text-slate-500">
            The selected account is not assigned to any company portal.
          </p>
          <Link to="/admin">
            <Button variant="primary">Return to Platform Admin</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentSlug = activeTenant.slug;

  const isTenantAdmin = mockStorage.isTenantAdminFor(currentUser, activeTenant.id);
  const activeTenantUserIds = new Set(
    allUsers
      .filter(
        (u) =>
          u.role === 'SUPER_ADMIN' ||
          u.tenantId === activeTenant.id ||
          (u.role === 'CONSULTANT' && (u.assignedTenantIds || []).includes(activeTenant.id))
      )
      .map((u) => u.id)
  );
  const switchableUsers = allUsers.filter((u) => activeTenantUserIds.has(u.id));

  const feats = activeTenant.features || {
    onboarding: true,
    leaveManagement: true,
    attendance: true,
    knowledgeBase: true,
    announcements: true,
    helpDesk: true,
    meetingRooms: true,
    documentVault: true,
    orgStructure: true,
  };

  // Navigation Items per role with dynamic feature gating
  const adminNavItems = [
    { label: 'Dashboard', path: `/${currentSlug}/dashboard`, icon: LayoutDashboard },
    { label: 'Employees', path: `/${currentSlug}/employees`, icon: Users },
    { label: 'My Profile & Settings', path: `/${currentSlug}/profile`, icon: User },
    ...(feats.onboarding !== false ? [{ label: 'Onboarding Cases', path: `/${currentSlug}/onboarding-cases`, icon: UserPlus }] : []),
    ...(feats.orgStructure !== false ? [
      { label: 'Regions', path: `/${currentSlug}/regions`, icon: Building },
      { label: 'Departments', path: `/${currentSlug}/departments`, icon: Building2 },
      { label: 'Designations', path: `/${currentSlug}/designations`, icon: Briefcase },
    ] : []),
    ...(feats.documentVault !== false ? [{ label: 'Documents', path: `/${currentSlug}/documents`, icon: FileText }] : []),
    ...(feats.leaveManagement !== false ? [
      { label: 'Leave Management', path: `/${currentSlug}/leave/requests`, icon: Calendar },
      { label: 'Holidays', path: `/${currentSlug}/holidays`, icon: CalendarDays },
    ] : []),
    ...(feats.attendance !== false ? [{ label: 'Attendance & OT', path: `/${currentSlug}/attendance/records`, icon: Clock }] : []),
    ...(feats.knowledgeBase !== false ? [{ label: 'Knowledge Base', path: `/${currentSlug}/knowledge-base`, icon: BookOpen }] : []),
    ...(feats.announcements !== false ? [{ label: 'Announcements', path: `/${currentSlug}/announcements`, icon: Megaphone }] : []),
    ...(feats.helpDesk !== false ? [{ label: 'Help Desk Tickets', path: `/${currentSlug}/tickets`, icon: Ticket }] : []),
    ...(feats.meetingRooms !== false ? [{ label: 'Meeting Rooms', path: `/${currentSlug}/rooms`, icon: DoorOpen }] : []),
    { label: 'Audit Logs', path: `/${currentSlug}/audit-logs`, icon: ShieldCheck },
  ];

  const employeeNavItems = [
    { label: 'Dashboard', path: `/${currentSlug}/dashboard`, icon: LayoutDashboard },
    { label: 'Directory', path: `/${currentSlug}/employees`, icon: Users },
    { label: 'My Profile & Settings', path: `/${currentSlug}/profile`, icon: User },
    ...(feats.attendance !== false ? [{ label: 'My Attendance', path: `/${currentSlug}/attendance`, icon: Clock }] : []),
    ...(feats.leaveManagement !== false ? [
      { label: 'My Leave', path: `/${currentSlug}/leave/balances`, icon: Calendar },
      { label: 'Holidays', path: `/${currentSlug}/holidays`, icon: CalendarDays },
    ] : []),
    ...(feats.documentVault !== false ? [{ label: 'Documents', path: `/${currentSlug}/documents`, icon: FileText }] : []),
    ...(feats.knowledgeBase !== false ? [{ label: 'Knowledge Base', path: `/${currentSlug}/knowledge-base`, icon: BookOpen }] : []),
    ...(feats.announcements !== false ? [{ label: 'Announcements', path: `/${currentSlug}/announcements`, icon: Megaphone }] : []),
    ...(feats.helpDesk !== false ? [{ label: 'Tickets', path: `/${currentSlug}/tickets`, icon: Ticket }] : []),
    ...(feats.meetingRooms !== false ? [{ label: 'Meeting Rooms', path: `/${currentSlug}/rooms`, icon: DoorOpen }] : []),
  ];

  const navItems = isTenantAdmin ? adminNavItems : employeeNavItems;

  // Check if current route is disabled
  const isCurrentFeatureDisabled =
    (location.pathname.includes('/onboarding-cases') && feats.onboarding === false) ||
    ((location.pathname.includes('/leave') || location.pathname.includes('/holidays')) && feats.leaveManagement === false) ||
    (location.pathname.includes('/attendance') && feats.attendance === false) ||
    (location.pathname.includes('/knowledge-base') && feats.knowledgeBase === false) ||
    (location.pathname.includes('/announcements') && feats.announcements === false) ||
    (location.pathname.includes('/tickets') && feats.helpDesk === false) ||
    (location.pathname.includes('/rooms') && feats.meetingRooms === false) ||
    (location.pathname.includes('/documents') && feats.documentVault === false) ||
    ((location.pathname.includes('/regions') || location.pathname.includes('/departments') || location.pathname.includes('/designations')) && feats.orgStructure === false);

  const handleRoleSwitch = (userId: string) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      mockStorage.setCurrentUser(targetUser);
      if (targetUser.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (targetUser.role === 'NEW_HIRE') {
        window.location.href = `/${currentSlug}/onboarding/dashboard`;
      } else if (targetUser.tenantId) {
        const tenant = mockStorage.getTenants().find((t) => t.id === targetUser.tenantId);
        window.location.href = `/${tenant?.slug || currentSlug}/dashboard`;
      } else if (targetUser.role === 'CONSULTANT') {
        const tenant = mockStorage.getAccessibleTenant(targetUser, currentSlug);
        window.location.href = tenant ? `/${tenant.slug}/dashboard` : '/admin/consultants';
      } else {
        window.location.reload();
      }
    }
  };

  const handleTenantSwitch = (newSlug: string) => {
    navigate(`/${newSlug}/dashboard`);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200">
      {/* Mandated Tenant Branding Surface: Logo displayed on WHITE background */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center">
        {activeTenant.logoUrl ? (
          <img
            src={activeTenant.logoUrl}
            alt={activeTenant.name}
            className="h-9 max-w-[160px] object-contain"
          />
        ) : (
          <div className="h-9 px-3.5 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
            {activeTenant.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Tenant Context Selector */}
      {visibleTenants.length > 1 && (
        <div className="px-3 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
          <label className="text-[11px] font-medium text-slate-500 px-2 mb-1 block">
            Company Portal Context:
          </label>
          <select
            value={currentSlug}
            onChange={(e) => handleTenantSwitch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer font-medium"
          >
            {visibleTenants.map((t) => (
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
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Demo Switcher Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span className="flex items-center gap-1 text-[11px]">
            <UserCheck className="w-3 h-3 text-indigo-600" />
            Switch Active User:
          </span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => handleRoleSwitch(e.target.value)}
          className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-md p-1.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer font-medium"
        >
          {switchableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({mockStorage.getRoleLabel(u.role)})
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar (Fixed in single screen) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 z-20 sticky top-0 h-screen overflow-hidden">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <Drawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
        <NavContent />
      </Drawer>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
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
                <span className="text-xs text-slate-500">{mockStorage.getRoleLabel(currentUser.role)}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                    {mockStorage.getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <Link
                  to={`/${currentSlug}/profile`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  My Profile & Settings
                </Link>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full">
          {currentUser.role === 'NEW_HIRE' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                  <UserPlus className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Pre-Employment Onboarding in Progress</h4>
                  <p className="text-xs text-amber-700">
                    Complete your remaining checklist requirements. Full operational features unlock upon HR approval.
                  </p>
                </div>
              </div>
              <Link to={`/${currentSlug}/onboarding/dashboard`}>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0">
                  Go to Onboarding Checklist →
                </Button>
              </Link>
            </div>
          )}

          {isCurrentFeatureDisabled ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto my-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Module Disabled for {activeTenant.name}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                This feature has been deactivated by the Platform Super Admin in company configuration settings.
              </p>
              <Link to={`/${currentSlug}/dashboard`}>
                <Button variant="primary" className="mt-2">Return to Company Dashboard</Button>
              </Link>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
