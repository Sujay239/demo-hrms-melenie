# Authorization and RBAC Module

## Purpose
Define tenant/platform role assignment, granular permission evaluation, and resource-level authorization policies used across every Phase 1 module.

## Requirement Traceability
Primary SRS requirements: `FR-RBAC-001` through `FR-RBAC-005`; `NFR-SEC-003`

## Actors
- Super Admin
- Consultant
- Tenant Admin
- Employee
- New Hire

## Phase 1 Scope
- Canonical roles and permissions
- Tenant-scoped role assignments
- Platform versus tenant permission separation
- Self/manager/resource/audience/sensitive-document policies
- Default-deny enforcement
- Extensible permission catalog for future custom roles

## Domain Data
Roles, permissions, role-permission mappings, user-role assignments, tenant memberships, consultant assignments, and resource-specific domain relationships used by policy checks.

## Core Workflows
Authenticate → establish trusted tenant/platform context → resolve role/permissions → evaluate resource policy → perform tenant-scoped repository operation → audit sensitive action.

## Business Rules and Invariants
- Permission alone does not override tenant or resource scope.
- `NEW_HIRE` never inherits `EMPLOYEE` access by role-name similarity.
- Tenant Admin cannot grant Super Admin/platform permissions.
- Consultant requires active tenant assignment in addition to any permission.
- Deny by default.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/authorization-api.md`
- `../api/v1/users.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Centralize policy evaluation, prevent IDOR, distinguish 401/403/404 safely, and test every role/resource/tenant negative path.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Role assignment boundaries
- Permission removal takes effect
- Self/manager policies
- Consultant assignment
- Cross-tenant IDOR
- New Hire isolation
- Platform permission escalation attempts

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
