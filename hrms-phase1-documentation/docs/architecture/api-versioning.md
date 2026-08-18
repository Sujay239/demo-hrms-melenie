# API Versioning

## Purpose
Define mandatory API versioning and compatibility.

## Strategy
All Phase 1 APIs use:
```text
/api/v1/
```

Examples:
`/api/v1/auth/login`
`/api/v1/employees`
`/api/v1/documents`
`/api/v1/leave-requests`

Future breaking API can use `/api/v2/`.

## Non-breaking v1 changes
- Add optional response field.
- Add optional request field with compatible behavior.
- Add endpoint.
- Add filter/sort option.

Enum additions require care if clients are not documented to tolerate unknown values.

## Breaking changes
- Remove/rename required field.
- Change type/meaning.
- Change path/method.
- Incompatible auth behavior.
- Incompatible required validation.
- Materially incompatible status/error semantics.

## Deprecation
Document replacement, announcement date, migration guidance and planned removal window/version. Maintain v1 until the approved deprecation period ends.
