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
      } else {
        window.location.href = '/acme-corp/dashboard';
      }
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          C
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight text-base">Cyrcalur HRMS</h1>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Super Admin Portal
          </span>
        </div>
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
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Demo Switcher footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            Switch Active Demo User:
          </span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => handleRoleSwitch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md p-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
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

      {/* Main Content Area */}
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
                <span className="text-xs text-slate-500">Super Admin</span>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
