# API v1 — Audit Logs

## Purpose
Define read-only authorized audit-query contracts. Audit creation is an internal cross-cutting concern rather than a client-controlled API.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Tenant audit viewers see only their tenant and only fields allowed by sensitivity policy. Super Admin platform audit scope is explicit. A consultant does not gain audit access merely by tenant assignment.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/audit-logs` | Query authorized audit events. | `audit.view` or platform audit permission. | Query: page/pageSize, actorId, action, resourceType, resourceId, dateFrom/dateTo, requestId; tenant scope server-derived. | 200 paginated. |
| `GET` | `/api/v1/audit-logs/{auditId}` | Read one authorized audit event. | `audit.view` with appropriate scope. | Path ID. | 200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Date ranges are bounded. Filter IDs are syntactically valid. Sensitive before/after fields are redacted according to viewer rights. Clients cannot create/update/delete audit events through this API.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Audit records are append-oriented and integrity-protected by access controls. Sensitive document reads/downloads must create auditable events. Secrets, raw credentials, and unnecessarily sensitive file content are never logged.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Actor, action, resource type/id, bounded date range, request ID. Tenant is derived/validated rather than accepted as authority.

## Sorting
Timestamp descending by default; deterministic ID tie-breaker.

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
{}
```

## Example Response
```json
{"data":[{"id":"audit-id","actorId":"user-id","action":"DOCUMENT_DOWNLOADED","resourceType":"DOCUMENT","resourceId":"document-id","timestamp":"2026-08-18T12:00:00Z","requestId":"request-id"}],"meta":{"requestId":"request-id","pagination":{"page":1,"pageSize":25,"total":1,"totalPages":1}}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
