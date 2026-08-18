# API v1 — Designations

## Purpose
Define tenant designation reference-data contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Designations are tenant-owned; optional department relationship must reference the same tenant.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/designations` | List designations. | `designation.view`. | Query: status, departmentId, search. | 200. |
| `POST` | `/api/v1/designations` | Create designation. | `designation.manage`. | Body: name, description, status, optional departmentId. | 201. |
| `GET` | `/api/v1/designations/{designationId}` | Read designation. | `designation.view`. | Path ID. | 200. |
| `PATCH` | `/api/v1/designations/{designationId}` | Update designation. | `designation.manage`. | Body: mutable fields. | 200. |
| `DELETE` | `/api/v1/designations/{designationId}` | Deactivate/archive safely. | `designation.manage`. | Path ID. | 204/200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Name and department relationship follow tenant constraints. Deactivation must not silently corrupt existing employee history.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Designation may be department-specific where appropriate, but the model must not force that relationship for tenants that use company-wide designations.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Status, department ID, safe search.

## Sorting
Name and created date.

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
{"name":"Senior Engineer","description":"Senior individual contributor","departmentId":"dept-id","status":"ACTIVE"}
```

## Example Response
```json
{"data":{"id":"designation-id","name":"Senior Engineer","status":"ACTIVE"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
