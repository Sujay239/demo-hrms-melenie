# Audit Logging Module

## Purpose
Provide append-oriented security/business audit events for privileged changes, workflow decisions, and sensitive document access.

## Requirement Traceability
Primary SRS requirements: `FR-AUD-001` through `FR-AUD-004`; `NFR-OBS-001`, `NFR-OBS-002`

## Actors
- Authorized audit viewers
- All authenticated actors as event subjects/producers via server-side instrumentation

## Phase 1 Scope
- Actor
- Tenant/platform scope
- Action
- Resource type and ID
- Timestamp
- Request ID
- IP when appropriate
- Before/after state when appropriate and safe
- Read-only authorized querying

## Domain Data
Audit log rows plus request correlation metadata. Audit records reference actor/resource logically while remaining durable even if the source record later changes.

## Core Workflows
Protected action executes → audit event created with trusted server context → authorized viewer queries scoped audit history. Sensitive document reads/downloads always emit the required audit event.

## Business Rules and Invariants
- Clients cannot create/edit/delete normal audit records.
- Audit data never contains passwords, tokens, file bytes, or unnecessary sensitive content.
- Tenant audit views cannot cross tenant.
- Before/after snapshots are selective and redacted.
- Failure strategy for security-critical audit emission must be explicit per action.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/audit-logs.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Restrict audit viewers, protect integrity/retention, correlate request IDs, and separate audit records from ordinary application logs.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Sensitive download produces event
- Administrative mutation produces event
- Wrong-tenant audit ID denied
- No mutation API
- Redaction
- Request ID correlation

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
