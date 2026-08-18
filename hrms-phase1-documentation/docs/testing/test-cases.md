# Phase 1 Test Case Catalog

## Purpose
Provide implementation-independent acceptance test cases that map to the HRMS requirements.

## Authentication
| ID | Scenario | Expected |
|---|---|---|
| TC-AUTH-001 | Valid active user logs in | Auth established; safe bootstrap returned |
| TC-AUTH-002 | Wrong password | Generic denial; no account enumeration |
| TC-AUTH-003 | Deactivated account | Denied |
| TC-AUTH-004 | Expired/reused reset capability | Denied; password unchanged |
| TC-AUTH-005 | Logout then reuse revoked capability where strategy supports revocation | Denied |

## RBAC and Multi-Tenancy
| ID | Scenario | Expected |
|---|---|---|
| TC-TEN-001 | Tenant A Admin requests Tenant B employee by valid ID | 403/404; no data leak |
| TC-TEN-002 | Tenant A list endpoint with Tenant B filter/reference | Rejected or remains Tenant A scoped |
| TC-TEN-003 | Consultant assigned to A opens A | Allowed only permitted data |
| TC-TEN-004 | Same consultant opens B | Denied |
| TC-TEN-005 | Super Admin performs authorized platform tenant read | Allowed and auditable |
| TC-RBAC-001 | Employee calls employee-create endpoint | Denied |
| TC-RBAC-002 | User has permission but resource belongs to wrong tenant | Denied |

## Employee Management
| ID | Scenario | Expected |
|---|---|---|
| TC-EMP-001 | Admin creates valid employee | Employee appears in directory |
| TC-EMP-002 | Duplicate employee ID in tenant | Conflict |
| TC-EMP-003 | Same employee ID in another tenant if allowed by per-tenant uniqueness | Allowed |
| TC-EMP-004 | Manager is self | Rejected |
| TC-EMP-005 | Manager update creates cycle | Rejected |
| TC-EMP-006 | Department from another tenant | Rejected |
| TC-EMP-007 | Employee self-edits admin-only field | Denied/ignored by explicit policy, never mass-assigned |

## New Hire Onboarding
| ID | Scenario | Expected |
|---|---|---|
| TC-ONB-001 | New Hire logs in | Onboarding-only navigation/data |
| TC-ONB-002 | New Hire calls employee directory admin endpoint | Denied |
| TC-ONB-003 | New Hire saves details/fun fact | Saved within own case |
| TC-ONB-004 | Reviews/downloads own offer | Allowed/audited as required |
| TC-ONB-005 | Uploads signed external copy | Stored as protected document association |
| TC-ONB-006 | Attempts in-platform native signature | No such Phase 1 feature/API |
| TC-ONB-007 | HR verifies incomplete case | Rejected unless explicit override exists and is documented |
| TC-ONB-008 | Authorized conversion | Distinct Employee created, case linked/completed |
| TC-ONB-009 | Duplicate conversion request | No duplicate Employee |

## Documents
| ID | Scenario | Expected |
|---|---|---|
| TC-DOC-001 | Allowed PDF within limit | Accepted/pending validation workflow |
| TC-DOC-002 | Extension says PDF but signature/MIME prohibited | Rejected/quarantined per policy |
| TC-DOC-003 | Oversized file | 413/validation error |
| TC-DOC-004 | Employee downloads permitted own document | Authorized short-lived delivery |
| TC-DOC-005 | Employee requests sensitive medical record without entitlement | Denied and appropriate audit |
| TC-DOC-006 | Cross-tenant document association | Rejected |
| TC-DOC-007 | New version uploaded | Previous version remains immutable |
| TC-DOC-008 | Revoked/expired document access | Enforced according to category/status policy |

## Leave
| ID | Scenario | Expected |
|---|---|---|
| TC-LEV-001 | Configurable monthly/annual policy saved | Values persist as configuration |
| TC-LEV-002 | Request exceeds max consecutive days | Rejected |
| TC-LEV-003 | Insufficient balance | Rejected unless policy explicitly allows negative balance |
| TC-LEV-004 | Wrong region/group policy | Not selected |
| TC-LEV-005 | Manager approves subordinate request | Approved, ledger updated once |
| TC-LEV-006 | Non-manager/unscoped approver attempts approval | Denied |
| TC-LEV-007 | Duplicate approval | No duplicate ledger debit |
| TC-LEV-008 | Carry-forward/year-end lapse | Matches configured rule |

