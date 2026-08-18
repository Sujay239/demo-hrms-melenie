# Monitoring and Observability Specification

## Purpose
Define runtime visibility required to operate HRMS safely across tenants.

## Signals
### Logs
Structured application/security logs include:
- timestamp;
- severity;
- request ID;
- route/module;
- safe actor identifier when appropriate;
- verified tenant identifier when appropriate;
- outcome/error code;
- duration.
Never log passwords, tokens, reset secrets, document bytes, or unnecessary sensitive HR content.

### Metrics
Track at least:
- request rate/error rate/latency;
- database connection/query health;
- storage operation failures;
- authentication failures/rate limits in aggregate;
- background/async processing if introduced;
- dashboard section failures;
- file validation/scan failure counts;
- resource saturation relevant to deployment.

### Traces
Distributed tracing is optional for a modular-monolith Phase 1 but request correlation must exist. If tracing is used, redact sensitive attributes.

## Health Endpoints
- Liveness: process can serve.
- Readiness: required dependencies available enough to receive traffic.
Health responses reveal minimal internal detail publicly.

## Alerting
Create actionable alerts for sustained:
- elevated 5xx;
- database/storage unavailability;
- authentication anomaly/rate-limit surge;
- failed migrations/deploys;
- backup failures;
- critical dependency/storage capacity risks.

## Tenant Safety
Monitoring dashboards/log access are operator-restricted. Tenant identifiers help diagnose isolation without dumping record contents.

## Audit vs Application Logs
Audit logs are a business/security record and have stronger retention/access requirements than ordinary operational logs. Do not treat normal logs as a substitute for `audit_logs`.

## Related Documents
- `../architecture/audit-architecture.md`
- `../security/security.md`
