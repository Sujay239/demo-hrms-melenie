# File Security

## Purpose
Define controls for document, onboarding and ticket files.

## Upload
- Allowed formats per use case/category.
- Configurable per-use maximum and platform hard ceiling.
- Reject invalid/zero-byte where inappropriate.
- Server-generated storage key.
- Original filename stored only as sanitized metadata.
- Validate declared type + extension + content signature where practical.
- Malware scan/quarantine hook.
- Avoid unsafe file conversion/processing.

## Storage
Private, encrypted at rest, least-privilege service access.

## Download
Authorize metadata → tenant/association/sensitivity check → optional audit → short-lived signed delivery/stream. Use safe content disposition; avoid unsafe inline serving.

## Version/deletion
Versions immutable. Logical revocation/deletion can precede retention-driven physical deletion.
