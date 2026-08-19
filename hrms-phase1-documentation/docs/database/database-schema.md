# Database Schema Specification

## Purpose

Define the complete, production-grade logical schema for the HRMS platform. Every table includes column name, data type, nullability, default value, constraints, and relationships. This document is the single source of truth for AI-agent-driven migration generation.

## Multi-Database Architecture

The schema is split across **5 independent databases** for fault isolation. Failure of one database does not cascade to unrelated modules.

| Database | Purpose | Failure Impact |
|---|---|---|
| **DB-CORE** | Identity, authentication, tenants, RBAC | Login/auth only — HR operations use cached tenant context |
| **DB-HR** | Organization, employees, onboarding | Employee/onboarding only — attendance, leave continue with cached refs |
| **DB-DOCS** | Documents, file storage metadata, access tokens | Document access only — core HR operations unaffected |
| **DB-OPS** | Leave, attendance, KB, announcements, tickets, facilities, notifications | Operational modules only — login, employees, documents unaffected |
| **DB-AUDIT** | Audit logs, platform tickets | Audit/platform tickets only — all business operations continue |

### Cross-Database Reference Convention

Tables in different databases **cannot** use SQL foreign key constraints. Instead:
- Store the referenced UUID column (e.g., `tenant_id`, `employee_id`) as a plain `UUID NOT NULL` column.
- The **service layer** validates referential integrity before write operations.
- Column names and comments explicitly note: `-- CROSS-DB REF: DB-CORE.tenants.id`.
- Within the same database, normal FK constraints apply.

### Common Column Patterns

Unless stated otherwise, every table includes:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | Primary key |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Row creation time (UTC) |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Last modification time (UTC) |

Selected tables also include:

| Column | Type | Notes |
|---|---|---|
| `created_by` | `UUID` | Actor who created the record. CROSS-DB REF to `users.id` where applicable |
| `updated_by` | `UUID` | Actor who last modified the record |
| `deleted_at` | `TIMESTAMPTZ` | Soft-delete timestamp. NULL = active. Only on tables requiring retention/recovery |

---

## DB-CORE — Identity & Platform

### `users`

Platform-wide login identity. Not tenant-specific — a user may belong to multiple tenants via memberships.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `email` | `VARCHAR(255)` | NO | | UNIQUE | Login identifier. Lowercase-normalized |
| `password_hash` | `VARCHAR(255)` | NO | | | Adaptive hash (bcrypt/argon2). Never logged/exposed |
| `first_name` | `VARCHAR(100)` | NO | | | |
| `last_name` | `VARCHAR(100)` | NO | | | |
| `phone` | `VARCHAR(20)` | YES | | | E.164 format preferred |
| `avatar_storage_ref_id` | `UUID` | YES | | FK → `DB-DOCS.file_storage_references.id` (CROSS-DB) | Profile avatar file reference |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`, `'PENDING_ACTIVATION'`) | Account lifecycle state |
| `last_login_at` | `TIMESTAMPTZ` | YES | | | Last successful authentication |
| `failed_login_attempts` | `INTEGER` | NO | `0` | CHECK >= 0 | Lockout tracking |
| `locked_until` | `TIMESTAMPTZ` | YES | | | Account lockout expiry |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `tenants`

A company/organization in the platform. Isolation root for all tenant-owned data.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Tenant isolation key. Propagated to all tenant-owned tables |
| `name` | `VARCHAR(200)` | NO | | | Company display name |
| `slug` | `VARCHAR(100)` | NO | | UNIQUE | URL-safe identifier. Lowercase, alphanumeric + hyphens |
| `domain` | `VARCHAR(255)` | YES | | UNIQUE | Custom domain for tenant portal (optional) |
| `logo_storage_ref_id` | `UUID` | YES | | CROSS-DB REF → `DB-DOCS.file_storage_references.id` | Company logo file reference |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`, `'PENDING_SETUP'`) | Tenant lifecycle state |
| `subscription_plan_id` | `UUID` | YES | | FK → `tenant_subscription_plans.id` | Current plan/tier |
| `industry` | `VARCHAR(100)` | YES | | | Industry classification |
| `company_size` | `VARCHAR(20)` | YES | | CHECK IN (`'1-10'`, `'11-50'`, `'51-200'`, `'201-500'`, `'501-1000'`, `'1000+'`) | |
| `registration_number` | `VARCHAR(100)` | YES | | | Government registration/incorporation number |
| `tax_id` | `VARCHAR(100)` | YES | | | Tax identification number |
| `website` | `VARCHAR(500)` | YES | | | Company website URL |
| `address_line_1` | `VARCHAR(255)` | YES | | | Registered address |
| `address_line_2` | `VARCHAR(255)` | YES | | | |
| `city` | `VARCHAR(100)` | YES | | | |
| `state_province` | `VARCHAR(100)` | YES | | | |
| `postal_code` | `VARCHAR(20)` | YES | | | |
| `country_code` | `CHAR(2)` | YES | | | ISO 3166-1 alpha-2 |
| `primary_contact_name` | `VARCHAR(200)` | YES | | | Primary contact for the company |
| `primary_contact_email` | `VARCHAR(255)` | YES | | | |
| `primary_contact_phone` | `VARCHAR(20)` | YES | | | E.164 format |
| `activated_at` | `TIMESTAMPTZ` | YES | | | When tenant was first activated |
| `deactivated_at` | `TIMESTAMPTZ` | YES | | | When tenant was last deactivated |
| `created_by` | `UUID` | NO | | CROSS-DB REF → `users.id` | Super Admin who created |
| `updated_by` | `UUID` | YES | | CROSS-DB REF → `users.id` | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `tenant_settings`

Per-tenant configuration. Exactly one row per tenant. Controls operational behavior for that company.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | FK → `tenants.id`, UNIQUE | One settings row per tenant |
| `timezone` | `VARCHAR(50)` | NO | `'UTC'` | | IANA timezone (e.g., `Asia/Kolkata`) |
| `date_format` | `VARCHAR(20)` | NO | `'YYYY-MM-DD'` | CHECK IN (`'YYYY-MM-DD'`, `'DD/MM/YYYY'`, `'MM/DD/YYYY'`, `'DD-MM-YYYY'`) | Display date format |
| `time_format` | `VARCHAR(5)` | NO | `'24h'` | CHECK IN (`'12h'`, `'24h'`) | |
| `currency_code` | `CHAR(3)` | NO | `'INR'` | | ISO 4217 currency |
| `fiscal_year_start_month` | `SMALLINT` | NO | `4` | CHECK BETWEEN 1 AND 12 | 1=Jan, 4=Apr (India default) |
| `leave_year_start_month` | `SMALLINT` | NO | `1` | CHECK BETWEEN 1 AND 12 | When leave balances reset |
| `work_week_start_day` | `SMALLINT` | NO | `1` | CHECK BETWEEN 0 AND 6 | 0=Sun, 1=Mon |
| `default_work_hours_per_day` | `DECIMAL(4,2)` | NO | `8.00` | CHECK > 0 AND <= 24 | |
| `default_work_days_per_week` | `SMALLINT` | NO | `5` | CHECK BETWEEN 1 AND 7 | |
| `probation_period_days` | `INTEGER` | YES | | CHECK >= 0 | Default probation period for new employees |
| `notice_period_days` | `INTEGER` | YES | | CHECK >= 0 | Default notice period |
| `max_file_upload_size_mb` | `INTEGER` | NO | `10` | CHECK > 0 AND <= 100 | Per-file upload limit |
| `allowed_file_types` | `TEXT[]` | NO | `'{pdf,jpg,jpeg,png,doc,docx,xls,xlsx}'` | | Array of allowed extensions |
| `employee_id_prefix` | `VARCHAR(10)` | YES | | | Auto-generated employee code prefix (e.g., `EMP`) |
| `employee_id_sequence_start` | `INTEGER` | NO | `1` | CHECK >= 1 | Starting sequence number for employee IDs |
| `enable_overtime` | `BOOLEAN` | NO | `true` | | Whether overtime module is enabled |
| `enable_flexible_holidays` | `BOOLEAN` | NO | `true` | | Whether flexible holiday selection is enabled |
| `enable_meeting_rooms` | `BOOLEAN` | NO | `true` | | Whether facilities module is enabled |
| `updated_by` | `UUID` | YES | | CROSS-DB REF → `users.id` | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `tenant_subscription_plans`

