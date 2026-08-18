# Security Specification

## Purpose
Define mandatory Phase 1 security controls. This is not a legal compliance certification.

## Objectives
Prevent cross-tenant leakage, privilege escalation/IDOR, credential theft, malicious file exposure, workflow tampering and loss of auditability.

## Authentication
- Modern adaptive password hash.
- Enumeration-resistant login/reset behavior.
- High-entropy short-lived single-use reset/activation secrets.
- Explicit session/token lifetime, renewal and revocation.
- Deactivated accounts cannot authenticate.

## Authorization/RBAC
- Server-side deny by default.
- Role + permission + tenant + resource rule.
- Platform permissions cannot be delegated by Tenant Admin.
- Consultant needs assignment before domain permissions.
- New Hire is onboarding-only.

## Tenant isolation/IDOR
- Never trust client tenant ID.
- Resolve tenant-owned records by trusted tenant + ID.
- Validate nested foreign IDs.
- Avoid cross-tenant existence leakage.
- Negative tests with valid IDs from another tenant.

## Input/injection
Schema validation; allowlisted filters/sorts; parameterized ORM/query use; no raw concatenated SQL from user input.

## XSS
Framework escaping plus allowlist sanitization for any supported rich text (KB, announcements, ticket comments). Never render filenames/metadata as trusted HTML.

## CSRF
If browser automatically sends auth cookies, use appropriate SameSite/origin/anti-CSRF controls. If header tokens are used, assess the selected design and document it in auth ADR.

## CORS
Production trusted-origin allowlist. No wildcard credentialed CORS.

## Rate limiting
Risk-based limits for login/reset/invite, uploads, heavy search and other abuse-prone endpoints.

## Secure headers
CSP, HSTS after HTTPS verification, nosniff, frame-ancestors/clickjacking controls, referrer policy and suitable permissions policy.

## File security
Private storage; server key; size/type/content validation; malware-scanning/quarantine integration; safe serving; checksums where useful; no permanent public protected URLs.

## Sensitive/medical documents
Stricter permissions, reduced metadata exposure, private delivery, access audit, restricted logging. No HIPAA compliance claim.

## Encryption/secrets
TLS in transit; platform/database/object-storage encryption at rest; secret manager/environment; never secrets in source/client/logs.

## Logging/audit
Operational logs ≠ audit. Log request ID and safe actor/tenant context. Do not log passwords, tokens, raw files or unnecessary sensitive content.

## Dependencies
Lock dependencies, vulnerability/secret scanning, remove unused packages and patch critical issues.

## Incident readiness
Correlation by request ID/actor/tenant/resource; ability to revoke credentials, rotate secrets and preserve evidence. Legal notification workflow is organizational Future/compliance work.
