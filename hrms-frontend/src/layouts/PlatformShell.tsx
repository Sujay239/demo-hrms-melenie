import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  Building2,
  Users2,
  Settings,
  ShieldAlert,
  LifeBuoy,
  LogOut,
  Menu,
  ChevronDown,
  Lock,
} from "lucide-react";
import { mockStorage, KEYS } from "@/services/mock-storage";
import { Ticket } from "@/demo-data/seedData";
import { Drawer } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { ToastContainer } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const PlatformShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const currentUser = mockStorage.getCurrentUser();

  const handleSignOut = () => {
    mockStorage.logout();
    navigate("/auth/login");
  };

  // Authorization check: only SUPER_ADMIN can access PlatformShell
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Super Admin Access Required
          </h2>
          <p className="text-sm text-slate-500">
            You must be logged in as a Platform Super Admin to view this scope.
          </p>
          <Button variant="primary" onClick={handleSignOut} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const allTickets = mockStorage.getTenantItems<Ticket>(KEYS.TICKETS);
  const openTicketCount = allTickets.filter(
    (t) =>
      (t.targetScope === "PLATFORM_SUPER_ADMIN" || !t.targetScope) &&
      (t.status === "OPEN" || t.status === "IN_PROGRESS"),
  ).length;

  const navItems = [
    { label: "Platform Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Tenants & Companies", path: "/admin/tenants", icon: Building2 },
    { label: "Consultants", path: "/admin/consultants", icon: Users2 },
    {
      label: "Support Tickets & Bugs",
      path: "/admin/tickets",
      icon: LifeBuoy,
      badge: openTicketCount > 0 ? openTicketCount : undefined,
    },
    { label: "Platform Settings", path: "/admin/settings", icon: Settings },
    {
      label: "Platform Audit Logs",
      path: "/admin/audit-logs",
      icon: ShieldAlert,
    },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center px-4 py-4 border-b border-slate-100 min-h-[72px]">
        <img
          src="/logo.png"
          alt="Peopleworkplaces Logo"
          className="h-12 w-auto max-w-[210px] object-contain object-left"
        />
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin" || location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0",
                    isActive
                      ? "bg-rose-500 text-white"
                      : "bg-rose-100 text-rose-700",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Clean User Footer (Role-switching dropdown removed) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={currentUser.avatarUrl}
            name={currentUser.name}
            size="sm"
          />
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-slate-800 truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Platform Super Admin
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 z-30 sticky top-0 h-screen overflow-hidden">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <Drawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
        <NavContent />
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              Platform Admin Scope (admin.Peopleworkplaces.hr)
            </span>
          </div>

          {/* Super Admin Profile Actions */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Avatar
                src={currentUser.avatarUrl}
                name={currentUser.name}
                size="sm"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-xs text-slate-500">Super Admin</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
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