Platform-managed subscription tiers. Referenced by tenants.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `name` | `VARCHAR(100)` | NO | | UNIQUE | Plan display name (e.g., `Starter`, `Professional`, `Enterprise`) |
| `code` | `VARCHAR(50)` | NO | | UNIQUE | Machine identifier (e.g., `starter`, `pro`, `enterprise`) |
| `max_employees` | `INTEGER` | YES | | CHECK > 0 | NULL = unlimited |
| `max_storage_gb` | `INTEGER` | YES | | CHECK > 0 | NULL = unlimited |
| `max_departments` | `INTEGER` | YES | | CHECK > 0 | NULL = unlimited |
| `features` | `JSONB` | NO | `'{}'` | | Feature flags: `{"overtime": true, "kb": true, "meeting_rooms": true}` |
| `is_active` | `BOOLEAN` | NO | `true` | | Whether plan is available for new assignments |
| `sort_order` | `SMALLINT` | NO | `0` | | Display ordering |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `tenant_user_memberships`

Links a user to a tenant with a specific role scope. One user can belong to multiple tenants.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | FK → `tenants.id` | |
| `user_id` | `UUID` | NO | | FK → `users.id` | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`, `'SUSPENDED'`) | Membership lifecycle |
| `joined_at` | `TIMESTAMPTZ` | NO | `now()` | | When user was added to tenant |
| `deactivated_at` | `TIMESTAMPTZ` | YES | | | When membership was deactivated |
| `created_by` | `UUID` | YES | | FK → `users.id` | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, user_id)` — one membership per user per tenant.

---

### `roles`

Platform-defined role catalog. Roles bundle permissions.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `name` | `VARCHAR(50)` | NO | | UNIQUE | Machine name: `SUPER_ADMIN`, `CONSULTANT`, `TENANT_ADMIN`, `EMPLOYEE`, `NEW_HIRE` |
| `display_name` | `VARCHAR(100)` | NO | | | Human-readable name |
| `description` | `TEXT` | YES | | | Role description |
| `scope` | `VARCHAR(20)` | NO | | CHECK IN (`'PLATFORM'`, `'TENANT'`) | Whether role operates at platform or tenant level |
| `is_system` | `BOOLEAN` | NO | `true` | | System roles cannot be deleted |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `permissions`

Granular permission catalog. Format: `resource.action`.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `code` | `VARCHAR(100)` | NO | | UNIQUE | Permission code: `employee.view`, `document.upload`, etc. |
| `resource` | `VARCHAR(50)` | NO | | | Resource group: `employee`, `document`, `leave`, etc. |
| `action` | `VARCHAR(50)` | NO | | | Action: `view`, `create`, `update`, `delete`, `manage`, etc. |
| `description` | `TEXT` | YES | | | Human-readable description |
| `scope` | `VARCHAR(20)` | NO | | CHECK IN (`'PLATFORM'`, `'TENANT'`) | Platform permissions cannot be tenant-delegated |
| `is_tenant_delegable` | `BOOLEAN` | NO | `false` | | Whether Tenant Admin can assign this permission |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `role_permissions`

Maps roles to permissions (many-to-many).

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `role_id` | `UUID` | NO | | FK → `roles.id` ON DELETE CASCADE | |
| `permission_id` | `UUID` | NO | | FK → `permissions.id` ON DELETE CASCADE | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(role_id, permission_id)`.

---

### `user_role_assignments`

Assigns roles to users within a tenant context (or platform-wide for super admin).

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `user_id` | `UUID` | NO | | FK → `users.id` ON DELETE CASCADE | |
| `role_id` | `UUID` | NO | | FK → `roles.id` | |
| `tenant_id` | `UUID` | YES | | FK → `tenants.id` | NULL for platform-scoped roles (SUPER_ADMIN) |
| `assigned_by` | `UUID` | YES | | FK → `users.id` | Who assigned this role |
| `assigned_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(user_id, role_id, tenant_id)` — prevents duplicate role assignment in same tenant.

---

### `consultants`

Consultant identity/profile. Platform-managed.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `user_id` | `UUID` | NO | | FK → `users.id`, UNIQUE | One consultant profile per user |
| `specialization` | `VARCHAR(200)` | YES | | | Area of expertise |
| `company_name` | `VARCHAR(200)` | YES | | | Consulting firm name |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `notes` | `TEXT` | YES | | | Internal notes (platform admin only) |
| `created_by` | `UUID` | YES | | FK → `users.id` | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `consultant_tenant_assignments`

Active tenant access grants for consultants. Assignment alone does not grant domain permissions — role/permission checks still apply.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `consultant_id` | `UUID` | NO | | FK → `consultants.id` ON DELETE CASCADE | |
| `tenant_id` | `UUID` | NO | | FK → `tenants.id` | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`, `'REVOKED'`) | |
| `assigned_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `revoked_at` | `TIMESTAMPTZ` | YES | | | When assignment was revoked |
| `assigned_by` | `UUID` | YES | | FK → `users.id` | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(consultant_id, tenant_id)` — one assignment per consultant per tenant.

---

### `auth_sessions`

Active user sessions. Implementation-specific to chosen auth strategy (server sessions, JWT, etc.).

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Session identifier |
| `user_id` | `UUID` | NO | | FK → `users.id` ON DELETE CASCADE | |
| `token_hash` | `VARCHAR(255)` | NO | | UNIQUE | Hashed session/access token. Never store plaintext |
| `ip_address` | `INET` | YES | | | Client IP at session creation |
| `user_agent` | `VARCHAR(500)` | YES | | | Sanitized user-agent string |
| `expires_at` | `TIMESTAMPTZ` | NO | | | Session expiry. Enforced on every request |
| `revoked_at` | `TIMESTAMPTZ` | YES | | | Explicit revocation (logout, admin action) |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `auth_refresh_tokens`

Refresh tokens for session renewal (if using access/refresh token strategy).

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `user_id` | `UUID` | NO | | FK → `users.id` ON DELETE CASCADE | |
| `session_id` | `UUID` | YES | | FK → `auth_sessions.id` ON DELETE CASCADE | Linked session |
| `token_hash` | `VARCHAR(255)` | NO | | UNIQUE | Hashed refresh token |
| `expires_at` | `TIMESTAMPTZ` | NO | | | |
| `used_at` | `TIMESTAMPTZ` | YES | | | When token was consumed for rotation |
| `revoked_at` | `TIMESTAMPTZ` | YES | | | |
| `replaced_by_id` | `UUID` | YES | | FK → `auth_refresh_tokens.id` | Token rotation chain |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `password_reset_tokens`

Short-lived single-use password reset secrets.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `user_id` | `UUID` | NO | | FK → `users.id` ON DELETE CASCADE | |
| `token_hash` | `VARCHAR(255)` | NO | | UNIQUE | Hashed reset token |
| `expires_at` | `TIMESTAMPTZ` | NO | | | Short-lived: 15–60 minutes |
| `used_at` | `TIMESTAMPTZ` | YES | | | NULL = unused. Non-null = consumed |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `account_activations`

Account activation/invitation records.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `user_id` | `UUID` | NO | | FK → `users.id` ON DELETE CASCADE | |
| `token_hash` | `VARCHAR(255)` | NO | | UNIQUE | Hashed activation token |
| `expires_at` | `TIMESTAMPTZ` | NO | | | |
| `activated_at` | `TIMESTAMPTZ` | YES | | | When user completed activation |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

## DB-HR — Organization & Workforce

All tables in DB-HR store `tenant_id` as a plain UUID column. **No FK constraint to `DB-CORE.tenants`** — the service layer validates tenant existence before writes. Within DB-HR, FK constraints between HR tables are enforced normally.

### `regions`

Geographic regions for a tenant. Used by employees, holidays, leave policies.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | Tenant isolation key |
| `name` | `VARCHAR(100)` | NO | | | Region display name |
| `country_code` | `CHAR(2)` | NO | | | ISO 3166-1 alpha-2 |
| `timezone` | `VARCHAR(50)` | NO | | | IANA timezone (e.g., `Asia/Kolkata`, `America/New_York`) |
| `locale` | `VARCHAR(10)` | YES | `'en'` | | BCP 47 language tag |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `description` | `TEXT` | YES | | | |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, name)` — no duplicate region names within tenant.

---

### `departments`

Organizational departments with optional hierarchy.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | |
| `code` | `VARCHAR(20)` | YES | | | Short code (e.g., `ENG`, `HR`, `FIN`) |
| `description` | `TEXT` | YES | | | |
| `parent_department_id` | `UUID` | YES | | FK → `departments.id` | Hierarchical parent. NULL = root department |
| `head_employee_id` | `UUID` | YES | | FK → `employees.id` | Department head |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `sort_order` | `SMALLINT` | NO | `0` | | Display ordering |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, name)`.
**Invariant**: `parent_department_id` must reference a department in the same `tenant_id`. Service layer validates acyclic hierarchy.

