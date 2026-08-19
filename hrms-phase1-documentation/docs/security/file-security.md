# File Security

## Purpose

Define controls for document, onboarding, ticket, and all module files. Covers the document access token system, HMAC-signed delivery, and immutable access logging.

## Upload Controls

- **Allowed formats**: Per use case/category, validated against `tenant_settings.allowed_file_types`.
- **Size limits**: Per-file limit from `tenant_settings.max_file_upload_size_mb` (default 10 MB). Platform hard ceiling: 100 MB.
- **Zero-byte rejection**: Reject invalid/zero-byte uploads.
- **Server-generated storage key**: Format: `{tenant_id}/{module}/{year}/{month}/{uuid}.{ext}`. Client NEVER controls the storage path.
- **Original filename**: Stored only as sanitized metadata in `file_storage_references.original_filename`. Never used as file path, storage key, or rendered as trusted HTML.
- **Content validation**: Validate declared MIME type + file extension + content signature (magic bytes) where practical. Reject mismatches (e.g., `.exe` renamed to `.pdf`).
- **Malware scan**: All uploads enter `QUARANTINED` status. Malware scan/quarantine hook runs before transition to `COMPLETED`. Infected files remain in `QUARANTINED` and are not accessible.
- **Unsafe processing**: Avoid unsafe file conversion/processing. Never execute or interpret uploaded files.

## Storage Controls

- **Private by default**: All storage buckets/containers have no public access.
- **Encryption at rest**: S3 SSE-KMS or SSE-S3 (or equivalent). Per-tenant encryption keys where isolation requirements demand it.
- **Least-privilege service access**: Application service account has minimal required permissions per bucket prefix.
- **Tenant-isolated paths**: Object keys are prefixed with `tenant_id`. IAM policies restrict access to tenant-specific prefixes where possible.
- **Content hash**: SHA-256 hash computed on upload, stored in `file_storage_references.content_hash`, verified on download where integrity is required.

## Document Access Token System

### Token Generation

When a user requests access to a document (view, download, preview), the system:

1. **Authenticates** the user (identity verified).
2. **Authorizes** — verifies tenant context, role, and permissions:
   - `document.view` for normal documents.
   - `document.view_sensitive` for `CONFIDENTIAL`/`HIGHLY_CONFIDENTIAL` documents.
   - `document.share` for generating share tokens.
3. **Checks document status** — not `REVOKED`, `EXPIRED`, or `QUARANTINED`.
4. **Generates HMAC-signed token**:
   - Token payload: `{ document_id, tenant_id, user_id, token_type, expires_at, nonce }`.
   - Signed with tenant-scoped HMAC-SHA256 secret.
   - Token hash stored in `document_access_tokens` table.
   - Plaintext token returned to client as a URL parameter.
5. **Sets expiry**: Download tokens: 5 minutes. Preview tokens: 15 minutes. Share tokens: up to 24 hours.
6. **Optionally restricts**: IP address, max access count.

### Token Verification Chain

On every document access attempt via token:

```text
1. Token exists? → YES
2. Token not expired? (expires_at > now()) → YES
3. Token not revoked? (revoked_at IS NULL) → YES
4. Access count within limit? (current_access_count < max_access_count OR max_access_count IS NULL) → YES
5. Tenant matches? (token.tenant_id == request.tenant_id) → YES
6. User permission re-verified? (current role still has required permission) → YES
7. IP restriction satisfied? (if set) → YES
8. Document not revoked/expired/quarantined? → YES
9. ✅ SERVE FILE → increment current_access_count
10. 📝 LOG to document_access_log (SUCCESS)
```

If ANY step fails:
- Return appropriate error (403 or 404 — never expose existence to wrong tenant).
- Log to `document_access_log` with `outcome = 'DENIED'` and `denial_reason`.

### Key Hierarchy

```text
Platform Master Key (KMS)
  └─ Tenant HMAC Secret (derived per tenant, rotatable)
       └─ Document Access Token (HMAC-SHA256 signed, short-lived)
```

- Platform master key stored in KMS (AWS KMS, Azure Key Vault, etc.).
- Tenant HMAC secrets derived from master key + tenant_id. Rotation invalidates all active tokens for that tenant.
- `encryption_key_ref` in `file_storage_references` stores the KMS key ARN — NEVER the actual key.

## Download Controls

- **Authorize metadata first**: Query document metadata with `tenant_id` + `document_id`. Never expose storage object keys to client.
- **Sensitivity check**: `CONFIDENTIAL` and `HIGHLY_CONFIDENTIAL` require `document.view_sensitive` permission.
- **Association/ownership check**: Verify document belongs to an entity the user is authorized to access (their own employee record, their department, etc.).
- **Signed delivery**: Generate pre-signed S3 GET URL with 30-second TTL, or server-side stream. Never permanent public URLs.
- **Content-Disposition**: `attachment` for downloads. `inline` only for explicitly safe types (images for preview, with CSP headers).
- **Audit**: Every download attempt logged to `document_access_log`.
- **No logging of file content**: Never log binary content, raw file data, or full document text in access logs.

## Cross-Company Document Isolation

**Documents are NEVER accessible outside their tenant** unless:
1. A Super Admin explicitly creates a platform-level `SHARE` token with `granted_to_tenant_id` set.
2. This is an exceptional operation, audited, and time-limited.

Standard tenant users, including Tenant Admins, cannot generate cross-tenant access tokens. Cross-tenant sharing is a platform-level operation only.

### Isolation Guarantees

| Layer | Control |
|---|---|
| Database | Every document row has `tenant_id`. Queries always include `tenant_id` |
| Storage | Object keys prefixed with `tenant_id`. IAM policies restrict prefix access |
| Access Token | `tenant_id` embedded in token. Verification checks tenant match |
| Access Log | Both `tenant_id` (document owner) and `actor_tenant_id` (accessor) logged |
| RBAC | Permission check is within tenant context |

## Version/Deletion Controls

- **Versions are immutable**: New upload = new `document_version` row with new `file_storage_ref_id`. Old versions remain until explicitly revoked.
- **Logical revocation**: `file_storage_references.deleted_at` set, `documents.status` set to `REVOKED` or `ARCHIVED`. All active `document_access_tokens` for the document are bulk-revoked.
- **Physical deletion**: Background job removes objects from S3 after retention period. Physical deletion must not break `document_access_log` records.
- **Retention policy**: Configurable per document category and sensitivity level.
