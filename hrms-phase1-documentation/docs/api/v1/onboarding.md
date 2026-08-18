# API v1 — Onboarding

## Purpose
Define New Hire onboarding dashboard, details, document checklist, acknowledgement, verification, and conversion contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
A New Hire belongs to exactly one tenant and receives only onboarding-scoped access. Tenant Admin/authorized HR users operate only within the verified tenant. Consultant access requires assignment and explicit onboarding permission if granted.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/onboarding/me` | Return New Hire onboarding dashboard. | Authenticated New Hire with active onboarding case. | No tenant/body input; tenant/case resolved from principal. | 200. |
| `PATCH` | `/api/v1/onboarding/me/details` | Submit/update allowed personal onboarding details. | Authenticated New Hire. | Body: permitted personal/contact fields and `funFactAboutYou`. | 200. |
| `GET` | `/api/v1/onboarding/me/tasks` | List onboarding checklist/tasks. | Authenticated New Hire. | Optional status filter. | 200. |
| `POST` | `/api/v1/onboarding/me/documents` | Associate an uploaded onboarding document. | Authenticated New Hire; upload permission implicit to active onboarding case. | Body: document/version reference, requested category/task reference. | 201. |
| `POST` | `/api/v1/onboarding/me/acknowledgements` | Submit acknowledgement metadata. | Authenticated New Hire. | Body: acknowledgementTemplate/version reference, name, place, date, acknowledgement confirmation. | 201. |
| `GET` | `/api/v1/onboarding/cases` | List onboarding cases. | `onboarding.view`. | Query: page, pageSize, status, search, regionId. | 200 paginated. |
| `GET` | `/api/v1/onboarding/cases/{caseId}` | Read case. | `onboarding.view` or owner-safe New Hire route. | Path: caseId. | 200. |
| `PATCH` | `/api/v1/onboarding/cases/{caseId}` | Manage case/task state. | `onboarding.manage`. | Body: allow-listed case/task fields. | 200. |
| `POST` | `/api/v1/onboarding/cases/{caseId}/verify` | Verify completion/materials. | `onboarding.verify`. | Body: verification outcome, notes where needed. | 200. |
| `POST` | `/api/v1/onboarding/cases/{caseId}/convert-to-employee` | Convert verified New Hire into Employee. | `onboarding.convert`. | Body: final employment fields not already authoritative, including employee identifier and org placement. | 201 with employee reference. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
New Hire owner routes resolve case from the authenticated principal, not from a client tenant ID. Name/place/date acknowledgement fields are required when applicable. Documents must satisfy document security and required categories. Conversion requires a verified/eligible onboarding state and same-tenant organization references.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
No native digital signature exists in Phase 1. The acknowledgement/offer workflow is review → download → sign in a third-party application → upload signed document → HR verification/completion. Conversion creates a distinct Employee lifecycle record and must be transactionally protected against duplicate conversion.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Admin case lists may filter by status, region, and safe New Hire search.

## Sorting
Allow-list created date, expected joining date where modeled, and status.

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
{"name":"Sam Lee","place":"Kolkata","date":"2026-08-18","acknowledged":true}
```

## Example Response
```json
{"data":{"acknowledgementId":"ack-id","status":"SUBMITTED","signingMode":"EXTERNAL_UPLOAD"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