---

### `designations`

Job titles/designations managed per tenant.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | Designation title |
| `description` | `TEXT` | YES | | | |
| `department_id` | `UUID` | YES | | FK → `departments.id` | Optional department association |
| `level` | `SMALLINT` | YES | | | Seniority level (1 = entry, higher = senior) |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, name)`.

---

### `employees`

Active workforce record. Core HR entity.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | Linked login account |
| `employee_code` | `VARCHAR(30)` | NO | | | Tenant-unique employee ID (e.g., `EMP001`) |
| `first_name` | `VARCHAR(100)` | NO | | | |
| `last_name` | `VARCHAR(100)` | NO | | | |
| `email` | `VARCHAR(255)` | NO | | | Work email |
| `personal_email` | `VARCHAR(255)` | YES | | | |
| `phone` | `VARCHAR(20)` | YES | | | |
| `date_of_birth` | `DATE` | YES | | | |
| `gender` | `VARCHAR(20)` | YES | | CHECK IN (`'MALE'`, `'FEMALE'`, `'NON_BINARY'`, `'PREFER_NOT_TO_SAY'`) | |
| `marital_status` | `VARCHAR(20)` | YES | | CHECK IN (`'SINGLE'`, `'MARRIED'`, `'DIVORCED'`, `'WIDOWED'`, `'OTHER'`) | |
| `nationality` | `CHAR(2)` | YES | | | ISO 3166-1 alpha-2 |
| `department_id` | `UUID` | YES | | FK → `departments.id` | Must be same tenant |
| `designation_id` | `UUID` | YES | | FK → `designations.id` | Must be same tenant |
| `region_id` | `UUID` | YES | | FK → `regions.id` | Must be same tenant |
| `manager_employee_id` | `UUID` | YES | | FK → `employees.id` | Reporting manager. Must be same tenant. Cannot self-reference |
| `joining_date` | `DATE` | NO | | | |
| `confirmation_date` | `DATE` | YES | | | Probation confirmation date |
| `employment_type` | `VARCHAR(20)` | NO | `'FULL_TIME'` | CHECK IN (`'FULL_TIME'`, `'PART_TIME'`, `'CONTRACT'`, `'INTERN'`) | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'ON_NOTICE'`, `'INACTIVE'`, `'TERMINATED'`, `'ARCHIVED'`) | |
| `termination_date` | `DATE` | YES | | | |
| `termination_reason` | `TEXT` | YES | | | |
| `address_line_1` | `VARCHAR(255)` | YES | | | Current address |
| `address_line_2` | `VARCHAR(255)` | YES | | | |
| `city` | `VARCHAR(100)` | YES | | | |
| `state_province` | `VARCHAR(100)` | YES | | | |
| `postal_code` | `VARCHAR(20)` | YES | | | |
| `country_code` | `CHAR(2)` | YES | | | |
| `profile_image_storage_ref_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.file_storage_references.id | Profile photo |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `updated_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, employee_code)`.
**Check constraint**: `manager_employee_id != id` (no self-manager).
**Invariant**: `department_id`, `designation_id`, `region_id`, `manager_employee_id` must all reference records with the same `tenant_id`. Service layer validates acyclic manager hierarchy.

---

### `employee_bank_details`

Bank account information. Encrypted sensitive data.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | FK → `employees.id` ON DELETE CASCADE | |
| `bank_name` | `VARCHAR(200)` | NO | | | |
| `branch_name` | `VARCHAR(200)` | YES | | | |
| `account_number_encrypted` | `TEXT` | NO | | | AES-256 encrypted. Key ref in application config |
| `account_type` | `VARCHAR(20)` | NO | | CHECK IN (`'SAVINGS'`, `'CURRENT'`, `'SALARY'`) | |
| `ifsc_code` | `VARCHAR(20)` | YES | | | India IFSC / international equivalent |
| `swift_code` | `VARCHAR(15)` | YES | | | |
| `iban` | `VARCHAR(34)` | YES | | | International bank account number |
| `is_primary` | `BOOLEAN` | NO | `true` | | Primary salary account |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `employee_emergency_contacts`

Emergency contact records per employee.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | FK → `employees.id` ON DELETE CASCADE | |
| `contact_name` | `VARCHAR(200)` | NO | | | |
| `relationship` | `VARCHAR(50)` | NO | | | e.g., `Spouse`, `Parent`, `Sibling` |
| `phone` | `VARCHAR(20)` | NO | | | E.164 format |
| `email` | `VARCHAR(255)` | YES | | | |
| `address` | `TEXT` | YES | | | |
| `is_primary` | `BOOLEAN` | NO | `false` | | Primary emergency contact |
| `sort_order` | `SMALLINT` | NO | `0` | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `employee_work_history`

Previous employment records.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | FK → `employees.id` ON DELETE CASCADE | |
| `company_name` | `VARCHAR(200)` | NO | | | Previous employer |
| `designation` | `VARCHAR(100)` | YES | | | Job title at previous employer |
| `start_date` | `DATE` | NO | | | |
| `end_date` | `DATE` | YES | | | NULL = current/last |
| `reason_for_leaving` | `TEXT` | YES | | | |
| `reference_contact` | `VARCHAR(200)` | YES | | | Reference person name |
| `reference_phone` | `VARCHAR(20)` | YES | | | |
| `verification_status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'VERIFIED'`, `'FAILED'`) | |
| `verified_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `verified_at` | `TIMESTAMPTZ` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Check constraint**: `end_date IS NULL OR end_date >= start_date`.

---

### `employee_education`

Education qualification records.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | FK → `employees.id` ON DELETE CASCADE | |
| `institution_name` | `VARCHAR(200)` | NO | | | |
| `degree` | `VARCHAR(100)` | NO | | | e.g., `B.Tech`, `MBA`, `PhD` |
| `field_of_study` | `VARCHAR(100)` | YES | | | e.g., `Computer Science`, `Finance` |
| `grade` | `VARCHAR(20)` | YES | | | GPA/percentage/class |
| `start_year` | `SMALLINT` | YES | | CHECK BETWEEN 1950 AND 2100 | |
| `end_year` | `SMALLINT` | YES | | CHECK BETWEEN 1950 AND 2100 | |
| `is_highest` | `BOOLEAN` | NO | `false` | | Highest qualification flag |
| `certificate_storage_ref_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.file_storage_references.id | Uploaded certificate |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `employee_skills`

Skills, certifications, and competencies.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | FK → `employees.id` ON DELETE CASCADE | |
| `skill_name` | `VARCHAR(100)` | NO | | | |
| `proficiency` | `VARCHAR(20)` | YES | | CHECK IN (`'BEGINNER'`, `'INTERMEDIATE'`, `'ADVANCED'`, `'EXPERT'`) | |
| `is_certification` | `BOOLEAN` | NO | `false` | | Whether this is a formal certification |
| `certification_authority` | `VARCHAR(200)` | YES | | | Issuing organization |
| `certification_number` | `VARCHAR(100)` | YES | | | Certificate number |
| `issued_date` | `DATE` | YES | | | |
| `expiry_date` | `DATE` | YES | | | NULL = no expiry |
| `certificate_storage_ref_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.file_storage_references.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `tenant_custom_fields`

