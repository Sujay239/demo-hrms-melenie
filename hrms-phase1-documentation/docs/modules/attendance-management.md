# Attendance and Overtime Management Module

## Purpose
Track employee clock events/records, working hours, corrections, approvals, and overtime requests.

## Requirement Traceability
Primary SRS requirements: `FR-ATT-001` through `FR-ATT-007`

## Actors
- Employee
- Manager/authorized approver
- Tenant Admin

## Phase 1 Scope
- Clock in/out
- Working-hour calculation
- Attendance history
- Manager approval where configured
- Correction requests
- Overtime request
- Overtime approval/rejection

## Domain Data
Attendance records/events, correction requests, approval state/history, overtime requests and decisions; employees/regions provide identity and local-day context.

## Core Workflows
Employee clocks in → active attendance state → clocks out → working duration computed → correction/approval if needed.

Employee requests overtime → manager validates scope → approve/reject → activity/audit retained.

## Business Rules and Invariants
- Server clock timestamp is authoritative for direct clock actions.
- One incompatible active clock session per employee according to policy.
- Corrections preserve original values.
- Working-day interpretation respects employee/region IANA time zone.
- Overtime approval is separate from attendance clocking.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/attendance.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Never let client employee ID impersonate another worker for clock actions. If location/device collection is later introduced, privacy and consent requirements must be separately specified.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Double clock-in
- Clock-out without open record
- Cross-midnight/time zone
- Correction approval/rejection
- Manager scope
- Overtime duplicate/invalid duration
- Audit history

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
