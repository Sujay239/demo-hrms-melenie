# ADR-007 — Authentication Credential Strategy

## Purpose
Record and govern the architectural decision represented by ADR-007, including its rationale, consequences, and future change boundary.


## Status
Proposed — must be resolved before authentication implementation

## Context
Requirements mandate login/logout/current-user, expiration, reset, activation, deactivation and secure session/token management, but the product prompt intentionally does not prescribe whether the browser uses server sessions or short-lived access tokens plus refresh credentials. Deployment topology and client plans must drive this choice.

## Decision
Do not invent the credential transport during documentation generation. Before coding authentication, the implementation architect/agent must choose and record one Phase 1 strategy here. The selected design must support secure HTTPS transport, expiration, logout/revocation behavior, account deactivation, protected renewal, CSRF controls appropriate to cookies, XSS/token-theft minimization, rotation where applicable, and server-side authorization revalidation.

## Alternatives Considered
- Server-side session with Secure/HttpOnly/SameSite cookie: strong browser ergonomics and revocation; requires shared session persistence or compatible deployment strategy at scale.
- Short-lived access token plus protected rotating refresh mechanism: supports stateless access validation but adds refresh rotation/revocation complexity and must avoid unsafe browser storage.
- Long-lived bearer JWT in localStorage: rejected due theft/revocation risk for sensitive HRMS.

## Reasoning
A deliberate unresolved ADR is safer than fabricating a token scheme before deployment/client constraints are known, and it satisfies the requirement that assumptions be documented.

## Consequences
- Authentication implementation is blocked until this ADR changes to Accepted with concrete lifecycle/cookie/header/storage settings.
- API contracts remain stable because they describe behavior rather than a premature transport.
- Security tests must be updated to the selected strategy.

## Future Implications
Future mobile apps, SSO, MFA, or identity providers may require separate authentication adapters while preserving the same principal/authorization model.