Tenant-defined custom fields for employee profiles. Allows each company to extend employee data without schema changes.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `field_name` | `VARCHAR(100)` | NO | | | Display label |
| `field_key` | `VARCHAR(50)` | NO | | | Machine key (snake_case) |
| `field_type` | `VARCHAR(20)` | NO | | CHECK IN (`'TEXT'`, `'NUMBER'`, `'DATE'`, `'BOOLEAN'`, `'SELECT'`, `'MULTI_SELECT'`) | |
| `options` | `JSONB` | YES | | | For SELECT/MULTI_SELECT: `["Option1", "Option2"]` |
| `is_required` | `BOOLEAN` | NO | `false` | | |
| `is_visible_to_employee` | `BOOLEAN` | NO | `true` | | Whether employee can see this field on their profile |
| `sort_order` | `SMALLINT` | NO | `0` | | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, field_key)`.

---

### `employee_custom_field_values`

Values for tenant-defined custom fields.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | FK → `employees.id` ON DELETE CASCADE | |
| `custom_field_id` | `UUID` | NO | | FK → `tenant_custom_fields.id` | |
| `value_text` | `TEXT` | YES | | | Stores TEXT, NUMBER (as string), DATE (ISO), BOOLEAN (`true`/`false`) |
| `value_json` | `JSONB` | YES | | | Stores MULTI_SELECT arrays |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(employee_id, custom_field_id)` — one value per field per employee.

---

### `employee_groups`

Logical grouping of employees for leave policies, announcements, etc.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | |
| `description` | `TEXT` | YES | | | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, name)`.

---

### `employee_group_memberships`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `employee_group_id` | `UUID` | NO | | FK → `employee_groups.id` ON DELETE CASCADE | |
| `employee_id` | `UUID` | NO | | FK → `employees.id` ON DELETE CASCADE | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(employee_group_id, employee_id)`.

---

### `new_hires`

Pre-employment onboarding record. NOT an employee — conversion is explicit.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | Login account for onboarding portal |
| `first_name` | `VARCHAR(100)` | NO | | | |
| `last_name` | `VARCHAR(100)` | NO | | | |
| `email` | `VARCHAR(255)` | NO | | | |
| `phone` | `VARCHAR(20)` | YES | | | |
| `designated_department_id` | `UUID` | YES | | FK → `departments.id` | Planned department |
| `designated_designation_id` | `UUID` | YES | | FK → `designations.id` | Planned designation |
| `designated_region_id` | `UUID` | YES | | FK → `regions.id` | Planned region |
| `designated_manager_id` | `UUID` | YES | | FK → `employees.id` | Planned reporting manager |
| `expected_joining_date` | `DATE` | YES | | | |
| `status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'CONVERTED'`, `'WITHDRAWN'`, `'REJECTED'`) | |
| `converted_employee_id` | `UUID` | YES | | FK → `employees.id` | Set when new hire → employee conversion completes |
| `converted_at` | `TIMESTAMPTZ` | YES | | | |
| `fun_fact` | `TEXT` | YES | | | "Fun fact about you" |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `onboarding_cases`

One case per new hire. Tracks overall onboarding progress.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `new_hire_id` | `UUID` | NO | | FK → `new_hires.id`, UNIQUE | One case per new hire |
| `assigned_hr_user_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | HR person managing onboarding |
| `status` | `VARCHAR(20)` | NO | `'OPEN'` | CHECK IN (`'OPEN'`, `'IN_PROGRESS'`, `'PENDING_VERIFICATION'`, `'COMPLETED'`, `'CANCELLED'`) | |
| `completion_percentage` | `SMALLINT` | NO | `0` | CHECK BETWEEN 0 AND 100 | Calculated from task completion |
| `notes` | `TEXT` | YES | | | Internal HR notes |
| `started_at` | `TIMESTAMPTZ` | YES | | | |
| `completed_at` | `TIMESTAMPTZ` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `onboarding_tasks`

Individual tasks within an onboarding case.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `onboarding_case_id` | `UUID` | NO | | FK → `onboarding_cases.id` ON DELETE CASCADE | |
| `title` | `VARCHAR(200)` | NO | | | Task name |
| `description` | `TEXT` | YES | | | |
| `task_type` | `VARCHAR(30)` | NO | | CHECK IN (`'DOCUMENT_UPLOAD'`, `'FORM_FILL'`, `'ACKNOWLEDGEMENT'`, `'REVIEW'`, `'CUSTOM'`) | |
| `is_required` | `BOOLEAN` | NO | `true` | | |
| `status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'IN_PROGRESS'`, `'SUBMITTED'`, `'VERIFIED'`, `'REJECTED'`, `'SKIPPED'`) | |
| `sort_order` | `SMALLINT` | NO | `0` | | |
| `due_date` | `DATE` | YES | | | |
| `completed_at` | `TIMESTAMPTZ` | YES | | | |
| `verified_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | HR who verified |
| `verified_at` | `TIMESTAMPTZ` | YES | | | |
| `rejection_reason` | `TEXT` | YES | | | |
| `document_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.documents.id | Associated uploaded document |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `offer_letters`

Offer letter metadata and document reference.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `new_hire_id` | `UUID` | NO | | FK → `new_hires.id` | |
| `document_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.documents.id | Offer letter document |
| `signed_document_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.documents.id | Signed copy (upload after external signing) |
| `status` | `VARCHAR(20)` | NO | `'DRAFT'` | CHECK IN (`'DRAFT'`, `'SENT'`, `'DOWNLOADED'`, `'SIGNED'`, `'ACCEPTED'`, `'REJECTED'`, `'EXPIRED'`) | |
| `offered_designation` | `VARCHAR(100)` | YES | | | |
| `offered_department` | `VARCHAR(100)` | YES | | | |
| `offered_salary` | `DECIMAL(15,2)` | YES | | | |
| `currency_code` | `CHAR(3)` | YES | | | ISO 4217 |
| `valid_until` | `DATE` | YES | | | Offer expiry date |
| `sent_at` | `TIMESTAMPTZ` | YES | | | |
| `signed_at` | `TIMESTAMPTZ` | YES | | | |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `acknowledgements`

Acknowledgement signatures for onboarding documents.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `new_hire_id` | `UUID` | NO | | FK → `new_hires.id` | |
| `document_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.documents.id | Document being acknowledged |
| `onboarding_task_id` | `UUID` | YES | | FK → `onboarding_tasks.id` | Linked task |
| `acknowledged_name` | `VARCHAR(200)` | NO | | | Name as entered by new hire |
| `acknowledged_place` | `VARCHAR(200)` | NO | | | Place as entered |
| `acknowledged_date` | `DATE` | NO | | | Date as entered |
| `ip_address` | `INET` | YES | | | Client IP at acknowledgement |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

## DB-DOCS — Documents & File Storage

This database handles all file/document metadata and access control. Binary files are stored externally (S3/file server) — only references and metadata live here.

### `file_storage_references`

**Central registry for all binary files stored on external storage** (S3, Azure Blob, file server). Every table that needs a file reference points here. Binary bytes NEVER live in any database.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Referenced by all tables needing file storage |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | Tenant isolation for storage |
| `provider` | `VARCHAR(20)` | NO | | CHECK IN (`'S3'`, `'AZURE_BLOB'`, `'GCS'`, `'LOCAL_FS'`) | Storage provider |
| `bucket` | `VARCHAR(255)` | NO | | | S3 bucket name / Azure container / local mount path |
| `object_key` | `VARCHAR(1024)` | NO | | | Full object path: `{tenant_id}/{module}/{year}/{month}/{uuid}.{ext}` |
| `region` | `VARCHAR(50)` | YES | | | Storage region (e.g., `ap-south-1`, `us-east-1`) |
| `original_filename` | `VARCHAR(500)` | NO | | | User-provided filename. Display only — NEVER used as path/key |
| `content_type` | `VARCHAR(100)` | NO | | | MIME type: `application/pdf`, `image/jpeg`, etc. |
| `file_size_bytes` | `BIGINT` | NO | | CHECK > 0 | |
| `content_hash` | `VARCHAR(128)` | NO | | | SHA-256 hash of file content for integrity verification |
| `encryption_algorithm` | `VARCHAR(20)` | YES | | CHECK IN (`'AES_256_GCM'`, `'AES_256_CBC'`, `'SSE_S3'`, `'SSE_KMS'`) | Encryption used for at-rest storage |
| `encryption_key_ref` | `VARCHAR(255)` | YES | | | KMS key ARN or key alias. NEVER the actual key |
| `upload_status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'UPLOADING'`, `'QUARANTINED'`, `'SCANNING'`, `'COMPLETED'`, `'FAILED'`, `'DELETED'`) | Upload lifecycle |
| `scan_status` | `VARCHAR(20)` | YES | | CHECK IN (`'PENDING'`, `'CLEAN'`, `'INFECTED'`, `'ERROR'`, `'SKIPPED'`) | Malware scan result |
| `scanned_at` | `TIMESTAMPTZ` | YES | | | |
| `module` | `VARCHAR(50)` | NO | | | Source module: `employee`, `onboarding`, `document`, `ticket`, `kb`, `tenant` |
| `deleted_at` | `TIMESTAMPTZ` | YES | | | Soft-delete. Physical deletion per retention policy |
| `uploaded_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(provider, bucket, object_key)` — no duplicate object paths.
**Index**: `(tenant_id, module, created_at)`.

