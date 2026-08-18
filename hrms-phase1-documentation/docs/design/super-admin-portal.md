# Super Admin Portal Design

## Purpose
Specify the platform-level experience.

## Navigation
- Dashboard
- Tenants
- Consultants
- Platform Configuration
- Platform Audit/Information

## Dashboard
Predefined Phase 1 sections may show tenant lifecycle counts, consultant assignment summaries, and safe platform operational indicators. Do not create customizable widget placement.

## Tenants
List:
- tenant name;
- status;
- relevant region/default context;
- assigned consultant count;
- created/updated metadata as useful.
Actions: create, view, edit, activate/deactivate.

Tenant detail:
- identity/settings;
- logo branding preview on white;
- status;
- consultant assignments;
- explicitly authorized platform-level information.

## Consultants
List consultants and assignment counts. Detail shows only platform-management data. Assignment UI uses search/select of tenants and displays active assignments.

## Cross-Tenant Safety UX
Always display current tenant name in tenant-specific detail areas. Destructive status changes identify tenant explicitly in confirmation copy. The UI must never imply that a consultant can access all tenants.

## Accessibility and Responsive
Tables collapse responsibly; actions remain keyboard accessible. Confirmation dialogs restore focus. Status cannot be indicated by color alone.
