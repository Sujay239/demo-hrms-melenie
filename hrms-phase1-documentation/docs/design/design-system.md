# Design System Specification

## Purpose
Define a consistent reusable UI foundation without choosing implementation code.

## Principles
1. Accessible by default.
2. Consistent interaction patterns across roles.
3. Dense enough for enterprise workflows, never cramped.
4. Clear state hierarchy.
5. Tenant branding limited to the Phase 1 logo on white.
6. Theme tokens remain implementation-owned and future-extensible.

## Typography
Use one production-approved sans-serif UI family with robust language support. Define tokens rather than hard-coded ad hoc sizes:
- page title;
- section heading;
- card heading;
- body;
- label;
- helper/caption.
Line height must preserve readability. Do not add tenant custom fonts in Phase 1.

## Spacing
Adopt a consistent spacing scale and component rhythm. Form rows, card padding, table cells, page gutters, and vertical sections should use tokens from that scale. Avoid one-off margins that create layout drift.

## Layout Tokens
Define:
- sidebar expanded/collapsed dimensions if collapse is implemented;
- header height;
- content gutters;
- max form width;
- table density;
- modal size tiers;
- responsive breakpoints.

## Core Components
- Button: primary, secondary, tertiary/text, destructive
- Input, textarea, select/autocomplete
- Date/time picker
- Checkbox/radio/switch
- Form field wrapper
- Card
- Data table
- Pagination
- Badge/status pill
- Tabs
- Breadcrumbs
- Modal/dialog
- Drawer
- Tooltip
- Toast
- Inline alert
- Skeleton/loading
- Empty state
- File uploader
- Avatar/profile image
- Search/filter bar
- Confirmation prompt

## Status Semantics
Centralize labels/icons/tokens for canonical statuses. UI colors are presentation tokens and must not be the only signal.

## Tenant Logo
- Render on white background.
- Preserve aspect ratio.
- Constrain dimensions.
- Provide text fallback/company name if asset unavailable.
- Uploaded asset follows secure file validation.
- No tenant color extraction or dynamic theme in Phase 1.

## Accessibility
Components define keyboard, focus, label, error, disabled, pending, and screen-reader semantics before implementation is considered complete.

## Future
The token architecture may later allow approved tenant themes, but no custom colors/fonts/CSS/theme builder exists in Phase 1.
