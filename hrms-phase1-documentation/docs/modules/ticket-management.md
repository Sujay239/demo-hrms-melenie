# Ticket Management Module

## Purpose
Provide department-routed internal service tickets with comments, attachments, assignment, canonical statuses, and immutable activity history.

## Requirement Traceability
Primary SRS requirements: `FR-TKT-001` through `FR-TKT-004`

## Actors
- Employee/requester
- Department ticket agent/authorized manager
- Tenant Admin

## Phase 1 Scope
- Create/list/view tickets
- Server-generated ticket number
- Subject/description/category/department
- Priority
- Assignee
- Comments
- Secure attachments
- Activity history
- Status workflow

## Domain Data
Tickets, categories, comments, activity entries; document associations provide attachments.

## Core Workflows
Employee creates `OPEN` ticket → department queue → assign → `IN_PROGRESS`/`WAITING` → resolve → `RESOLVED` → close → `CLOSED`, with every material transition in activity history.

## Business Rules and Invariants
- Canonical statuses: `OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED`.
- Ticket number tenant-unique/server-generated.
- Department/category/assignee/attachments are same-tenant.
- Status transitions follow explicit state rules.
- Attachments use centralized Document Management.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/tickets.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Department queue visibility is server-enforced. Comment rendering prevents XSS. File attachments inherit secure document access. Requester visibility does not imply access to internal-only data unless explicitly modeled.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Create/routing
- Status transition matrix
- Assignee scope
- Requester versus agent access
- Comments/activity
- Attachment authorization
- Cross-department/tenant attempts

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
