# Permission Catalog

## Purpose
Provide a consistent Phase 1 namespace.

## Platform
`tenant.view`, `tenant.create`, `tenant.update`, `tenant.manage_status`, `consultant.view`, `consultant.manage`, `consultant.assign`, `platform_config.manage`, `platform_audit.view`.

## Tenant administration
`user.view`, `user.manage_status`, `role.view`, `role.assign`, `permission.view`.

## Organization
`employee.view`, `employee.view_self`, `employee.create`, `employee.update`, `employee.delete`, `employee.update_self`, `department.view`, `department.manage`, `designation.view`, `designation.manage`, `region.view`, `region.manage`.

## Onboarding/documents
`onboarding.view`, `onboarding.manage`, `onboarding.verify`, `onboarding.convert`, `offer_letter.view`, `offer_letter.manage`, `document.view`, `document.upload`, `document.manage`, `document.delete`, `document.view_sensitive`.

## Leave/holiday/attendance
`leave.view_self`, `leave.view`, `leave.apply`, `leave.approve`, `leave.manage`, `holiday.view`, `holiday.view_self`, `holiday.select`, `holiday.manage`, `attendance.clock`, `attendance.view_self`, `attendance.view`, `attendance.correct_self`, `attendance.manage`, `attendance.approve`, `overtime.request`, `overtime.approve`, `overtime.manage`.

## Content/service/facilities
`kb.view`, `kb.manage`, `announcement.view`, `announcement.manage`, `ticket.create`, `ticket.view`, `ticket.comment`, `ticket.manage`, `room.view`, `room.reserve`, `room.view_reservations`, `room.manage`, `audit.view`.

## Delegation
Tenant Admin can assign only permissions marked tenant-delegable. Platform permissions are never tenant-delegable.
