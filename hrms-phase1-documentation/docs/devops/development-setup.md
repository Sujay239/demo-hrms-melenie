# Local Development Setup Specification

## Purpose
Define the required developer experience without providing implementation files.

## Required Local Capabilities
The implementation repository must provide a documented, repeatable way to start:
- frontend application;
- backend API;
- relational database;
- private-file storage dependency or safe local substitute;
- any required queue/cache dependency introduced by an approved ADR;
- test services.

## Setup Workflow
1. Install the repository-pinned runtime/package-manager versions.
2. Copy the committed environment-variable example to a local untracked file.
3. Start dependencies through the approved local orchestration mechanism.
4. Apply database migrations.
5. Seed only development-safe reference/test data.
6. Start backend and frontend.
7. Run health checks.
8. Run lint/type/unit/integration smoke checks.

## Requirements
- One documented command or short sequence should reach a usable local environment.
- Runtime/package versions are pinned or constrained reproducibly.
- No developer needs production credentials.
- Development email/reset flows use safe local/test delivery.
- Development storage is isolated from production.
- Seed users must use clearly non-production credentials and never ship as production defaults.
- Local HTTPS may be used where authentication behavior requires Secure-cookie realism; document it if selected.

## Repository Hygiene
Generated artifacts, secrets, local DB files, and uploads are ignored appropriately. Migrations and seed definitions are source-controlled.

## Related Documents
- `environment.md`
- `docker.md`
- `../database/migration-strategy.md`
