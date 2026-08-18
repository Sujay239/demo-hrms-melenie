# AI Coding Agent Operating Manual

## Purpose
Mandatory operational instructions for the future AI coding agent. The documentation repository is authoritative unless an approved later ADR or requirement explicitly supersedes it.

## Required workflow
For every feature:
1. Read `agent.md`.
2. Read `docs/01-prd.md`.
3. Read `docs/02-srs.md` and identify requirement IDs.
4. Read `docs/03-scope.md`.
5. Read relevant architecture documents.
6. Read relevant database documents.
7. Read relevant security documents.
8. Read relevant API contract.
9. Read relevant module specification.
10. Read relevant design specification.
11. Plan the implementation against requirement IDs and acceptance criteria.
12. Implement using existing project conventions.
13. Add/update tests.
14. Review security, tenant isolation, authorization, validation and error handling.
15. Update affected documentation.
16. Check the Definition of Done before completion.

The agent must never skip documentation because a feature appears simple.

## Backend rule
Always:
```text
Route
→ Controller
→ Service
→ Repository
→ Database
```

Never:
```text
Route → Database
Controller → Database
Frontend → Database
```

### Route
Defines `/api/v1/` path, method and middleware order.

### Controller
Maps validated HTTP input to service calls and service outcomes to HTTP responses. No raw DB queries or business logic.

### Service
Owns business rules, resource-level authorization, transaction orchestration, audit events, and coordination across repositories/storage.

### Repository
Owns persistence/database logic and tenant-scoped queries.

## API rule
All application endpoints use `/api/v1/`. Breaking changes require a new major API version or a documented compatibility/deprecation approach.

## Multi-tenancy rule
Never trust a client tenant ID. Establish trusted tenant context from authenticated identity, active membership/assignment, and server-side authorization. Resolve tenant-owned resources by tenant + resource ID.

## Performance rule
Use `Promise.allSettled()` when multiple operations are independent and partial results are valid. Do not use it for dependent work, state-machine sequencing, or all-or-nothing transactions.

## Security rule
Deny by default. Treat hidden UI controls as UX only, never authorization. Sensitive document access requires explicit authorization and auditability.

## Database rule
Use migrations. Never manually mutate production schema as a normal workflow. Do not add speculative tables for Future Phase features.

## Testing rule
Every meaningful feature requires appropriate unit, integration and E2E/security tests. Cross-tenant negative tests are mandatory for tenant-owned modules.

## Documentation rule
Update relevant `.md` files whenever behavior, API contracts, database design, permissions, state transitions, architecture, or operational requirements change.

## Completion rule
Do not mark work complete until:
- code works and builds;
- tests pass;
- acceptance criteria pass;
- authorization and tenant isolation are verified;
- validation/error handling exist;
- migrations are present when required;
- docs are synchronized;
- audit/observability requirements are met;
- no Future Phase feature was accidentally added.
