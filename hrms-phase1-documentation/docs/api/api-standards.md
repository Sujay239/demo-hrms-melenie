# API Standards

## Purpose
Define the mandatory HTTP contract conventions for the HRMS Phase 1 API. All module API documents under `docs/api/v1/` inherit these rules unless they explicitly tighten them.

## Base Path and Version
All Phase 1 application APIs use:

`/api/v1/`

The version is part of the URL. See `../architecture/api-versioning.md`.

## Resource Naming
- Use plural, lower-case, kebab-case resource nouns.
- Prefer nested routes only when the child has no useful independent identity.
- Do not encode actions into resource names when normal HTTP semantics are sufficient.
- Workflow actions that are not CRUD may use explicit action suffixes such as `/approve`, `/reject`, `/clock-in`, or `/convert-to-employee`.
- Never expose a raw storage-provider URL as the permanent document access contract.

## HTTP Methods
| Method | Use |
|---|---|
| GET | Read resources; no state change |
| POST | Create resources or execute explicit workflow actions |
| PATCH | Partial update |
| PUT | Full replacement only where a module explicitly supports it |
| DELETE | Logical deletion/deactivation where the business domain permits it |

## Authentication
Protected endpoints require an authenticated principal resolved by the authentication middleware. Public unauthenticated endpoints must be explicitly documented. Authentication failure returns `401`.

## Trusted Tenant Context
Tenant-scoped endpoints never trust a tenant identifier merely because the client supplied it. The backend derives or validates the effective tenant through authenticated membership, consultant assignment, or explicit Super Admin authority.

For tenant-portal routes, a tenant context may be selected by a server-verifiable route/header/session mechanism, but authorization must prove access before any repository query is executed. The eventual transport choice must follow the authentication ADR and must not weaken this invariant.

## Authorization
The service enforces permissions from `../security/permissions-catalog.md` plus resource ownership, target audience, managerial scope, sensitivity, and tenant constraints. Failure returns `403`; implementations should avoid resource-existence leakage where appropriate.

## Request Correlation
Every request should have a request/correlation ID. The response exposes the ID in an agreed header and error envelope; audit and application logs use the same identifier.

## Request Body
- JSON APIs use `application/json`.
- File uploads use the documented multipart/direct-upload workflow.
- Unknown fields should be rejected or safely ignored according to a project-wide validation policy; the choice must be consistent.
- Validation happens before business logic.

## Success Envelope
Single resource example:

```json
{
  "data": {
    "id": "opaque-id",
    "name": "Example"
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

Collection example:

```json
{
  "data": [],
  "meta": {
    "requestId": "request-id",
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

The exact serializer must remain consistent across modules.

## Error Envelope
See `error-handling.md`. Canonical shape:

```json
{
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "The requested employee could not be found.",
    "details": [],
    "requestId": "request-id"
  }
}
```

Do not expose stack traces, SQL, storage keys, secrets, or internal exception messages.

## Status Code Guidance
- `200` successful read/update/action with response body
- `201` created
- `204` successful operation with no body
- `400` malformed request
- `401` unauthenticated
- `403` unauthorized
- `404` resource unavailable/not found within effective access scope
- `409` state or uniqueness conflict
- `413` file/payload too large
- `415` unsupported media type
- `422` semantically invalid request
- `429` rate limited
- `500` unexpected server failure
- `503` required dependency unavailable

## Pagination, Filtering and Sorting
See `pagination-filtering.md`. Collection endpoints that can grow must paginate. Filtering/sorting must be allow-listed, tenant-safe, and index-aware.

## Idempotency and Concurrency
- Reads are naturally idempotent.
- Workflow actions vulnerable to duplicate submission should define idempotency or state guards.
- Updates of contested records should use optimistic concurrency/version checks where data loss is plausible.
- Room booking, leave ledger changes, and other invariant-sensitive operations require transactional concurrency control.

## Dates and Times
- Store instants in UTC.
- Emit ISO 8601 timestamps.
- Interpret business-day/date-only rules in the relevant IANA time zone.
- Date-only fields such as joining date remain date values rather than artificial UTC instants.
- Region records carry locale/time-zone context.

## Sensitive Data
Responses must follow data-minimization and field-level authorization rules. Sensitive document metadata must not disclose storage internals or protected classification to unauthorized users.

## Caching
Authenticated tenant-specific responses are private by default. Never let caches mix tenant responses. Any cache key for tenant data must include verified tenant and authorization-relevant dimensions.

## Deprecation
Breaking contract changes require a new major API path (`/api/v2/`). See the API versioning architecture.

## Related Documents
- `../architecture/api-versioning.md`
- `../architecture/multi-tenancy.md`
- `../security/security.md`
- `../security/permissions-catalog.md`
- `error-handling.md`
- `pagination-filtering.md`
