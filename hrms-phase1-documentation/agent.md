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
Owns business rules, resource-level authorization, transaction orchestration, audit events, and coordination across repositories/storage. Handles cross-database validation (e.g., verifying an employee exists in DB-HR before creating a leave request in DB-OPS).

### Repository
Owns persistence/database logic and tenant-scoped queries. Each repository connects to exactly one database. Never query multiple databases from a single repository.

## Multi-database rule
The system uses 5 independent databases: DB-CORE, DB-HR, DB-DOCS, DB-OPS, DB-AUDIT.
- **Never** write SQL JOINs across databases. Cross-database data is aggregated by the service layer.
- **Never** create FK constraints across databases. Cross-DB references use UUID columns with `-- CROSS-DB REF:` comments.
- Each database has its own migration version sequence (prefix: `core_`, `hr_`, `docs_`, `ops_`, `audit_`).
- Each database has its own connection pool and repository layer.
- When a service needs data from another database, it calls the owning service — not the owning repository directly.
- Consult `docs/architecture/database-architecture.md` for the full topology and `docs/database/database-schema.md` for table-to-database assignments.

## File storage rule
- **Never** store binary file content in any database. All files go to external object storage (S3/file server).
- Every file reference in the database uses a `file_storage_ref_id` UUID column pointing to `file_storage_references` in DB-DOCS.
- Storage keys are server-generated: `{tenant_id}/{module}/{year}/{month}/{uuid}.{ext}`. Original filenames are display metadata only.
- Content hash (SHA-256) is computed and stored on upload for integrity verification.
- Consult `docs/architecture/storage-architecture.md` for upload/download flows.

## Document access token rule
- **Never** serve documents without a valid `document_access_token`. No permanent public URLs.
- Token generation requires authentication + authorization + tenant context verification.
- Token verification chain: exists → not expired → not revoked → access count within limit → tenant matches → user permission re-verified → document not revoked → serve → log.
- Every access attempt (success AND denial) is logged to `document_access_log` (immutable, append-only).
- Consult `docs/security/file-security.md` for the full token lifecycle and key hierarchy.

## API rule
All application endpoints use `/api/v1/`. Breaking changes require a new major API version or a documented compatibility/deprecation approach.

## Multi-tenancy rule
Never trust a client tenant ID. Establish trusted tenant context from authenticated identity, active membership/assignment, and server-side authorization. Resolve tenant-owned resources by tenant + resource ID. This applies across all 5 databases.

## Performance rule
Use `Promise.allSettled()` when multiple operations are independent and partial results are valid (e.g., dashboard sections from different databases). Do not use it for dependent work, state-machine sequencing, or all-or-nothing transactions.

## Security rule
Deny by default. Treat hidden UI controls as UX only, never authorization. Sensitive document access requires explicit authorization and auditability. Cross-tenant document access is only possible via Super Admin-created platform-level share tokens.

## Database rule
Use migrations. Never manually mutate production schema as a normal workflow. Do not add speculative tables for Future Phase features. Each database has its own migration sequence.

## Testing rule
Every meaningful feature requires appropriate unit, integration and E2E/security tests. Cross-tenant negative tests are mandatory for tenant-owned modules. Cross-database reference validation tests are mandatory for features spanning multiple databases.

## Documentation rule
Update relevant `.md` files whenever behavior, API contracts, database design, permissions, state transitions, architecture, or operational requirements change.

## Completion rule
Do not mark work complete until:
- code works and builds;
- tests pass;
- acceptance criteria pass;
- authorization and tenant isolation are verified (across all affected databases);
- validation/error handling exist;
- migrations are present when required (in the correct database);
- file storage references use `file_storage_references` (no binary in DB);
- document access uses token-based access (no permanent public URLs);
- docs are synchronized;
- audit/observability requirements are met;
- no Future Phase feature was accidentally added.
