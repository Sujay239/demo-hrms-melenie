# Frontend Architecture

## Purpose
Define shells, routing, state and component responsibilities without implementation code.

## Shells
- Platform shell: `SUPER_ADMIN`.
- Tenant shell: `TENANT_ADMIN`, `EMPLOYEE`, assigned `CONSULTANT`.
- Onboarding shell: `NEW_HIRE`.

## Routing
Frontend route guards improve UX but do not enforce security. Every protected action is authorized server-side.

Logical route groups may be `/platform`, `/app`, `/onboarding`; exact client routing can follow existing project conventions. Backend remains `/api/v1/`.

## State
- Server state: query/cache layer with refetch/cancellation/error handling.
- Auth/current user/current tenant: central context.
- Forms: local validated state with server final authority.
- UI state: local to page/component unless cross-route persistence is actually required.

## Component layers
Design primitives → shared application components → domain components → route/page composition.

## Role navigation
Build navigation from current permitted capabilities. Hidden items are not security controls.

## Dashboard
Phase 1 dashboard sections are predefined by role/product design. Partial independent metric errors can render per-section. No Phase 1 configurable / drag-and-drop widget functionality.
