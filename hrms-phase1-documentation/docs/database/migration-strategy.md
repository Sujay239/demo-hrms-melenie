# Migration and Seed Strategy

## Purpose
Define safe schema evolution and environment initialization.

## Migrations
- Every schema change has an ordered version-controlled migration.
- Deployed migrations are immutable; corrections use new migrations.
- Use expand/migrate/contract for risky incompatible changes when needed.
- Production manual DDL is prohibited as normal workflow.
- Large data backfills are restartable/idempotent and tenant-safe.

## Seeds
Seed canonical permissions and role bundles. Non-production may seed demo tenants/reference data. Never seed known default production passwords.

## Rollback/recovery
Before destructive migrations, document rollback versus roll-forward and backup/restore dependence.