---

### `documents`

Logical document entity. Associates file(s) with HR domain context.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `title` | `VARCHAR(300)` | NO | | | Document title |
| `description` | `TEXT` | YES | | | |
| `category` | `VARCHAR(30)` | NO | | CHECK IN (`'IDENTITY'`, `'EMPLOYMENT'`, `'OFFER_LETTER'`, `'EDUCATION'`, `'MEDICAL'`, `'PAYROLL'`, `'TAX'`, `'POLICY'`, `'ACKNOWLEDGEMENT'`, `'CONTRACT'`, `'CERTIFICATE'`, `'OTHER'`) | |
| `sensitivity` | `VARCHAR(20)` | NO | `'NORMAL'` | CHECK IN (`'NORMAL'`, `'CONFIDENTIAL'`, `'HIGHLY_CONFIDENTIAL'`) | Access control classification |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'EXPIRED'`, `'REVOKED'`, `'ARCHIVED'`, `'QUARANTINED'`) | |
| `expires_at` | `TIMESTAMPTZ` | YES | | | Document expiry date |
| `current_version_id` | `UUID` | YES | | FK → `document_versions.id` | Points to latest version |
| `owner_type` | `VARCHAR(20)` | NO | | CHECK IN (`'TENANT'`, `'EMPLOYEE'`, `'NEW_HIRE'`, `'DEPARTMENT'`, `'HR'`) | What entity owns this document |
| `owner_id` | `UUID` | NO | | | ID of the owning entity (tenant_id, employee_id, etc.) |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `updated_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `deleted_at` | `TIMESTAMPTZ` | YES | | | Soft-delete |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `document_versions`

Immutable file versions for a document. New upload = new version row. Never in-place overwrite.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `document_id` | `UUID` | NO | | FK → `documents.id` ON DELETE CASCADE | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `version_number` | `INTEGER` | NO | | CHECK > 0 | Monotonically increasing per document |
| `file_storage_ref_id` | `UUID` | NO | | FK → `file_storage_references.id` | The actual file on S3/storage |
| `change_notes` | `TEXT` | YES | | | What changed in this version |
| `uploaded_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | Immutable — no updated_at |

**Unique constraint**: `UNIQUE(document_id, version_number)`.

---

### `document_associations`

Links documents to various HR entities. A document can be associated with multiple entities.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `document_id` | `UUID` | NO | | FK → `documents.id` ON DELETE CASCADE | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `entity_type` | `VARCHAR(30)` | NO | | CHECK IN (`'TENANT'`, `'EMPLOYEE'`, `'NEW_HIRE'`, `'OFFER_LETTER'`, `'DEPARTMENT'`, `'ONBOARDING_TASK'`, `'TICKET'`, `'KB_ARTICLE'`) | Associated entity type |
| `entity_id` | `UUID` | NO | | | ID of the associated entity |
| `association_type` | `VARCHAR(20)` | NO | `'ATTACHMENT'` | CHECK IN (`'ATTACHMENT'`, `'PROFILE_IMAGE'`, `'CERTIFICATE'`, `'OFFER'`, `'SIGNED_COPY'`, `'POLICY'`) | Nature of the association |
| `created_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(document_id, entity_type, entity_id, association_type)`.

---

### `document_access_tokens`

HMAC-signed, time-limited tokens for secure document access. Used for download URLs and cross-boundary sharing. **Documents are NEVER accessible without a valid, non-expired token backed by role/permission checks.**

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | Token is tenant-scoped |
| `document_id` | `UUID` | NO | | FK → `documents.id` | |
| `document_version_id` | `UUID` | YES | | FK → `document_versions.id` | Specific version. NULL = current version |
| `token_hash` | `VARCHAR(255)` | NO | | UNIQUE | HMAC-SHA256 hash of the token. Plaintext token is sent to client |
| `token_type` | `VARCHAR(20)` | NO | | CHECK IN (`'DOWNLOAD'`, `'PREVIEW'`, `'SHARE'`) | Purpose of the token |
| `granted_to_user_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | Specific user. NULL = any authorized user in tenant |
| `granted_to_tenant_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.tenants.id | For cross-tenant sharing (super admin only) |
| `permissions_snapshot` | `JSONB` | NO | | | Permissions verified at token generation: `{"role": "TENANT_ADMIN", "perms": ["document.view"]}` |
| `max_access_count` | `INTEGER` | YES | | CHECK > 0 | NULL = unlimited within TTL |
| `current_access_count` | `INTEGER` | NO | `0` | CHECK >= 0 | |
| `expires_at` | `TIMESTAMPTZ` | NO | | | Token expiry (short-lived: 5 min – 24 hours) |
| `revoked_at` | `TIMESTAMPTZ` | YES | | | Explicit revocation |
| `revoked_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `ip_restriction` | `INET` | YES | | | Optional: restrict to specific IP |
| `created_by` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Index**: `(token_hash)` — primary lookup path.
**Index**: `(tenant_id, document_id, expires_at)` — cleanup/listing.
**Verification chain**: token valid → token not expired → `current_access_count < max_access_count` (if set) → tenant matches → user permission re-verified → document not revoked → serve file → increment `current_access_count` → log to `document_access_log`.

---

### `document_access_log`

**Immutable** log of every document access attempt. Append-only — no UPDATE or DELETE. Used for compliance audit trail.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `document_id` | `UUID` | NO | | FK → `documents.id` | |
| `document_version_id` | `UUID` | YES | | FK → `document_versions.id` | |
| `access_token_id` | `UUID` | YES | | FK → `document_access_tokens.id` | Token used (if token-based access) |
| `actor_user_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | User who accessed. NULL = system/automated |
| `actor_tenant_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.tenants.id | Tenant context of accessor |
| `action` | `VARCHAR(20)` | NO | | CHECK IN (`'VIEW'`, `'DOWNLOAD'`, `'PREVIEW'`, `'SHARE_GENERATED'`, `'DENIED'`) | |
| `outcome` | `VARCHAR(10)` | NO | | CHECK IN (`'SUCCESS'`, `'DENIED'`, `'ERROR'`) | |
| `denial_reason` | `VARCHAR(100)` | YES | | | Why access was denied: `TOKEN_EXPIRED`, `WRONG_TENANT`, `NO_PERMISSION`, etc. |
| `ip_address` | `INET` | YES | | | |
| `user_agent` | `VARCHAR(500)` | YES | | | Sanitized |
| `request_id` | `UUID` | YES | | | Correlation ID |
| `accessed_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**No `updated_at`** — immutable rows.
**Index**: `(tenant_id, document_id, accessed_at)`.
**Index**: `(actor_user_id, accessed_at)`.

---

## DB-OPS — Operations

All tables in DB-OPS store `tenant_id` as a plain UUID column with CROSS-DB REF to `DB-CORE.tenants.id`. Employee references are CROSS-DB REF to `DB-HR.employees.id`.

### `leave_types`

Tenant-configurable leave type catalog.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | e.g., `Casual Leave`, `Sick Leave`, `Earned Leave` |
| `code` | `VARCHAR(20)` | NO | | | Short code: `CL`, `SL`, `EL` |
| `description` | `TEXT` | YES | | | |
| `is_paid` | `BOOLEAN` | NO | `true` | | |
| `requires_approval` | `BOOLEAN` | NO | `true` | | |
| `requires_documentation` | `BOOLEAN` | NO | `false` | | e.g., medical certificate for sick leave |
| `color_code` | `VARCHAR(7)` | YES | | | Hex color for UI display: `#FF5733` |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, code)`.

---

### `leave_policies`

