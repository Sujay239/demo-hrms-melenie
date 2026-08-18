# HRMS Phase 1 Documentation Repository

## Purpose
This repository is the official product and technical specification for Phase 1 of a multi-tenant Human Resource Management System (HRMS). It contains specifications only: no frontend implementation, backend implementation, database migration code, or Docker implementation.

It is intended to be the single source of truth for engineers and an AI coding agent.

## Non-negotiable rules
1. Tenant data isolation is a security boundary.
2. Backend flow is **Route → Controller → Service → Repository → Database**.
3. Controllers are thin; no raw database queries or substantive business logic.
4. All application APIs use `/api/v1/`.
5. The server never trusts a client-provided tenant ID as proof of access.
6. `CONSULTANT` access requires an active assignment to the tenant plus permissions.
7. `NEW_HIRE` is distinct from `EMPLOYEE` and has onboarding-only access.
8. File binaries are private; metadata/associations are authorization-controlled.
9. Database schema changes use migrations.
10. Use `Promise.allSettled()` for independent concurrent operations when partial failure is meaningful, not for dependent or atomic workflows.
11. Tenant branding in Phase 1 is logo + white background only.
12. **Future Phase: Configurable / drag-and-drop dashboard widgets.**
13. Phase 1 does not claim GDPR or HIPAA compliance.

## Application areas
- Platform / Super Admin Portal
- Company / Tenant Portal
- New Hire Onboarding Portal

## Start here
Read `agent.md`, then `docs/INDEX.md`.
