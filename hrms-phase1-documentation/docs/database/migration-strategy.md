# Migration and Seed Strategy

## Purpose

Define safe schema evolution and environment initialization for the multi-database architecture.

## Per-Database Migration Versioning

Each of the 5 databases has its own **independent migration version sequence**:

| Database | Migration Prefix | Example |
|---|---|---|
| DB-CORE | `core_` | `core_001_create_users.sql`, `core_002_create_tenants.sql` |
| DB-HR | `hr_` | `hr_001_create_regions.sql`, `hr_002_create_departments.sql` |
| DB-DOCS | `docs_` | `docs_001_create_file_storage_references.sql`, `docs_002_create_documents.sql` |
| DB-OPS | `ops_` | `ops_001_create_leave_types.sql`, `ops_002_create_attendance_records.sql` |
| DB-AUDIT | `audit_` | `audit_001_create_audit_logs.sql`, `audit_002_create_platform_tickets.sql` |

Each database tracks its own migration version table (e.g., `schema_migrations` within each database).

## Migration Rules

- Every schema change has an ordered version-controlled migration.
- Deployed migrations are immutable; corrections use new migrations.
- Use expand/migrate/contract for risky incompatible changes when needed.
- Production manual DDL is prohibited as normal workflow.
- Large data backfills are restartable/idempotent and tenant-safe.

## Cross-Database Migration Coordination

When a feature requires schema changes in multiple databases:

1. **Order by dependency**: DB-CORE migrations run first (identity/auth tables), then DB-HR, then DB-DOCS, then DB-OPS, then DB-AUDIT.
2. **No cross-DB FK constraints**: Migrations never create FK constraints across databases. Cross-DB references are UUID columns with comments noting the target.
3. **Atomic per database**: Each migration is atomic within its database. Cross-database migrations are NOT atomic — application code handles partial-migration states gracefully.
4. **Version coordination file**: Maintain a `migration_manifest.md` or `migration_order.json` that lists which database migrations should be applied together for a feature.

### Example Cross-Database Feature: "Platform Tickets"

```text
1. core_015_add_platform_ticket_permissions.sql  (DB-CORE: add new permissions)
2. audit_003_create_platform_tickets.sql         (DB-AUDIT: create ticket tables)
3. docs_005_platform_ticket_attachments.sql       (DB-DOCS: optional attachment support)
```

Apply in order. If step 2 fails, step 1 is already committed. Application code checks for table existence before using platform ticket features.

## Seeds

### Platform Seeds (DB-CORE)
- Canonical permissions catalog (all permission codes).
- Default role bundles (SUPER_ADMIN, CONSULTANT, TENANT_ADMIN, EMPLOYEE, NEW_HIRE).
- Default role-permission mappings.
- Default subscription plans (if applicable).

### Non-Production Seeds
- Demo tenants with demo tenant_settings.
- Demo users with role assignments.
- Sample reference data for testing.
- **Never** seed known default production passwords.

### Per-Database Seed Scripts
| Database | Seed Content |
|---|---|
| DB-CORE | Permissions, roles, role-permissions, subscription plans, initial Super Admin |
| DB-HR | (Non-prod only) Demo regions, departments, designations |
| DB-DOCS | (No seeds) |
| DB-OPS | (Non-prod only) Demo leave types, ticket categories |
| DB-AUDIT | (No seeds) |

## Rollback/Recovery

### Per-Database
- Before destructive migrations, document rollback versus roll-forward and backup/restore dependence.
- Each database has its own backup schedule and retention.
- Backup frequency by criticality:
  - DB-CORE: Every 1 hour (identity data)
  - DB-HR: Every 6 hours (employee data)
  - DB-DOCS: Every 6 hours (document metadata — binary files backed up via S3 versioning)
  - DB-OPS: Every 6 hours (operational data)
  - DB-AUDIT: Every 24 hours (append-only, loss is non-critical since events can be replayed)

### Cross-Database Recovery
- If DB-CORE is restored from backup, other databases may have references to entities that no longer exist in DB-CORE. The consistency check background job detects and reports orphaned references.
- DB-DOCS backup includes `file_storage_references` metadata but NOT the actual S3 objects (backed up via S3 versioning/cross-region replication).

## Database Creation Scripts

For initial environment setup, provide per-database creation scripts:

```sql
-- DB-CORE
CREATE DATABASE hrms_core;

-- DB-HR
CREATE DATABASE hrms_hr;

-- DB-DOCS
CREATE DATABASE hrms_docs;

-- DB-OPS
CREATE DATABASE hrms_ops;

-- DB-AUDIT
CREATE DATABASE hrms_audit;
```

Each database has its own connection string, credentials (from secret manager), and migration runner configuration.
