# Definition of Done

## Purpose
Define minimum completion standards.

A task is Done only when applicable items are satisfied:

## Requirements
- Requirement/story IDs identified.
- Scope matches Phase 1 documentation.
- No unapproved Future feature.

## Architecture/data
- Route → Controller → Service → Repository → Database.
- Tenant-scoped persistence.
- Transactions protect invariants.
- Migration for schema changes.
- API contract remains `/api/v1/`.

## Security
- Server-side auth/authorization.
- IDOR/cross-tenant negative tests.
- Input validation and safe output.
- File/sensitive-data controls where applicable.
- Secrets are not logged.

## Quality
- Unit tests for business logic.
- Integration tests for API + DB.
- E2E for critical journey.
- Failure/permission/empty cases covered.
- Concurrency tested where relevant.

## UX
- Loading/empty/error/validation states.
- Responsive/keyboard/focus behavior.
- Status not color-only.

## Operations/docs
- Request-ID logging.
- Monitoring/config impact documented.
- Relevant Markdown synchronized.
