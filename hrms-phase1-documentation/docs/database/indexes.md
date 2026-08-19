# Database Index Strategy

## Purpose

Define index patterns per database, to be validated with real query plans. All indexes follow the naming convention `idx_{table}_{columns}`.

## General Principle

Tenant-scoped high-volume queries normally start composite indexes with `tenant_id`. This applies across all databases.

## DB-CORE Indexes

- `users`: `UNIQUE(email)`, `(status, last_login_at)`.
- `tenants`: `UNIQUE(slug)`, `UNIQUE(domain) WHERE domain IS NOT NULL`, `(status)`.
- `tenant_settings`: `UNIQUE(tenant_id)`.
- `tenant_user_memberships`: `UNIQUE(tenant_id, user_id)`, `(user_id, status)`.
- `user_role_assignments`: `UNIQUE(user_id, role_id, tenant_id)`, `(tenant_id, role_id)`.
- `consultants`: `UNIQUE(user_id)`, `(status)`.
- `consultant_tenant_assignments`: `UNIQUE(consultant_id, tenant_id)`, `(tenant_id, status)`.
- `auth_sessions`: `UNIQUE(token_hash)`, `(user_id, expires_at)`, `(expires_at)` for cleanup.
- `auth_refresh_tokens`: `UNIQUE(token_hash)`, `(user_id, expires_at)`.
- `password_reset_tokens`: `UNIQUE(token_hash)`, `(user_id, expires_at)`.
- `account_activations`: `UNIQUE(token_hash)`, `(user_id)`.

## DB-HR Indexes

- `employees`: `UNIQUE(tenant_id, employee_code) WHERE deleted_at IS NULL`, `(tenant_id, status, last_name, first_name)`, `(tenant_id, department_id, status)`, `(tenant_id, designation_id)`, `(tenant_id, region_id)`, `(tenant_id, manager_employee_id)`, `(user_id)`.
- `employee_bank_details`: `(tenant_id, employee_id)`, `(employee_id, is_primary)`.
- `employee_emergency_contacts`: `(tenant_id, employee_id)`, `(employee_id, is_primary)`.
- `employee_work_history`: `(tenant_id, employee_id)`.
- `employee_education`: `(tenant_id, employee_id)`.
- `employee_skills`: `(tenant_id, employee_id)`, `(employee_id, is_certification)`.
- `tenant_custom_fields`: `UNIQUE(tenant_id, field_key)`, `(tenant_id, status)`.
- `employee_custom_field_values`: `UNIQUE(employee_id, custom_field_id)`, `(tenant_id, custom_field_id)`.
- `employee_groups`: `UNIQUE(tenant_id, name)`.
- `employee_group_memberships`: `UNIQUE(employee_group_id, employee_id)`.
- `departments`: `UNIQUE(tenant_id, name)`, `(tenant_id, status)`, `(tenant_id, parent_department_id)`.
- `designations`: `UNIQUE(tenant_id, name)`, `(tenant_id, department_id)`.
- `regions`: `UNIQUE(tenant_id, name)`, `(tenant_id, country_code)`.
- `new_hires`: `(tenant_id, status)`, `(user_id)`.
- `onboarding_cases`: `UNIQUE(new_hire_id)`, `(tenant_id, status)`.
- `onboarding_tasks`: `(onboarding_case_id, sort_order)`, `(tenant_id, status)`.
- `offer_letters`: `(tenant_id, new_hire_id)`, `(tenant_id, status)`.
- `acknowledgements`: `(tenant_id, new_hire_id)`.

## DB-DOCS Indexes

- `file_storage_references`: `UNIQUE(provider, bucket, object_key)`, `(tenant_id, module, created_at)`, `(tenant_id, upload_status)`, `(deleted_at)` for cleanup.
- `documents`: `(tenant_id, status, category, updated_at)`, `(tenant_id, owner_type, owner_id)`, `(tenant_id, sensitivity)`.
- `document_versions`: `UNIQUE(document_id, version_number)`, `(document_id, created_at DESC)`.
- `document_associations`: `UNIQUE(document_id, entity_type, entity_id, association_type)`, `(tenant_id, entity_type, entity_id)`.
- `document_access_tokens`: `UNIQUE(token_hash)`, `(tenant_id, document_id, expires_at)`, `(expires_at)` for cleanup.
- `document_access_log`: `(tenant_id, document_id, accessed_at)`, `(actor_user_id, accessed_at)`, `(tenant_id, action, outcome, accessed_at)`.

## DB-OPS Indexes

