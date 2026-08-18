# API v1 — Leave Management

## Purpose
Define configurable leave types/policies, balances, applications, approval actions, and history contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Leave data is tenant-owned. Employee self-routes are constrained to the authenticated employee. Approvers must have permission plus valid managerial/approval scope.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/leave-types` | List active/configured leave types. | `leave.view` or self leave access. | Query: status, regionId. | 200. |
| `POST` | `/api/v1/leave-types` | Create leave type. | `leave.manage`. | Body: name, code, status, descriptive metadata. | 201. |
| `GET` | `/api/v1/leave-policies` | List policies. | `leave.manage` or permitted admin view. | Query: leaveTypeId, regionId, status, employeeGroupId. | 200 paginated. |
| `POST` | `/api/v1/leave-policies` | Create configurable policy. | `leave.manage`. | Body: leaveTypeId, credit/allocation rules, max consecutive days, carry-forward/lapse/max-pool, eligibility, notice, approval requirements, target region/group, effective dates. | 201. |
| `PATCH` | `/api/v1/leave-policies/{policyId}` | Update future/effective policy configuration. | `leave.manage`. | Body: mutable version/effective fields; history must remain explainable. | 200. |
| `GET` | `/api/v1/leave-balances/me` | Read own balances. | `leave.view_self`. | Optional as-of period/year. | 200. |
| `GET` | `/api/v1/leave-requests` | List authorized requests. | `leave.view` or own-scope `leave.view_self`. | Query: status, employeeId if authorized, leaveTypeId, date range, page/pageSize. | 200 paginated. |
| `POST` | `/api/v1/leave-requests` | Apply for leave. | `leave.apply`. | Body: leaveTypeId, startDate, endDate, partial-day data if supported, reason/notes, attachments where policy permits. | 201. |
| `GET` | `/api/v1/leave-requests/{requestId}` | Read request. | Own request or `leave.view` with scope. | Path ID. | 200. |
| `POST` | `/api/v1/leave-requests/{requestId}/approve` | Approve request. | `leave.approve` plus approver scope. | Body: optional decision note. | 200. |
| `POST` | `/api/v1/leave-requests/{requestId}/reject` | Reject request. | `leave.approve` plus approver scope. | Body: reason/note where required. | 200. |
| `POST` | `/api/v1/leave-requests/{requestId}/cancel` | Cancel eligible request. | Owner or `leave.manage`. | Body: optional reason. | 200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Dates must form a valid interval. The effective policy is selected from authoritative employee/region/group context. Validate eligibility, notice, balance, max consecutive days, overlapping requests, holiday/weekend rules where configured, and approval requirements. Configurable values such as 1.5 monthly credit or 18 annual days are examples, not hard-coded rules.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Balance changes use an auditable ledger and transactional updates. Approved requests cannot double-debit. Policy edits must not rewrite historical leave decisions. Manager approval requires valid reporting/approval scope, not role name alone.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Request lists: status, employee (only if authorized), leave type, region, and date range. Policy lists: type, region, group, status/effective date.

## Sorting
Requests: submitted date, start date, status. Policies: effective date/name where indexed.

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
{"leaveTypeId":"sick-id","startDate":"2026-09-10","endDate":"2026-09-11","reason":"Personal"}
```

## Example Response
```json
{"data":{"id":"leave-request-id","status":"PENDING","requestedDays":2},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
