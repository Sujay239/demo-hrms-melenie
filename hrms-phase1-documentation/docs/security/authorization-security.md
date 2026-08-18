# Authorization Security

## Purpose
Define secure policy evaluation.

## Rules
- Deny by default.
- Hidden UI is not permission.
- Tenant resources need permission + tenant + resource relationship.
- Platform/tenant delegation boundaries are explicit.
- Sensitive document viewing is separately permissioned.
- Approval permissions also require approver/resource scope unless explicit broad management permission.
- Self rules use server identity mapping.
- Check authorization-relevant state close to write transaction to reduce TOCTOU risk.
