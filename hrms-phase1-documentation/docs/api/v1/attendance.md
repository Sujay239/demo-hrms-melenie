# API v1 — Attendance and Overtime

## Purpose
Define clock-in/out, attendance records, corrections, approval, overtime request, and overtime approval contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Attendance is tenant-owned. Clock actions use the authenticated employee identity; a client cannot clock another employee by changing an ID. Manager/admin views require permission and scope.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `POST` | `/api/v1/attendance/clock-in` | Clock in current employee. | `attendance.clock`. | Body: permitted context such as note; server captures authoritative timestamp. Location/device fields only if Phase 1 policy explicitly enables them. | 201. |
| `POST` | `/api/v1/attendance/clock-out` | Clock out current employee. | `attendance.clock`. | Body: optional allowed note; server timestamp. | 200. |
| `GET` | `/api/v1/attendance/me` | List own attendance. | `attendance.view_self`. | Query: dateFrom, dateTo, page/pageSize. | 200 paginated. |
| `GET` | `/api/v1/attendance` | List authorized employee records. | `attendance.view`. | Query: employeeId, departmentId, regionId, status, date range, page/pageSize. | 200 paginated. |
| `POST` | `/api/v1/attendance/{recordId}/corrections` | Request/capture correction. | `attendance.correct_self` for own request or `attendance.manage`. | Body: requested clock times/reason. | 201. |
| `POST` | `/api/v1/attendance/{recordId}/approve` | Approve attendance/correction where workflow requires. | `attendance.approve` plus scope. | Body: optional note. | 200. |
| `POST` | `/api/v1/attendance/{recordId}/reject` | Reject pending correction/attendance approval. | `attendance.approve` plus scope. | Body: reason. | 200. |
| `GET` | `/api/v1/overtime-requests` | List overtime requests. | Own or `overtime.manage`/approver scope. | Query: status, employeeId if authorized, date range. | 200 paginated. |
| `POST` | `/api/v1/overtime-requests` | Request overtime. | `overtime.request`. | Body: date, requested duration/time range, reason. | 201. |
| `POST` | `/api/v1/overtime-requests/{requestId}/approve` | Approve overtime. | `overtime.approve` plus manager scope. | Body: note/approved duration if policy permits. | 200. |
| `POST` | `/api/v1/overtime-requests/{requestId}/reject` | Reject overtime. | `overtime.approve` plus manager scope. | Body: reason. | 200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Server timestamps are authoritative for direct clock actions. Prevent an open second clock-in, impossible clock-out ordering, invalid durations, overlapping active attendance as defined by policy, and unauthorized retroactive edits. Corrections preserve original values/history.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Working hours derive from approved/valid events; overtime is a separate request/approval workflow. Region time zone controls local-day interpretation while persisted instants remain UTC.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Date range, status, employee/department/region only for authorized viewers.

## Sorting
Attendance date/time and submitted date; deterministic tie-breakers required.

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
{"reason":"Stayed for production release","date":"2026-08-18","requestedMinutes":120}
```

## Example Response
```json
{"data":{"id":"overtime-id","status":"PENDING","requestedMinutes":120},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
