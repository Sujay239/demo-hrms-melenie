# Authorization API Architecture

## Purpose
Define how API endpoints enforce roles, permissions, tenant boundaries, ownership, sensitivity, and scope.

## Core Model
`User → Role → Permission → Resource → Tenant`

A permission is necessary but may not be sufficient. Resource-specific policies can additionally require:
- same tenant;
- self ownership;
- manager/subordinate relationship;
- consultant assignment;
- department/region audience eligibility;
- sensitive-document entitlement;
- target audience match.

## Enforcement Order
1. Authenticate user.
2. Resolve trusted tenant context.
3. Confirm active membership/assignment or Super Admin authority.
4. Resolve effective permission.
5. Load/query the resource through a tenant-scoped repository.
6. Apply resource-level policy.
7. Execute business action.
8. Audit security-sensitive actions.

This ordering prevents IDOR and accidental cross-tenant lookups.

## API Exposure
Phase 1 may expose endpoints needed to list roles/permissions or manage allowed assignments, but it does not permit arbitrary users to manufacture platform permissions.

## Permission Checks
API documentation names the canonical permission from `../security/permissions-catalog.md`. Implementations should centralize policy evaluation; controllers must not contain scattered role-name conditionals.

## Denial Semantics
Use `401` for missing/invalid authentication. Use `403` when authenticated but not allowed. A `404` may be used where disclosing existence would leak another tenant’s or another user’s protected resource.

## Related Documents
- `../architecture/authorization-architecture.md`
- `../architecture/multi-tenancy.md`
- `../security/authorization-security.md`
- `../security/permissions-catalog.md`
