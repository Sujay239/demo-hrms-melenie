# Sensitive Data

## Purpose
Define classification and stronger handling.

## Suggested classes
- Public/Internal: approved knowledge/notices.
- Confidential HR: contact/employment/leave/attendance.
- Highly Sensitive: identity, tax/payroll, medical/PHI-related, signed employment artifacts, authentication secrets.

## Controls
Least privilege, minimal list exposure, private storage, no raw content in logs, audit sensitive access and restrict exports.

## Medical/PHI-related
`Medical` category triggers stricter controls but does not imply HIPAA compliance.

## EU readiness
Ownership/region metadata supports future export/delete/retention workflows; exact legal rules are not invented in Phase 1.
