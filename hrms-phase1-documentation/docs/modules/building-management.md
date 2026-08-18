# Building and Meeting Room Management Module

## Purpose
Manage buildings, floors, meeting rooms, facilities, availability, and overlap-safe reservations.

## Requirement Traceability
Primary SRS requirements: `FR-ROOM-001` through `FR-ROOM-004`

## Actors
- Tenant Admin/facility manager
- Employee

## Phase 1 Scope
- Building/floor/room configuration
- Capacity
- Facilities
- Availability
- Active/inactive
- Search rooms
- Reserve
- Cancel
- Upcoming reservations

## Domain Data
Buildings, floors, meeting rooms, facilities/relationships, and reservations with tenant ownership and timestamps.

## Core Workflows
Admin configures room → employee searches availability → submits reservation → backend transaction checks conflict → creates confirmed reservation → employee sees upcoming booking → cancels if eligible.

## Business Rules and Invariants
- Availability read is advisory; reservation create is authoritative.
- No overlapping active reservations for the same room/time.
- Overlap prevention must be safe under concurrent requests.
- Room/building/floor references share tenant.
- Inactive room cannot accept new bookings.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/meeting-rooms.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Reservation titles/purposes may be sensitive; visibility should be minimal. Conflict checks must be database-backed/transaction-safe rather than UI-only.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Boundary overlaps
- Same-time concurrent requests
- Cancel/rebook
- Inactive room
- Wrong tenant/building/floor
- Capacity/facility filters

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
