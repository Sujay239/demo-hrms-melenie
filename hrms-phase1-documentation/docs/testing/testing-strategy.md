# Testing Strategy

## Purpose
Define the test pyramid, environments, data-isolation expectations, release gates, and mandatory Phase 1 coverage.

## Principles
- Test business rules at the service layer.
- Test repository tenant scoping with real database integration where meaningful.
- Test API authorization and validation end-to-end through middleware/controller/service/repository boundaries.
- Test critical journeys in E2E.
- Every security boundary gets negative tests, not only happy paths.
- Each defect fixed should add a regression test at the cheapest reliable layer.

## Test Layers

### Unit Tests
Primary targets:
- service business rules;
- policy evaluators;
- leave calculations;
- hierarchy cycle detection;
- announcement audience matching;
- ticket state transitions;
- room-overlap logic helpers;
- document metadata validation;
- dashboard section orchestration/partial-failure mapping.

Controllers should need little business-logic unit testing because they are thin.

### Integration Tests
Use the actual application persistence abstraction against an isolated test database:
- repository tenant predicates;
- unique/foreign-key constraints;
- transactions;
- API request validation;
- authentication middleware;
- authorization policies;
- document metadata/access;
- leave ledger atomicity;
- reservation conflict concurrency.

### E2E Tests
Browser/client-to-API workflows:
- authentication;
- Super Admin tenant management;
- consultant assigned/unassigned tenant behavior;
- Tenant Admin employee management;
- New Hire onboarding;
- employee leave/attendance/tickets/rooms;
- sensitive document access restrictions.

## Test Data Strategy
Factories/fixtures create at minimum:
- Tenant A and Tenant B;
- Super Admin;
- Consultant assigned only to Tenant A;
- Tenant Admin in each tenant;
- managers and employees in each tenant;
- New Hire in each tenant;
- public/department/sensitive documents;
- leave policies/regions/holidays;
- tickets/rooms/reservations.

IDs should be intentionally mixed in negative tests to detect missing tenant predicates.

## Tenant Isolation Gate
Every tenant-owned module must include:
1. read with own-tenant ID succeeds;
2. same endpoint with another tenant's valid resource ID is denied/not found;
3. list/count excludes other tenant;
4. create/update association to other-tenant reference fails;
5. consultant unassigned tenant access fails;
6. Super Admin cross-tenant behavior only succeeds on explicit platform-authorized path.

## Security Gate
Required categories:
- auth brute-force/rate-limit behavior;
- permission denial;
- IDOR;
- malformed/oversized inputs;
- XSS payload storage/rendering path;
- SQL-injection-like input remains data;
- CSRF tests if ambient cookie auth is selected;
- CORS/headers;
- file type/content mismatch;
- sensitive file delivery;
- audit event creation;
- secrets/log redaction.

## Concurrency Tests
- simultaneous room bookings for overlapping interval: at most one succeeds;
- duplicate leave approval: no double debit;
- duplicate New Hire conversion: one Employee result;
- duplicate clock actions: invariant preserved;
- concurrent document version creation: unique monotonic/version policy preserved.

## Performance Tests
Before production readiness, characterize:
- employee/document/ticket lists at representative tenant sizes;
- dashboard aggregate latency and partial-failure handling;
- indexed filters;
- upload/download authorization overhead;
- high-volume audit list.
Numeric SLOs are not invented here; establish baselines and release thresholds once deployment sizing is known, then update `../performance/performance.md`.

## Accessibility Tests
Automated accessibility checks plus manual keyboard/focus/form-error/table/modal checks on critical flows.

## Release Gates
- unit/integration/E2E suites pass;
- migrations tested;
- security-critical negative tests pass;
- no unresolved cross-tenant defect;
- documentation changed with behavior;
- lint/type/static checks from chosen stack pass;
- production smoke test plan prepared.

## Related Documents
- `test-cases.md`
- `integration-tests.md`
- `e2e-tests.md`
- `../security/security-testing.md`
- `../10-definition-of-done.md`
