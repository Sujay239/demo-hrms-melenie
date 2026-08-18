# Storage Architecture

## Purpose
Define secure file binary storage and relational document metadata.

## Separation
Relational DB: tenant, document identity, category, sensitivity, association, version metadata, checksum, expiry, status, storage key.  
Private object storage: binary bytes.

## Upload
Authenticate/authorize → validate association → validate size/type/content policy → server-generated object key → upload/quarantine → verify/scan/finalize → persist version state → audit.

If direct-to-storage uploads are used, storage upload is not automatically an accepted document; server finalization remains authoritative.

## Download
Authorize tenant-scoped metadata → apply sensitivity/association policy → audit if needed → create short-lived signed delivery or stream.

## Versioning
Versions are immutable. New file means new version, not in-place overwrite.

## Deletion
Logical access revocation may precede physical deletion according to retention. Physical deletion must not break retained/audited records.
