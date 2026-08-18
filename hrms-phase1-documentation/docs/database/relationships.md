# Database Relationships

## Purpose
Define important relationships and tenant consistency.

```mermaid
erDiagram
 TENANT ||--o{ REGION : owns
 TENANT ||--o{ DEPARTMENT : owns
 TENANT ||--o{ DESIGNATION : owns
 TENANT ||--o{ EMPLOYEE : owns
 TENANT ||--o{ NEW_HIRE : owns
 TENANT ||--o{ DOCUMENT : owns
 DEPARTMENT ||--o{ EMPLOYEE : contains
 DESIGNATION ||--o{ EMPLOYEE : assigned
 REGION ||--o{ EMPLOYEE : located
 EMPLOYEE o|--o{ EMPLOYEE : manages
 NEW_HIRE ||--|| ONBOARDING_CASE : has
 ONBOARDING_CASE ||--o{ ONBOARDING_TASK : contains
 NEW_HIRE ||--o{ OFFER_LETTER : receives
 DOCUMENT ||--o{ DOCUMENT_VERSION : versions
 EMPLOYEE ||--o{ LEAVE_REQUEST : submits
 EMPLOYEE ||--o{ ATTENDANCE_RECORD : has
 REGION ||--o{ HOLIDAY : calendar
 MEETING_ROOM ||--o{ ROOM_RESERVATION : booked
```

## Critical rules
Employee department/designation/region/manager are same tenant. Department parent/head are same tenant. Manager and department-parent hierarchies are acyclic. Onboarding/offer/document associations never cross tenant. Leave policy targets and room hierarchy/reservations remain same tenant.
