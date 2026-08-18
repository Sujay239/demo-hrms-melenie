# ADR-004 — Backend Layering

## Purpose
Record and govern the architectural decision represented by ADR-004, including its rationale, consequences, and future change boundary.


## Status
Accepted

## Context
The project explicitly requires thin controllers and separation of HTTP concerns, business rules, and persistence.

## Decision
Every backend request follows `Route → Controller → Service → Repository → Database`. Routes bind middleware/controllers. Controllers parse transport data and map results. Services own business rules, authorization-relevant domain orchestration, transactions, and workflow decisions. Repositories own persistence/query logic. Controllers never issue raw database queries.

## Alternatives Considered
- Route → database: rejected.
- Controller → database: rejected.
- Active Record calls scattered through services/controllers: rejected when it obscures repository boundary.
- Frontend → database: prohibited.

## Reasoning
The pattern makes business rules testable, centralizes tenant-safe persistence, and prevents controllers from becoming a second service layer.

## Consequences
- Some simple CRUD still passes through all layers.
- Repositories must not absorb business-policy logic just because it is convenient.
- Cross-repository transactions are coordinated at service/application boundary using the chosen persistence transaction abstraction.

## Future Implications
If CQRS/read models are later justified for reporting, they must preserve authorization/tenant guarantees and be documented as an extension rather than an undocumented shortcut.
