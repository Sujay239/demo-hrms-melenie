# Department Management Module

## Purpose
Manage tenant departments, hierarchy, department heads, status, and employee membership context.

## Requirement Traceability
Primary SRS requirements: `FR-DEP-001` through `FR-DEP-002`

## Actors
- Tenant Admin
- Employees as read-only directory consumers where permitted

## Phase 1 Scope
- Department create/read/update/deactivate
- Description
- Head employee
- Parent department hierarchy
- Employee membership via employee record
- Future targeting compatibility for KB, tickets, announcements, permissions

## Domain Data
Departments contain tenant, name, description, status, optional parent department, optional department-head employee. Employee records reference department.

## Core Workflows
Admin creates department → optionally assigns parent/head → employees are placed through Employee Management → hierarchy queries present tree/ancestry.

## Business Rules and Invariants
- Parent and head must share tenant.
- No self-parent or hierarchy cycle.
- Deactivation cannot silently orphan required active relationships.
- Department does not duplicate employee membership in an uncontrolled second source of truth.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/departments.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Department visibility and future target usage must remain tenant-scoped. Head assignment does not automatically grant permissions unless role/policy says so.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- CRUD/status
- Hierarchy cycle
- Head in another tenant
- Active child/dependency behavior
- Employee directory filter

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
