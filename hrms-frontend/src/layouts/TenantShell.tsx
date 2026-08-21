import React, { useState } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useParams,
  useNavigate,
} from "react-router-dom";
import { cn } from "@/utils/cn";
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
  Building2,
  Lock,
  User,
  Sparkles,
} from "lucide-react";
import { mockStorage, KEYS } from "@/services/mock-storage";
import { Employee } from "@/demo-data/seedData";
import { Drawer } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ToastContainer } from "@/components/ui/Toast";

export const TenantShell: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const currentUser = mockStorage.getCurrentUser();
  const allTenants = mockStorage.getTenants();

  // Find requested tenant by slug
  const targetTenant = allTenants.find((t) => t.slug === slug) || allTenants[0];

  const handleSignOut = () => {
    mockStorage.logout();
    navigate("/auth/login");
  };

  // Check if current user is authenticated and belongs to this tenant or is an assigned consultant
  const hasAccess =
    currentUser &&
    targetTenant &&
    (currentUser.tenantId === targetTenant.id ||
      (currentUser.role === "CONSULTANT" &&
        (currentUser.assignedTenantIds || []).includes(targetTenant.id)));

  if (!targetTenant || !currentUser || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-lg p-6 sm:p-8 text-center space-y-5 shadow-lg border border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Company Portal Authentication Required
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {currentUser?.role === "SUPER_ADMIN" ? (
                <>
                  You are currently signed in as <strong className="text-slate-800 font-semibold">Super Admin ({currentUser.email})</strong>. Direct bypass into tenant workspaces is restricted to preserve multi-tenant security.
                  <br className="mb-1" />
                  Please log in using the authorized <strong className="text-slate-800 font-semibold">Company Admin</strong> credentials for <strong className="text-indigo-600 font-semibold">{targetTenant?.name || slug}</strong>.
                </>
              ) : (
                <>
                  You must be logged in with an authorized account for{" "}
                  <strong className="text-slate-800">
                    {targetTenant?.name || slug || "this company"}
                  </strong>{" "}
                  to access this portal.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {currentUser?.role === "SUPER_ADMIN" && (
              <Link to="/admin/tenants" className="w-full sm:w-1/2">
                <Button variant="outline" className="w-full font-semibold">
                  ← Back to Platform
                </Button>
              </Link>
            )}
            <Button
              variant="primary"
              onClick={handleSignOut}
              className={cn("w-full bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold", currentUser?.role === "SUPER_ADMIN" ? "sm:w-1/2" : "")}
            >
              Sign In as Company Admin
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const activeTenant = targetTenant;
  const currentSlug = activeTenant.slug;

  const isTenantAdmin = mockStorage.isTenantAdminFor(
    currentUser,
    activeTenant.id,
  );

  // Check employee record in the tenant
  const tenantEmployees = mockStorage.getTenantItems<Employee>(KEYS.EMPLOYEES, activeTenant.id);
  const matchingEmployee = tenantEmployees.find(
    (e) =>
      e.email.toLowerCase() === currentUser.email.toLowerCase() ||
      e.id === currentUser.id ||
      `user-${e.id}` === currentUser.id
  );

  const isPrivileged = isTenantAdmin || currentUser.role === "SUPER_ADMIN" || currentUser.role === "CONSULTANT";

  // Check if employee is not a permanent confirmed employee of this tenant
  const isNonPermanent =
    !isPrivileged &&
    (currentUser.role === "NEW_HIRE" ||
      currentUser.isPermanent !== true ||
      !matchingEmployee ||
      matchingEmployee.isPermanent !== true ||
      matchingEmployee.employmentStatus !== "ACTIVE");

  if (isNonPermanent) {
    const isMissingRecord = !matchingEmployee;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-xl p-8 text-center space-y-6 shadow-xl border border-slate-200 rounded-3xl bg-white">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-3 border border-amber-200">
              {isMissingRecord ? "Profile Not Enrolled" : "Onboarding In Progress • Non-Permanent Access"}
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              {isMissingRecord ? "Employee Profile Inactive" : `Welcome to ${activeTenant.name}, ${currentUser.name}!`}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">
              {isMissingRecord
                ? `No active employee record was found for ${currentUser.email} in ${activeTenant.name}. Access to tenant workspace resources is restricted. Please contact your company HR administrator.`
                : "Your profile is currently undergoing new hire onboarding. Company resources (Leaves, Attendance, Knowledge Base, Meeting Rooms, etc.) are restricted until your onboarding is verified and approved as permanent by HR."}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between font-semibold">
              <span>Account Status:</span>
              <span className="text-amber-600 font-bold">
                {isMissingRecord ? "No Employee Record" : "New Hire / Onboarding Required"}
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Work Email:</span>
              <span className="text-slate-900 font-mono">{currentUser.email}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full sm:w-1/3 text-xs font-semibold cursor-pointer"
            >
              Sign Out
            </Button>
            {!isMissingRecord && (
              <Link to={`/${currentSlug}/onboarding/dashboard`} className="w-full sm:w-2/3">
                <Button
                  variant="primary"
                  className="w-full bg-[#FF6900] hover:bg-[#E05D00] text-white font-bold text-sm shadow-md cursor-pointer"
                >
                  Go to Onboarding Portal →
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

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
    {
      label: "Dashboard",
      path: `/${currentSlug}/dashboard`,
      icon: LayoutDashboard,
    },
    { label: "Employees", path: `/${currentSlug}/employees`, icon: Users },
    {
      label: "My Profile & Settings",
      path: `/${currentSlug}/profile`,
      icon: User,
    },
    ...(feats.onboarding !== false
      ? [
          {
            label: "Onboarding Cases",
            path: `/${currentSlug}/onboarding-cases`,
            icon: UserPlus,
          },
        ]
      : []),
    ...(feats.orgStructure !== false
      ? [
          { label: "Regions", path: `/${currentSlug}/regions`, icon: Building },
          {
            label: "Departments",
            path: `/${currentSlug}/departments`,
            icon: Building2,
          },
          {
            label: "Designations",
            path: `/${currentSlug}/designations`,
            icon: Briefcase,
          },
        ]
      : []),
    ...(feats.documentVault !== false
      ? [
          {
            label: "Documents",
            path: `/${currentSlug}/documents`,
            icon: FileText,
          },
        ]
      : []),
    ...(feats.leaveManagement !== false
      ? [
          {
            label: "Leave Management",
            path: `/${currentSlug}/leave/requests`,
            icon: Calendar,
          },
          {
            label: "Holidays",
            path: `/${currentSlug}/holidays`,
            icon: CalendarDays,
          },
        ]
      : []),
    ...(feats.attendance !== false
      ? [
          {
            label: "Attendance & OT",
            path: `/${currentSlug}/attendance/records`,
            icon: Clock,
          },
        ]
      : []),
    ...(feats.knowledgeBase !== false
      ? [
          {
            label: "Knowledge Base",
            path: `/${currentSlug}/knowledge-base`,
            icon: BookOpen,
          },
        ]
      : []),
    ...(feats.announcements !== false
      ? [
          {
            label: "Announcements",
            path: `/${currentSlug}/announcements`,
            icon: Megaphone,
          },
        ]
      : []),
    ...(feats.helpDesk !== false
      ? [
          {
            label: "Help Desk Tickets",
            path: `/${currentSlug}/tickets`,
            icon: Ticket,
          },
        ]
      : []),
    ...(feats.meetingRooms !== false
      ? [
          {
            label: "Meeting Rooms",
            path: `/${currentSlug}/rooms`,
            icon: DoorOpen,
          },
        ]
      : []),
    {
      label: "Audit Logs",
      path: `/${currentSlug}/audit-logs`,
      icon: ShieldCheck,
    },
  ];

  const employeeNavItems = [
    {
      label: "Dashboard",
      path: `/${currentSlug}/dashboard`,
      icon: LayoutDashboard,
    },
    { label: "Directory", path: `/${currentSlug}/employees`, icon: Users },
    {
      label: "My Profile & Settings",
      path: `/${currentSlug}/profile`,
      icon: User,
    },
    ...(feats.attendance !== false
      ? [
          {
            label: "My Attendance",
            path: `/${currentSlug}/attendance`,
            icon: Clock,
          },
        ]
      : []),
    ...(feats.leaveManagement !== false
      ? [
          {
            label: "My Leave",
            path: `/${currentSlug}/leave/balances`,
            icon: Calendar,
          },
          {
            label: "Holidays",
            path: `/${currentSlug}/holidays`,
            icon: CalendarDays,
          },
        ]
      : []),
    ...(feats.documentVault !== false
      ? [
          {
            label: "Documents",
            path: `/${currentSlug}/documents`,
            icon: FileText,
          },
        ]
      : []),
    ...(feats.knowledgeBase !== false
      ? [
          {
            label: "Knowledge Base",
            path: `/${currentSlug}/knowledge-base`,
            icon: BookOpen,
          },
        ]
      : []),
    ...(feats.announcements !== false
      ? [
          {
            label: "Announcements",
            path: `/${currentSlug}/announcements`,
            icon: Megaphone,
          },
        ]
      : []),
    ...(feats.helpDesk !== false
      ? [{ label: "Tickets", path: `/${currentSlug}/tickets`, icon: Ticket }]
      : []),
    ...(feats.meetingRooms !== false
      ? [
          {
            label: "Meeting Rooms",
            path: `/${currentSlug}/rooms`,
            icon: DoorOpen,
          },
        ]
      : []),
  ];

  const navItems = isTenantAdmin ? adminNavItems : employeeNavItems;

  const isCurrentFeatureDisabled =
    (location.pathname.includes("/onboarding-cases") &&
      feats.onboarding === false) ||
    ((location.pathname.includes("/leave") ||
      location.pathname.includes("/holidays")) &&
      feats.leaveManagement === false) ||
    (location.pathname.includes("/attendance") && feats.attendance === false) ||
    (location.pathname.includes("/knowledge-base") &&
      feats.knowledgeBase === false) ||
    (location.pathname.includes("/announcements") &&
      feats.announcements === false) ||
    (location.pathname.includes("/tickets") && feats.helpDesk === false) ||
    (location.pathname.includes("/rooms") && feats.meetingRooms === false) ||
    (location.pathname.includes("/documents") &&
      feats.documentVault === false) ||
    ((location.pathname.includes("/regions") ||
      location.pathname.includes("/departments") ||
      location.pathname.includes("/designations")) &&
      feats.orgStructure === false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200">
      {/* Mandated Tenant Branding Surface: Logo displayed on WHITE background */}
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-3 min-h-[72px]">
        {activeTenant.logoUrl ? (
          <img
            src={activeTenant.logoUrl}
            alt={activeTenant.name}
            className="h-11 max-w-[170px] object-contain object-left shrink-0"
          />
        ) : (
          <div className="h-11 px-3.5 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
            {activeTenant.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Clean User Footer (Role-switching dropdown removed) */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
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
            <span className="text-[10px] text-indigo-600 font-medium">
              {mockStorage.getRoleLabel(currentUser.role)}
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

      {/* Main Container */}
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
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm hidden sm:inline">
                {activeTenant.name}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-mono">
                Peopleworkplaces.hr/{currentSlug}
              </span>
            </div>
          </div>

          {/* User Account Menu */}
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
                <span className="text-xs text-slate-500">
                  {mockStorage.getRoleLabel(currentUser.role)}
                </span>
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

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full">
          {currentUser.role === "NEW_HIRE" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                  <UserPlus className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Pre-Employment Onboarding in Progress
                  </h4>
                  <p className="text-xs text-amber-700">
                    Complete your remaining checklist requirements. Full
                    operational features unlock upon HR approval.
                  </p>
                </div>
              </div>
              <Link to={`/${currentSlug}/onboarding/dashboard`}>
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0"
                >
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
              <h3 className="text-xl font-bold text-slate-900">
                Module Disabled for {activeTenant.name}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                This feature has been deactivated by the Platform Super Admin in
                company configuration settings.
              </p>
              <Link to={`/${currentSlug}/dashboard`}>
                <Button variant="primary" className="mt-2">
                  Return to Company Dashboard
                </Button>
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