Rules governing how leave types are applied.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `leave_type_id` | `UUID` | NO | | FK → `leave_types.id` | |
| `name` | `VARCHAR(100)` | NO | | | Policy name |
| `annual_allowance` | `DECIMAL(5,1)` | YES | | CHECK >= 0 | Total annual days |
| `monthly_credit` | `DECIMAL(4,1)` | YES | | CHECK >= 0 | Monthly accrual |
| `max_consecutive_days` | `INTEGER` | YES | | CHECK > 0 | |
| `carry_forward_enabled` | `BOOLEAN` | NO | `false` | | |
| `max_carry_forward_days` | `DECIMAL(5,1)` | YES | | CHECK >= 0 | |
| `carry_forward_expiry_months` | `INTEGER` | YES | | CHECK > 0 | Months before carried balance expires |
| `year_end_lapse` | `BOOLEAN` | NO | `true` | | Whether unused balance lapses at year-end |
| `max_pooled_balance` | `DECIMAL(5,1)` | YES | | CHECK >= 0 | Maximum total accumulated balance |
| `min_notice_days` | `INTEGER` | YES | `0` | CHECK >= 0 | Advance notice required |
| `probation_eligible` | `BOOLEAN` | NO | `false` | | Available during probation |
| `effective_from` | `DATE` | NO | | | Policy effective start |
| `effective_to` | `DATE` | YES | | | NULL = no end date |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`, `'DRAFT'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `leave_policy_targets`

Which employees/groups/regions a leave policy applies to.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `leave_policy_id` | `UUID` | NO | | FK → `leave_policies.id` ON DELETE CASCADE | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `target_type` | `VARCHAR(20)` | NO | | CHECK IN (`'ALL'`, `'REGION'`, `'DEPARTMENT'`, `'EMPLOYEE_GROUP'`, `'DESIGNATION'`) | |
| `target_id` | `UUID` | YES | | | ID of region/department/group. NULL when `target_type = 'ALL'` |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(leave_policy_id, target_type, target_id)`.

---

### `leave_balances`

Current leave balance summary per employee per leave type.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `leave_type_id` | `UUID` | NO | | FK → `leave_types.id` | |
| `year` | `SMALLINT` | NO | | | Leave year |
| `total_allocated` | `DECIMAL(5,1)` | NO | `0` | | Total days allocated |
| `total_used` | `DECIMAL(5,1)` | NO | `0` | CHECK >= 0 | Days used |
| `total_pending` | `DECIMAL(5,1)` | NO | `0` | CHECK >= 0 | Days in pending requests |
| `carried_forward` | `DECIMAL(5,1)` | NO | `0` | CHECK >= 0 | Days carried from previous year |
| `available_balance` | `DECIMAL(5,1)` | NO | `0` | | Computed: allocated + carried - used - pending |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, employee_id, leave_type_id, year)`.

---

### `leave_ledger_entries`

Explainable effects on leave balance. Every balance change is recorded.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `leave_type_id` | `UUID` | NO | | FK → `leave_types.id` | |
| `leave_request_id` | `UUID` | YES | | FK → `leave_requests.id` | NULL for system credits |
| `entry_type` | `VARCHAR(20)` | NO | | CHECK IN (`'CREDIT'`, `'DEBIT'`, `'CARRY_FORWARD'`, `'LAPSE'`, `'ADJUSTMENT'`, `'REVERSAL'`) | |
| `days` | `DECIMAL(4,1)` | NO | | | Positive = credit, negative = debit |
| `balance_after` | `DECIMAL(5,1)` | NO | | | Balance after this entry |
| `reason` | `TEXT` | YES | | | |
| `effective_date` | `DATE` | NO | | | |
| `performed_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | Immutable |

---

### `leave_requests`

Employee leave applications with approval workflow.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `leave_type_id` | `UUID` | NO | | FK → `leave_types.id` | |
| `start_date` | `DATE` | NO | | | |
| `end_date` | `DATE` | NO | | | |
| `days_count` | `DECIMAL(4,1)` | NO | | CHECK > 0 | Number of leave days (handles half-days) |
| `is_half_day` | `BOOLEAN` | NO | `false` | | |
| `half_day_period` | `VARCHAR(10)` | YES | | CHECK IN (`'FIRST_HALF'`, `'SECOND_HALF'`) | |
| `reason` | `TEXT` | YES | | | |
| `status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'CANCELLED'`, `'WITHDRAWN'`) | |
| `approver_employee_id` | `UUID` | YES | | -- CROSS-DB REF: DB-HR.employees.id | Who should approve |
| `approved_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | Who actually approved |
| `approved_at` | `TIMESTAMPTZ` | YES | | | |
| `rejection_reason` | `TEXT` | YES | | | |
| `supporting_document_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.documents.id | Medical certificate, etc. |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Check constraint**: `end_date >= start_date`.

---

### `leave_request_actions`

Audit trail for leave request status changes.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `leave_request_id` | `UUID` | NO | | FK → `leave_requests.id` ON DELETE CASCADE | |
| `action` | `VARCHAR(20)` | NO | | CHECK IN (`'SUBMITTED'`, `'APPROVED'`, `'REJECTED'`, `'CANCELLED'`, `'WITHDRAWN'`, `'ESCALATED'`) | |
| `performed_by` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `comment` | `TEXT` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | Immutable |

---

### `holidays`

Tenant regional holidays — common and flexible.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `region_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.regions.id | |
| `name` | `VARCHAR(100)` | NO | | | Holiday name |
| `date` | `DATE` | NO | | | |
| `holiday_type` | `VARCHAR(20)` | NO | | CHECK IN (`'COMMON'`, `'FLEXIBLE'`) | |
| `description` | `TEXT` | YES | | | |
| `year` | `SMALLINT` | NO | | | Calendar year |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'CANCELLED'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, region_id, date, name)`.

---

### `flexible_holiday_selections`

Employee selections from flexible holiday options.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `holiday_id` | `UUID` | NO | | FK → `holidays.id` | Must be type `FLEXIBLE` |
| `year` | `SMALLINT` | NO | | | |
| `selected_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, employee_id, holiday_id)`.

---

### `attendance_records`

Daily work-time records.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `work_date` | `DATE` | NO | | | |
| `clock_in` | `TIMESTAMPTZ` | YES | | | |
| `clock_out` | `TIMESTAMPTZ` | YES | | | |
| `total_hours` | `DECIMAL(5,2)` | YES | | CHECK >= 0 | Computed from clock events |
| `status` | `VARCHAR(20)` | NO | `'PRESENT'` | CHECK IN (`'PRESENT'`, `'ABSENT'`, `'HALF_DAY'`, `'ON_LEAVE'`, `'HOLIDAY'`, `'WEEKEND'`, `'WORK_FROM_HOME'`) | |
| `source` | `VARCHAR(20)` | NO | `'MANUAL'` | CHECK IN (`'MANUAL'`, `'BIOMETRIC'`, `'GEO_FENCE'`, `'SYSTEM'`) | How the record was created |
| `notes` | `TEXT` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, employee_id, work_date)`.

---

### `attendance_events`

Individual clock events within a day (for multiple clock-in/out scenarios).

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `attendance_record_id` | `UUID` | NO | | FK → `attendance_records.id` ON DELETE CASCADE | |
| `event_type` | `VARCHAR(10)` | NO | | CHECK IN (`'CLOCK_IN'`, `'CLOCK_OUT'`) | |
| `event_time` | `TIMESTAMPTZ` | NO | | | |
| `source` | `VARCHAR(20)` | NO | `'MANUAL'` | CHECK IN (`'MANUAL'`, `'BIOMETRIC'`, `'GEO_FENCE'`, `'SYSTEM'`) | |
| `location` | `VARCHAR(255)` | YES | | | Geo-fence location if applicable |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `attendance_corrections`

Proposed corrections to attendance records.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `attendance_record_id` | `UUID` | NO | | FK → `attendance_records.id` | |
| `employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `original_clock_in` | `TIMESTAMPTZ` | YES | | | |
| `original_clock_out` | `TIMESTAMPTZ` | YES | | | |
| `corrected_clock_in` | `TIMESTAMPTZ` | YES | | | |
| `corrected_clock_out` | `TIMESTAMPTZ` | YES | | | |
| `reason` | `TEXT` | NO | | | |
| `status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'APPROVED'`, `'REJECTED'`) | |
| `approved_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `approved_at` | `TIMESTAMPTZ` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `overtime_requests`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `date` | `DATE` | NO | | | |
| `hours` | `DECIMAL(4,1)` | NO | | CHECK > 0 | |
| `reason` | `TEXT` | YES | | | |
| `status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'APPROVED'`, `'REJECTED'`) | |
| `approved_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `approved_at` | `TIMESTAMPTZ` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `kb_categories`

Knowledge base category hierarchy.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | |
| `slug` | `VARCHAR(100)` | NO | | | URL-friendly key |
| `parent_category_id` | `UUID` | YES | | FK → `kb_categories.id` | |
| `description` | `TEXT` | YES | | | |
| `icon` | `VARCHAR(50)` | YES | | | Icon name/class |
| `sort_order` | `SMALLINT` | NO | `0` | | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, slug)`.

