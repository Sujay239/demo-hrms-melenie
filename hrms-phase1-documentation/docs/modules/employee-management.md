# Employee Management Module

## Purpose
Maintain tenant employee directory, profiles, organization placement, and reporting hierarchy.

## Requirement Traceability
Primary SRS requirements: `FR-EMP-001` through `FR-EMP-005`

## Actors
- Tenant Admin
- Employee
- Consultant when assigned and explicitly permitted

## Phase 1 Scope
- Employee listing and profile
- Create/update/deactivate/archive
- Employee ID, contact and employment data
- Department/designation/region/manager
- Joining date, status, profile image
- Directory visibility rules
- Direct reports and reporting chain

## Domain Data
Employees reference tenant, department, designation, region, manager employee, and optional secured profile image document. Historical employment/audit records remain preservable.

## Core Workflows
Admin creates employee → assigns organization references → employee appears in authorized directory.

Hierarchy update validates no self-manager/cycle → persists relationship → reporting queries derive chain/direct reports.

## Business Rules and Invariants
- Employee ID unique within tenant.
- All organization references must share tenant.
- Manager hierarchy cannot cycle.
- `NEW_HIRE` is not an `EMPLOYEE`; conversion is handled by onboarding workflow.
- Self-edit fields are narrower than administrator-edit fields.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/employees.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Field-level privacy matters: directory access does not imply access to every HR field. Consultants require tenant assignment and specific employee-view authority.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Directory filters/pagination
- Self versus admin fields
- Same-tenant reference validation
- Manager cycle prevention
- Cross-tenant employee IDOR
- New Hire/Employee lifecycle distinction

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
