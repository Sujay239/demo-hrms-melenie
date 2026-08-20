import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Building2,
  Users2,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { mockStorage } from '@/services/mock-storage';
import { Drawer } from '@/components/ui/Drawer';
import { Avatar } from '@/components/ui/Avatar';
import { ToastContainer } from '@/components/ui/Toast';

export const PlatformShell: React.FC = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const currentUser = mockStorage.getCurrentUser();
  const allUsers = mockStorage.getUsers();

  const navItems = [
    { label: 'Platform Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Tenants & Companies', path: '/admin/tenants', icon: Building2 },
    { label: 'Consultants', path: '/admin/consultants', icon: Users2 },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
    { label: 'Platform Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const handleRoleSwitch = (userId: string) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (targetUser) {
      mockStorage.setCurrentUser(targetUser);
      // Redirect according to role
      if (targetUser.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (targetUser.role === 'NEW_HIRE') {
        window.location.href = '/acme-corp/onboarding/dashboard';
      } else if (targetUser.tenantId) {
        const tenant = mockStorage.getTenants().find((t) => t.id === targetUser.tenantId);
        window.location.href = `/${tenant?.slug || 'acme-corp'}/dashboard`;
      } else if (targetUser.role === 'CONSULTANT') {
        const tenant = mockStorage.getAccessibleTenant(targetUser);
        window.location.href = tenant ? `/${tenant.slug}/dashboard` : '/admin/consultants';
      } else {
        window.location.href = '/acme-corp/dashboard';
      }
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center px-6 py-5 border-b border-slate-100">
        <img src="/logo.png" alt="Cyrcalur Logo" className="h-8 w-auto max-w-full object-contain" />
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin' || location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Demo Switcher footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            Switch Active Demo User:
          </span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => handleRoleSwitch(e.target.value)}
          className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer font-medium"
        >
          {allUsers.map((u) => (
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

      {/* Main Content Area */}
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
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              Platform Admin Scope (admin.cyrcalur.hr)
            </span>
          </div>

          {/* User Profile */}
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

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
