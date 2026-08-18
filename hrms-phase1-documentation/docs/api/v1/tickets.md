# API v1 — Ticket Management

## Purpose
Define department-wise ticket creation, assignment, comments, attachments, status, priority, and activity history contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Tickets are tenant-owned and routed to a tenant department. Employees can create and view tickets according to policy; department/authorized agents see only their permitted queue.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/tickets` | List tickets in effective scope. | `ticket.view` or own ticket policy. | Query: page/pageSize, status, priority, departmentId, assigneeId if authorized, mine, search. | 200 paginated. |
| `POST` | `/api/v1/tickets` | Create ticket. | `ticket.create`. | Body: subject, description, categoryId, departmentId, priority, attachmentDocumentIds if already uploaded. | 201. |
| `GET` | `/api/v1/tickets/{ticketId}` | Read ticket and permitted activity. | Owner or `ticket.view` with department scope. | Path ID. | 200. |
| `PATCH` | `/api/v1/tickets/{ticketId}` | Update routing/assignee/priority/allowed fields. | `ticket.manage`. | Body: allow-listed mutable fields. | 200. |
| `POST` | `/api/v1/tickets/{ticketId}/status` | Transition status. | `ticket.manage` or permitted resolver action. | Body: status, optional reason. | 200. |
| `POST` | `/api/v1/tickets/{ticketId}/comments` | Add comment. | `ticket.comment` plus ticket visibility. | Body: comment text, attachmentDocumentIds if allowed. | 201. |
| `GET` | `/api/v1/tickets/{ticketId}/activity` | List activity history. | Ticket visibility required. | Pagination. | 200 paginated. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Department/category/assignee/attachments must belong to the same tenant and be authorized. Status must be one of `OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED` and transitions follow the documented state machine. Ticket number is server-generated and tenant-unique.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Every meaningful status, assignment, priority, or routing change creates activity history. Attachments reuse secure Document Management rather than a parallel insecure file store. Closed ticket mutation is restricted by explicit reopen/policy rules.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Status, priority, department, assignee (authorized), own tickets, category, safe search.

## Sorting
Updated date, created date, priority, ticket number using stable allow-listed sorts.

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
{"subject":"Laptop access issue","description":"VPN cannot connect.","categoryId":"it-access","departmentId":"it-dept","priority":"MEDIUM","attachmentDocumentIds":[]}
```

## Example Response
```json
{"data":{"id":"ticket-id","ticketNumber":"TKT-000123","status":"OPEN","priority":"MEDIUM"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
