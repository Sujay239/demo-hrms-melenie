# Company / Tenant Portal Design

## Purpose
Specify the common tenant shell and role-based experiences.

## Tenant Admin Navigation
Dashboard, Employees, Organization, Onboarding, Documents, Leave, Holidays, Attendance, Knowledge Base, Announcements, Tickets, Buildings & Meeting Rooms, Users & Access, Audit (if permitted), Settings.

## Employee Navigation
Dashboard, My Profile/Directory, Attendance, Leave, Holidays, Documents, Knowledge Base, Announcements, Tickets, Meeting Rooms.

## Consultant Experience
A consultant first enters an assigned tenant context, then receives only the modules and data permitted for that assignment/role. No unassigned tenant search is shown.

## Shared Patterns
- Tenant logo on white.
- Stable sidebar/header.
- Server-paginated lists.
- Consistent status badges.
- Permission-aware actions.
- Accessible forms.
- Safe file upload pattern.
- Page-level request/error state.
- No data from another tenant in suggestions, reference selectors, counts, or caches.

## Dashboard
Predefined by role; see `designs.md` and `../modules/dashboard.md`.

## Organization Configuration
Departments, designations, and regions use aligned list/create/edit/detail patterns so Tenant Admin does not relearn CRUD interactions.

## Security UX
Access denied pages never reveal hidden resource metadata. Sensitive documents can use a higher-friction confirmation/download action if security review deems appropriate.
