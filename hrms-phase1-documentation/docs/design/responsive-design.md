# Responsive Design Specification

## Purpose
Ensure Phase 1 is usable across phones, tablets, laptops, and large desktop displays.

## Principles
- Content determines breakpoints.
- Never hide a critical workflow solely because width is small.
- Preserve readable line length.
- Avoid horizontal page overflow.
- Tables may use controlled horizontal scrolling or responsive row/card representation.
- Touch targets remain adequately sized.
- Fixed headers/footers must not cover controls.

## Sidebar
Desktop: persistent.
Tablet/mobile: accessible drawer or equivalent. Opening moves focus appropriately; Escape/close returns focus.

## Forms
Desktop may use two columns for naturally paired fields; narrow screens stack to one column. Error text remains adjacent to the field.

## Tables
Prioritize essential columns. Secondary information may move into row details. Actions remain reachable and named. Pagination/filter controls wrap cleanly.

## Dashboards
Predefined cards flow from multi-column to single-column. No drag/drop handles or layout editor exists in Phase 1.

## Uploads
File chooser/drop target must also provide keyboard-accessible input; drag-to-upload, if supported as a file input convenience, is unrelated to dashboard widget drag-and-drop.

## Testing Viewports
Test representative narrow mobile, wide mobile, tablet portrait/landscape, standard laptop/desktop, and wide desktop, plus zoom/reflow behavior.
