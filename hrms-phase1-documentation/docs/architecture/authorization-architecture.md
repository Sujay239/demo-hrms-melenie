# Authorization Architecture

## Purpose
Define how roles, permissions, tenant context, resource relationships and data sensitivity combine.

## Decision model
```text
Identity
+ Account State
+ Platform/Tenant Context
+ Role/Permission Grants
+ Membership/Consultant Assignment
+ Resource Ownership/Relationship
+ Resource Classification
= Allow / Deny
```

## Principles
- Deny by default.
- Prefer named permissions over role-name checks for tenant business logic.
- Platform-only operations remain explicitly platform scoped.
- Self access uses server-established user→employee/New-Hire mapping.
- Sensitive documents require extra permission/classification policy.
- Leave/attendance approvals require both permission and approver scope unless broader HR manage permission is explicitly defined.

## Examples
- Employee self update: `employee.update_self` + own employee mapping.
- HR employee update: `employee.update` + same tenant.
- Consultant view: active assignment + permission + same tenant + field visibility.
- Sensitive document: `document.view_sensitive` + authorized association + audit.

## Future roles
Data model may support future custom tenant role bundles. Future roles cannot grant platform privileges or bypass tenant checks.
