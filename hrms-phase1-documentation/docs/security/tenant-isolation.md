# Tenant Isolation Security

## Purpose

Translate tenancy architecture into security controls, spanning all 5 databases, external storage, and document access.

## Multi-Layer Isolation Model

```text
Layer 1: Authentication        → User identity verified (DB-CORE)
Layer 2: Tenant Context        → Server-side tenant membership verified (DB-CORE)
Layer 3: Database Queries      → Every query includes tenant_id WHERE clause (all DBs)
Layer 4: Storage Paths         → Object keys prefixed with tenant_id (S3/storage)
Layer 5: Encryption Keys       → Per-tenant encryption key references (KMS)
Layer 6: Access Tokens         → Document tokens scoped to tenant_id (DB-DOCS)
Layer 7: Audit Trail           → tenant_id in every audit event (DB-AUDIT)
Layer 8: Cache Keys            → Tenant-scoped cache keys (application memory)
```

## Controls

### 1. Trusted Tenant Context
Tenant context is established from DB-CORE during authentication and propagated as an immutable in-memory object to all service calls across all databases.

### 2. Tenant-Bound Repositories
Every repository method in every database includes `tenant_id` in its WHERE clause. No repository method accepts a resource ID without tenant context.

### 3. Same-Tenant Foreign-Reference Validation
Within the same database: FK constraints enforce same-tenant references.
Across databases: Service-layer validates that referenced entities belong to the same tenant before write operations.

### 4. Consultant Assignment Check
Consultant must have an active `consultant_tenant_assignment` before tenant context can be established. Assignment alone does not grant domain permissions.

### 5. Explicit/Audited Super Admin Cross-Tenant Flow
Super Admin cross-tenant access requires explicit platform permission, is logged with full context to `audit_logs`, and never silently bypasses tenant authorization.

### 6. Tenant-Aware Cache Keys
All cache keys include tenant scope: `{tenant_id}:{resource_type}:{resource_id}`. Cache invalidation is tenant-scoped.

### 7. Storage-Level Isolation
- Object keys follow `{tenant_id}/{module}/{year}/{month}/{uuid}.{ext}` structure.
- IAM policies or bucket policies restrict service access to tenant-specific prefixes where possible.
- No cross-tenant path traversal — storage keys are server-generated.

### 8. Tenant ID in Audit Events
Every audit event in `audit_logs` includes `tenant_id`. Platform-level events have `tenant_id = NULL`.

### 9. Document Access Token Isolation
- Tokens embed `tenant_id` and are verified against the request's tenant context.
- Cross-tenant document access is blocked unless explicitly created by Super Admin with `granted_to_tenant_id`.
- Access log records both `tenant_id` (document owner) and `actor_tenant_id` (accessor).

### 10. Database-Level Isolation
- Each database has its own connection pool and credentials.
- Cross-database references are UUID columns without FK constraints — service-layer validated.
- Database failure isolation: DB-DOCS failure does not expose tenant data from DB-HR or DB-OPS.

### 11. Encryption Key Isolation
- Per-tenant encryption keys (KMS key ARN) stored in `file_storage_references.encryption_key_ref`.
- Key rotation is per-tenant — rotating one tenant's key does not affect others.
- Platform master key → tenant-derived keys hierarchy.

### 12. Network-Level Considerations
- Database connections restricted to application service network (VPC, private subnet).
- S3/storage endpoint accessible only from application service network.
- No direct client-to-database or client-to-storage connections.

## Test Matrix

For each tenant-owned endpoint, across all databases:

| Test Case | Expected Outcome |
|---|---|
| Correct tenant access | 200 OK with data |
| Another tenant's valid resource ID | 404 Not Found (not 403) |
| Missing consultant assignment | 403 Forbidden |
| Inactive consultant assignment | 403 Forbidden |
| Cross-tenant parent/child reference (e.g., employee from Tenant A, department from Tenant B) | 400 Validation Error |
| Cross-database reference with wrong tenant (e.g., leave request for employee in different tenant) | 400 Validation Error |
| Document access token from Tenant A used in Tenant B context | 403 Forbidden |
| Storage path manipulation attempt | 403 Forbidden (server-generated keys only) |
| Cache poisoning attempt (wrong tenant key) | Cache miss, fresh query with correct tenant |
