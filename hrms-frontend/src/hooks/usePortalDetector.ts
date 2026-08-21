import { useLocation } from "react-router-dom";

export type PortalType = "platform" | "tenant" | "onboarding" | "auth";

export interface PortalContext {
  portal: PortalType;
  tenantSlug: string | null;
  isAdminSubdomain: boolean;
}

export function usePortalDetector(): PortalContext {
  const location = useLocation();
  const hostname = window.location.hostname;
  const pathname = location.pathname;

  // Check admin subdomain (e.g. admin.Peopleworkplaces.hr or admin.localhost) or path prefix /admin
  const isAdminSubdomain =
    hostname.startsWith("admin.") || pathname.startsWith("/admin");

  if (pathname.startsWith("/auth")) {
    return { portal: "auth", tenantSlug: null, isAdminSubdomain };
  }

  if (isAdminSubdomain) {
    return { portal: "platform", tenantSlug: null, isAdminSubdomain: true };
  }

  // Path format: /:slug/onboarding/* or /:slug/*
  const pathParts = pathname.split("/").filter(Boolean);
  const tenantSlug = pathParts[0] || null;

  if (pathParts[1] === "onboarding") {
    return { portal: "onboarding", tenantSlug, isAdminSubdomain: false };
  }

  if (tenantSlug) {
    return { portal: "tenant", tenantSlug, isAdminSubdomain: false };
  }

  // Fallback to platform if root path
  return { portal: "platform", tenantSlug: null, isAdminSubdomain: false };
}
