# Entity Catalog

## Purpose

Define ownership, lifecycle intent, and database assignment for every entity.

| Entity | Database | Ownership | Notes |
|---|---|---|---|
| User | DB-CORE | Platform | Login identity, account state, platform-wide |
| Tenant | DB-CORE | Platform | Isolation root for all tenant-owned data |
| TenantSettings | DB-CORE | Tenant (1:1) | Per-tenant configuration (timezone, formats, quotas) |
| TenantSubscriptionPlan | DB-CORE | Platform | Platform-managed tier/plan catalog |
| TenantUserMembership | DB-CORE | Tenant | User-to-tenant access relation |
| Role | DB-CORE | Platform catalog | RBAC role definitions |
| Permission | DB-CORE | Platform catalog | Granular permission definitions |
| RolePermission | DB-CORE | Platform catalog | Role-permission mapping |
| UserRoleAssignment | DB-CORE | Platform + Tenant scoped | Role assignment per user per tenant |
| Consultant | DB-CORE | Platform | Consultant identity/profile |
| ConsultantTenantAssignment | DB-CORE | Platform relation | Active tenant eligibility for consultants |
| AuthSession | DB-CORE | Platform | Active login sessions |
| AuthRefreshToken | DB-CORE | Platform | Refresh tokens for session renewal |
| PasswordResetToken | DB-CORE | Platform | Short-lived password reset secrets |
| AccountActivation | DB-CORE | Platform | Activation/invitation records |
| Region | DB-HR | Tenant | Country/timezone/locale grouping |
| Department | DB-HR | Tenant | Organizational hierarchy, head, status |
| Designation | DB-HR | Tenant | Job title, optional department link |
| Employee | DB-HR | Tenant | Active workforce record, core HR entity |
| EmployeeBankDetails | DB-HR | Tenant | Encrypted bank information |
| EmployeeEmergencyContact | DB-HR | Tenant | Emergency contacts per employee |
| EmployeeWorkHistory | DB-HR | Tenant | Previous employment records |
| EmployeeEducation | DB-HR | Tenant | Education qualifications |
| EmployeeSkill | DB-HR | Tenant | Skills and certifications |
| TenantCustomField | DB-HR | Tenant | Tenant-defined custom fields for employees |
| EmployeeCustomFieldValue | DB-HR | Tenant | Values for custom fields |
| EmployeeGroup | DB-HR | Tenant | Logical employee grouping for policies |
| EmployeeGroupMembership | DB-HR | Tenant | Group membership join table |
| NewHire | DB-HR | Tenant | Pre-employment onboarding record |
| OnboardingCase | DB-HR | Tenant | Per-new-hire onboarding progress |
| OnboardingTask | DB-HR | Tenant | Individual task with verification |
| OfferLetter | DB-HR | Tenant | Offer metadata + document link |
| Acknowledgement | DB-HR | Tenant | Signature capture for onboarding docs |
| FileStorageReference | DB-DOCS | Tenant | Central registry for all S3/storage files |
| Document | DB-DOCS | Tenant | Logical document with metadata and classification |
| DocumentVersion | DB-DOCS | Tenant | Immutable file version per document |
| DocumentAssociation | DB-DOCS | Tenant | Links documents to HR entities |
| DocumentAccessToken | DB-DOCS | Tenant | HMAC-signed time-limited access tokens |
| DocumentAccessLog | DB-DOCS | Tenant | Immutable access audit trail |
| LeaveType | DB-OPS | Tenant | Configurable leave category |
| LeavePolicy | DB-OPS | Tenant | Rules for leave allocation and usage |
| LeavePolicyTarget | DB-OPS | Tenant | Policy applicability (region, dept, group) |
| LeaveBalance | DB-OPS | Tenant | Per-employee per-type balance summary |
| LeaveLedgerEntry | DB-OPS | Tenant | Explainable balance effects |
| LeaveRequest | DB-OPS | Tenant | Leave application with approval workflow |
| LeaveRequestAction | DB-OPS | Tenant | Status change audit trail |
| Holiday | DB-OPS | Tenant + Region | Common and flexible holidays |
| FlexibleHolidaySelection | DB-OPS | Tenant | Employee flexible holiday picks |
| AttendanceRecord | DB-OPS | Tenant | Daily work-time record |
| AttendanceEvent | DB-OPS | Tenant | Clock in/out events within a day |
| AttendanceCorrection | DB-OPS | Tenant | Proposed attendance corrections |
| OvertimeRequest | DB-OPS | Tenant | Overtime approval workflow |
| KBCategory | DB-OPS | Tenant | Knowledge base categories |
| KBArticle | DB-OPS | Tenant | Versioned knowledge base content |
| KBArticleVersion | DB-OPS | Tenant | Immutable article versions |
| KBTag | DB-OPS | Tenant | Article tags |
| KBArticleTag | DB-OPS | Tenant | Article-tag join table |
| KBDepartmentVisibility | DB-OPS | Tenant | Department visibility for KB articles |
| Announcement | DB-OPS | Tenant | Targeted lifecycle announcements |
| AnnouncementTarget | DB-OPS | Tenant | Targeting rules (dept, region, role, group) |
| AnnouncementRead | DB-OPS | Tenant | Per-user read tracking |
| TicketCategory | DB-OPS | Tenant | Intra-company ticket categories |
| Ticket | DB-OPS | Tenant | Department-routed service tickets |
| TicketComment | DB-OPS | Tenant | Ticket comments |
| TicketActivity | DB-OPS | Tenant | Immutable ticket activity history |
| Building | DB-OPS | Tenant | Facility buildings |
| Floor | DB-OPS | Tenant | Building floors |
| MeetingRoom | DB-OPS | Tenant | Meeting rooms with capacity |
| RoomFacility | DB-OPS | Tenant | Room amenities |
| RoomReservation | DB-OPS | Tenant | Room bookings |
| NotificationTemplate | DB-OPS | Tenant | Customizable notification templates |
| NotificationQueue | DB-OPS | Tenant | Outbound notification processing queue |
| AuditLog | DB-AUDIT | Platform/Tenant | Immutable append-only audit events |
| PlatformTicket | DB-AUDIT | Platform + Tenant | Company-to-super-admin tickets |
| PlatformTicketComment | DB-AUDIT | Platform | Platform ticket comments |
| PlatformTicketActivity | DB-AUDIT | Platform | Platform ticket state change log |

## Rules

- Tenant children never reference another tenant. Mutable names are not foreign keys. Status values are constrained where practical.
- Every tenant-owned entity has `tenant_id` as a mandatory column.
- Cross-database references use UUID columns without FK constraints — service-layer validated.
- File references always use `file_storage_ref_id` → `file_storage_references` — binary content NEVER in any database.
