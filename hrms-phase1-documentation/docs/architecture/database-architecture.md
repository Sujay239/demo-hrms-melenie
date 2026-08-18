# Database Architecture

## Purpose
Define persistence principles for tenant-safe transactional HRMS data.

## Model
Relational DB is authoritative for identities, tenants, organization records, workflow state, document metadata, reservations and audit references.

## Keys
Use opaque globally unique identifiers (UUID-class or equivalent). Exact DB type is implementation-specific.

## Tenant ownership
Tenant-owned records carry `tenant_id` directly where practical, especially high-risk/high-volume tables. Cross-tenant references are forbidden.

## Common fields
Most mutable records: `created_at`, `updated_at`; selected records: `created_by`, `updated_by`. Use `deleted_at` only where retention/recovery semantics require soft deletion.

## Time
Store instants in UTC-capable timestamp types. Store IANA timezone identifiers for regional/local policy interpretation.

## Documents
DB stores document/version metadata, association, storage key, checksum, status, expiry and classification; binary bytes live in private object storage.

## Audit
Append-oriented. Normal tenant admin flows do not update/delete historical audit events.

## Migrations
All schema changes are migration-controlled.
