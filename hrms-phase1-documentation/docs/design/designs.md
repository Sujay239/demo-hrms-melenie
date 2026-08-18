# Complete UI/UX Design Specification

## Purpose
Define the Phase 1 visual, interaction, information-architecture, state, responsive, and accessibility requirements for the Super Admin, tenant, and onboarding experiences. This is a behavioral design specification, not production UI code.

## Overall Visual Direction
The HRMS should feel professional, calm, data-dense without being cramped, and suitable for daily enterprise use. Favor clarity over decoration. Important actions must remain visually discoverable without relying on color alone.

Phase 1 tenant branding is deliberately restrained:
- tenant logo;
- logo displayed on a white branding surface;
- no tenant custom colors;
- no custom fonts;
- no custom CSS;
- no theme builder.

## Application Shell
### Desktop
- Persistent left sidebar for primary navigation.
- Header/top bar for page context, tenant context where relevant, account/profile menu, and compact global actions.
- Main content area uses a predictable max-width/fluid grid appropriate to tables and forms.
- Page title, optional breadcrumb/context, primary action, filters, and content appear in a consistent hierarchy.

### Mobile/Tablet
- Sidebar becomes an accessible drawer or compact navigation pattern.
- Header retains page title/context and account access.
- Tables adapt via horizontal containment or purpose-designed responsive rows/cards; critical fields remain visible.
- Primary actions remain reachable without covering content.
- Modal-heavy flows may become full-height sheets/pages when space is constrained.

## Navigation by Role
### Super Admin
Primary groups:
- Dashboard
- Tenants
- Consultants
- Platform configuration
- Platform audit/information where permitted

### Consultant
- Assigned tenants
- Allowed tenant information/module entry points
No global tenant directory.

### Tenant Admin
- Dashboard
- Employees
- Organization: Departments, Designations, Regions
- Onboarding
- Documents
- Leave
- Holidays
- Attendance
- Knowledge Base
- Announcements
- Tickets
- Buildings & Meeting Rooms
- Users & Access where permitted
- Audit Logs where permitted
- Tenant settings/logo

### Employee
- Dashboard
- My Profile / Directory
- Attendance
- Leave
- Holidays
- Documents
- Knowledge Base
- Announcements
- Tickets
- Meeting Rooms

### New Hire
A restricted onboarding shell:
- Onboarding Dashboard
- My Details
- Offer Letter
- Documents
- Acknowledgement
No Employee or Tenant Admin navigation before conversion.

## Sidebar
- Group related modules, not every action.
- Active item has text/icon/state distinction.
- Collapsed behavior, if implemented, must preserve accessible names/tooltips.
- Hidden items are based on server-resolved permissions/role context, but UI hiding is not authorization.
- Tenant logo sits in a dedicated white branding area and must preserve aspect ratio; never distort it.

## Header
Include only useful persistent context:
- current page;
- verified tenant identity when user can operate across assigned/multiple tenants;
- user/profile menu;
- optional notification/announcement affordance if Phase 1 product flow requires it.
Do not expose a client-editable tenant ID control as a security mechanism.

## Dashboard UX
Dashboards use predefined Phase 1 sections/cards. Examples:
- Super Admin: tenant counts/status, consultant assignments, platform operational summaries.
- Tenant Admin: employee/onboarding/leave/attendance/ticket/room operational summaries.
- Employee: current attendance, leave balances/requests, announcements, tickets, upcoming reservations.
- New Hire: onboarding completion/tasks, offer letter, required documents, acknowledgement state.

Independent sections may render independently. If one optional metric fails, show an inline section error/retry state instead of blanking the entire page where server semantics permit partial results.

**There is no configurable or drag-and-drop widget UX in Phase 1.**

## Employee Screens
### Directory
- Search.
- Allow-listed filters: department, designation, region, employment status where user is permitted.
- Paginated result table/list.
- Name/profile image, employee ID, department, designation, region, manager or other permitted directory fields.
- Empty state distinguishes “no employees” from “no filter matches.”

### Employee Profile
Organize into clear sections:
- identity/contact;
- employment;
- organization/reporting;
- permitted documents;
- related attendance/leave links when authorized.
Sensitive fields are shown only by field-level policy.

### Edit/Create
- Structured form with section headings.
- Async reference selectors for larger tenant datasets.
- Manager selector must not permit self/cycle after server validation.
- Server validation errors map to fields; conflict errors appear at form level.

## Onboarding Screens
### Dashboard
Show completion progress by required tasks, not gamified drag/drop widgets.
Cards/sections:
- personal details;
- fun fact;
- offer letter;
- documents;
- acknowledgement;
- signed-copy status;
- verification state.

### Offer Letter
- Secure document preview metadata where possible.
- Explicit Review and Download actions.
- Instruction: download and sign using an external/third-party application.
- Upload Signed Copy action.
- Never imply the platform digitally signs the document in Phase 1.

### Acknowledgement
Capture:
- Name
- Place
- Date
- explicit acknowledgement confirmation
Provide generated/downloadable acknowledgement artifact when business template supports it, then external signing and signed-file upload as required.

### Upload UX
Show:
- allowed types;
- file-size guidance;
- upload progress;
- validation/scan/pending state;
- replace/new-version behavior if allowed;
- failure and retry;
- uploaded file metadata;
- remove action only when policy allows.

## Document Screens
### Document Library
- Permission-filtered metadata list.
- Category, owner/association, status, version, expiry, updated date.
- Filters for safe metadata.
- Sensitive classification not overexposed.

### Document Detail
- Metadata and associations.
- Version history.
- Access history only for authorized roles.
- Secure Download.
- New Version action where allowed.
- Expiry/status management for document managers.
Never display object-storage keys or permanent public URLs.

