# Canonical Status Values

## Purpose
Prevent inconsistent terminology.

## Binding Phase 1 ticket statuses
`OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED`.

## Naming guidance
Use uppercase snake-case domain/API values. Candidate lifecycle sets may include:
- account: `PENDING_ACTIVATION`, `ACTIVE`, `DEACTIVATED`;
- tenant: `ACTIVE`, `INACTIVE`;
- New Hire: `INVITED`, `IN_PROGRESS`, `COMPLETED`, `CONVERTED`, `CANCELLED`;
- approvals: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`;
- KB: `DRAFT`, `PUBLISHED`, `ARCHIVED`;
- holiday type: `COMMON`, `FLEXIBLE`.

Candidate values become binding only when the module/API contract adopts them.
