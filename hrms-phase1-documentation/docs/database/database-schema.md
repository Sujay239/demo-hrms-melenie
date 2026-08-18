# Database Schema Specification

## Purpose
Define the canonical logical Phase 1 entity set.

## Identity/platform
- `users`
- `tenants`
- `tenant_user_memberships`
- `roles`
- `permissions`
- `role_permissions`
- `user_role_assignments`
- `consultants`
- `consultant_tenant_assignments`
- auth session/refresh/reset/activation persistence as required by chosen auth strategy

## Organization
- `regions`
- `departments`
- `designations`
- `employees`
- `employee_groups`
- `employee_group_memberships`

## Onboarding
- `new_hires`
- `onboarding_cases`
- `onboarding_tasks`
- `offer_letters`
- `acknowledgements`

## Documents
- `documents`
- `document_versions`
- `document_associations`

## Leave/holidays
- `leave_types`
- `leave_policies`
- policy target/assignment relations where required
- `leave_balances`
- `leave_ledger_entries`
- `leave_requests`
- `leave_request_actions`
- `holidays`
- `flexible_holiday_selections`

## Attendance
- `attendance_records`
- append attendance events if selected
- `attendance_corrections`
- `overtime_requests`

## Knowledge/announcements
- `kb_categories`
- `kb_articles`
- `kb_article_versions`
- `kb_tags`
- article-tag and department-visibility relations
- `announcements`
- `announcement_targets`
- `announcement_reads`

## Tickets
- `ticket_categories`
- `tickets`
- `ticket_comments`
- `ticket_activities`
- attachments associate through Documents

## Facilities
- `buildings`
- `floors`
- `meeting_rooms`
- facility value/relation if needed
- `room_reservations`

## Audit
- `audit_logs`

## Explicit non-entity
No Phase 1 table exists for dashboard widget layout/placement/configuration. Configurable / drag-and-drop dashboard widgets are Future Phase.
