# API v1 — Buildings, Meeting Rooms and Reservations

## Purpose
Define building/floor/room reference data, room availability, reservation, cancellation, and upcoming-reservation contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Buildings, rooms, and reservations are tenant-owned. Employees can reserve only active rooms they are permitted to use. Facility managers use `room.manage` within the tenant.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/buildings` | List buildings/floors for current tenant. | `room.view`. | Query: status, regionId if modeled. | 200. |
| `POST` | `/api/v1/buildings` | Create building. | `room.manage`. | Body: name, region/address metadata, status. | 201. |
| `GET` | `/api/v1/meeting-rooms` | List rooms. | `room.view`. | Query: buildingId, floorId, capacityMin, facility, active, page/pageSize. | 200. |
| `POST` | `/api/v1/meeting-rooms` | Create room. | `room.manage`. | Body: building/floor, name, capacity, facilities, active status. | 201. |
| `PATCH` | `/api/v1/meeting-rooms/{roomId}` | Update room. | `room.manage`. | Body: mutable room fields. | 200. |
| `GET` | `/api/v1/meeting-rooms/{roomId}/availability` | Read availability. | `room.view`. | Query: start, end; bounded window. | 200. |
| `GET` | `/api/v1/room-reservations` | List own/authorized reservations. | `room.view_reservations`. | Query: mine, roomId, date range, status, page/pageSize. | 200 paginated. |
| `POST` | `/api/v1/room-reservations` | Reserve room. | `room.reserve`. | Body: roomId, startAt, endAt, title/purpose where allowed. | 201. |
| `DELETE` | `/api/v1/room-reservations/{reservationId}` | Cancel eligible reservation. | Owner or `room.manage`. | Path ID; optional reason. | 204/200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Capacity is positive; start precedes end; room is active; requested period is within configured constraints. The create operation must prevent any conflicting active reservation even under concurrent requests using a transactionally safe database strategy.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Availability is advisory; only successful reservation creation confirms a booking. The backend, not the UI, owns overlap prevention. Cancellation preserves history rather than physically deleting the reservation.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Rooms: building/floor/capacity/facility/status. Reservations: own, room, status, bounded date range.

## Sorting
Rooms: name/capacity. Reservations: start time, created time.

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
{"roomId":"room-id","startAt":"2026-08-20T09:00:00Z","endAt":"2026-08-20T10:00:00Z","title":"Project Review"}
```

## Example Response
```json
{"data":{"id":"reservation-id","roomId":"room-id","status":"CONFIRMED","startAt":"2026-08-20T09:00:00Z","endAt":"2026-08-20T10:00:00Z"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
