# Authentication Module

## Purpose
Provide secure identity entry, exit, activation, password recovery, current-user bootstrap, and account-state enforcement.

## Requirement Traceability
Primary SRS requirements: `FR-AUTH-001` through `FR-AUTH-006`; `NFR-SEC-001` through `NFR-SEC-004`

## Actors
- Super Admin
- Consultant
- Tenant Admin
- Employee
- New Hire

## Phase 1 Scope
- Login and logout
- Current-user bootstrap
- Activation/invitation completion
- Password reset
- Expiration/renewal behavior
- Deactivated-account denial

## Domain Data
Users/identity records plus whichever server-side session/refresh persistence is selected by ADR-007. Tenant memberships and role assignments remain authorization data rather than client claims.

## Core Workflows
1. User authenticates.
2. Middleware establishes trusted principal.
3. Active account state is checked.
4. UI receives only authorized bootstrap context.

Password reset: request → one-time capability → password validation → capability invalidation.

Activation: valid invitation → establish password/profile → activate allowed membership only.

## Business Rules and Invariants
- Password hashes are never reversible.
- Reset/activation capability is purpose-bound, expiring, and one-time.
- Deactivation takes effect on subsequent protected requests and should revoke long-lived capabilities as designed.
- Authentication cannot grant tenant access not already represented by server-side membership/assignment.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/auth.md`
- `../api/authentication-api.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Rate-limit sensitive endpoints; resist account enumeration; protect credentials in transit/storage; do not log passwords/tokens; apply CSRF protection if cookies carry ambient authority.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Valid/invalid login
- Deactivated user
- Expired/reused reset
- Expired/reused activation
- Logout/revocation
- `/me` never leaks unassigned tenants
- Authentication strategy security tests

## Future Extensibility
SSO/MFA/federation may be future additions. They must not change tenant authorization semantics.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
