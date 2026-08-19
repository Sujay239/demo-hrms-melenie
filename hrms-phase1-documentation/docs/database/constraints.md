# Database Constraints

## Purpose

Define invariants that cannot rely on frontend behavior, spanning all 5 databases.

## Universal Invariants

- PK non-null/unique (UUID, generated server-side).
- Required `tenant_id` non-null on every tenant-owned table.
- `created_at` and `updated_at` non-null with server defaults.
- Status columns use CHECK constraints with explicitly enumerated values.

## DB-CORE Constraints

- `users.email` UNIQUE, lowercase-normalized.
- `tenants.slug` UNIQUE, alphanumeric + hyphens.
- `tenants.domain` UNIQUE (where not null).
- `tenant_settings.tenant_id` UNIQUE — exactly one settings row per tenant.
- `tenant_user_memberships` UNIQUE `(tenant_id, user_id)` — one membership per user per tenant.
- `role_permissions` UNIQUE `(role_id, permission_id)`.
- `user_role_assignments` UNIQUE `(user_id, role_id, tenant_id)` — no duplicate role assignments.
- `consultants.user_id` UNIQUE — one consultant profile per user.
- `consultant_tenant_assignments` UNIQUE `(consultant_id, tenant_id)` — one assignment per pair.
- `auth_sessions.token_hash` UNIQUE, `auth_refresh_tokens.token_hash` UNIQUE.
- `password_reset_tokens.token_hash` UNIQUE, `account_activations.token_hash` UNIQUE.
- `tenant_subscription_plans.name` UNIQUE, `tenant_subscription_plans.code` UNIQUE.

## DB-HR Constraints

- `employees` UNIQUE `(tenant_id, employee_code)` — employee code unique within tenant.
- `employees` CHECK `manager_employee_id != id` — no self-manager.
- `departments` UNIQUE `(tenant_id, name)`.
- `designations` UNIQUE `(tenant_id, name)`.
- `regions` UNIQUE `(tenant_id, name)`.
- `employee_groups` UNIQUE `(tenant_id, name)`.
- `employee_group_memberships` UNIQUE `(employee_group_id, employee_id)`.
- `tenant_custom_fields` UNIQUE `(tenant_id, field_key)`.
- `employee_custom_field_values` UNIQUE `(employee_id, custom_field_id)` — one value per field per employee.
- `onboarding_cases.new_hire_id` UNIQUE — one case per new hire.
- `employee_work_history` CHECK `end_date IS NULL OR end_date >= start_date`.
- `employee_education` CHECK `end_year IS NULL OR end_year >= start_year`.
- Same-tenant invariant: `department_id`, `designation_id`, `region_id`, `manager_employee_id` on `employees` must all reference records with the same `tenant_id`. Composite unique constraints or service-layer validation.
- Hierarchy cycle prevention: Manager hierarchy and department parent hierarchy validated by service-layer graph traversal. Recursive DB checks may reinforce.

## DB-DOCS Constraints

- `file_storage_references` UNIQUE `(provider, bucket, object_key)` — no duplicate storage paths.
- `file_storage_references.file_size_bytes` CHECK `> 0`.
- `document_versions` UNIQUE `(document_id, version_number)`.
- `document_associations` UNIQUE `(document_id, entity_type, entity_id, association_type)`.
- `document_access_tokens.token_hash` UNIQUE.
- `document_access_tokens.max_access_count` CHECK `> 0` (when not null).
- `document_access_tokens.current_access_count` CHECK `>= 0`.
- `document_access_tokens.expires_at` must be in the future at creation time — enforced by service layer.
- `document_access_log` — NO UPDATE/DELETE constraints. Immutable append-only. Application users cannot modify or remove access log entries.

## DB-OPS Constraints

- `leave_types` UNIQUE `(tenant_id, code)`.
- `leave_policy_targets` UNIQUE `(leave_policy_id, target_type, target_id)`.
- `leave_balances` UNIQUE `(tenant_id, employee_id, leave_type_id, year)`.
- `leave_requests` CHECK `end_date >= start_date`.
- `leave_requests.days_count` CHECK `> 0`.
- `holidays` UNIQUE `(tenant_id, region_id, date, name)`.
- `flexible_holiday_selections` UNIQUE `(tenant_id, employee_id, holiday_id)`.
- `attendance_records` UNIQUE `(tenant_id, employee_id, work_date)`.
- `overtime_requests.hours` CHECK `> 0`.
- `kb_categories` UNIQUE `(tenant_id, slug)`.
- `kb_articles` UNIQUE `(tenant_id, slug)`.
- `kb_article_versions` UNIQUE `(article_id, version_number)`.
- `kb_tags` UNIQUE `(tenant_id, name)`.
- `kb_article_tags` PK `(article_id, tag_id)`.
- `kb_department_visibility` PK `(article_id, department_id)`.
- `announcement_reads` UNIQUE `(tenant_id, announcement_id, user_id)`.
- Announcements CHECK `expires_at IS NULL OR publish_at IS NULL OR expires_at > publish_at`.
- `ticket_categories` UNIQUE `(tenant_id, name)`.
- `tickets` UNIQUE `(tenant_id, ticket_number)`.
- `notification_templates` UNIQUE `(tenant_id, event_type, channel)`.
- `room_facilities` UNIQUE `(meeting_room_id, facility_name)`.
- `floors` UNIQUE `(building_id, floor_number)`.
- `buildings` UNIQUE `(tenant_id, name)`.
- Room reservations CHECK `end_at > start_at`.
- Meeting rooms CHECK `capacity > 0`.

## DB-AUDIT Constraints

- `platform_tickets.ticket_number` UNIQUE (platform-wide).
- `audit_logs` — NO UPDATE/DELETE. Immutable append-only.
- `platform_ticket_activities` — NO UPDATE/DELETE. Immutable append-only.

## Room Overlap Prevention

A UI availability check is insufficient. Use a database exclusion/range constraint where supported (PostgreSQL `EXCLUDE USING gist`) or transactional lock/serialization:
```sql
SELECT id FROM room_reservations
WHERE meeting_room_id = ? AND status = 'CONFIRMED'
  AND start_at < ?new_end AND end_at > ?new_start
FOR UPDATE;
```

## Hierarchy Cycles

Service performs graph/cycle validation for:
- Manager reporting hierarchy (`employees.manager_employee_id`)
- Department parent hierarchy (`departments.parent_department_id`)
- KB category hierarchy (`kb_categories.parent_category_id`)

Recursive DB checks (WITH RECURSIVE CTE) may reinforce but service validation is primary.

## Cross-Database Referential Integrity

Since FK constraints cannot span databases, the following rules are enforced by the service layer:
1. Before writing a record with a cross-DB reference, the service calls the owning service to verify the entity exists and belongs to the correct tenant.
2. Deleting a cross-DB referenced entity requires the owning service to notify dependent services for cascade/cleanup.
3. Orphaned references are detected by periodic consistency checks (background job).

## Soft Deletion

Unique business identifiers must behave intentionally with soft-deleted rows:
- Use partial/filtered indexes: `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL`.
- Example: `UNIQUE(tenant_id, employee_code) WHERE deleted_at IS NULL` — allows reuse of employee codes after soft deletion.
- Tables with soft-delete: `employees`, `documents`, `file_storage_references`, `tenants`.
