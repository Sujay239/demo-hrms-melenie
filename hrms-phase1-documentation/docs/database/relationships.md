# Database Relationships

## Purpose

Define all entity relationships across the 5-database architecture, distinguishing between same-database FK constraints and cross-database application-enforced references.

## Relationship Legend

- **Solid lines** (`||--o{`): Same-database FK constraint enforced by the database.
- **Dashed groupings**: Cross-database logical references enforced by the service layer.

## DB-CORE Relationships

```mermaid
erDiagram
    TENANT ||--o| TENANT_SETTINGS : "has one"
    TENANT ||--o{ TENANT_USER_MEMBERSHIP : "has members"
    TENANT }o--|| TENANT_SUBSCRIPTION_PLAN : "subscribes to"
    USER ||--o{ TENANT_USER_MEMBERSHIP : "belongs to"
    USER ||--o{ USER_ROLE_ASSIGNMENT : "has roles"
    USER ||--o{ AUTH_SESSION : "has sessions"
    USER ||--o{ AUTH_REFRESH_TOKEN : "has tokens"
    USER ||--o{ PASSWORD_RESET_TOKEN : "resets"
    USER ||--o{ ACCOUNT_ACTIVATION : "activates"
    USER ||--o| CONSULTANT : "is consultant"
    ROLE ||--o{ ROLE_PERMISSION : "has permissions"
    PERMISSION ||--o{ ROLE_PERMISSION : "granted to"
    ROLE ||--o{ USER_ROLE_ASSIGNMENT : "assigned"
    CONSULTANT ||--o{ CONSULTANT_TENANT_ASSIGNMENT : "assigned to"
    TENANT ||--o{ CONSULTANT_TENANT_ASSIGNMENT : "has consultants"
    TENANT ||--o{ USER_ROLE_ASSIGNMENT : "scopes"
```

## DB-HR Relationships

```mermaid
erDiagram
    TENANT_ref ||--o{ REGION : "owns (cross-db)"
    TENANT_ref ||--o{ DEPARTMENT : "owns (cross-db)"
    TENANT_ref ||--o{ DESIGNATION : "owns (cross-db)"
    TENANT_ref ||--o{ EMPLOYEE : "owns (cross-db)"
    TENANT_ref ||--o{ NEW_HIRE : "owns (cross-db)"
    TENANT_ref ||--o{ EMPLOYEE_GROUP : "owns (cross-db)"
    TENANT_ref ||--o{ TENANT_CUSTOM_FIELD : "defines (cross-db)"

    DEPARTMENT ||--o{ EMPLOYEE : "contains"
    DEPARTMENT ||--o{ DESIGNATION : "optional"
    DEPARTMENT o|--o{ DEPARTMENT : "parent hierarchy"
    DESIGNATION ||--o{ EMPLOYEE : "assigned"
    REGION ||--o{ EMPLOYEE : "located"
    EMPLOYEE o|--o{ EMPLOYEE : "manages"
    EMPLOYEE ||--o{ EMPLOYEE_BANK_DETAIL : "has bank"
    EMPLOYEE ||--o{ EMPLOYEE_EMERGENCY_CONTACT : "has contacts"
    EMPLOYEE ||--o{ EMPLOYEE_WORK_HISTORY : "has history"
    EMPLOYEE ||--o{ EMPLOYEE_EDUCATION : "has education"
    EMPLOYEE ||--o{ EMPLOYEE_SKILL : "has skills"
    EMPLOYEE ||--o{ EMPLOYEE_CUSTOM_FIELD_VALUE : "has custom"
    TENANT_CUSTOM_FIELD ||--o{ EMPLOYEE_CUSTOM_FIELD_VALUE : "defines"
    EMPLOYEE_GROUP ||--o{ EMPLOYEE_GROUP_MEMBERSHIP : "has members"
    EMPLOYEE ||--o{ EMPLOYEE_GROUP_MEMBERSHIP : "member of"

    NEW_HIRE ||--|| ONBOARDING_CASE : "has case"
    ONBOARDING_CASE ||--o{ ONBOARDING_TASK : "has tasks"
    NEW_HIRE ||--o{ OFFER_LETTER : "receives"
    NEW_HIRE ||--o{ ACKNOWLEDGEMENT : "signs"
    NEW_HIRE }o--o| EMPLOYEE : "converts to"
    DEPARTMENT ||--o{ NEW_HIRE : "designated"
    DESIGNATION ||--o{ NEW_HIRE : "designated"
    REGION ||--o{ NEW_HIRE : "designated"
    EMPLOYEE ||--o{ NEW_HIRE : "designated manager"
```

