# API v1 — Users and Tenant Access

## Purpose
Define tenant user listing, account status, role assignment, and permission-reference contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Tenant user operations are restricted to the verified tenant context. Platform-only role assignment is never available through tenant routes.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/users` | List tenant users. | `user.view`. | Query: page, pageSize, status, role, search. | 200 paginated. |
| `GET` | `/api/v1/users/{userId}` | Read tenant-access identity. | `user.view` or self-safe route policy. | Path: userId. | 200. |
| `POST` | `/api/v1/users/{userId}/activate` | Activate tenant-access account where allowed. | `user.manage_status`. | Path: userId. | 200. |
| `POST` | `/api/v1/users/{userId}/deactivate` | Deactivate tenant access/account per policy. | `user.manage_status`. | Path: userId; optional reason. | 200. |
| `GET` | `/api/v1/roles` | List tenant-assignable roles. | `role.view`. | Bounded list / pagination. | 200. |
| `GET` | `/api/v1/permissions` | List reference permission catalog. | `permission.view`. | Optional module filter. | 200. |
| `POST` | `/api/v1/users/{userId}/roles/{roleId}` | Assign tenant role. | `role.assign`. | Path IDs; role must be tenant-assignable. | 201/200. |
| `DELETE` | `/api/v1/users/{userId}/roles/{roleId}` | Remove tenant role. | `role.assign`. | Path IDs; cannot violate last-admin safeguards if such safeguard is configured. | 204. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Email/identity fields use canonical normalization. Role IDs must reference active tenant-assignable roles. State transitions must not accidentally deactivate the same identity in unrelated tenants unless the explicit account-level operation is authorized.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Role assignment is scoped to the tenant membership. Super Admin permissions cannot be granted by a Tenant Admin. New Hire access remains onboarding-only until explicit conversion creates/activates employee access.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Status, role, and safe identity search are allow-listed.

## Sorting
Allow-list display name, email, and created date if indexed.

## Success Response
Responses follow `../api-standards.md`; sensitive fields are omitted unless authorized.

## Error Responses
Relevant errors include:
- `401` unauthenticated or expired credential;
- `403` permission/scope denial;
- `404` resource unavailable in the effective access scope;
- `409` state/uniqueness/concurrency conflict where applicable;
- `422` semantic validation failure;
- `429` rate-limit breach on sensitive endpoints;
- `500` unexpected server error;
- module-specific errors documented through stable machine codes.

Errors never disclose cross-tenant existence, SQL/storage internals, secrets, or stack traces.

## Example Request
```json
{"reason":"Employment ended"}
```

## Example Response
```json
{"data":{"id":"user-id","tenantStatus":"INACTIVE"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