## Leave Screens
### Employee
- Leave balances by configurable type.
- Apply action.
- Request history/status.
- Policy summary relevant to the user.
- Date selection and computed requested-day preview are advisory until server validation.

### Approver/Admin
- Request queue with employee, dates, type, status.
- Detail view includes policy-relevant facts needed for decision.
- Approve/Reject with clear confirmation.
- Policy configuration screens expose configurable numeric/rule fields; example values must not be embedded defaults unless tenant configuration establishes them.

## Holiday Screens
Calendar/list by employee region. Distinguish:
- Common holiday
- Flexible holiday
- Selected flexible holiday
Selection eligibility/limits show clearly and rely on server validation.

## Attendance Screens
Employee:
- prominent Clock In or Clock Out based on authoritative current state;
- today's timeline/record;
- working duration;
- recent records;
- correction request;
- overtime request/history.

Manager:
- pending approvals/corrections/overtime.
Prevent double-click duplicate actions with UI disabling, while server state remains authoritative.

## Knowledge Base
- Search prominent.
- Category/tag filters.
- Article list/cards appropriate to content density.
- Article page includes title, publication metadata, breadcrumbs/category, accessible content.
- Draft badge and authoring actions only for managers.
- Department-only articles never appear to ineligible users.

## Announcements
- Active feed with priority and publish date.
- Read/unread state.
- Expired announcements removed from normal feed.
- Targeting editor for authorized publisher uses explicit audience chips/groups and a review summary before publish.

## Tickets
### Employee
- Create Ticket
- My/visible tickets table
- Ticket detail with status, department, priority, comments, attachments, activity visible by policy.

### Agent/Admin
- Queue filters: department, status, priority, assignee.
- Clear status action following canonical states:
  `OPEN`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED`.
- Assignment and comment actions preserve activity history.

## Buildings and Meeting Rooms
- Room list/filter by building/floor/capacity/facility.
- Availability view for a bounded date/time interval.
- Reservation form with room/start/end/title.
- Conflict error explains that the slot is no longer available and prompts a fresh availability check.
- Upcoming reservations with Cancel when eligible.

## Super Admin Screens
### Dashboard
Platform operational summary, not tenant-sensitive detail by default.
### Tenants
Search/filter, lifecycle status, create/edit, activate/deactivate.
### Tenant Detail
Identity/configuration, branding/logo, consultant assignments, permitted platform-level summaries.
### Consultants
Consultant records/assignments; assignment screen clearly shows assigned tenant list.
Cross-tenant operations use explicit context and audit.

## Tenant Admin Screens
Prioritize operational HR tasks, maintain consistent CRUD patterns, and show tenant logo on white surface. Administrative reference data (regions/departments/designations) should use concise list/detail/form patterns.

## Employee Screens
Self-service emphasis: today's state, common actions, personal status/history. Do not show administrative navigation merely because an API exists.

## New Hire Screens
Use a simplified onboarding-only experience with progress and required next actions. No normal company directory/HR admin navigation.

## Form Architecture
- Visible label for every input.
- Required indicator + explanatory text when needed.
- Client validation for usability; server validation is authoritative.
- Preserve user input after recoverable server error.
- Destructive/status-changing actions require confirmation proportional to impact.
- Date/time input displays the relevant local time zone when ambiguity matters.

## Table Architecture
- Server pagination for growing data.
- Sort only supported columns.
- Filters reflect URL/query state where beneficial for navigation.
- Row actions are permission-aware.
- Bulk operations are out unless explicitly specified by module.
- On mobile, preserve action accessibility and critical data.

## Cards
Use for summaries and discrete self-service information. Cards are not movable/configurable Phase 1 dashboard widgets.

## Modals and Drawers
Use modal for focused confirmation/small form; drawer for contextual detail where preserving list context is valuable. Complex workflows should be full pages. Focus is trapped/restored correctly.

## Toasts and Alerts
- Toast: transient success/non-critical feedback.
- Inline alert: errors/warnings requiring user attention.
- Do not rely only on toast for form validation.
- Error messages should include safe recovery action and request ID when support value justifies it.

## Loading States
- Initial page skeleton for expected layout.
- Button-level pending state on submissions.
- Avoid repeated global spinners.
- Prevent duplicate submissions.
- For independent dashboard sections, section-level loading/error is allowed.

## Empty States
Differentiate:
- no data exists yet;
- no search/filter match;
- user lacks optional data because workflow not started.
Offer a context-appropriate action only when authorized.

## Error States
- 401: transition to authentication recovery according to auth strategy.
- 403: permission-aware access denied; do not encourage bypass.
- 404: resource unavailable.
- 409: explain state changed/conflict and refresh.
- 422: field/business validation.
- 500/503: safe retry/support messaging with request ID.

## Accessibility
Target WCAG 2.1 AA-level design practices:
- semantic headings/landmarks;
- keyboard operability;
- visible focus;
- accessible names for icon controls;
- sufficient contrast;
- error association with fields;
- status announcements for async operations;
- modals with focus management;
- tables with headers;
- no color-only meaning;
- adequate pointer targets.
Formal certification is not claimed by documentation alone.

## Responsive Breakpoint Philosophy
Use content-driven breakpoints from the selected frontend system rather than device names as business logic. Test narrow mobile, large mobile, tablet, standard desktop, and wide desktop.

## Future Phase
- Future only: Configurable / drag-and-drop dashboard widgets
- Custom tenant colors
- Custom tenant fonts
- Custom CSS
- Theme builder

These are not designed as Phase 1 controls, APIs, or persistence models.

## Related Documents
- `design-system.md`
- `application-layout.md`
- `super-admin-portal.md`
- `company-portal.md`
- `onboarding-portal.md`
- `responsive-design.md`
- `../architecture/frontend-architecture.md`
