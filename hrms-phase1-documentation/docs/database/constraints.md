# Database Constraints

## Purpose
Define invariants that cannot rely on frontend behavior.

## Invariants
- PK non-null/unique.
- Required tenant ownership non-null.
- Employee code unique within tenant.
- `start_at < end_at` for reservation/time ranges.
- Document version number unique within logical document.
- Allowed statuses constrained where practical.
- Announcement expiry after publish when both are set.
- Leave end date not before start date.
- No self-manager.
- Cross-tenant references denied; composite constraints may reinforce where practical.

## Room overlap
A UI availability check is insufficient. Use a database exclusion/range constraint where supported or transactional lock/serialization around overlap detection and insert.

## Hierarchy cycles
Service performs graph/cycle validation; recursive DB checks may reinforce.

## Soft deletion
Unique business identifiers must behave intentionally with soft-deleted rows, using partial/filtered indexes or documented equivalent where supported.
