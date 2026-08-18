# API v1 — Knowledge Base

## Purpose
Define global-within-tenant and department-targeted KB categories, articles, versions, tags, publishing, FAQs, and search contracts.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
KB content is tenant-owned. Employee reads are filtered by publication state and audience/department visibility; managers/admins require management permission for drafts and edits.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/knowledge-base/articles` | Search/list readable articles. | `kb.view`. | Query: page/pageSize, search, categoryId, tag, departmentId where eligible, type, sort/order. | 200 paginated. |
| `POST` | `/api/v1/knowledge-base/articles` | Create article. | `kb.manage`. | Body: title, article type/FAQ fields, categoryId, department visibility, tags, draft content/version. | 201. |
| `GET` | `/api/v1/knowledge-base/articles/{articleId}` | Read article. | `kb.view` if published/audience eligible; `kb.manage` for drafts. | Path ID. | 200. |
| `PATCH` | `/api/v1/knowledge-base/articles/{articleId}` | Update article metadata/create revision as designed. | `kb.manage`. | Body: mutable metadata and content change input. | 200. |
| `POST` | `/api/v1/knowledge-base/articles/{articleId}/publish` | Publish selected current version. | `kb.manage`. | Body: optional publish date if scheduled publication is supported. | 200. |
| `POST` | `/api/v1/knowledge-base/articles/{articleId}/unpublish` | Return to draft/unpublished state. | `kb.manage`. | Path ID. | 200. |
| `GET` | `/api/v1/knowledge-base/categories` | List readable/manageable categories. | `kb.view`. | Query: department visibility/type. | 200. |
| `POST` | `/api/v1/knowledge-base/categories` | Create category. | `kb.manage`. | Body: name, description, department visibility. | 201. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Titles/content follow length/content validation. Department IDs/tags/categories must belong to the tenant. Published article version is immutable historically; edits create or preserve version history. Employee search excludes drafts and inaccessible departments.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Global KB means tenant-wide content, not cross-tenant platform content. Department visibility can narrow content. Search results must not leak draft titles/snippets or unauthorized department content.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Search, category, tag, department/audience, article type, publication status only where authorized.

## Sorting
Published date, updated date, title, or relevance for search, using allow-listed modes.

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
{"title":"Expense Policy","categoryId":"policy-cat","departmentIds":[],"tags":["expenses"],"status":"DRAFT","content":"Policy content"}
```

## Example Response
```json
{"data":{"id":"article-id","title":"Expense Policy","status":"DRAFT","version":1},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
