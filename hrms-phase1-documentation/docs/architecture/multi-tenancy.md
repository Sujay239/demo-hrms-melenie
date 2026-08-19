# Multi-Tenancy Architecture

## Purpose

Specify tenant identification, trusted context, isolation, consultant assignments, cross-tenant access, and multi-database tenant context propagation.

## Model

```text
Platform
 ├─ Tenant A ──▶ DB-CORE (identity) + DB-HR (employees) + DB-DOCS (files) + DB-OPS (operations) + DB-AUDIT (audit)
 ├─ Tenant B ──▶ Same databases, isolated by tenant_id in every row
 └─ Tenant C ──▶ Same databases, isolated by tenant_id in every row
```

Each tenant's data is spread across all 5 databases but isolated by `tenant_id` on every tenant-owned row. There is no per-tenant database — isolation is row-level within shared databases.

## Tenant Identification

A client may request/select a tenant ID, but that value is only a selector. The server proves access before creating trusted tenant context.

## Tenant Context Algorithm

1. Authenticate user (DB-CORE: `users`, `auth_sessions`).
2. Determine platform or tenant operation.
3. For Tenant Admin/Employee/New Hire, verify active tenant membership/lifecycle mapping (DB-CORE: `tenant_user_memberships`).
4. For Consultant, verify active `consultant_tenant_assignment` (DB-CORE: `consultant_tenant_assignments`).
5. For Super Admin tenant-context operation, require explicit platform permission (DB-CORE: `user_role_assignments`, `role_permissions`).
6. Attach trusted tenant context — a server-side object containing: `{ tenant_id, user_id, role, permissions[] }`.
7. Service/repository resolves all tenant-owned resources inside that context, across **all databases**.

## Cross-Database Tenant Propagation

Once tenant context is established from DB-CORE, it is propagated as a trusted in-memory context object to all service calls. Other databases do NOT re-query DB-CORE to verify the tenant — they trust the context established during authentication.

```text
Authentication (DB-CORE)
  ▼
Trusted Context Object: { tenant_id: UUID, user_id: UUID, role: string, perms: string[] }
  ▼
┌───────────┬───────────┬───────────┬───────────┐
│  DB-HR    │  DB-DOCS  │  DB-OPS   │  DB-AUDIT │
│  WHERE    │  WHERE    │  WHERE    │  WHERE    │
│  tenant_id│  tenant_id│  tenant_id│  tenant_id│
│  = ctx.id │  = ctx.id │  = ctx.id │  = ctx.id │
└───────────┴───────────┴───────────┴───────────┘
```

### Cross-Database Tenant Validation

When a service writes data that references a cross-database entity:
1. The service calls the owning service to verify the entity exists.
2. The owning service confirms the entity belongs to the same `tenant_id`.
3. Only then does the write proceed.

Example: Creating a leave request (DB-OPS) for an employee (DB-HR):
- Leave Service calls Employee Service: "Does employee `{id}` exist in tenant `{tenant_id}`?"
- Employee Service queries DB-HR with `WHERE id = ? AND tenant_id = ?`
- If valid, Leave Service creates the request in DB-OPS.

## Query Rule

Forbidden conceptual query:
`getEmployeeById(employeeId)` for a tenant endpoint.

Required behavior:
`getEmployeeForTenant(trustedTenantId, employeeId)` or a repository already bound to tenant context.

This rule applies across **all 5 databases** — no repository method in any database should accept a resource ID without tenant context.

## Consultant

Assignment grants eligibility to enter tenant context, not blanket domain permission. A consultant with an active assignment to Tenant A can enter Tenant A's context but must still pass permission checks for every resource access within that tenant.

## Super Admin

Cross-tenant access must be deliberate, permission-controlled and auditable. Do not silently bypass failed tenant authorization because actor is Super Admin. Super Admin platform operations (e.g., listing all tenants, managing platform tickets) operate outside tenant context entirely.

## IDOR Prevention

- Resolve `(tenant_id, resource_id)` — never resource_id alone.
- Validate all nested foreign IDs are same tenant — including cross-database references.
- Avoid leaking resource existence across tenants — return 404 (not 403) when resource belongs to another tenant.
- Cache keys include tenant scope: `{tenant_id}:{resource_type}:{resource_id}`.
- Storage delivery starts from authorized tenant-scoped metadata — object keys are NOT authorization tokens.
- Document access requires valid `document_access_token` scoped to the correct tenant.

## Database Considerations

App-level tenant scoping is mandatory across all 5 databases. DB row-level security (PostgreSQL RLS) may later provide defense in depth but does not replace service/repository correctness. Within a single database, FK constraints help enforce same-tenant references. Across databases, the service layer is responsible for tenant consistency.

## Tenant-Scoped Connection Selection

The application maintains separate connection pools for each database. When a request enters a service:
1. Tenant context is already established.
2. The service selects the appropriate repository (which uses the correct database connection pool).
3. Every repository method includes `tenant_id` in its WHERE clause.
4. Connection pool selection is based on the **module/domain**, not the tenant — all tenants share the same databases.

## Required Tests

For every tenant-owned module, across all databases:
- Correct-tenant access succeeds.
- Cross-tenant ID returns 404 (not 403).
- Missing consultant assignment returns 403.
- Inactive assignment/access returns 403.
- Cross-tenant child reference (e.g., employee from Tenant A assigned to department from Tenant B) returns validation error.
- Cross-database reference validation (e.g., leave request references employee that doesn't exist in DB-HR).
