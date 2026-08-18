# Database Index Strategy

## Purpose
Define index patterns to be validated with real query plans.

## General
Tenant-scoped high-volume queries normally start composite indexes with `tenant_id`.

## Candidate patterns
- employees: `(tenant_id, status, name/search_key)`, `(tenant_id, department_id, status)`, `(tenant_id, manager_employee_id)`.
- unique employee code within tenant.
- consultant assignment: `(consultant_id, tenant_id, status)` with unique relation semantics.
- documents: `(tenant_id, status, category, updated_at)`.
- document versions: unique `(document_id, version_number)`.
- leave requests: `(tenant_id, employee_id, status, start_date)`.
- ledger: `(tenant_id, employee_id, leave_type_id, effective_date)`.
- holidays: `(tenant_id, region_id, date)`.
- attendance: `(tenant_id, employee_id, work_date)`.
- announcements: `(tenant_id, status, publish_at, expires_at)`.
- reads: unique `(tenant_id, announcement_id, user_id)`.
- tickets: `(tenant_id, department_id, status, updated_at)` and tenant ticket number unique.
- room reservations: `(tenant_id, room_id, start_at, end_at, status)` plus DB-specific overlap enforcement support.
- audit: `(tenant_id, occurred_at)` and `(resource_type, resource_id, occurred_at)`.
