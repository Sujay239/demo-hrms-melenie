# Software Requirements Specification (SRS)

## Purpose
Define uniquely identified, testable functional and non-functional Phase 1 requirements.

## Functional requirements

### Authentication
- **FR-AUTH-001** Authenticate active users using the approved credential/session strategy.
- **FR-AUTH-002** Support login, logout and current-user/session inspection.
- **FR-AUTH-003** Support enumeration-resistant password reset request and completion.
- **FR-AUTH-004** Support account activation and deactivation.
- **FR-AUTH-005** Deactivated accounts cannot establish new sessions; existing credentials are revocable.
- **FR-AUTH-006** Authentication never replaces authorization.

### RBAC and authorization
- **FR-RBAC-001** Authorize using role/permissions + tenant context + resource rules.
- **FR-RBAC-002** Support `SUPER_ADMIN`, `CONSULTANT`, `TENANT_ADMIN`, `EMPLOYEE`, `NEW_HIRE`.
- **FR-RBAC-003** Permission design is granular and extensible for future custom roles.
- **FR-RBAC-004** Authorization denies by default.
- **FR-RBAC-005** `NEW_HIRE` does not inherit Employee access.

### Multi-tenancy
- **FR-TEN-001** Every tenant-owned entity has an explicit/unambiguous tenant relationship.
- **FR-TEN-002** Tenant context is server-established from authorized identity/context selection.
- **FR-TEN-003** Tenant resources are resolved by tenant + resource ID, not resource ID alone.
- **FR-TEN-004** Consultant may access only actively assigned tenants and permitted information.
- **FR-TEN-005** Super Admin cross-tenant access is explicit, permission-controlled and auditable.
- **FR-TEN-006** Support tenant create, update, view, activate and deactivate.
- **FR-TEN-007** Inactive tenants cannot use normal tenant portal while retained data follows policy.

### Layout, branding and dashboard
- **FR-UI-001** Provide distinct Platform and Tenant application experiences.
- **FR-UI-002** Tenant branding displays tenant logo on white background.
- **FR-UI-003** Navigation/dashboard content is role/permission aware.
- **FR-UI-004** Phase 1 dashboards are predefined and provide no configurable / drag-and-drop dashboard widget behavior.
- **FR-UI-005** Layouts are responsive.

### Employees and organization
- **FR-EMP-001** Authorized Tenant Admin can create/view/update employee records.
- **FR-EMP-002** Employee supports employee ID, name, email, contact info, department, designation, region, manager, joining date, employment status and profile image metadata.
- **FR-EMP-003** Authorized directory list/search/filter is tenant-scoped and field-visibility controlled.
- **FR-EMP-004** Store/query reporting relationships.
- **FR-EMP-005** Prevent self-management, cross-tenant manager references and hierarchy cycles.

### Onboarding
- **FR-ONB-001** New Hire belongs to one tenant onboarding context.
- **FR-ONB-002** New Hire access is onboarding-only.
- **FR-ONB-003** Onboarding dashboard shows tasks and completion status.
- **FR-ONB-004** New Hire can submit required details including Fun Fact About You.
- **FR-ONB-005** New Hire can review/download permitted offer/acknowledgement documents.
- **FR-ONB-006** New Hire can upload required onboarding documents.
- **FR-ONB-007** Acknowledgement captures name, place and date.
- **FR-ONB-008** Signing workflow is download → external signing → upload signed copy; no native digital signature.
- **FR-ONB-009** Authorized HR can verify onboarding requirements.
- **FR-ONB-010** New Hire → Employee conversion is explicit and controlled.

### Documents
- **FR-DOC-001** Authorized upload/download through controlled flows.
- **FR-DOC-002** Documents can associate with tenant, employee, New Hire, offer letter, HR records, departments and extensible future entities.
- **FR-DOC-003** Store category, status, ownership, versions, timestamps and optional expiry.
- **FR-DOC-004** Support categories Identity, Employment, Offer Letter, Education, Medical, Payroll, Tax, Policy, Acknowledgement, Other.
- **FR-DOC-005** Enforce server-side type, size and content validation.
- **FR-DOC-006** Preserve version history.
- **FR-DOC-007** Sensitive document access uses additional permission restrictions and audit logging.
- **FR-DOC-008** Public storage URLs cannot bypass authorization.

### Regions/departments/designations
- **FR-REG-001** Manage region, country, IANA timezone, locale and status.
- **FR-REG-002** Regions are usable by employees, holidays, leave and attendance.
- **FR-DEP-001** Manage department description, head, status and hierarchy.
- **FR-DEP-002** Department is usable by KB, tickets, announcements and permissions.
- **FR-DES-001** Manage designation name, description, status and optional department.

### Leave
- **FR-LEV-001** Leave types/policies are tenant-configurable.
- **FR-LEV-002** Policy supports monthly credit, annual allowance, max consecutive days, carry forward, year-end lapse, max pooled balance, eligibility, approval, notice, region, employee group.
- **FR-LEV-003** Maintain explainable leave balance/ledger effects.
- **FR-LEV-004** Employee views eligible leave types/balances.
- **FR-LEV-005** Employee applies and service validates dates, eligibility, policy and balance.
- **FR-LEV-006** Authorized approver approves/rejects.
- **FR-LEV-007** Approval/cancellation changes balances exactly once and remains auditable.

