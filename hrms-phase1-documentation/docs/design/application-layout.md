# Application Layout Specification

## Purpose
Define the persistent application shell and role-aware information architecture.

## Areas
1. Authentication shell
2. Platform / Super Admin portal
3. Company / Tenant portal
4. New Hire onboarding portal

## Desktop Shell
`Sidebar | Header + Main Content`

The sidebar owns navigation. The header owns page/account/context utilities. Main content owns page-specific controls and data.

## Tenant Context
If a user has access to multiple valid contexts, the UI may expose a context selector, but selection is merely a request input; the server verifies it. A consultant selector shows only assigned tenants. A Tenant Admin/Employee normally stays inside their authorized tenant context.

## Branding
Tenant portal header/sidebar includes tenant logo inside a white surface. Platform portal uses platform branding. New Hire onboarding uses tenant identity/logo where authorized.

## Page Template
1. Optional breadcrumb/context
2. Page title + description
3. Primary action
4. Filter/search controls where needed
5. Main content
6. Pagination/footer controls where needed

## Route Protection UX
Client routing checks known authentication/role state to prevent confusing navigation, while all actual access control is server-side.

## Responsive
See `responsive-design.md`.

## Future
The shell can host future dashboard configuration, theme tokens, SSO controls, payroll, and reports without Phase 1 persistence for those future functions.
