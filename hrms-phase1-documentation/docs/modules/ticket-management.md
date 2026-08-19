# Ticket Management Module

## Purpose

Provide department-routed internal service tickets with comments, attachments, assignment, canonical statuses, and immutable activity history. **Additionally**, provide company-to-Super-Admin platform tickets for platform-level support.

## Requirement Traceability

Primary SRS requirements: `FR-TKT-001` through `FR-TKT-008`

## Actors

### Intra-Company Tickets (DB-OPS)
- Employee/requester
- Department ticket agent/authorized manager
- Tenant Admin

### Platform Tickets (DB-AUDIT)
- Tenant Admin (raises tickets to Super Admin)
- Super Admin (manages/resolves platform tickets)

## Phase 1 Scope

### Intra-Company Tickets
- Create/list/view tickets
- Server-generated ticket number (tenant-unique, e.g., `TKT-00042`)
- Subject/description/category/department
- Priority
- Assignee
- Comments (with internal-only flag)
- Secure attachments (via Document Management)
- Activity history
- Status workflow

### Platform Tickets (NEW)
- Tenant Admin creates platform ticket to Super Admin
- Subject/description/category (TECHNICAL, BILLING, FEATURE_REQUEST, DATA_ISSUE, ACCESS_ISSUE, SECURITY, GENERAL)
- Priority (LOW, MEDIUM, HIGH, CRITICAL)
- Super Admin assignment
- Comments (with internal-only flag for admin-only notes)
- Activity history
- Status workflow
- Attachment support (via file_storage_references)

## Domain Data

### Intra-Company (DB-OPS)
Tickets, categories, comments, activity entries; document associations provide attachments. All tenant-scoped.

### Platform (DB-AUDIT)
Platform tickets, platform ticket comments, platform ticket activities. Tenant-scoped for the raising company; platform-scoped for Super Admin management.

## Core Workflows

### Intra-Company Ticket
Employee creates `OPEN` ticket → department queue → assign → `IN_PROGRESS`/`WAITING` → resolve → `RESOLVED` → close → `CLOSED`, with every material transition in activity history.

### Platform Ticket (NEW)
```text
Tenant Admin creates OPEN platform ticket
  → Super Admin sees in platform queue
  → Super Admin assigns to self/another admin
  → IN_PROGRESS / WAITING_ON_TENANT / WAITING_ON_ADMIN
  → Comments exchanged between Tenant Admin and Super Admin
  → RESOLVED (with resolution notes)
  → CLOSED
```

## Business Rules and Invariants

### Intra-Company Tickets
- Canonical statuses: `OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED`.
- Ticket number tenant-unique/server-generated.
- Department/category/assignee/attachments are same-tenant.
- Status transitions follow explicit state rules.
- Attachments use centralized Document Management.

### Platform Tickets
- Canonical statuses: `OPEN`, `IN_PROGRESS`, `WAITING_ON_TENANT`, `WAITING_ON_ADMIN`, `RESOLVED`, `CLOSED`.
- Ticket number platform-wide unique/server-generated (e.g., `PLT-00042`).
- Only Tenant Admin (with `platform_ticket.create` permission) can create platform tickets.
- Only Super Admin (with `platform_ticket.manage` permission) can assign/resolve platform tickets.
- Both Tenant Admin and Super Admin can comment. Internal comments are admin-only.
- Platform tickets are isolated per tenant — a Tenant Admin sees only their own company's platform tickets.
- Super Admin sees all platform tickets across all tenants with filtering.

### Separation
Intra-company tickets and platform tickets are **completely separate** systems with different tables, different databases, different statuses, and different access patterns. They share no data or code paths except the same UI navigation structure.

## Authorization and Tenant Rules

All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

### Platform Ticket Authorization
- `platform_ticket.create`: Tenant Admin creates tickets for their own tenant.
- `platform_ticket.view_own`: Tenant Admin views tickets raised by their tenant.
- `platform_ticket.view`: Super Admin views all platform tickets.
- `platform_ticket.manage`: Super Admin assigns, resolves, closes platform tickets.
- `platform_ticket.comment`: Both Tenant Admin and Super Admin can comment.

## API Contracts

- `../api/v1/tickets.md` — intra-company tickets
- `../api/v1/platform-tickets.md` — platform tickets (NEW)

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling

- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations

- Department queue visibility is server-enforced for intra-company tickets.
- Platform ticket visibility is tenant-scoped for Tenant Admin and platform-scoped for Super Admin.
- Comment rendering prevents XSS.
- File attachments inherit secure document access (via Document Management for intra-company, via file_storage_references for platform tickets).
- Requester visibility does not imply access to internal-only data unless explicitly modeled.
- Internal comments (`is_internal = true`) are never visible to Tenant Admin for platform tickets.

## Audit Expectations

Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

### Platform Ticket Specific Audit Events
- Platform ticket created (by Tenant Admin)
- Platform ticket assigned (by Super Admin)
- Platform ticket status changed
- Platform ticket resolved/closed
- Platform ticket commented (noting if internal)

## Acceptance/Test Focus

### Intra-Company Tickets
- Create/routing
- Status transition matrix
- Assignee scope
- Requester versus agent access
- Comments/activity
- Attachment authorization
- Cross-department/tenant attempts

### Platform Tickets
- Tenant Admin creates platform ticket
- Tenant Admin sees only their own tenant's platform tickets
- Super Admin sees all platform tickets
- Super Admin assigns platform ticket
- Comment exchange between Tenant Admin and Super Admin
- Internal comment not visible to Tenant Admin
- Cross-tenant platform ticket access denied
- Platform ticket attachment authorization
- Status transition matrix

## Future Extensibility

No additional module-specific future scope beyond `../11-future-roadmap.md`. Future potential: SLA tracking, escalation rules, satisfaction surveys, auto-routing.

## Related Documents

- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
- `../database/database-schema.md`
