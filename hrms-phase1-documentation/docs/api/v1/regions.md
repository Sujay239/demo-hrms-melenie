# API v1 — Regions

## Purpose
Define tenant region configuration used by employees, holidays, leave, attendance, localization, and future EU/payroll features.

## Authentication
All endpoints in this document require authentication unless an endpoint explicitly states otherwise. Authentication follows `../authentication-api.md`.

## Tenant Requirements
Regions are tenant-owned configuration. Tenant Admin manages only the current tenant; employees may receive read-only region references needed for their experience.

Client-provided tenant identifiers are never sufficient authorization. The service validates tenant access before repository operations.

## Authorization
Permissions shown below are canonical Phase 1 permissions from `../../security/permissions-catalog.md`. Resource policies (self, manager, assignment, sensitivity, audience) apply in addition to named permissions.

## Endpoint Contracts
| Method | Endpoint | Purpose | Authorization | Path / Query / Request Body | Success |
|---|---|---|---|---|---|
| `GET` | `/api/v1/regions` | List regions. | `region.view`. | Query: page/pageSize if unbounded, status, countryCode, search. | 200. |
| `POST` | `/api/v1/regions` | Create region. | `region.manage`. | Body: name, countryCode, IANA timeZone, locale, status, allowed configuration. | 201. |
| `GET` | `/api/v1/regions/{regionId}` | Read region. | `region.view`. | Path ID. | 200. |
| `PATCH` | `/api/v1/regions/{regionId}` | Update region. | `region.manage`. | Body: mutable fields. | 200. |
| `DELETE` | `/api/v1/regions/{regionId}` | Deactivate/archive region where safe. | `region.manage`. | Path ID. | 204/200. |

## Path Parameters
Opaque resource IDs are used where paths contain `{id}`-style values. IDs must be syntactically valid and the resource must be available inside the trusted access scope. An ID from another tenant must not bypass scope.

## Query Parameters
Collection endpoints use only documented, allow-listed query parameters. Growing collections support `page` and `pageSize` as defined in `../pagination-filtering.md`.

## Request Body
Mutation bodies are JSON unless the document endpoint defines a file-upload workflow. Fields not relevant to the operation must not be mass-assigned. Server-controlled fields such as tenant ownership, audit actor, and computed status are derived server-side.

## Validation
Country codes use a documented standard; time zones must be valid IANA identifiers; locale strings must be supported/valid. Deactivation cannot silently invalidate active employee/policy dependencies.

Validation failure uses the standard `400`/`422` error envelope. Business-state conflicts generally use `409`.

## Business Rules
Region-specific business dates use the region time zone. Region does not itself imply legal compliance or data residency.

## Pagination
All potentially growing list endpoints are paginated. Small controlled reference lists may return a bounded collection if the implementation documents and enforces a safe maximum.

## Filtering
Status, country code, and safe name search.

## Sorting
Name, country code, created date.

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
{"name":"India East","countryCode":"IN","timeZone":"Asia/Kolkata","locale":"en-IN","status":"ACTIVE"}
```

## Example Response
```json
{"data":{"id":"region-id","name":"India East","countryCode":"IN","timeZone":"Asia/Kolkata","status":"ACTIVE"},"meta":{"requestId":"request-id"}}
```

## Security and Audit
State-changing actions and sensitive reads follow `../../security/security.md`. Where the module is auditable, the actor, tenant, action, resource, resource ID, request ID, timestamp, and appropriate state change are recorded.



## Related Documents
- `../api-standards.md`
- `../error-handling.md`
- `../pagination-filtering.md`
- `../../architecture/multi-tenancy.md`
- `../../security/permissions-catalog.md`
