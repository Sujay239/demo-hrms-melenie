# Authentication Security

## Purpose
Specify secure auth lifecycle without inventing JWT-versus-session details.

## Passwords
Adaptive hash, salted, never reversible/logged.

## Strategy selection
Implementation must document whether it uses server sessions, opaque tokens, or access/refresh tokens and define:
- browser transport;
- `HttpOnly`/`Secure`/`SameSite` if cookies;
- access/session lifetime;
- refresh/renewal lifetime;
- rotation/reuse handling if applicable;
- logout/revocation;
- deactivation revocation;
- CSRF controls consistent with transport.

## Reset/activation
Generic request response; short-lived single-use secret; safe persistent representation; successful reset invalidates token and handles prior sessions according to policy.