## DB-DOCS Relationships

```mermaid
erDiagram
    TENANT_ref ||--o{ DOCUMENT : "owns (cross-db)"
    TENANT_ref ||--o{ FILE_STORAGE_REFERENCE : "owns (cross-db)"

    DOCUMENT ||--o{ DOCUMENT_VERSION : "has versions"
    DOCUMENT ||--o{ DOCUMENT_ASSOCIATION : "associated with"
    DOCUMENT ||--o{ DOCUMENT_ACCESS_TOKEN : "access controlled"
    DOCUMENT ||--o{ DOCUMENT_ACCESS_LOG : "access logged"
    DOCUMENT_VERSION }o--|| FILE_STORAGE_REFERENCE : "stored as"
    DOCUMENT_ACCESS_TOKEN ||--o{ DOCUMENT_ACCESS_LOG : "tracked"
```

## DB-OPS Relationships (Leave/Attendance)

```mermaid
erDiagram
    TENANT_ref ||--o{ LEAVE_TYPE : "owns (cross-db)"
    LEAVE_TYPE ||--o{ LEAVE_POLICY : "governed by"
    LEAVE_POLICY ||--o{ LEAVE_POLICY_TARGET : "targets"
    LEAVE_TYPE ||--o{ LEAVE_BALANCE : "balance per type"
    LEAVE_TYPE ||--o{ LEAVE_LEDGER_ENTRY : "effects"
    LEAVE_TYPE ||--o{ LEAVE_REQUEST : "requested"
    LEAVE_REQUEST ||--o{ LEAVE_REQUEST_ACTION : "actions"
    LEAVE_REQUEST ||--o{ LEAVE_LEDGER_ENTRY : "causes"

    TENANT_ref ||--o{ HOLIDAY : "owns (cross-db)"
    HOLIDAY ||--o{ FLEXIBLE_HOLIDAY_SELECTION : "selected"

    TENANT_ref ||--o{ ATTENDANCE_RECORD : "owns (cross-db)"
    ATTENDANCE_RECORD ||--o{ ATTENDANCE_EVENT : "clock events"
    ATTENDANCE_RECORD ||--o{ ATTENDANCE_CORRECTION : "corrections"
```

## DB-OPS Relationships (Content/Service/Facilities)

```mermaid
erDiagram
    TENANT_ref ||--o{ KB_CATEGORY : "owns (cross-db)"
    KB_CATEGORY ||--o{ KB_ARTICLE : "contains"
    KB_CATEGORY o|--o{ KB_CATEGORY : "parent hierarchy"
    KB_ARTICLE ||--o{ KB_ARTICLE_VERSION : "versions"
    KB_ARTICLE ||--o{ KB_ARTICLE_TAG : "tagged"
    KB_TAG ||--o{ KB_ARTICLE_TAG : "used by"
    KB_ARTICLE ||--o{ KB_DEPARTMENT_VISIBILITY : "visible to"

    TENANT_ref ||--o{ ANNOUNCEMENT : "owns (cross-db)"
    ANNOUNCEMENT ||--o{ ANNOUNCEMENT_TARGET : "targets"
    ANNOUNCEMENT ||--o{ ANNOUNCEMENT_READ : "read tracking"

    TENANT_ref ||--o{ TICKET_CATEGORY : "owns (cross-db)"
    TENANT_ref ||--o{ TICKET : "owns (cross-db)"
    TICKET_CATEGORY ||--o{ TICKET : "categorizes"
    TICKET ||--o{ TICKET_COMMENT : "has comments"
    TICKET ||--o{ TICKET_ACTIVITY : "has activities"

    TENANT_ref ||--o{ BUILDING : "owns (cross-db)"
    BUILDING ||--o{ FLOOR : "has floors"
    FLOOR ||--o{ MEETING_ROOM : "has rooms"
    MEETING_ROOM ||--o{ ROOM_FACILITY : "has facilities"
    MEETING_ROOM ||--o{ ROOM_RESERVATION : "booked"

    TENANT_ref ||--o{ NOTIFICATION_TEMPLATE : "owns (cross-db)"
    TENANT_ref ||--o{ NOTIFICATION_QUEUE : "owns (cross-db)"
```

