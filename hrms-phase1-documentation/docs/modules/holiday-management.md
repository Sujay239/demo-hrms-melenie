# Holiday Management Module

## Purpose
Maintain region-specific common and flexible holiday calendars separately from leave.

## Requirement Traceability
Primary SRS requirements: `FR-HOL-001` through `FR-HOL-005`

## Actors
- Tenant Admin
- Employee

## Phase 1 Scope
- Common holidays
- Flexible holidays
- Region-specific lists
- Employee flexible-holiday selection
- Status/lifecycle
- Calendar labels as configuration where needed

## Domain Data
Holidays reference tenant and region. Flexible-holiday selections reference employee and eligible holiday.

## Core Workflows
Admin publishes region holiday list → employee sees applicable common/flexible holidays → employee selects eligible flexible holiday within configured constraints.

## Business Rules and Invariants
- Holiday and leave are separate domains.
- Employee eligibility derives from authoritative region/group context.
- Duplicate flexible selection is prohibited.
- Selection limits/windows are configurable if adopted by tenant policy.
- Sick Leave/PTO/Wellness are normally leave types, not automatically holiday records.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/holidays.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Employees cannot select holidays belonging to another tenant/region. Changes to already-selected holidays require explicit history-safe rules.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- India/Germany/UK style region separation
- Common versus flexible
- Duplicate/ineligible selection
- Wrong-region access
- Deactivated holiday handling

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