---

### `kb_articles`

Knowledge base articles with versioned content.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `category_id` | `UUID` | YES | | FK → `kb_categories.id` | |
| `title` | `VARCHAR(300)` | NO | | | |
| `slug` | `VARCHAR(300)` | NO | | | |
| `content` | `TEXT` | NO | | | Article body (sanitized rich text) |
| `excerpt` | `VARCHAR(500)` | YES | | | Short summary for listing |
| `author_user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `is_faq` | `BOOLEAN` | NO | `false` | | Whether this is an FAQ-style article |
| `status` | `VARCHAR(20)` | NO | `'DRAFT'` | CHECK IN (`'DRAFT'`, `'PUBLISHED'`, `'ARCHIVED'`) | |
| `visibility` | `VARCHAR(20)` | NO | `'ALL'` | CHECK IN (`'ALL'`, `'DEPARTMENT'`, `'ADMIN_ONLY'`) | |
| `published_at` | `TIMESTAMPTZ` | YES | | | |
| `current_version_id` | `UUID` | YES | | FK → `kb_article_versions.id` | |
| `view_count` | `INTEGER` | NO | `0` | CHECK >= 0 | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, slug)`.

---

### `kb_article_versions`

Immutable article version history.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `article_id` | `UUID` | NO | | FK → `kb_articles.id` ON DELETE CASCADE | |
| `version_number` | `INTEGER` | NO | | CHECK > 0 | |
| `title` | `VARCHAR(300)` | NO | | | Title at this version |
| `content` | `TEXT` | NO | | | Content at this version |
| `edited_by` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `change_notes` | `TEXT` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | Immutable |

**Unique constraint**: `UNIQUE(article_id, version_number)`.

---

### `kb_tags`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(50)` | NO | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, name)`.

---

### `kb_article_tags`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `article_id` | `UUID` | NO | | FK → `kb_articles.id` ON DELETE CASCADE | |
| `tag_id` | `UUID` | NO | | FK → `kb_tags.id` ON DELETE CASCADE | |

**PK**: `(article_id, tag_id)`.

---

### `kb_department_visibility`

Which departments can see a department-scoped KB article.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `article_id` | `UUID` | NO | | FK → `kb_articles.id` ON DELETE CASCADE | |
| `department_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.departments.id | |

**PK**: `(article_id, department_id)`.

---

### `announcements`

Targeted announcements with lifecycle and read tracking.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `title` | `VARCHAR(300)` | NO | | | |
| `content` | `TEXT` | NO | | | Sanitized rich text |
| `priority` | `VARCHAR(10)` | NO | `'NORMAL'` | CHECK IN (`'LOW'`, `'NORMAL'`, `'HIGH'`, `'URGENT'`) | |
| `status` | `VARCHAR(20)` | NO | `'DRAFT'` | CHECK IN (`'DRAFT'`, `'SCHEDULED'`, `'PUBLISHED'`, `'EXPIRED'`, `'ARCHIVED'`) | |
| `publish_at` | `TIMESTAMPTZ` | YES | | | Scheduled publish time |
| `expires_at` | `TIMESTAMPTZ` | YES | | | Auto-expire time |
| `published_by` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_by` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Check constraint**: `expires_at IS NULL OR publish_at IS NULL OR expires_at > publish_at`.

---

### `announcement_targets`

Who should see an announcement (targeting rules).

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `announcement_id` | `UUID` | NO | | FK → `announcements.id` ON DELETE CASCADE | |
| `target_type` | `VARCHAR(20)` | NO | | CHECK IN (`'ALL'`, `'DEPARTMENT'`, `'REGION'`, `'ROLE'`, `'EMPLOYEE_GROUP'`) | |
| `target_id` | `UUID` | YES | | | ID of dept/region/role/group. NULL when `target_type = 'ALL'` |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `announcement_reads`

Per-user read tracking.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `announcement_id` | `UUID` | NO | | FK → `announcements.id` ON DELETE CASCADE | |
| `user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `read_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, announcement_id, user_id)`.

---

### `ticket_categories`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | |
| `description` | `TEXT` | YES | | | |
| `department_id` | `UUID` | YES | | -- CROSS-DB REF: DB-HR.departments.id | Default routing department |
| `sort_order` | `SMALLINT` | NO | `0` | | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, name)`.

---

### `tickets`

Intra-company department-routed service tickets.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `ticket_number` | `VARCHAR(20)` | NO | | | Tenant-unique, server-generated (e.g., `TKT-00042`) |
| `subject` | `VARCHAR(300)` | NO | | | |
| `description` | `TEXT` | NO | | | |
| `category_id` | `UUID` | YES | | FK → `ticket_categories.id` | |
| `department_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.departments.id | Routing department |
| `priority` | `VARCHAR(10)` | NO | `'MEDIUM'` | CHECK IN (`'LOW'`, `'MEDIUM'`, `'HIGH'`, `'URGENT'`) | |
| `status` | `VARCHAR(20)` | NO | `'OPEN'` | CHECK IN (`'OPEN'`, `'IN_PROGRESS'`, `'WAITING'`, `'RESOLVED'`, `'CLOSED'`) | |
| `requester_employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `assignee_employee_id` | `UUID` | YES | | -- CROSS-DB REF: DB-HR.employees.id | |
| `resolved_at` | `TIMESTAMPTZ` | YES | | | |
| `closed_at` | `TIMESTAMPTZ` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, ticket_number)`.

---

### `ticket_comments`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `ticket_id` | `UUID` | NO | | FK → `tickets.id` ON DELETE CASCADE | |
| `author_user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `content` | `TEXT` | NO | | | Sanitized. XSS-safe |
| `is_internal` | `BOOLEAN` | NO | `false` | | Internal-only (not visible to requester) |
| `attachment_document_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.documents.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `ticket_activities`

Immutable activity log for ticket state changes.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `ticket_id` | `UUID` | NO | | FK → `tickets.id` ON DELETE CASCADE | |
| `actor_user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `action` | `VARCHAR(30)` | NO | | CHECK IN (`'CREATED'`, `'ASSIGNED'`, `'STATUS_CHANGED'`, `'PRIORITY_CHANGED'`, `'COMMENTED'`, `'ATTACHMENT_ADDED'`, `'REOPENED'`) | |
| `old_value` | `VARCHAR(100)` | YES | | | Previous state |
| `new_value` | `VARCHAR(100)` | YES | | | New state |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | Immutable |

---

### `buildings`

Facility buildings managed per tenant.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | |
| `address` | `TEXT` | YES | | | |
| `city` | `VARCHAR(100)` | YES | | | |
| `region_id` | `UUID` | YES | | -- CROSS-DB REF: DB-HR.regions.id | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, name)`.

---

### `floors`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `building_id` | `UUID` | NO | | FK → `buildings.id` ON DELETE CASCADE | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(50)` | NO | | | e.g., `Ground Floor`, `Floor 3` |
| `floor_number` | `SMALLINT` | NO | | | Numeric ordering |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(building_id, floor_number)`.

---

### `meeting_rooms`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `floor_id` | `UUID` | NO | | FK → `floors.id` ON DELETE CASCADE | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `name` | `VARCHAR(100)` | NO | | | |
| `capacity` | `SMALLINT` | NO | | CHECK > 0 | |
| `description` | `TEXT` | YES | | | |
| `status` | `VARCHAR(20)` | NO | `'ACTIVE'` | CHECK IN (`'ACTIVE'`, `'UNDER_MAINTENANCE'`, `'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `room_facilities`

