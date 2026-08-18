# Phase 1 Acceptance Criteria

## Purpose
Define release-level acceptance conditions.

### Tenancy
- **AC-TEN-001** Super Admin can create/update/view/activate/deactivate tenants through authorized `/api/v1/` flows.
- **AC-TEN-002** Consultant sees only actively assigned tenants.
- **AC-TEN-003** Valid IDs from another tenant cannot be read or mutated.
- **AC-TEN-004** Tenant entities have enforceable ownership/indexing.

### Authentication/RBAC
- **AC-AUTH-001** Active valid login works; invalid/nonexistent credentials use safe generic behavior.
- **AC-AUTH-002** Deactivated account cannot establish new session.
- **AC-RBAC-001** Server denies actions even if client UI is bypassed.
- **AC-RBAC-002** New Hire cannot access Employee-only modules.

### Employee/hierarchy
- **AC-EMP-001** Tenant-owned department/designation/region/manager references validate.
- **AC-EMP-002** Self-manager and cross-tenant manager are denied.
- **AC-EMP-003** Hierarchy cycles are prevented.
- **AC-EMP-004** Directory fields respect visibility.

### Onboarding
- **AC-ONB-001** New Hire sees own required tasks/statuses.
- **AC-ONB-002** Details, offer review, uploads and acknowledgement work.
- **AC-ONB-003** Signing is download → external sign → upload only.
- **AC-ONB-004** HR verification/completion is permission-controlled and auditable.

### Documents
- **AC-DOC-001** Disallowed size/type/content is rejected server-side.
- **AC-DOC-002** Protected binaries are not permanently public.
- **AC-DOC-003** Sensitive access requires elevated permission and is audited.
- **AC-DOC-004** Versions preserve history/current version.
- **AC-DOC-005** Expiry/deletion/status access rules are enforced.

### Leave/holidays
- **AC-LEV-001** Business values remain configurable.
- **AC-LEV-002** Request validates eligibility/date/notice/balance rules.
- **AC-LEV-003** Repeated approval cannot duplicate ledger effect.
- **AC-HOL-001** Region calendars distinguish common/flexible holidays.

### Attendance
- **AC-ATT-001** Invalid clock state transitions are denied.
- **AC-ATT-002** Time remains unambiguous across timezone/DST.
- **AC-ATT-003** Corrections/overtime preserve approval history.

### Content/tickets
- **AC-KB-001** Draft/restricted article data is not leaked.
- **AC-ANN-001** Target audience and publish/expiry are enforced.
- **AC-TKT-001** Status is one of `OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED`.
- **AC-TKT-002** Ticket access is tenant/department/resource scoped.

### Rooms
- **AC-ROOM-001** Reservation validates active room and start < end.
- **AC-ROOM-002** Concurrent overlapping reservations cannot both succeed.
- **AC-ROOM-003** Cancellation stops blocking availability and preserves history.

### UI
- **AC-UI-001** Role-appropriate navigation/dashboard exists.
- **AC-UI-002** Tenant logo appears on white branding surface.
- **AC-UI-003** Loading/empty/error/denied states exist.
- **AC-UI-004** No configurable / drag-and-drop dashboard widget persistence/API/editor exists in Phase 1.

### Security/operations
- **AC-SEC-001** Cross-tenant IDOR, consultant bypass and sensitive-document tests pass.
- **AC-OPS-001** Health, logs, controlled migrations and recovery procedures exist.
