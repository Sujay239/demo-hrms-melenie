# Environment and Secrets Specification

## Purpose
Define configuration categories and secret-handling expectations.

## Environments
At minimum distinguish:
- local development;
- automated test/CI;
- staging/pre-production;
- production.

Each environment uses separate databases, storage namespaces/buckets, credentials, and signing/session secrets.

## Configuration Categories
Exact variable names are chosen during implementation and documented in `.env.example`, but configuration must cover as applicable:
- application environment;
- frontend public API base URL;
- backend listen/runtime settings;
- database connection;
- authentication/session/token secrets and lifetimes;
- allowed frontend origins;
- storage endpoint/bucket/region/credentials;
- file size/type limits;
- malware scanning integration if selected;
- log level;
- monitoring/telemetry destination;
- email delivery/reset/activation origin;
- rate-limit settings;
- trusted proxy configuration;
- feature flags only where approved.

## Secret Rules
- Never commit secrets.
- Production secrets come from the deployment platform/secret manager.
- Rotate credentials through documented procedure.
- Use least-privilege DB/storage credentials.
- Do not expose backend secrets through frontend build-time variables.
- Logs and error telemetry redact secrets/tokens/passwords.
- Separate signing/encryption secrets by purpose where applicable.

## Validation
The application fails fast on missing/invalid required production configuration with safe diagnostics. It must not silently fall back to insecure defaults.

## Data Residency
Phase 1 does not claim residency controls. Region/country architecture can support future environment/storage placement policy.

## Related Documents
- `../security/security.md`
- `deployment.md`
