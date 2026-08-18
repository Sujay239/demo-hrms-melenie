# API v1 — Tenants

## Purpose
Define Super Admin tenant lifecycle and consultant assignment contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Tenant management is platform scope. Only Super Admin may enumerate all tenants. Consultant assignments are server-validated platform relationships.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/tenants` | List tenants. | `tenant.view`. | Query: page, pageSize, status, search, sort/order. | 200 paginated. |
| `POST` | `/api/v1/tenants` | Create tenant. | `tenant.create`. | Body: legal/display name, code/slug if adopted, active status defaults, region defaults, logo metadata only if already uploaded through document/storage flow. | 201. |
| `GET` | `/api/v1/tenants/{tenantId}` | Read tenant. | `tenant.view`; consultant may use assigned-tenant read route only when explicitly permitted. | Path: tenantId. | 200. |
| `PATCH` | `/api/v1/tenants/{tenantId}` | Update tenant configuration. | `tenant.update`. | Body: allow-listed tenant configuration; no arbitrary platform-role changes. | 200. |
| `POST` | `/api/v1/tenants/{tenantId}/activate` | Activate tenant. | `tenant.manage_status`. | Path: tenantId; optional reason. | 200. |
| `POST` | `/api/v1/tenants/{tenantId}/deactivate` | Deactivate tenant. | `tenant.manage_status`. | Path: tenantId; reason recommended. | 200. |
| `GET` | `/api/v1/tenants/{tenantId}/consultants` | List assignments. | `consultant.view`. | Path: tenantId; pagination if needed. | 200. |
| `POST` | `/api/v1/tenants/{tenantId}/consultants/{consultantId}` | Assign consultant. | `consultant.assign`. | Path identifiers; optional assignment permissions/scope if supported by Phase 1 policy. | 201/200. |
| `DELETE` | `/api/v1/tenants/{tenantId}/consultants/{consultantId}` | Remove assignment. | `consultant.assign`. | Path identifiers. | 204. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Tenant name/code rules and uniqueness must match database constraints. Activation/deactivation state transitions must be explicit. Consultant and tenant must exist in platform scope.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Deactivation blocks normal tenant-portal access without deleting tenant data. Consultant access is never implied by consultant role alone; assignment is required. Platform operations are audited.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Allow-list status and safe search over tenant identifying fields. Consultant-facing tenant listing is constrained to assigned tenants.

## Sorting
Allow-list stable tenant fields such as name and created timestamp.

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
{"name":"Acme Ltd","defaultRegionId":"region-id"}
```

## Example Response
```json
{"data":{"id":"tenant-id","name":"Acme Ltd","status":"ACTIVE"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
