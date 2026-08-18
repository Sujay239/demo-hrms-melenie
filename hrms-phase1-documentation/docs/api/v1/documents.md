# API v1 — Documents

## Purpose
Define the cross-platform secure document metadata, upload, version, association, expiry, access, download, and deletion contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Every tenant-owned document has verified tenant ownership. Access also depends on association, category/classification, ownership, role permission, and sensitive-data policy. Platform-level documents, if later introduced, must be explicitly modeled rather than using a fake tenant.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/documents` | List authorized document metadata. | `document.view`. | Query: page, pageSize, category, status, ownerType/ownerId where allowed, expiresBefore, search. | 200 paginated. |
| `POST` | `/api/v1/documents/uploads` | Initialize/accept secure upload metadata. | `document.upload` or onboarding owner policy. | Body/multipart: file metadata, category, intended association; actual transport follows storage architecture. | 201 with upload/document reference. |
| `POST` | `/api/v1/documents/{documentId}/versions` | Add a new immutable version. | `document.manage` or permitted owner workflow. | Body/upload reference plus version metadata. | 201. |
| `GET` | `/api/v1/documents/{documentId}` | Read metadata and authorized associations. | `document.view`; `document.view_sensitive` additionally when classification requires it. | Path ID. | 200. |
| `GET` | `/api/v1/documents/{documentId}/download` | Authorize file delivery. | `document.view`; additional sensitivity/ownership rules. | Path ID; optional versionId. | 200/302 per approved short-lived delivery design. |
| `POST` | `/api/v1/documents/{documentId}/associations` | Associate to allowed tenant resource. | `document.manage` or module-specific workflow authority. | Body: resourceType, resourceId, relationship type. | 201. |
| `PATCH` | `/api/v1/documents/{documentId}` | Update mutable metadata/status/expiry. | `document.manage`. | Body: category/status/expiry/metadata fields that do not mutate immutable versions. | 200. |
| `DELETE` | `/api/v1/documents/{documentId}` | Soft-delete/revoke document metadata. | `document.delete`. | Path ID; reason may be required for sensitive records. | 204. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Validate allowed file size, extension, MIME type, signature/magic bytes where feasible, upload completeness, malware-scan state when configured, category, expiry, and same-tenant associations. Never trust original filename as a storage key or execute uploaded content.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Storage is private by default. Every download is authorized at request time and sensitive access is audited. Versions are immutable; metadata changes do not overwrite historical bytes. A document can support multiple authorized associations without weakening access control. Medical/PHI-related records require tighter access and audit, but Phase 1 documentation does not claim HIPAA compliance.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Allow-list category, status, expiry range, explicitly supported association dimensions, and metadata search that excludes sensitive content.

## Sorting
Allow-list created date, updated date, expiry, and safe display name.

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
{"category":"EMPLOYMENT","intendedAssociation":{"resourceType":"EMPLOYEE","resourceId":"employee-id"},"originalFileName":"contract.pdf","declaredMimeType":"application/pdf"}
```

## Example Response
```json
{"data":{"id":"document-id","status":"PENDING_SCAN","category":"EMPLOYMENT","latestVersion":1},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