### Holidays
- **FR-HOL-001** Holiday management is separate from leave.
- **FR-HOL-002** Manage region-specific common holidays.
- **FR-HOL-003** Manage region-specific flexible holiday options.
- **FR-HOL-004** Employee views applicable regional holidays.
- **FR-HOL-005** Flexible selection enforces eligibility and configured limits.

### Attendance/overtime
- **FR-ATT-001** Employee clocks in/out.
- **FR-ATT-002** Store time records safely across time zones.
- **FR-ATT-003** Authorized attendance review.
- **FR-ATT-004** Correction has reason/status/approval history.
- **FR-ATT-005** Employee requests overtime.
- **FR-ATT-006** Authorized manager approves/rejects overtime.
- **FR-ATT-007** Attendance/overtime decisions are auditable.

### Knowledge base
- **FR-KB-001** Support global and department knowledge.
- **FR-KB-002** Articles support categories, tags, draft/published and versions.
- **FR-KB-003** Search only permitted content.
- **FR-KB-004** Department visibility is server-enforced.
- **FR-KB-005** FAQs are supported as KB content/structured subtype.

### Announcements
- **FR-ANN-001** Create public or targeted announcements.
- **FR-ANN-002** Target by tenant, department, region, role, employee group.
- **FR-ANN-003** Support title, content, publish date, expiry, priority, status.
- **FR-ANN-004** Track per-user read/unread state.

### Tickets
- **FR-TKT-001** Create department-oriented tickets with server ticket number, subject, description, category, priority.
- **FR-TKT-002** Statuses are `OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED`.
- **FR-TKT-003** Support assignee, comments, attachments, activity history.
- **FR-TKT-004** Enforce tenant/department/permission visibility.

### Meeting rooms
- **FR-ROOM-001** Manage buildings, floors, rooms, capacity, facilities and status.
- **FR-ROOM-002** View rooms, availability and permitted upcoming reservations.
- **FR-ROOM-003** Reserve/cancel rooms.
- **FR-ROOM-004** Prevent overlapping active reservations with transactionally safe backend/database enforcement.

### Audit
- **FR-AUD-001** Audit actor, tenant, action, resource, resource ID, timestamp, request ID.
- **FR-AUD-002** Include IP and before/after state where appropriate and justified.
- **FR-AUD-003** Sensitive document access is audited.
- **FR-AUD-004** Audit records cannot be normally edited/deleted by application users.

## Non-functional requirements

### Security
- **NFR-SEC-001** Use modern adaptive password hashing.
- **NFR-SEC-002** Protect authentication material against leakage/replay/excessive lifetime.
- **NFR-SEC-003** All tenant-owned repository access is tenant-scoped.
- **NFR-SEC-004** Validate untrusted input; use parameterized persistence.
- **NFR-SEC-005** Use safe rendering and sanitize allowed rich text.
- **NFR-SEC-006** Apply CSRF defenses when credential transport makes CSRF relevant.
- **NFR-SEC-007** Production CORS is allowlisted.
- **NFR-SEC-008** Apply risk-based rate limits.
- **NFR-SEC-009** Apply secure headers.
- **NFR-SEC-010** Private file storage with malware/content-scanning readiness.
- **NFR-SEC-011** Secrets come from environment/secret management and are not logged.
- **NFR-SEC-012** CI includes appropriate security/dependency scanning.

### Performance
- **NFR-PERF-001** Bounded pagination and indexed filter/sort.
- **NFR-PERF-002** Prevent N+1 queries.
- **NFR-PERF-003** Independent dashboard/aggregate operations run concurrently where appropriate; prefer `Promise.allSettled()` when partial results are valid.
- **NFR-PERF-004** Avoid unnecessary whole-file memory buffering for large transfers.
- **NFR-PERF-005** Frontend supports route/lazy loading.
- **NFR-PERF-006** Numeric SLOs are measured/approved rather than invented.

### Reliability/availability
- **NFR-REL-001** Production exposes liveness/readiness checks.
- **NFR-REL-002** Migrations are controlled and backups have tested recovery procedure.
- **NFR-REL-003** Use transactions for invariants requiring atomicity.
- **NFR-REL-004** Bound retries and design idempotency for duplicate-prone operations.

### Privacy/EU readiness
- **NFR-PRV-001** Model region, country, locale and timezone without one-country assumptions.
- **NFR-PRV-002** Ownership/audit metadata supports future export/delete/retention workflows.
- **NFR-PRV-003** Do not claim GDPR compliance in Phase 1.
- **NFR-PRV-004** Medical/sensitive data supports stricter permissions and auditing.

### UX/accessibility
- **NFR-UX-001** Main workflows are keyboard-operable with semantic labels/focus behavior.
- **NFR-UX-002** Explicit loading, empty, validation, denied and error states.
- **NFR-UX-003** Responsive desktop/tablet/mobile behavior.
- **NFR-UX-004** Status is not communicated by color alone.

### Maintainability/observability
- **NFR-MNT-001** Backend follows Route → Controller → Service → Repository → Database.
- **NFR-MNT-002** API uses `/api/v1/`.
- **NFR-MNT-003** Documentation updates with implementation changes.
- **NFR-MNT-004** Automated formatting/lint/type/test conventions.
- **NFR-OBS-001** Request/correlation ID propagates to logs/audit.
- **NFR-OBS-002** Logs exclude credentials/secrets/raw sensitive content.
- **NFR-OBS-003** Monitor app, DB, storage and backup health.
