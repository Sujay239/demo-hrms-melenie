# Requirements Traceability Matrix

## Purpose
Map Phase 1 product/SRS requirement families to implementation-facing module, API, data, security, design, and test specifications so the coding agent can prove coverage without duplicating requirements.

## Traceability Rules
- `01-prd.md` defines product intent and scope.
- `02-srs.md` is the authoritative requirement-ID catalog.
- Module documents explain domain behavior.
- API documents define external contracts.
- Database documents define persistent concepts/invariants.
- Security documents define cross-cutting protection.
- Design documents define user-visible behavior.
- Test documents verify the contract.
- If implementation exposes a new behavior not represented here/SRS, update documentation first.

## Matrix

| Requirement family | Module specification | API specification | Primary data | Primary security/design/test references |
|---|---|---|---|---|
| `FR-AUTH-*` | `modules/authentication.md` | `api/v1/auth.md` | users + selected auth persistence | `security/authentication-security.md`, `testing/test-cases.md` |
| `FR-RBAC-*` | Cross-cutting + tenant/auth modules | `api/authorization-api.md`, `api/v1/users.md` | roles, permissions, role assignments | `architecture/authorization-architecture.md`, `security/permissions-catalog.md` |
| `FR-TEN-*` | `modules/tenant-management.md` | `api/v1/tenants.md` | tenants, consultants, consultant assignments | `architecture/multi-tenancy.md`, `testing/integration-tests.md` |
| `FR-UI-*` | `modules/dashboard.md` | `api/v1/dashboard.md` | no Phase 1 layout persistence | `design/designs.md`, `design/application-layout.md` |
| `FR-EMP-*` | `modules/employee-management.md` | `api/v1/employees.md` | employees + org references | `database/relationships.md`, employee tests |
| `FR-ONB-*` | `modules/onboarding.md`, `modules/offer-letter.md` | `api/v1/onboarding.md`, `api/v1/offer-letters.md` | new hires, onboarding cases/tasks, offers, acknowledgements | `design/onboarding-portal.md`, onboarding E2E |
| `FR-DOC-*` | `modules/document-management.md` | `api/v1/documents.md` | documents, versions, associations | `security/file-security.md`, document tests |
| `FR-REG-*` | `modules/region-management.md` | `api/v1/regions.md` | regions | `architecture/eu-readiness.md`, region tests |
| `FR-DEP-*` | `modules/department-management.md` | `api/v1/departments.md` | departments, employees | hierarchy constraints/tests |
| `FR-DES-*` | `modules/designation-management.md` | `api/v1/designations.md` | designations | organization tests |
| `FR-LEV-*` | `modules/leave-management.md` | `api/v1/leave.md` | leave types/policies/balances/ledger/requests/actions | leave unit/integration/E2E tests |
| `FR-HOL-*` | `modules/holiday-management.md` | `api/v1/holidays.md` | holidays, flexible selections | holiday tests |
| `FR-ATT-*` | `modules/attendance-management.md` | `api/v1/attendance.md` | attendance/corrections/overtime | attendance E2E/concurrency tests |
| `FR-KB-*` | `modules/knowledge-base.md` | `api/v1/knowledge-base.md` | KB categories/articles/versions/tags | XSS/audience tests |
| `FR-ANN-*` | `modules/announcements.md` | `api/v1/announcements.md` | announcements/targets/reads | audience/XSS tests |
| `FR-TKT-*` | `modules/ticket-management.md` | `api/v1/tickets.md` | tickets/comments/activity + document attachments | ticket E2E |
| `FR-ROOM-*` | `modules/building-management.md` | `api/v1/meeting-rooms.md` | buildings/floors/rooms/reservations | overlap concurrency/E2E |
| `FR-AUD-*` | Cross-cutting modules | `api/v1/audit-logs.md` | audit_logs | `architecture/audit-architecture.md`, audit tests |
| `NFR-SEC-*` | Cross-cutting | all APIs | all protected data | `security/*`, `security/security-testing.md` |
| `NFR-PERF-*` | Cross-cutting | dashboard/list APIs | indexes/query patterns | `performance/*`, `decisions/adr-006-performance-strategy.md` |
| `NFR-REL-*` | Cross-cutting | state-changing APIs | transactions/constraints | `devops/*`, integration/concurrency tests |
| `NFR-PRV-*` | Documents/regions/audit | protected APIs | sensitive metadata/audit | `security/sensitive-data.md`, `architecture/eu-readiness.md` |
| `NFR-UX-*` | All user-facing modules | N/A contract behavior | N/A | `design/*`, accessibility/E2E |
| `NFR-MNT-*` | Cross-cutting | `/api/v1/` | migrations | `architecture/*`, `engineering/*`, `agent.md` |
| `NFR-OBS-*` | Cross-cutting | request IDs/errors | audit/log metadata | `devops/monitoring.md`, `api/error-handling.md` |

## Explicit Boundary Traceability
### Dashboard Customization
Phase 1 requirement is the absence of a layout editor/persistence feature. Trace:
- `03-scope.md`
- `modules/dashboard.md`
- `api/v1/dashboard.md`
- `database/database-schema.md`
- `design/designs.md`
- `testing/test-cases.md` (`TC-DASH-005`)
- `11-future-roadmap.md`

Future Phase: Configurable / drag-and-drop dashboard widgets.

### EU Readiness
Phase 1 architecture records region/country/locale/time zone, auditability and future privacy hooks, but does not implement or claim GDPR compliance. Trace:
- `architecture/eu-readiness.md`
- `security/sensitive-data.md`
- `devops/backup-recovery.md`
- `11-future-roadmap.md`

### External Signing Only
Phase 1 has no native digital signature. Trace:
- `modules/onboarding.md`
- `modules/offer-letter.md`
- `api/v1/onboarding.md`
- `api/v1/offer-letters.md`
- `design/onboarding-portal.md`
- onboarding E2E.

## Change Control
When a requirement is added or its meaning changes:
1. update SRS ID/acceptance criteria;
2. update this matrix;
3. update affected module/API/data/security/design specs;
4. update tests;
5. add/update ADR if architecture changes.
