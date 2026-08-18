# Phase 1 User Stories

## Purpose
Provide story IDs and acceptance criteria for major workflows.

### US-TEN-001 Create tenant
As a Super Admin, I want to create a tenant so a new company can use the HRMS.  
Acceptance: unique tenant identity/status, audited creation, isolated data, configurable logo.

### US-TEN-002 Assign consultant
As a Super Admin, I want to assign consultants so they can support only selected companies.  
Acceptance: active/inactive assignment; unassigned tenant calls denied; permissions still required.

### US-EMP-001 Create employee
As a Tenant Admin, I want to create an employee so the company directory is accurate.  
Acceptance: same-tenant references, unique employee code policy, valid manager, audited change.

### US-EMP-002 Directory
As an Employee, I want to find colleagues so I can work with the organization.  
Acceptance: same tenant only; permitted fields only; search/pagination.

### US-EMP-003 Reporting hierarchy
As a Tenant Admin, I want to assign managers so the org structure is represented.  
Acceptance: no self/cross-tenant/cyclic relationship.

### US-ONB-001 Onboarding dashboard
As a New Hire, I want a clear onboarding checklist so I know what is left.  
Acceptance: own onboarding only; required/optional state; no Employee portal access.

### US-ONB-002 Submit details
As a New Hire, I want to submit my details including a fun fact so HR has required information.  
Acceptance: validated, tenant/identity scoped, completion updates correctly.

### US-ONB-003 External signing
As a New Hire, I want to download, externally sign and upload the signed document so HR can verify it.  
Acceptance: no native signature representation; original/signed artifacts distinguishable; upload audited.

### US-DOC-001 Upload employee document
As a Tenant Admin, I want to upload a categorized employee document so records are centralized.  
Acceptance: same-tenant employee, validated private file, metadata/version, audit.

### US-DOC-002 View sensitive document
As an authorized HR user, I want to access a sensitive record so I can perform legitimate HR work.  
Acceptance: sensitive permission + tenant/resource policy + access audit.

### US-LEV-001 Configure leave
As a Tenant Admin, I want configurable leave rules so policy is not hard-coded.  
Acceptance: allowance/credit/consecutive/carry-forward/lapse/pool/eligibility/approval/notice/region/group supported.

### US-LEV-002 Apply leave
As an Employee, I want to apply for leave so my absence can be reviewed.  
Acceptance: policy/date/eligibility/balance validation and traceable status.

### US-LEV-003 Approve leave
As an authorized manager, I want to approve/reject leave so staffing policy is enforced.  
Acceptance: approver policy validated; balance effect exactly once.

### US-HOL-001 Regional holidays
As a Tenant Admin, I want region-specific holiday lists so locations see appropriate calendars.  
Acceptance: common/flexible distinction; same-tenant region; employee eligibility.

### US-ATT-001 Clock in/out
As an Employee, I want to record my workday.  
Acceptance: valid state transitions and timezone-safe timestamps.

### US-ATT-002 Correction
As an Employee, I want to request a correction so mistakes can be reviewed.  
Acceptance: original data retained; reason and approval history.

### US-ATT-003 Overtime
As an Employee, I want to request overtime so extra work can be approved.  
Acceptance: valid period, approver scope, audit.

### US-KB-001 Department article
As an authorized editor, I want to publish department content so relevant staff see it.  
Acceptance: drafts hidden; department visibility enforced; versions retained.

### US-ANN-001 Targeted notice
As a Tenant Admin, I want to target announcements so only intended users see them.  
Acceptance: valid tenant targets, publish/expiry, read tracking.

### US-TKT-001 Create ticket
As an Employee, I want to create a department ticket so I can request support.  
Acceptance: server ticket number, valid department/category/priority, activity and secure attachments.

### US-TKT-002 Work ticket
As an authorized assignee, I want to update ticket state/comments so work progresses.  
Acceptance: allowed status transitions and access scope.

### US-ROOM-001 Reserve room
As an Employee, I want to reserve an available room so I can schedule a meeting.  
Acceptance: active same-tenant room, start < end, atomic non-overlap.

### US-ROOM-002 Cancel room
As owner/authorized admin, I want to cancel a booking so capacity is released.  
Acceptance: authorization, audit/history, slot becomes available.

### US-DSH-001 Dashboard
As a signed-in user, I want a role-relevant overview.  
Acceptance: predefined Phase 1 sections; partial metric failure is representable; no configurable / drag-and-drop widget controls.
