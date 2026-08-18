# Dashboard Module

## Purpose
Provide responsive predefined dashboards tailored to Super Admin and tenant roles while keeping future extensibility possible.

## Requirement Traceability
Primary SRS requirements: `FR-UI-001` through `FR-UI-005`; `NFR-PERF-005`

## Actors
- Super Admin
- Consultant
- Tenant Admin
- Employee
- New Hire

## Phase 1 Scope
- Super Admin dashboard with platform-level information
- Tenant dashboard with role-appropriate summaries
- New Hire onboarding dashboard
- Fixed Phase 1 cards/sections
- Tenant logo on white branding surface
- Responsive states
- Independent aggregate error isolation

## Domain Data
No dashboard layout persistence entity exists in Phase 1. Dashboard data is composed from authoritative module repositories/services.

## Core Workflows
Authenticated user → role/tenant context → dashboard service determines allowed predefined sections → independent metrics execute concurrently where appropriate → response returns sections with data or safe partial-failure status.

## Business Rules and Invariants
- No Phase 1 configurable/drag-and-drop dashboard widgets.
- No layout CRUD API or widget-position database table.
- All section data obeys underlying permissions and tenant scope.
- `Promise.allSettled()` is appropriate only for independent optional metrics.
- Auth/tenant failure fails the entire request.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/dashboard.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
A dashboard is not a security bypass. Aggregates must not expose counts/data from resources the user cannot access. Cache keys must include verified tenant/authorization dimensions.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Role-specific section visibility
- Tenant isolation of counts
- Partial metric failure
- Dashboard loading/empty/error state
- Responsive behavior
- Verify absence of layout persistence

## Future Extensibility
Future Phase: Configurable / drag-and-drop dashboard widgets. Advanced tenant themes may also be added later.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