Amenities available in a meeting room.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `meeting_room_id` | `UUID` | NO | | FK → `meeting_rooms.id` ON DELETE CASCADE | |
| `facility_name` | `VARCHAR(50)` | NO | | | e.g., `Projector`, `Whiteboard`, `Video Conference` |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(meeting_room_id, facility_name)`.

---

### `room_reservations`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `meeting_room_id` | `UUID` | NO | | FK → `meeting_rooms.id` | |
| `booked_by_employee_id` | `UUID` | NO | | -- CROSS-DB REF: DB-HR.employees.id | |
| `title` | `VARCHAR(200)` | YES | | | Meeting title |
| `start_at` | `TIMESTAMPTZ` | NO | | | |
| `end_at` | `TIMESTAMPTZ` | NO | | | |
| `status` | `VARCHAR(20)` | NO | `'CONFIRMED'` | CHECK IN (`'CONFIRMED'`, `'CANCELLED'`, `'COMPLETED'`) | |
| `attendee_count` | `SMALLINT` | YES | | CHECK > 0 | |
| `notes` | `TEXT` | YES | | | |
| `cancelled_at` | `TIMESTAMPTZ` | YES | | | |
| `cancelled_reason` | `TEXT` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Check constraint**: `end_at > start_at`.
**Overlap prevention**: Use database exclusion constraint where supported, or transactional lock + overlap check: `SELECT ... WHERE room_id = ? AND status = 'CONFIRMED' AND start_at < ? AND end_at > ? FOR UPDATE`.

---

### `notification_templates`

Tenant-customizable notification templates for email, push, and in-app.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `event_type` | `VARCHAR(50)` | NO | | | e.g., `LEAVE_APPROVED`, `TICKET_ASSIGNED`, `DOCUMENT_SHARED` |
| `channel` | `VARCHAR(20)` | NO | | CHECK IN (`'EMAIL'`, `'PUSH'`, `'IN_APP'`) | |
| `subject_template` | `VARCHAR(500)` | YES | | | For email: subject line template with variables `{{employee_name}}` |
| `body_template` | `TEXT` | NO | | | Body template with variables |
| `is_active` | `BOOLEAN` | NO | `true` | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

**Unique constraint**: `UNIQUE(tenant_id, event_type, channel)`.

---

### `notification_queue`

Outbound notification queue. Processed by background worker.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | |
| `recipient_user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `channel` | `VARCHAR(20)` | NO | | CHECK IN (`'EMAIL'`, `'PUSH'`, `'IN_APP'`) | |
| `subject` | `VARCHAR(500)` | YES | | | Rendered subject |
| `body` | `TEXT` | NO | | | Rendered body |
| `event_type` | `VARCHAR(50)` | NO | | | Source event |
| `reference_type` | `VARCHAR(50)` | YES | | | e.g., `leave_request`, `ticket`, `document` |
| `reference_id` | `UUID` | YES | | | ID of the referenced entity |
| `status` | `VARCHAR(20)` | NO | `'PENDING'` | CHECK IN (`'PENDING'`, `'PROCESSING'`, `'SENT'`, `'FAILED'`, `'CANCELLED'`) | |
| `attempts` | `SMALLINT` | NO | `0` | CHECK >= 0 | Retry count |
| `max_attempts` | `SMALLINT` | NO | `3` | CHECK > 0 | |
| `last_error` | `TEXT` | YES | | | Last failure reason |
| `scheduled_at` | `TIMESTAMPTZ` | NO | `now()` | | When to send |
| `sent_at` | `TIMESTAMPTZ` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

## DB-AUDIT — Audit & Platform Tickets

### `audit_logs`

Append-oriented business/security audit events. **Immutable** — no UPDATE or DELETE by application users.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `tenant_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.tenants.id | NULL for platform-level events |
| `actor_user_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | NULL for system-generated events |
| `actor_type` | `VARCHAR(20)` | NO | `'USER'` | CHECK IN (`'USER'`, `'SYSTEM'`, `'SCHEDULER'`, `'WEBHOOK'`) | |
| `action` | `VARCHAR(100)` | NO | | | Structured action: `employee.created`, `document.downloaded`, `leave.approved` |
| `resource_type` | `VARCHAR(50)` | NO | | | Entity type: `employee`, `document`, `leave_request` |
| `resource_id` | `UUID` | YES | | | ID of affected entity |
| `resource_db` | `VARCHAR(20)` | YES | | | Which database the resource belongs to |
| `outcome` | `VARCHAR(10)` | NO | | CHECK IN (`'SUCCESS'`, `'FAILURE'`, `'DENIED'`) | |
| `request_id` | `UUID` | YES | | | Correlation/tracing ID |
| `ip_address` | `INET` | YES | | | |
| `user_agent` | `VARCHAR(500)` | YES | | | Sanitized |
| `before_state` | `JSONB` | YES | | | State before change (when safe/useful) |
| `after_state` | `JSONB` | YES | | | State after change |
| `metadata` | `JSONB` | YES | | | Additional context: `{"reason": "...", "field": "..."}` |
| `occurred_at` | `TIMESTAMPTZ` | NO | `now()` | | Event timestamp |

**No `updated_at`** — immutable rows.
**Index**: `(tenant_id, occurred_at)`.
**Index**: `(resource_type, resource_id, occurred_at)`.
**Index**: `(actor_user_id, occurred_at)`.

---

### `platform_tickets`

**Company-to-Super-Admin tickets.** Separate from intra-company department tickets. Used when a tenant needs platform-level support, billing issues, feature requests, or dispute resolution.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `ticket_number` | `VARCHAR(20)` | NO | | UNIQUE | Platform-wide unique: `PLT-00042` |
| `tenant_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.tenants.id | Company raising the ticket |
| `subject` | `VARCHAR(300)` | NO | | | |
| `description` | `TEXT` | NO | | | |
| `category` | `VARCHAR(30)` | NO | | CHECK IN (`'TECHNICAL'`, `'BILLING'`, `'FEATURE_REQUEST'`, `'DATA_ISSUE'`, `'ACCESS_ISSUE'`, `'SECURITY'`, `'GENERAL'`) | |
| `priority` | `VARCHAR(10)` | NO | `'MEDIUM'` | CHECK IN (`'LOW'`, `'MEDIUM'`, `'HIGH'`, `'CRITICAL'`) | |
| `status` | `VARCHAR(20)` | NO | `'OPEN'` | CHECK IN (`'OPEN'`, `'IN_PROGRESS'`, `'WAITING_ON_TENANT'`, `'WAITING_ON_ADMIN'`, `'RESOLVED'`, `'CLOSED'`) | |
| `raised_by_user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | Tenant Admin who raised |
| `assigned_admin_id` | `UUID` | YES | | -- CROSS-DB REF: DB-CORE.users.id | Super Admin handling |
| `resolved_at` | `TIMESTAMPTZ` | YES | | | |
| `closed_at` | `TIMESTAMPTZ` | YES | | | |
| `resolution_notes` | `TEXT` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `platform_ticket_comments`

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `platform_ticket_id` | `UUID` | NO | | FK → `platform_tickets.id` ON DELETE CASCADE | |
| `author_user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `content` | `TEXT` | NO | | | |
| `is_internal` | `BOOLEAN` | NO | `false` | | Internal admin-only (not visible to tenant) |
| `attachment_storage_ref_id` | `UUID` | YES | | -- CROSS-DB REF: DB-DOCS.file_storage_references.id | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | | |

---

### `platform_ticket_activities`

Immutable activity log for platform ticket state changes.

| Column | Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | |
| `platform_ticket_id` | `UUID` | NO | | FK → `platform_tickets.id` ON DELETE CASCADE | |
| `actor_user_id` | `UUID` | NO | | -- CROSS-DB REF: DB-CORE.users.id | |
| `action` | `VARCHAR(30)` | NO | | CHECK IN (`'CREATED'`, `'ASSIGNED'`, `'STATUS_CHANGED'`, `'PRIORITY_CHANGED'`, `'COMMENTED'`, `'ATTACHMENT_ADDED'`, `'RESOLVED'`, `'CLOSED'`, `'REOPENED'`) | |
| `old_value` | `VARCHAR(100)` | YES | | | |
| `new_value` | `VARCHAR(100)` | YES | | | |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | | Immutable |

---

## Explicit Non-Entity

No Phase 1 table exists for:
- Dashboard widget layout/placement/configuration — configurable / drag-and-drop dashboard widgets are Future Phase.
- Billing/invoicing — future scope.
- Payroll calculation — future scope.
- SSO/OAuth provider configuration — future scope.
- Advanced reporting/analytics schemas — future scope.
- Workflow builder/custom approval chains — future scope.
