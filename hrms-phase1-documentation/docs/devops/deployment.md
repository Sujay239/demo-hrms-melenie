# Deployment Specification

## Purpose
Define production/staging deployment architecture expectations without selecting unapproved vendor-specific implementation.

## Deployable Components
- Frontend application
- Backend `/api/v1/` service
- Relational database
- Private object/document storage
- Monitoring/logging services
- Optional cache/queue only if later approved by ADR

## Deployment Principles
- Infrastructure/environment separation.
- TLS for all public traffic.
- Backend not directly exposing database/storage credentials to browser.
- Database and storage on private/least-privilege connectivity where platform supports it.
- Stateless API instances except for explicitly externalized session state.
- Authoritative documents in durable private object storage.
- Horizontal scaling must preserve session/auth and tenant behavior.

## Release Sequence
A safe release plan should:
1. Build immutable artifacts.
2. Run automated tests/security checks.
3. Back up/confirm recovery posture for high-risk DB migration.
4. Apply backward-compatible migrations where possible.
5. Deploy backend/frontend in compatibility-safe order.
6. Run health/readiness checks.
7. Execute smoke tests.
8. Monitor errors/latency.
9. Roll back application version when needed; schema rollback follows migration policy.

## Migration Compatibility
Prefer expand-and-contract for risky schema changes:
- add compatible schema;
- deploy code that supports transition;
- migrate/backfill safely;
- remove legacy schema only after no supported code depends on it.

## File Delivery
Browser downloads use authorization-mediated short-lived access or streaming, never permanent public objects.

## Availability
No numeric SLA is invented in Phase 1 documentation. Production targets must be agreed before launch and recorded in SRS/performance/monitoring docs.

## Related Documents
- `ci-cd.md`
- `monitoring.md`
- `backup-recovery.md`
- `../architecture/system-architecture.md`
