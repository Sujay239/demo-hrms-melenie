# Leave Management Module

## Purpose
Provide a configurable policy engine, balances, leave requests, and approval workflows without hard-coding tenant policy values.

## Requirement Traceability
Primary SRS requirements: `FR-LEV-001` through `FR-LEV-007`

## Actors
- Tenant Admin
- Employee
- Manager/authorized approver
- Consultant only when explicitly permitted

## Phase 1 Scope
- Configurable leave types
- Monthly credit and annual allowance
- Maximum consecutive days
- Carry-forward and year-end lapse
- Maximum pooled balance
- Eligibility
- Approval requirements
- Notice period
- Region and employee-group targeting
- Balance/ledger
- Apply, approve, reject, cancel

## Domain Data
Leave types, leave policies/effective targeting, employee groups, balances, ledger entries, requests, approval/action history.

## Core Workflows
Policy configuration → accrual/allocation updates auditable ledger → employee applies → service resolves effective policy → validates eligibility/balance/rules → pending approval if required → approver approves/rejects → ledger/status updates transactionally.

## Business Rules and Invariants
- Business values are configuration, not code constants.
- Example 1.5 monthly / 18 annual / 5 consecutive is illustrative only.
- Effective policy selection is deterministic and documented.
- Approved leave cannot double-debit balances.
- Historical decisions remain explainable after policy changes.
- Approver requires scope, not merely a role label.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/leave.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
Protect leave reasons/attachments according to sensitivity. Never allow employeeId/tenantId substitution to apply or approve for an unauthorized subject. Audit policy and approval changes.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- Policy edge cases
- Accrual precision
- Carry-forward/lapse
- Max pool
- Region/group targeting
- Insufficient balance
- Overlapping leave
- Approval scope
- Double-submit/idempotency

## Future Extensibility
No additional module-specific future scope beyond `../11-future-roadmap.md`.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