### Leave
- `leave_types`: `UNIQUE(tenant_id, code)`, `(tenant_id, status)`.
- `leave_policies`: `(tenant_id, leave_type_id, status)`, `(tenant_id, effective_from, effective_to)`.
- `leave_policy_targets`: `UNIQUE(leave_policy_id, target_type, target_id)`.
- `leave_balances`: `UNIQUE(tenant_id, employee_id, leave_type_id, year)`.
- `leave_ledger_entries`: `(tenant_id, employee_id, leave_type_id, effective_date)`, `(leave_request_id)`.
- `leave_requests`: `(tenant_id, employee_id, status, start_date)`, `(tenant_id, status, created_at)`, `(tenant_id, approver_employee_id, status)`.
- `leave_request_actions`: `(leave_request_id, created_at)`.

### Holidays
- `holidays`: `UNIQUE(tenant_id, region_id, date, name)`, `(tenant_id, year, holiday_type)`.
- `flexible_holiday_selections`: `UNIQUE(tenant_id, employee_id, holiday_id)`, `(tenant_id, year)`.

### Attendance
- `attendance_records`: `UNIQUE(tenant_id, employee_id, work_date)`, `(tenant_id, work_date, status)`.
- `attendance_events`: `(attendance_record_id, event_time)`.
- `attendance_corrections`: `(tenant_id, employee_id, status)`, `(attendance_record_id)`.
- `overtime_requests`: `(tenant_id, employee_id, status)`, `(tenant_id, date)`.

### Knowledge Base
- `kb_categories`: `UNIQUE(tenant_id, slug)`, `(tenant_id, status)`.
- `kb_articles`: `UNIQUE(tenant_id, slug)`, `(tenant_id, status, category_id)`, `(tenant_id, is_faq, status)`.
- `kb_article_versions`: `UNIQUE(article_id, version_number)`.
- `kb_tags`: `UNIQUE(tenant_id, name)`.
- `kb_article_tags`: PK `(article_id, tag_id)`.
- `kb_department_visibility`: PK `(article_id, department_id)`.

### Announcements
- `announcements`: `(tenant_id, status, publish_at, expires_at)`, `(tenant_id, priority, status)`.
- `announcement_targets`: `(announcement_id, target_type)`.
- `announcement_reads`: `UNIQUE(tenant_id, announcement_id, user_id)`.

### Tickets
- `ticket_categories`: `UNIQUE(tenant_id, name)`.
- `tickets`: `UNIQUE(tenant_id, ticket_number)`, `(tenant_id, department_id, status, updated_at)`, `(tenant_id, requester_employee_id, status)`, `(tenant_id, assignee_employee_id, status)`.
- `ticket_comments`: `(ticket_id, created_at)`.
- `ticket_activities`: `(ticket_id, created_at)`.

### Facilities
- `buildings`: `UNIQUE(tenant_id, name)`.
- `floors`: `UNIQUE(building_id, floor_number)`.
- `meeting_rooms`: `(tenant_id, status)`, `(floor_id, status)`.
- `room_facilities`: `UNIQUE(meeting_room_id, facility_name)`.
- `room_reservations`: `(tenant_id, meeting_room_id, start_at, end_at, status)`, `(tenant_id, booked_by_employee_id, status)`. Plus DB-specific overlap enforcement support (GiST exclusion constraint on PostgreSQL).

### Notifications
- `notification_templates`: `UNIQUE(tenant_id, event_type, channel)`.
- `notification_queue`: `(status, scheduled_at)` for worker processing, `(tenant_id, recipient_user_id, created_at)`, `(status, attempts)` for retry logic.

## DB-AUDIT Indexes

- `audit_logs`: `(tenant_id, occurred_at)`, `(resource_type, resource_id, occurred_at)`, `(actor_user_id, occurred_at)`, `(action, occurred_at)`.
- `platform_tickets`: `UNIQUE(ticket_number)`, `(tenant_id, status)`, `(assigned_admin_id, status)`, `(status, priority, updated_at)`.
- `platform_ticket_comments`: `(platform_ticket_id, created_at)`.
- `platform_ticket_activities`: `(platform_ticket_id, created_at)`.

## Index Maintenance Notes

- Partial indexes (`WHERE deleted_at IS NULL`, `WHERE status = 'ACTIVE'`) reduce index size and improve query performance on active records.
- Composite indexes should be ordered by selectivity: `tenant_id` (low selectivity) first for routing, then high-selectivity columns.
- Monitor and prune unused indexes. Use `pg_stat_user_indexes` (PostgreSQL) or equivalent.
- Large append-only tables (`audit_logs`, `document_access_log`) benefit from BRIN indexes on `occurred_at`/`accessed_at` for time-range queries.
