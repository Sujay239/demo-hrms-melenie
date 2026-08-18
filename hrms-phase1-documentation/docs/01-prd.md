# Product Requirements Document (PRD)

## Purpose
Define product vision, objectives, users, journeys, Phase 1 scope, out-of-scope items, future scope, success criteria, risks and assumptions.

## Product vision
Build a secure, extensible multi-tenant HRMS that centralizes workforce records, onboarding, documents, leave, attendance, internal knowledge, notices, support tickets and meeting-room reservations while keeping each tenant's data isolated.

## Business objectives
- Operate multiple companies from one SaaS platform.
- Give HR teams a unified operating environment.
- Provide employee self-service.
- Support consultants only for assigned tenants.
- Make sensitive operations auditable.
- Establish reusable architecture for future payroll, reporting, richer customization, integrations and regional privacy features.

## Users
### SUPER_ADMIN
Creates/updates/activates/deactivates tenants, manages consultants, assigns consultants, manages platform configuration and views platform-level information.

### CONSULTANT
Can enter only actively assigned tenant contexts and only use permissions granted for those tenants.

### TENANT_ADMIN
Manages tenant configuration, employees, organization reference data, leave/holidays, documents, knowledge, notices, tickets, rooms and permitted user/permission administration.

### EMPLOYEE
Views permitted profile/directory data, attendance, leave, documents, knowledge, announcements, tickets and meeting-room availability/reservations.

### NEW_HIRE
Tenant-bound pre-employment user. Not an Employee. Can use onboarding functions only.

## Core journeys
### Tenant provisioning
Super Admin creates tenant → configures status/basic identity → adds logo → associates Tenant Admin → assigns consultant(s) if required → tenant begins operation.

### Employee setup
Tenant Admin creates employee → assigns region/department/designation/manager → activates account/access → employee appears in permitted directory and workflows.

### New Hire onboarding
New Hire logs in → sees onboarding tasks → reviews offer → submits details including Fun Fact About You → uploads required documents → enters acknowledgement name/place/date → downloads document → signs in third-party application → uploads signed copy → HR verifies → onboarding completes → later explicit conversion to Employee.

Phase 1 has **no native digital signature**.

### Leave
Employee views policy/balance → applies → service validates eligibility/rules/balance → approver approves/rejects → balance ledger changes exactly once → audit/history retained.

### Attendance
Employee clocks in → clocks out → attendance record exists → correction/approval workflow if required. Overtime is a separate request/approval flow.

### Documents
Authorized upload → server validation → private storage → metadata/version → authorized view/download → sensitive access audit.

### Room booking
Search room/time → check availability → submit reservation → backend atomically prevents overlap → confirmation/cancellation.

## Phase 1 scope
- Platform and tenant application shells.
- Authentication, account activation/deactivation and reset architecture.
- RBAC and granular permissions.
- Multi-tenancy and consultant assignments.
- Tenant lifecycle and logo branding.
- Employee directory/profile/reporting hierarchy.
- New Hire onboarding and offer-letter workflow.
- Cross-platform document management.
- Regions, departments and designations.
- Configurable leave policy engine and balances.
- Region-specific common/flexible holidays.
- Attendance, corrections, approvals and overtime.
- Predefined role-specific dashboards.
- Global/department knowledge base.
- Public/targeted announcements with read tracking.
- Department-oriented ticket management.
- Buildings/floors/rooms and conflict-safe reservations.
- Audit logging.
- Security, performance, testing, deployment and recovery foundations.

## Out of scope
- Future only: Configurable / drag-and-drop dashboard widgets.
- Custom tenant colors, fonts, CSS or theme builder.
- Payroll.
- Advanced reporting/BI.
- Native digital signature.
- Enterprise SSO.
- Advanced integrations/webhooks unless separately approved.
- Formal GDPR implementation/certification or data residency enforcement.
- Claims of HIPAA/GDPR compliance.

## Future scope
**Future Phase: Configurable / drag-and-drop dashboard widgets.** Phase 1 may keep dashboard data/components modular, but must not create layout tables, widget placement APIs or customization UI.

Other future items: advanced themes, payroll, analytics, SSO, advanced integrations, verified privacy/compliance workflows, data residency and native e-signature.

## Success criteria
- Cross-tenant security tests show no data leakage.
- Consultant assignment bypass is impossible.
- All Phase 1 acceptance criteria pass.
- Sensitive document access is permission-controlled and auditable.
- Leave approval does not duplicate balance effects.
- Concurrent room reservations cannot overlap.
- `/api/v1/` is used consistently.
- Critical E2E journeys pass.
- Production operations include health checks, logs, backup and recovery procedures.

## Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Tenant data leakage | Critical | trusted tenant context, scoped repositories, negative tests |
| Document exposure | Critical | private storage, authorized delivery, audit |
| Consultant overreach | High | explicit active assignment + permissions |
| Leave policy complexity | High | configurable effective policy + ledger |
| Time-zone errors | High | UTC instants + IANA zone |
| Room race condition | High | transactional/database overlap protection |
| Future-scope creep | Medium | scope document + consistency checks |
| Compliance overstatement | High | readiness language only |

## Assumptions
- Transactional HRMS data uses a relational database.
- File binaries use private object storage; metadata stays relational.
- Exact auth transport, ORM/database vendor, cloud storage vendor and numeric limits are implementation-time decisions if the existing codebase does not already fix them.
- Leave values are configurable tenant data, not universal source-code constants.
