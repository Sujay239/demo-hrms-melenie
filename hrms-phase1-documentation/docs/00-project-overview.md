# Project Overview

## Purpose
Give all contributors a concise shared understanding of the HRMS product, applications, roles, Phase 1 domains and architectural boundaries.

## Product
A multi-tenant HRMS SaaS serving multiple independent companies from one platform while preserving strict data isolation.

## Application areas
### Platform / Super Admin Portal
Tenant lifecycle, consultant management/assignment and platform-level administration.

### Company / Tenant Portal
Tenant administration, HR operations, employee self-service and assigned consultant access.

### New Hire Onboarding Portal
Restricted tenant-scoped pre-employment experience.

## Canonical roles
`SUPER_ADMIN`, `CONSULTANT`, `TENANT_ADMIN`, `EMPLOYEE`, `NEW_HIRE`.

## Phase 1 domains
Authentication, RBAC, tenancy, employees, organization hierarchy, onboarding, offer letters, documents, regions, departments, designations, leave, holidays, attendance/overtime, fixed role dashboards, knowledge base, announcements, tickets, buildings/meeting rooms, audit, security, testing and operations.

## Key boundaries
- Tenant data isolation is mandatory.
- Backend: Route → Controller → Service → Repository → Database.
- API: `/api/v1/`.
- Files: private object storage + relational metadata.
- Signing: download → external sign → upload signed copy; no native digital signature.
- Branding: tenant logo on white background.
- **Future Phase: Configurable / drag-and-drop dashboard widgets.**
- EU support is architectural readiness only; no GDPR compliance claim.
