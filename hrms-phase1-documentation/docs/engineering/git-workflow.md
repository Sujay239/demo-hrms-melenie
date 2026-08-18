# Git Workflow

## Purpose
Define a reviewable, auditable change process for the HRMS implementation.

## Branching
Use short-lived feature/fix branches from the protected main integration branch unless the organization adopts an equivalent trunk-based model. Long-lived divergent branches are discouraged.

## Change Size
Prefer one coherent feature/sub-phase per pull request. Separate mass refactors from behavior changes where possible so security and tenant-isolation review remains tractable.

## Commit Guidance
Commits should be understandable and avoid generated/noise changes. Never commit secrets, production data, uploaded HR documents, local databases, or credential dumps.

## Pull Request Requirements
Describe:
- requirement/story IDs;
- modules changed;
- API/schema impact;
- tenant-isolation impact;
- security impact;
- tests run;
- documentation updated;
- migration/deployment considerations.

## Reviews
Security-sensitive areas (authentication, authorization, multi-tenancy, document access, audit, migrations) require deliberate review rather than relying only on automated tests.

## Protected Branch
Require CI gates from `../devops/ci-cd.md`. Avoid direct pushes except documented emergency procedure.

## Database Changes
Migration file and schema documentation change in the same PR. Never alter production schema manually and leave source history inconsistent.

## API Changes
Breaking changes cannot silently modify `/api/v1/`; follow API version/deprecation ADR.

## Documentation
`agent.md`, SRS, API/module/database/security docs remain source of truth and change with behavior.
