# Security Testing

## Purpose
Define security verification required before release.

## Automated/targeted scenarios
- invalid/nonexistent login and deactivated accounts;
- reset expiry/reuse;
- RBAC matrix;
- cross-tenant IDOR for every tenant domain;
- consultant assigned/unassigned/inactive;
- New Hire calling Employee APIs;
- cross-tenant foreign IDs;
- sensitive document allow/deny + audit;
- spoofed file type/oversize/malicious payload handling;
- XSS payloads in rich text;
- injection/meta-character filters;
- duplicate leave approval;
- concurrent room booking;
- CSRF if relevant to credential transport;
- rate limits.

## Pipeline
Dependency, secret, static security and container/image scanning where applicable.

## Release
Critical/high tenant-isolation, auth or protected-document vulnerabilities block release unless formally accepted by authorized security/business leadership.
