# ADR-006 — Performance and Concurrency Strategy

## Purpose
Record and govern the architectural decision represented by ADR-006, including its rationale, consequences, and future change boundary.


## Status
Accepted

## Context
Dashboard/aggregate operations may need multiple independent queries. Other workflows have strict sequencing/transaction requirements.

## Decision
Use database indexes/pagination/query planning as primary performance tools. Execute genuinely independent I/O operations concurrently; prefer `Promise.allSettled()` when partial independent success is useful (especially dashboard sections). Keep dependent or atomic workflows sequential/transactional. Bound concurrency to protect database/storage.

## Alternatives Considered
- Sequential execution of all independent metrics: rejected as unnecessary latency.
- `Promise.all()` for partial-failure aggregates: rejected when one optional metric should not erase all results.
- `Promise.allSettled()` everywhere: rejected because it can hide dependency failure and does not create atomicity.

## Reasoning
Selective concurrency reduces user-visible latency while preserving clear failure semantics.

## Consequences
- Each aggregate maps fulfilled/rejected results intentionally.
- Failures are logged/correlated.
- Authorization/tenant resolution occurs before concurrent tenant data work.
- Load testing must validate that concurrency does not overwhelm downstream pools.

## Future Implications
Caching, read replicas, queues, search services, or precomputed analytics may be added only when measured need justifies them.
