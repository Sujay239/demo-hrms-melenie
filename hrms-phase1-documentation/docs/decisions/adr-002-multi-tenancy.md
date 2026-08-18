# ADR-002 — Multi-Tenancy Isolation Strategy

## Purpose
Record and govern the architectural decision represented by ADR-002, including its rationale, consequences, and future change boundary.


## Status
Accepted

## Context
Multiple independent companies share the platform. Consultant access is assignment-based; Super Admin can cross tenant. IDOR prevention and query isolation are core security requirements.

## Decision
Use shared application infrastructure with explicit tenant ownership on every tenant-owned entity and mandatory verified tenant scoping in authorization/services/repositories. Use opaque IDs, tenant-first indexes/constraints, same-tenant reference validation, and automated two-tenant negative tests. Client-supplied tenant IDs are inputs only and never authority.

## Alternatives Considered
- Separate database per tenant: stronger physical isolation but much greater provisioning/migration/operational complexity for Phase 1.
- Separate schema per tenant: similar operational complexity and harder cross-tenant platform operations.
- Shared tables without tenant column because parent joins imply tenant: rejected as fragile and IDOR-prone.

## Reasoning
Explicit tenant ownership gives predictable query rules, scalable tenant provisioning, and supports platform-level cross-tenant management while keeping authorization centralized.

## Consequences
- Every new tenant-owned table must include tenant ownership.
- Repository APIs should require trusted tenant scope.
- Composite constraints may include tenant ID to enforce domain uniqueness.
- A missing predicate is a severe defect, so tests are mandatory.

## Future Implications
Higher-isolation tiers or residency-specific storage/databases can be introduced later only through an ADR and migration plan. Phase 1 does not claim data residency.
