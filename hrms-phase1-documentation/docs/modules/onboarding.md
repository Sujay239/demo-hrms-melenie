# Onboarding Module

## Purpose
Provide a restricted New Hire experience from offer review through document completion and eventual verified conversion to Employee.

## Requirement Traceability
Primary SRS requirements: `FR-ONB-001` through `FR-ONB-010`

## Actors
- New Hire
- Tenant Admin / authorized HR
- Consultant only if assigned and specifically permitted

## Phase 1 Scope
- New Hire login and onboarding dashboard
- Employee details collection
- Fun Fact About You
- Offer review
- Document submission
- Acknowledgement with name/place/date
- Download acknowledgement/offer artifacts
- Upload externally signed document
- Verification/completion
- Explicit conversion to Employee

## Domain Data
New hires, onboarding cases/tasks, offer letters, acknowledgements, document associations, verification state, and eventual employee reference.

## Core Workflows
Offer Letter → Review → Download → Sign using third-party application → Upload signed document → HR verification/completion.

New Hire → complete required details/tasks → HR verifies → explicit conversion transaction creates distinct Employee record/access state.

## Business Rules and Invariants
- New Hire has onboarding-only access.
- No native digital signature in Phase 1.
- Signed copy is an uploaded artifact; the platform does not claim cryptographic signature verification.
- Conversion is explicit, idempotency-protected, and cannot happen twice.
- Required same-tenant org references are validated at conversion.

## Authorization and Tenant Rules
All tenant-owned records are accessed only through verified tenant context. Permission checks are necessary but do not replace ownership, manager, audience, sensitivity, consultant-assignment, or lifecycle checks. Client-provided tenant IDs are never trusted as authority.

## API Contracts
- `../api/v1/onboarding.md`
- `../api/v1/offer-letters.md`
- `../api/v1/documents.md`

All endpoints use `/api/v1/` and inherit `../api/api-standards.md`.

## Error and State Handling
- Validation errors are field-specific and safe for UI display.
- Invalid lifecycle transitions return a conflict/semantic error rather than silently coercing state.
- Access denials must not leak another tenant's resource existence.
- Operations that update multiple invariant-related records use transactions where required.
- UI-visible failures provide retry/recovery guidance when retry is safe.

## Security Considerations
New Hires must not browse employee/admin resources. Onboarding documents are private. Identity, employment, medical or other sensitive records receive category-sensitive controls and audit.

## Audit Expectations
Create audit events for administrative mutations, security-relevant state changes, workflow decisions, and sensitive reads identified by the module/security specifications. Before/after state is captured only when useful and safe.

## Acceptance/Test Focus
- New Hire restricted navigation/API
- Details and fun fact
- Required uploads
- Acknowledgement fields
- External-signing workflow
- Verification rejection/rework
- Duplicate conversion prevention
- Converted employee linkage

## Future Extensibility
Native e-signature integrations may be future work, but are not Phase 1.

## Related Documents
- `../01-prd.md`
- `../02-srs.md`
- `../05-user-roles.md`
- `../security/security.md`
- `../database/entities.md`