## DB-AUDIT Relationships

```mermaid
erDiagram
    PLATFORM_TICKET ||--o{ PLATFORM_TICKET_COMMENT : "has comments"
    PLATFORM_TICKET ||--o{ PLATFORM_TICKET_ACTIVITY : "has activities"
```

`audit_logs` is a standalone append-only table with no FK relationships.

## Cross-Database Reference Matrix

| Source Table (DB) | Referenced Table (DB) | Column | Enforcement |
|---|---|---|---|
| All tenant-owned tables (HR, DOCS, OPS, AUDIT) | `tenants` (CORE) | `tenant_id` | Service-layer validation |
| `employees` (HR) | `users` (CORE) | `user_id` | Service-layer validation |
| `new_hires` (HR) | `users` (CORE) | `user_id` | Service-layer validation |
| `onboarding_tasks` (HR) | `documents` (DOCS) | `document_id` | Service-layer validation |
| `offer_letters` (HR) | `documents` (DOCS) | `document_id`, `signed_document_id` | Service-layer validation |
| `employee_education` (HR) | `file_storage_references` (DOCS) | `certificate_storage_ref_id` | Service-layer validation |
| `employee_skills` (HR) | `file_storage_references` (DOCS) | `certificate_storage_ref_id` | Service-layer validation |
| `leave_requests` (OPS) | `employees` (HR) | `employee_id`, `approver_employee_id` | Service-layer validation |
| `leave_requests` (OPS) | `documents` (DOCS) | `supporting_document_id` | Service-layer validation |
| `attendance_records` (OPS) | `employees` (HR) | `employee_id` | Service-layer validation |
| `holidays` (OPS) | `regions` (HR) | `region_id` | Service-layer validation |
| `tickets` (OPS) | `employees` (HR) | `requester_employee_id`, `assignee_employee_id` | Service-layer validation |
| `tickets` (OPS) | `departments` (HR) | `department_id` | Service-layer validation |
| `ticket_comments` (OPS) | `documents` (DOCS) | `attachment_document_id` | Service-layer validation |
| `kb_department_visibility` (OPS) | `departments` (HR) | `department_id` | Service-layer validation |
| `room_reservations` (OPS) | `employees` (HR) | `booked_by_employee_id` | Service-layer validation |
| `buildings` (OPS) | `regions` (HR) | `region_id` | Service-layer validation |
| `platform_ticket_comments` (AUDIT) | `file_storage_references` (DOCS) | `attachment_storage_ref_id` | Service-layer validation |
| Various created_by/updated_by columns | `users` (CORE) | `user_id` | Context propagation |

## Critical Rules

- Employee department/designation/region/manager are same tenant — enforced by same-database FKs in DB-HR plus service-layer tenant check.
- Department parent/head are same tenant — enforced by same-database FKs.
- Manager and department-parent hierarchies are acyclic — enforced by service-layer graph validation.
- Onboarding/offer/document associations never cross tenant — enforced by service-layer tenant_id comparison.
- Leave policy targets and room hierarchy/reservations remain same tenant — enforced by service-layer cross-DB validation.
- Cross-database references always include tenant_id verification in both the source and target services.