## Holidays
| ID | Scenario | Expected |
|---|---|---|
| TC-HOL-001 | Employee sees region-specific common holidays | Correct list |
| TC-HOL-002 | Eligible flexible holiday selected | Selection created |
| TC-HOL-003 | Duplicate selection | Conflict |
| TC-HOL-004 | Other-region flexible holiday | Denied/ineligible |
| TC-HOL-005 | Leave balance unaffected by holiday CRUD unless explicit leave calculation rule uses calendar | Domains remain separate |

## Attendance and Overtime
| ID | Scenario | Expected |
|---|---|---|
| TC-ATT-001 | Employee clocks in | Active record/event with server timestamp |
| TC-ATT-002 | Double clock-in | Rejected |
| TC-ATT-003 | Clock out without open session | Rejected |
| TC-ATT-004 | Correction preserves original values/history | Yes |
| TC-ATT-005 | Manager approves scoped correction | Approved |
| TC-ATT-006 | Overtime request/approve | Valid transition/history |
| TC-ATT-007 | Client tries to clock for another employee | Denied |

## Knowledge Base
| ID | Scenario | Expected |
|---|---|---|
| TC-KB-001 | Published tenant-global article | Visible to eligible tenant users only |
| TC-KB-002 | Department-only article | Visible only to eligible department/audience |
| TC-KB-003 | Draft | Hidden from normal employee search |
| TC-KB-004 | Article edit | Version history retained |
| TC-KB-005 | Stored script payload | Rendered/sanitized safely; no XSS |

## Announcements
| ID | Scenario | Expected |
|---|---|---|
| TC-ANN-001 | Tenant-wide active notice | Eligible tenant users see it |
| TC-ANN-002 | Department target | Other departments do not see it |
| TC-ANN-003 | Expired notice | Removed from active feed |
| TC-ANN-004 | Read action | User read state stored |
| TC-ANN-005 | Cross-tenant target ID | Rejected |

## Tickets
| ID | Scenario | Expected |
|---|---|---|
| TC-TKT-001 | Employee creates ticket | Server ticket number; status `OPEN` |
| TC-TKT-002 | Agent moves through valid status | Activity recorded |
| TC-TKT-003 | Invalid status value/transition | Rejected |
| TC-TKT-004 | Unauthorized department queue | Hidden/denied |
| TC-TKT-005 | Attachment | Uses Document Management authorization |
| TC-TKT-006 | Comment script payload | Safe render/no XSS |

## Meeting Rooms
| ID | Scenario | Expected |
|---|---|---|
| TC-ROOM-001 | Search active rooms | Correct tenant-filtered results |
| TC-ROOM-002 | Valid free slot reservation | Confirmed |
| TC-ROOM-003 | Overlapping reservation | Conflict |
| TC-ROOM-004 | Two concurrent overlapping creates | At most one confirmed |
| TC-ROOM-005 | Cancel own eligible booking | Cancelled/history retained |
| TC-ROOM-006 | Reserve inactive/wrong-tenant room | Denied |

## Dashboard
| ID | Scenario | Expected |
|---|---|---|
| TC-DASH-001 | Employee dashboard | Only employee-allowed sections/data |
| TC-DASH-002 | Tenant Admin dashboard | Tenant-only aggregates |
| TC-DASH-003 | Independent optional metric fails | Other sections can render if contract permits |
| TC-DASH-004 | Tenant authorization fails | Whole dashboard denied |
| TC-DASH-005 | Inspect Phase 1 UI/API/schema | No widget layout editor, layout CRUD, or layout table |

## Audit
| ID | Scenario | Expected |
|---|---|---|
| TC-AUD-001 | Sensitive document download | Audit event with actor/tenant/resource/request/timestamp |
| TC-AUD-002 | Tenant Admin requests another tenant audit ID | Denied/not found |
| TC-AUD-003 | Client attempts create/update audit event | No such mutation API |
| TC-AUD-004 | Audit payload | No passwords/tokens/raw secret content |
