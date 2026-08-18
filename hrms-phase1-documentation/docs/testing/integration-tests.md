# Integration Test Specification

## Purpose
Define tests that exercise API, authorization, services, repositories, database constraints, storage abstractions, and transaction boundaries together.

## Test Environment
Use an isolated disposable database/schema and isolated test storage namespace/emulator compatible with the selected infrastructure. Migrations run from zero before the suite or test environment snapshot. Never point integration tests at production tenant data.

## Mandatory Suites

### Authentication + Membership
- login and current user;
- deactivated membership/account;
- role assignment;
- reset/activation persistence;
- logout/revocation behavior.

### Tenant Scoping
For each tenant-owned repository/API family, seed Tenant A and B resources and run positive + cross-tenant negative reads, lists, counts, creates, updates, associations, and deletes.

### Consultant Assignment
- assigned tenant succeeds;
- assignment removed then next request fails;
- unassigned valid tenant ID fails;
- list returns only assigned tenants.

### Employees / Organization
- FK/tenant relationship enforcement;
- employee identifier uniqueness;
- hierarchy service validation;
- soft delete/status behavior.

### Onboarding / Documents
- New Hire owner resolution;
- onboarding document association;
- offer/signed-copy relationship;
- document version uniqueness/immutability;
- secure download authorization call path;
- conversion transaction.

### Leave
- effective policy lookup;
- ledger transaction;
- duplicate approval;
- carry-forward/lapse calculation persistence;
- approval action history.

### Attendance
- clock state transitions;
- correction record preserving prior state;
- manager approval scope;
- time-zone local-day boundaries.

### Content / Tickets
- KB/announcement audience predicates in database/service queries;
- ticket department visibility;
- canonical status/activity history;
- attachment document authorization.

### Rooms
Execute truly concurrent overlapping reservation attempts against the real transactional database strategy and assert invariant preservation.

### Audit
Verify security-sensitive actions create events and unauthorized audit access cannot cross tenant.

## Failure Injection
For dashboard/service orchestration, substitute one independent dependency failure and verify `Promise.allSettled()` mapping does not mask authorization failures or corrupt successful sections.

## Assertions
Prefer behavior/state assertions over implementation-detail assertions. Repository SQL shape may evolve; tenant isolation, constraints, and transaction outcomes may not.
