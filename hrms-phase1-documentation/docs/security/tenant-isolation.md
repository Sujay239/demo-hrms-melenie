# Tenant Isolation Security

## Purpose
Translate tenancy architecture into security controls.

## Controls
1. Trusted tenant context.
2. Tenant-bound repositories.
3. Same-tenant foreign-reference validation.
4. Consultant assignment check before context.
5. Explicit/audited Super Admin cross-tenant flow.
6. Tenant-aware cache keys.
7. Tenant-organized object keys as defense-in-depth only.
8. Tenant ID in relevant audit events.

## Test matrix
For each tenant-owned endpoint: correct tenant; another tenant's valid ID; missing consultant assignment; inactive assignment; cross-tenant parent/child reference.
