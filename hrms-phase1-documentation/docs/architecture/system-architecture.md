# System Architecture

## Purpose
Define Phase 1 component boundaries, trust boundaries and deployment shape.

## Logical architecture
```mermaid
flowchart LR
 UI[Web Client] --> EDGE[Edge/Reverse Proxy]
 EDGE --> API[/api/v1 API]
 API --> ACCESS[Authentication + Tenant Context + Authorization]
 ACCESS --> ROUTE[Routes]
 ROUTE --> CTRL[Controllers]
 CTRL --> SVC[Services]
 SVC --> REPO[Repositories]
 REPO --> DB[(Relational DB)]
 SVC --> STORE[Private Object Storage]
 SVC --> AUDIT[Audit Service]
```

## Phase 1 deployment shape
Use a modular monolith unless the existing codebase already establishes a different approved architecture. Domains remain explicit modules but share one backend runtime, relational transactional DB and private file storage.

## Domain boundaries
- Identity/access
- Platform/tenants/consultants
- Organization/employees
- Onboarding/offer letters
- Documents
- Leave/holidays/attendance
- Knowledge/announcements
- Tickets
- Facilities
- Audit/observability

## Trust boundaries
1. Browser/client is untrusted.
2. Authentication proves identity only.
3. Tenant context is server-authorized.
4. Service layer owns business authorization/invariants.
5. Repository owns tenant-scoped persistence.
6. Storage object keys are not authorization tokens.

## Extensibility
Cross-domain behavior should call stable services/contracts rather than directly manipulating another domain's tables. This supports later payroll, reporting, SSO and privacy functions.
