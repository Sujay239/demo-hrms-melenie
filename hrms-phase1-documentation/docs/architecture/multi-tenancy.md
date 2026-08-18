# Multi-Tenancy Architecture

## Purpose
Specify tenant identification, trusted context, isolation, consultant assignments and cross-tenant access.

## Model
```text
Platform
 ├─ Tenant A
 ├─ Tenant B
 └─ Tenant C
```

## Tenant identification
A client may request/select a tenant ID, but that value is only a selector. The server proves access before creating trusted tenant context.

## Tenant context algorithm
1. Authenticate user.
2. Determine platform or tenant operation.
3. For Tenant Admin/Employee/New Hire, verify active tenant membership/lifecycle mapping.
4. For Consultant, verify active `consultant_tenant_assignment`.
5. For Super Admin tenant-context operation, require explicit platform permission.
6. Attach trusted tenant context.
7. Service/repository resolves all tenant-owned resources inside that context.

## Query rule
Forbidden conceptual query:
`getEmployeeById(employeeId)` for a tenant endpoint.

Required behavior:
`getEmployeeForTenant(trustedTenantId, employeeId)` or a repository already bound to tenant context.

## Consultant
Assignment grants eligibility to enter tenant context, not blanket domain permission.

## Super Admin
Cross-tenant access must be deliberate, permission-controlled and auditable. Do not silently bypass failed tenant authorization because actor is Super Admin.

## IDOR prevention
- Resolve `(tenant_id, resource_id)`.
- Validate all nested foreign IDs are same tenant.
- Avoid leaking resource existence across tenants.
- Cache keys include tenant scope.
- Storage delivery starts from authorized tenant-scoped metadata.

## Database considerations
App-level tenant scoping is mandatory. DB row-level security may later provide defense in depth but does not replace service/repository correctness.

## Required tests
For every tenant-owned module: correct-tenant access, cross-tenant ID, missing consultant assignment, inactive assignment/access, and cross-tenant child reference.
