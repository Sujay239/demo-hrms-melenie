# Tenant Management Module

## Purpose
Provide Super Admin lifecycle control for independent companies and consultant assignment.

## Requirement Traceability
Primary SRS requirements: `FR-TEN-001` through `FR-TEN-007`; relevant `FR-RBAC-*`

## Actors
- Super Admin
- Consultant (assigned-tenant read only as permitted)

## Phase 1 Scope
- Create/update/read tenants
- Activate/deactivate tenant
- Platform tenant listing
- Consultant creation/reference and tenant assignment
- Tenant logo metadata/reference and basic tenant configuration
- Platform-level overview data

## Domain Data
Tenants, consultant profiles, consultant-tenant assignments, memberships, audit logs; tenant branding references private/authorized storage metadata.

## Core Workflows
Tenant lifecycle: create → configure → activate → operate → deactivate/reactivate.

Consultant: create/identify consultant → assign to tenant → permit only allowed tenant information → revoke assignment immediately blocks future access.

## Business Rules and Invariants
- Super Admin is the only Phase 1 role that can manage all tenants.
- Consultant role alone grants zero tenant access; an active assignment is mandatory.
- Tenant deactivation preserves data and blocks normal tenant portal operations.
- Tenant identity used for data access is server-validated.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/tenants.md`
- `../api/v1/users.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Cross-tenant administration is privileged and auditable. Avoid bulk endpoints that bypass per-tenant authorization. Tenant logo files follow document/file security rules.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Create/update/status transition
- Consultant assigned tenant succeeds
- Unassigned consultant denied
- Cross-tenant IDOR attempts
- Tenant deactivation effect
- Audit events

## Future Extensibility
Billing, plans, advanced tenant themes, data residency controls, and advanced platform analytics are future scope.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
