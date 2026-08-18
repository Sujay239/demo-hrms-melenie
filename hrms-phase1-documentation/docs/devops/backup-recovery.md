# Backup and Recovery Specification

## Purpose
Define recovery expectations for relational data and document storage without inventing unapproved RPO/RTO numbers.

## Assets
- relational database;
- private object/document storage;
- critical deployment/configuration metadata managed by infrastructure;
- encryption/key material according to secret-management provider recovery procedures.

## Database Backups
Production must have automated backups with retention appropriate to business/legal requirements. Before launch, stakeholders must establish and document:
- Recovery Point Objective (RPO);
- Recovery Time Objective (RTO);
- retention schedule;
- point-in-time recovery capability if supported/required;
- geographic/storage redundancy policy.

## Document Storage
Use storage durability/versioning/backup policy consistent with HR document criticality. Database metadata and file objects must be recoverable coherently enough to avoid orphaned references.

## Recovery Procedure
1. Declare incident and recovery target.
2. Isolate affected environment.
3. Restore database to clean target.
4. Restore/validate document storage references.
5. Run schema/version compatibility checks.
6. Run tenant-isolation and integrity smoke checks.
7. Re-enable traffic deliberately.
8. Audit/document incident and lessons.

## Recovery Testing
Perform scheduled restore drills. A backup that has never been restored is not considered verified.

## Deletion/Retention
Future GDPR/data-deletion implementation may require backup retention/deletion policy changes. Phase 1 readiness does not claim GDPR compliance.

## Related Documents
- `deployment.md`
- `monitoring.md`
- `../architecture/eu-readiness.md`
