# API v1 — Dashboards

## Purpose
Define fixed Phase 1 dashboard aggregation contracts for Super Admin and tenant-role experiences.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Dashboard identity and tenant are server-resolved. Super Admin receives platform metrics; tenant users receive only the current authorized tenant and role-appropriate sections.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/dashboard` | Return dashboard appropriate to principal/context. | Authenticated; section permissions apply. | No client widget layout. Optional bounded date/window parameters only if explicitly implemented. | 200; optional independent sections may carry partial-error status. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Any date/window parameter must be bounded and authorized. Tenant dashboard queries must all use the same trusted tenant context.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Phase 1 dashboards have predefined server/client composition and no configurable or drag-and-drop widget placement. Independent metrics may execute concurrently with `Promise.allSettled()` when they do not depend on one another. Required identity/tenant/authorization failures fail the whole request; optional independent metric failures may be isolated in section status.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
No arbitrary dashboard data-source filtering. Any supported time window is explicit and bounded.

## Sorting
Not applicable.

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
{"data":{"dashboardType":"TENANT_EMPLOYEE","sections":{"attendance":{"status":"ok","data":{"today":"CLOCKED_IN"}},"announcements":{"status":"ok","data":[]},"leave":{"status":"error","error":{"code":"SECTION_UNAVAILABLE"}}}},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.

## Future Phase
Configurable / drag-and-drop dashboard widgets may be added later. Phase 1 must not create widget-layout tables, layout CRUD APIs, or drag/drop persistence.

## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
