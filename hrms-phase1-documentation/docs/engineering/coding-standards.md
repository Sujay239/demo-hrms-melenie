# Coding Standards

## Purpose
Define implementation rules the future coding agent and human contributors must follow independent of the exact chosen language/framework conventions.

## Architecture
Mandatory backend flow:

`Route → Controller → Service → Repository → Database`

Never:
- Route → Database
- Controller → Database
- Frontend → Database

Controllers are thin. Services own business decisions. Repositories own persistence.

## Modules
Organize code by domain/module boundaries consistent with `../modules/`. Shared utilities must be genuinely cross-cutting; avoid a dumping-ground `utils` layer that bypasses domain ownership.

## Naming
- Use project terminology exactly: `Super Admin`, `Consultant`, `Tenant Admin`, `Employee`, `New Hire`.
- Lifecycle enum values use canonical names from `../reference/status-enums.md`.
- Permissions use dotted canonical keys from `../security/permissions-catalog.md`.
- API paths are under `/api/v1/`.

## Types and Validation
Use strong static types where the chosen stack supports them. External input is untrusted and validated at the API boundary/domain service. Persistence entities are not automatically safe response DTOs.

## Error Handling
Use stable domain/application error codes mapped centrally to HTTP errors. Do not throw raw database/storage errors to clients.

## Async/Concurrency
Await all promises intentionally. Use `Promise.allSettled()` for independent partial-failure-friendly work. Do not use it for dependent or atomic steps. Avoid unbounded per-row parallel requests.

## Database
- All schema changes via migrations.
- Parameterized/ORM-safe queries.
- Tenant scope explicit.
- Avoid N+1.
- Transactions for invariants.
- Do not query DB from UI/controller.

## Security
- Never trust client tenant ID.
- Never log secrets.
- Apply least privilege.
- File paths/keys opaque.
- Authorization in server policy/service, not only UI.
- Audit sensitive access.

## Frontend
- Accessible semantic components.
- Central API client.
- No direct storage/database credentials.
- Server remains authority for permissions/business validation.
- Handle loading/empty/error states.

## Testing
Meaningful feature changes include tests at appropriate layers, including negative tenant/authorization cases.

## Documentation
If implementation intentionally diverges from a documented architectural choice, update relevant documentation/ADR in the same change before completion.
