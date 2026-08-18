# API Error Handling

## Purpose
Provide a stable, safe error model for all `/api/v1/` endpoints.

## Error Envelope
```json
{
  "error": {
    "code": "LEAVE_POLICY_VIOLATION",
    "message": "The leave request does not satisfy the applicable policy.",
    "details": [
      {
        "field": "endDate",
        "reason": "MAX_CONSECUTIVE_DAYS_EXCEEDED"
      }
    ],
    "requestId": "request-id"
  }
}
```

## Error Classes
| Class | Typical HTTP status | Examples |
|---|---:|---|
| Authentication | 401 | Invalid/expired credential |
| Authorization | 403/404 | Permission, scope, tenant denial |
| Validation | 400/422 | Invalid email, date, enum, file metadata |
| Not found | 404 | Resource unavailable in effective scope |
| Conflict | 409 | Duplicate employee ID, room overlap, invalid state transition |
| Payload/media | 413/415 | Oversized or prohibited file type |
| Rate limit | 429 | Login/upload throttling |
| Dependency | 503 | Required storage/database dependency unavailable |
| Internal | 500 | Unhandled failure |

## Rules
- Machine codes are stable and documented where clients need branching.
- Human messages are safe to display but are not a localization contract unless explicitly designated.
- Validation details identify safe field-level errors.
- Never expose stack traces, SQL, database names, storage paths, internal hostnames, passwords, tokens, or secret values.
- Cross-tenant denials should avoid confirming resource existence.
- A request ID links user-visible errors to server logs.
- Expected business-rule failures are not logged as uncaught exceptions.

## Aggregated Endpoint Partial Failure
Dashboard or other independent aggregate sections may return `200` with per-section `status: "error"` when optional independent subsections fail and the endpoint can still provide useful data. A required authentication/authorization/tenant failure always fails the entire request. See `../performance/promise-all-settled.md`.

## Retry Guidance
Clients may retry idempotent transient failures with bounded backoff. Do not blindly retry non-idempotent state-changing calls.

## Related Documents
- `api-standards.md`
- `../security/security.md`
