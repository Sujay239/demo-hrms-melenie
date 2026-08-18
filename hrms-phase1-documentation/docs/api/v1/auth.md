# API v1 — Authentication

## Purpose
Define login, logout, current-user, activation, and password-reset contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Authentication endpoints operate on identity rather than an arbitrary tenant. `/me` returns only memberships/assignments the authenticated user may know about.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate an account. | Public; rate-limited. | Body: identifier/email, password; no tenant authority accepted from body. | 200 with selected session/token result and safe user bootstrap data. |
| `POST` | `/api/v1/auth/logout` | Invalidate the active authentication capability. | Authenticated. | No business body; credential conveyed by selected auth strategy. | 204. |
| `GET` | `/api/v1/auth/me` | Return authenticated user bootstrap context. | Authenticated. | No path params; no arbitrary tenant filter. | 200. |
| `POST` | `/api/v1/auth/password-reset/request` | Request reset capability. | Public; rate-limited. | Body: email/identifier. | 202 regardless of account discoverability. |
| `POST` | `/api/v1/auth/password-reset/complete` | Set a new password using one-time capability. | Public with valid reset capability. | Body: reset capability, new password, confirmation if UI uses it. | 200/204. |
| `POST` | `/api/v1/auth/activate` | Activate an invited account. | Public with valid one-time activation capability. | Body: activation capability and required initial password/profile fields. | 200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Identifiers must be normalized consistently. Password rules follow the authentication-security specification. Reset/activation capabilities must be valid, unexpired, unused, and purpose-bound.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Login is denied for inactive/deactivated accounts. Error wording resists account enumeration. Reset and activation are single-use. The exact cookie/token strategy is resolved through ADR-007 before implementation.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
None beyond endpoint-specific identifiers.

## Sorting
Not applicable unless stated in the endpoint table.

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
{"identifier": "alex@example.com", "password": "<redacted>"}
```

## Example Response
```json
{"data":{"user":{"id":"user-id","displayName":"Alex"},"memberships":[{"tenantId":"tenant-id","roles":["EMPLOYEE"]}]},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
