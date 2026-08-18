# API v1 — Holiday Management

## Purpose
Define region-specific common and flexible holidays, employee selection, and holiday lifecycle contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Holidays are tenant-owned and associated with tenant regions. Employees can view/select only holidays applicable to their authoritative region and eligibility.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/holidays` | List holidays. | `holiday.view` or own `holiday.view_self`. | Query: year/date range, regionId if authorized, type, status. | 200. |
| `POST` | `/api/v1/holidays` | Create holiday. | `holiday.manage`. | Body: name, date, regionId, holidayKind (`COMMON`/`FLEXIBLE` or canonical enum), status, selection metadata. | 201. |
| `GET` | `/api/v1/holidays/{holidayId}` | Read holiday. | `holiday.view` or eligible employee view. | Path ID. | 200. |
| `PATCH` | `/api/v1/holidays/{holidayId}` | Update holiday. | `holiday.manage`. | Body: mutable fields subject to selection/history rules. | 200. |
| `DELETE` | `/api/v1/holidays/{holidayId}` | Deactivate/cancel where policy permits. | `holiday.manage`. | Path ID. | 204/200. |
| `GET` | `/api/v1/holiday-selections/me` | List own flexible selections. | `holiday.view_self`. | Query: year. | 200. |
| `POST` | `/api/v1/holiday-selections` | Select eligible flexible holiday. | `holiday.select`. | Body: holidayId. | 201. |
| `DELETE` | `/api/v1/holiday-selections/{selectionId}` | Cancel selection when allowed. | `holiday.select`. | Path ID. | 204. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Holiday date and region are required. Flexible selection must be for an active eligible holiday in the employee’s region and within configured selection limits/windows. Duplicate selection is prohibited.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Holiday Management is separate from Leave Management. Labels such as Sick Leave/PTO/Wellness are leave-type concepts unless a tenant intentionally uses similarly named calendar labels; the data model must not conflate holiday records with leave balances.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Region, year/date range, holiday kind, status.

## Sorting
Date then name is the default stable presentation.

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
{"name":"Regional Festival","date":"2026-10-20","regionId":"region-id","holidayKind":"FLEXIBLE","status":"ACTIVE"}
```

## Example Response
```json
{"data":{"id":"holiday-id","name":"Regional Festival","date":"2026-10-20","holidayKind":"FLEXIBLE"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
