# Authentication API Architecture

## Purpose
Define cross-cutting authentication contract behavior used by `/api/v1/auth/*`.

## Phase 1 Capabilities
- Login
- Logout
- Resolve current user
- Account activation pathway
- Password reset request and completion
- Account deactivation enforcement
- Expiration and renewal/refresh behavior as selected by the authentication ADR

## Strategy Boundary
The documentation intentionally does not invent whether Phase 1 uses a server session cookie or a short-lived access token plus refresh mechanism. Before coding authentication, the implementation agent must resolve the open choice in `../decisions/adr-007-authentication.md` based on the chosen deployment/runtime constraints and update that ADR. Whichever strategy is selected must provide:
- revocation/deactivation behavior;
- expiration;
- secure transport;
- replay/CSRF controls appropriate to the credential transport;
- no tokens in application logs;
- server-side permission and tenant revalidation.

## Identity Result
The authentication middleware produces a trusted principal containing only server-resolved identity context, for example:
- user identity;
- platform role if applicable;
- active account state;
- tenant memberships;
- role assignments or resolvable authorization references;
- consultant identity/assignments where relevant.

Client claims never become trusted solely by being present in a request.

## Login
Login accepts the documented identifier/password fields, validates active status, applies throttling, and returns/sets the selected credential mechanism. Error messaging should resist user enumeration.

## Logout
Logout invalidates the relevant session/refresh capability when applicable and clears the client credential as appropriate.

## Current User
`GET /api/v1/auth/me` returns the minimum data needed to initialize the UI: identity, account state, authorized memberships/roles, and navigation-relevant context. It must not return permissions for inaccessible tenants.

## Password Reset
Use a one-time, short-lived reset capability. Store only a safe verifier form when feasible; invalidate on use and after relevant security events. Do not expose whether an arbitrary email exists.

## Account Activation
Invitations/activation links are single-use and expiring. Activation cannot grant tenant access beyond the server-created membership.

## Errors
Authentication errors follow `error-handling.md` and never reveal password hashes, tokens, reset secrets, or internal auth-provider details.

## Related Documents
- `v1/auth.md`
- `../security/authentication-security.md`
- `../decisions/adr-007-authentication.md`
