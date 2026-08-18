# API v1 — Announcements and Notices

## Purpose
Define tenant notices, audience targeting, scheduling/expiry, priority, and read/unread tracking contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Announcements are tenant-owned. Read endpoints return only messages whose target rules match the current user. Management is restricted to tenant administrators/authorized roles.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/announcements` | List eligible announcements. | `announcement.view`. | Query: unreadOnly, priority, activeAt, page/pageSize. | 200 paginated. |
| `POST` | `/api/v1/announcements` | Create announcement. | `announcement.manage`. | Body: title, content, publishAt, expiresAt, priority, targets (tenant/department/region/role/employeeGroup). | 201. |
| `GET` | `/api/v1/announcements/{announcementId}` | Read eligible announcement. | `announcement.view` plus target eligibility; management can read drafts. | Path ID. | 200. |
| `PATCH` | `/api/v1/announcements/{announcementId}` | Update announcement. | `announcement.manage`. | Body: mutable content/schedule/target fields subject to publication rules. | 200. |
| `DELETE` | `/api/v1/announcements/{announcementId}` | Archive/cancel. | `announcement.manage`. | Path ID. | 204/200. |
| `POST` | `/api/v1/announcements/{announcementId}/read` | Mark current user as read. | `announcement.view` plus eligibility. | No body or read timestamp derived server-side. | 200/204. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Publish/expiry timestamps must be ordered. Targets must be valid same-tenant entities and at least one target rule must resolve to an intended audience. Priority uses the canonical enum. Users cannot mark inaccessible announcements as read.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Public notice means all eligible users in the tenant, not internet-public. Target rules are evaluated server-side. Read tracking is per user/announcement and cannot be used to infer other audience members unless management reporting explicitly allows it.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Employee view: unread, priority, active window. Admin view may additionally filter status/audience.

## Sorting
Priority then publish date by default; alternative allow-listed sort.

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
{"title":"Office Closure","content":"Office will be closed.","publishAt":"2026-08-20T03:30:00Z","expiresAt":"2026-08-22T03:30:00Z","priority":"HIGH","targets":{"tenantWide":true}}
```

## Example Response
```json
{"data":{"id":"announcement-id","status":"SCHEDULED","priority":"HIGH"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
