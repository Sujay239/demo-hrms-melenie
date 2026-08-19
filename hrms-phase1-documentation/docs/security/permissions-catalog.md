# Permission Catalog

## Purpose

Provide a consistent Phase 1 namespace for all permissions, including new document access, platform ticket, tenant settings, and file storage permissions.

## Platform

`tenant.view`, `tenant.create`, `tenant.update`, `tenant.manage_status`, `consultant.view`, `consultant.manage`, `consultant.assign`, `platform_config.manage`, `platform_audit.view`.

## Platform Tickets

`platform_ticket.create`, `platform_ticket.view`, `platform_ticket.view_own`, `platform_ticket.comment`, `platform_ticket.manage`, `platform_ticket.assign`.

## Tenant Administration

`user.view`, `user.manage_status`, `role.view`, `role.assign`, `permission.view`, `tenant_settings.view`, `tenant_settings.manage`.

## Organization

`employee.view`, `employee.view_self`, `employee.create`, `employee.update`, `employee.delete`, `employee.update_self`, `department.view`, `department.manage`, `designation.view`, `designation.manage`, `region.view`, `region.manage`, `employee_group.view`, `employee_group.manage`, `custom_field.view`, `custom_field.manage`.

## Onboarding/Documents

`onboarding.view`, `onboarding.manage`, `onboarding.verify`, `onboarding.convert`, `offer_letter.view`, `offer_letter.manage`, `document.view`, `document.upload`, `document.manage`, `document.delete`, `document.view_sensitive`, `document.share`, `document.revoke_access`.

## Leave/Holiday/Attendance

`leave.view_self`, `leave.view`, `leave.apply`, `leave.approve`, `leave.manage`, `holiday.view`, `holiday.view_self`, `holiday.select`, `holiday.manage`, `attendance.clock`, `attendance.view_self`, `attendance.view`, `attendance.correct_self`, `attendance.manage`, `attendance.approve`, `overtime.request`, `overtime.approve`, `overtime.manage`.

## Content/Service/Facilities

`kb.view`, `kb.manage`, `announcement.view`, `announcement.manage`, `ticket.create`, `ticket.view`, `ticket.comment`, `ticket.manage`, `room.view`, `room.reserve`, `room.view_reservations`, `room.manage`, `audit.view`.

## Notifications

`notification.view`, `notification.manage_templates`.

## Permission Details

### New Permissions (Phase 1 additions)

| Permission | Scope | Description |
|---|---|---|
| `document.share` | Tenant | Generate document access tokens for sharing within tenant |
| `document.revoke_access` | Tenant | Revoke active document access tokens |
| `platform_ticket.create` | Tenant | Tenant Admin raises ticket to Super Admin |
| `platform_ticket.view` | Platform | View platform tickets (Super Admin: all; Tenant Admin: own tenant) |
| `platform_ticket.view_own` | Tenant | View platform tickets raised by own tenant |
| `platform_ticket.comment` | Platform/Tenant | Comment on platform tickets |
| `platform_ticket.manage` | Platform | Super Admin manages/assigns/resolves platform tickets |
| `platform_ticket.assign` | Platform | Super Admin assigns platform tickets to other admins |
| `tenant_settings.view` | Tenant | View tenant configuration |
| `tenant_settings.manage` | Tenant | Modify tenant configuration (timezone, formats, file limits) |
| `employee_group.view` | Tenant | View employee groups |
| `employee_group.manage` | Tenant | Create/update/delete employee groups |
| `custom_field.view` | Tenant | View tenant custom field definitions |
| `custom_field.manage` | Tenant | Create/update/delete tenant custom fields |
| `notification.view` | Tenant | View notification queue/history |
| `notification.manage_templates` | Tenant | Create/update notification templates |

## Delegation

Tenant Admin can assign only permissions marked tenant-delegable (`is_tenant_delegable = true`). Platform permissions (`scope = 'PLATFORM'`) are never tenant-delegable. Platform ticket permissions with `PLATFORM` scope are assigned only by Super Admin.

## Role-Permission Mapping (Default Bundles)

| Role | Key Permissions |
|---|---|
| `SUPER_ADMIN` | All platform permissions + all tenant permissions (cross-tenant requires explicit context) |
| `CONSULTANT` | Subset of tenant read permissions per assignment (e.g., `employee.view`, `document.view`) |
| `TENANT_ADMIN` | All tenant-delegable permissions including `tenant_settings.manage`, `platform_ticket.create` |
| `EMPLOYEE` | Self-service: `employee.view_self`, `employee.update_self`, `leave.apply`, `attendance.clock`, `ticket.create`, `document.view`, `document.upload` |
| `NEW_HIRE` | Onboarding only: `onboarding.view` (own case), `document.upload` (onboarding docs), `document.view` (own offer/docs) |
