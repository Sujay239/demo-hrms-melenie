# Region Management Module

## Purpose
Represent tenant geographic/locale/time context for holidays, leave, attendance, future localization/payroll, and EU readiness.

## Requirement Traceability
Primary SRS requirements: `FR-REG-001` through `FR-REG-002`; `NFR-PRV-004`

## Actors
- Tenant Admin
- Read-only consumers across tenant modules

## Phase 1 Scope
- Region name
- Country
- IANA time zone
- Locale
- Status
- Region-specific configuration envelope

## Domain Data
Regions are tenant-owned and referenced by employees, holiday lists, leave policies, attendance interpretation, and future modules.

## Core Workflows
Admin creates active region → modules target/reference region → deactivation validates dependencies.

## Business Rules and Invariants
- Valid country/locale/time-zone identifiers.
- Local business-day calculations use region time zone; persisted instants remain UTC.
- Region is architecture readiness and does not imply GDPR/data-residency compliance.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/regions.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Prevent tenant-crossing references. Treat future privacy/data residency settings as explicit fields/modules when implemented rather than inferred from country.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Invalid IANA time zone
- Same name/constraint behavior
- Region dependency on employee/holiday/policy
- Cross-tenant region reference

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
