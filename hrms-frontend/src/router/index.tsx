import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlatformShell } from "@/layouts/PlatformShell";
import { TenantShell } from "@/layouts/TenantShell";
import { OnboardingShell } from "@/layouts/OnboardingShell";
import { AuthShell } from "@/layouts/AuthShell";

import { LoginPage } from "@/pages/auth/LoginPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { ActivateAccountPage } from "@/pages/auth/ActivateAccountPage";

import { PlatformDashboardPage } from "@/pages/platform/PlatformDashboardPage";
import { TenantListPage } from "@/pages/platform/TenantListPage";
import { TenantCreatePage } from "@/pages/platform/TenantCreatePage";
import { TenantDetailPage } from "@/pages/platform/TenantDetailPage";
import { ConsultantListPage } from "@/pages/platform/ConsultantListPage";
import { PlatformSettingsPage } from "@/pages/platform/PlatformSettingsPage";
import { PlatformAuditLogsPage } from "@/pages/platform/PlatformAuditLogsPage";

import { TenantDashboardPage } from "@/pages/tenant/TenantDashboardPage";
import { EmployeeListPage } from "@/pages/tenant/EmployeeListPage";
import { RegionListPage } from "@/pages/tenant/RegionListPage";
import { DepartmentListPage } from "@/pages/tenant/DepartmentListPage";
import { DesignationListPage } from "@/pages/tenant/DesignationListPage";
import { DocumentListPage } from "@/pages/tenant/DocumentListPage";
import { LeaveManagementPage } from "@/pages/tenant/LeaveManagementPage";
import { LeaveDetailPage } from "@/pages/tenant/LeaveDetailPage";
import { HolidayListPage } from "@/pages/tenant/HolidayListPage";
import { AttendancePage } from "@/pages/tenant/AttendancePage";
import { ShiftRosterPage } from "@/pages/tenant/ShiftRosterPage";
import { KBPage } from "@/pages/tenant/KBPage";
import { AnnouncementsPage } from "@/pages/tenant/AnnouncementsPage";
import { TicketListPage } from "@/pages/tenant/TicketListPage";
import { RoomReservationPage } from "@/pages/tenant/RoomReservationPage";
import { AuditLogPage } from "@/pages/tenant/AuditLogPage";
import { OnboardingCasesPage } from "@/pages/tenant/OnboardingCasesPage";
import { ProfileSettingsPage } from "@/pages/tenant/ProfileSettingsPage";
import { ProjectsPage } from "@/pages/tenant/ProjectsPage";
import { TasksPage } from "@/pages/tenant/TasksPage";

import { OnboardingDashboardPage } from "@/pages/onboarding/OnboardingDashboardPage";
import { MyDetailsPage } from "@/pages/onboarding/MyDetailsPage";
import { OfferReviewPage } from "@/pages/onboarding/OfferReviewPage";
import { RequiredDocumentsPage } from "@/pages/onboarding/RequiredDocumentsPage";
import { AcknowledgementPage } from "@/pages/onboarding/AcknowledgementPage";
import { ToolsPreviewPage } from "@/pages/onboarding/ToolsPreviewPage";

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthShell />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="activate" element={<ActivateAccountPage />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Super Admin Platform Routes (admin.Peopleworkplaces.hr/* or /admin/*) */}
        <Route path="/admin" element={<PlatformShell />}>
          <Route index element={<PlatformDashboardPage />} />
          <Route path="tenants" element={<TenantListPage />} />
          <Route path="tenants/new" element={<TenantCreatePage />} />
          <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
          <Route path="consultants" element={<ConsultantListPage />} />
          <Route path="settings" element={<PlatformSettingsPage />} />
          <Route path="audit-logs" element={<PlatformAuditLogsPage />} />
        </Route>

        {/* Company Portal Routes (Peopleworkplaces.hr/{company-slug}/*) */}
        <Route path="/:slug" element={<TenantShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TenantDashboardPage />} />
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="settings" element={<ProfileSettingsPage />} />
          <Route path="onboarding-cases" element={<OnboardingCasesPage />} />
          <Route path="regions" element={<RegionListPage />} />
          <Route path="departments" element={<DepartmentListPage />} />
          <Route path="designations" element={<DesignationListPage />} />
          <Route path="documents" element={<DocumentListPage />} />
          <Route path="leave" element={<LeaveManagementPage />} />
          <Route path="leave/*" element={<LeaveManagementPage />} />
          <Route path="leave/detail/:leaveId" element={<LeaveDetailPage />} />
          <Route path="holidays" element={<HolidayListPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="attendance/*" element={<AttendancePage />} />
          <Route path="shifts" element={<ShiftRosterPage />} />
          <Route path="attendance/shifts" element={<ShiftRosterPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="knowledge-base" element={<KBPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="rooms" element={<RoomReservationPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
        </Route>

        {/* Onboarding Portal Routes (Peopleworkplaces.hr/{company-slug}/onboarding/*) */}
        <Route path="/:slug/onboarding" element={<OnboardingShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OnboardingDashboardPage />} />
          <Route path="details" element={<MyDetailsPage />} />
          <Route path="offer" element={<OfferReviewPage />} />
          <Route path="documents" element={<RequiredDocumentsPage />} />
          <Route path="acknowledgement" element={<AcknowledgementPage />} />
          <Route path="preview" element={<ToolsPreviewPage />} />
        </Route>

        {/* Fallback Root Redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
