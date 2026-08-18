# Roles and Permission Model

## Purpose
Define canonical roles and access evaluation.

## Model
```text
User
→ Authentication
→ Access Context
→ Role
→ Permissions
→ Resource Rule
→ Tenant Rule
→ Allow/Deny
```

## Roles
| Role | Scope | Boundary |
|---|---|---|
| `SUPER_ADMIN` | Platform | explicit audited cross-tenant administration |
| `CONSULTANT` | Assigned tenants | active assignment + permission required |
| `TENANT_ADMIN` | Current tenant | tenant administration |
| `EMPLOYEE` | Current tenant | self-service/permitted resources |
| `NEW_HIRE` | Own tenant onboarding | onboarding only |

## Permission format
`resource.action`, such as:
`employee.view`, `employee.create`, `employee.update`, `leave.apply`, `leave.approve`, `document.view`, `document.upload`, `document.view_sensitive`, `ticket.manage`, `room.reserve`.

## Rules
- Role bundles permissions; permissions do not replace resource/tenant checks.
- Tenant Admin cannot delegate platform-only permissions.
- Sensitive document access is separate from ordinary document viewing.
- Future custom tenant roles may reuse the permission catalog without altering platform privileges.
