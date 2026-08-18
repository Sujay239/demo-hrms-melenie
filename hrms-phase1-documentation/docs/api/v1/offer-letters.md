# API v1 — Offer Letters

## Purpose
Define offer-letter creation/association, New Hire viewing/downloading, signed-copy upload association, and verification contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Offer letters are tenant-owned documents associated with a New Hire/onboarding case. New Hires can access only their own authorized offer letter. HR users require tenant permission.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `POST` | `/api/v1/offer-letters` | Create offer-letter record from secured document version. | `offer_letter.manage`. | Body: newHireId/caseId, documentVersionId, issueDate, status, optional expiry. | 201. |
| `GET` | `/api/v1/offer-letters/{offerLetterId}` | Read offer metadata. | `offer_letter.view` or owner New Hire policy. | Path ID. | 200. |
| `GET` | `/api/v1/offer-letters/{offerLetterId}/download` | Obtain authorized short-lived download. | `offer_letter.view` or owner New Hire policy. | Path ID; response may be redirect/token descriptor per storage architecture. | 200/302 per documented delivery choice. |
| `POST` | `/api/v1/offer-letters/{offerLetterId}/signed-copy` | Associate externally signed uploaded document. | Owner New Hire or `offer_letter.manage`. | Body: signedDocumentVersionId. | 201. |
| `POST` | `/api/v1/offer-letters/{offerLetterId}/verify-signed-copy` | Verify signed copy. | `offer_letter.manage`. | Body: outcome and optional notes. | 200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Offer/copy document versions must belong to the same tenant and permitted onboarding case. File category/status must be compatible. Download authorization is rechecked at request time.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Phase 1 does not perform or validate a cryptographic/native digital signature. It records the externally signed artifact and HR verification outcome. Original offer versions remain auditable and immutable.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
None beyond endpoint-specific identifiers.

## Sorting
Not applicable unless stated in the endpoint table.

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
{"signedDocumentVersionId":"document-version-id"}
```

## Example Response
```json
{"data":{"offerLetterId":"offer-id","signedCopyStatus":"SUBMITTED"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
