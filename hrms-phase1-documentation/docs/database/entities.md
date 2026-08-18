# Entity Catalog

## Purpose
Define ownership/lifecycle intent.

| Entity | Ownership | Notes |
|---|---|---|
| User | Platform | login identity/account state |
| Tenant | Platform | isolation root |
| TenantUserMembership | Tenant | identity access relation |
| Role/Permission | Platform catalog + scoped assignment | RBAC |
| Consultant | Platform | consultant identity/profile |
| ConsultantTenantAssignment | Platform relation | active tenant eligibility |
| Region | Tenant | country/timezone/locale |
| Department | Tenant | hierarchy/head/status |
| Designation | Tenant | title/status/optional department |
| Employee | Tenant | active workforce record |
| NewHire | Tenant | pre-employment only |
| OnboardingCase/Task | Tenant | checklist/progress/verification |
| OfferLetter | Tenant | New Hire offer metadata/document link |
| Document/Version | Tenant | protected metadata + immutable versions |
| LeaveType/Policy | Tenant | configurable effective rules |
| LeaveBalance/Ledger | Tenant | summary + explainable effects |
| LeaveRequest | Tenant | approval workflow |
| Holiday | Tenant+Region | common/flexible |
| AttendanceRecord | Tenant | work-time record |
| AttendanceCorrection | Tenant | proposed correction |
| OvertimeRequest | Tenant | approval workflow |
| KBArticle | Tenant | versioned content |
| Announcement | Tenant | targeted lifecycle/read tracking |
| Ticket | Tenant | department service request |
| Building/Floor/Room | Tenant | facilities |
| Reservation | Tenant | room booking |
| AuditLog | Platform/Tenant | append-oriented event |

## Rules
Tenant children never reference another tenant. Mutable names are not foreign keys. Status values are constrained where practical.
