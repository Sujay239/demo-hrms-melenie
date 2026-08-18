# CI/CD Specification

## Purpose
Define mandatory automated quality gates and safe release behavior.

## Pull Request Pipeline
Expected gates:
1. dependency install from lockfile;
2. formatting/lint checks;
3. static/type checks for chosen stack;
4. unit tests;
5. build;
6. integration tests with migrated disposable database;
7. security/dependency scanning;
8. migration validation;
9. documentation link/consistency checks where automated;
10. selected E2E smoke suite where practical.

## Main/Release Pipeline
- repeat trusted build/tests rather than promote unverified local output;
- produce immutable/versioned artifacts;
- deploy to staging;
- run E2E/smoke;
- require production approval policy appropriate to organization;
- deploy production;
- run post-deploy health/smoke;
- monitor and retain rollback path.

## Security
- CI secrets are scoped per environment.
- Untrusted pull requests cannot access production secrets.
- Build logs redact credentials.
- Dependency lockfiles are reviewed/source-controlled.
- Critical dependency/security findings block release according to agreed severity policy.

## Database Migrations
CI tests forward migration from a clean database and, for release migrations, from representative previous schema state where feasible. Production migrations are never handcrafted outside version control.

## Documentation Gate
Behavior-changing work updates the relevant Markdown docs and ADR when an architectural decision changes.

## Branch Protection
Require successful checks and review for protected branches. Direct production changes outside the pipeline are exceptional, logged, and followed by repository reconciliation.

## Related Documents
- `../engineering/git-workflow.md`
- `../10-definition-of-done.md`
