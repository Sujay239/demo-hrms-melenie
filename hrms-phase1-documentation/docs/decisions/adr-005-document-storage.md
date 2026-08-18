# ADR-005 — Document Storage

## Purpose
Record and govern the architectural decision represented by ADR-005, including its rationale, consequences, and future change boundary.


## Status
Accepted

## Context
HRMS stores offer letters, identity/employment records, acknowledgements, ticket attachments, and potentially sensitive medical/PHI-related documents. Files must be protected, versioned, and auditable.

## Decision
Store file bytes in durable private object storage and store document metadata, version metadata, associations, ownership, status/expiry, and audit references in the relational database. Authorize every download and deliver through a backend stream or short-lived signed mechanism. Versions are immutable. File validation includes size/type/signature checks and a malware-scan hook where supported.

## Alternatives Considered
- Store large file bytes directly in relational database: rejected as default due scaling/backup/access trade-offs.
- Public object URLs: rejected due sensitive data exposure.
- Local container filesystem: rejected as non-durable and unsafe across replicas.

## Reasoning
Private object storage separates large binaries from transactional metadata while allowing strong access control and scalable delivery.

## Consequences
- Database/storage consistency requires careful create/version workflows and cleanup of failed uploads.
- Storage keys are opaque and never client-authoritative.
- Sensitive downloads are audited.
- Backup/recovery must cover both metadata and objects.

## Future Implications
Future external e-sign providers, retention/legal hold, residency-specific buckets, encryption-key segmentation, or DLP scanning can integrate behind this architecture.
