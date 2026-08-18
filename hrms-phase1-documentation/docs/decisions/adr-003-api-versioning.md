# ADR-003 — API Versioning

## Purpose
Record and govern the architectural decision represented by ADR-003, including its rationale, consequences, and future change boundary.


## Status
Accepted

## Context
The API must evolve without breaking deployed clients.

## Decision
Use URL major-versioning. Every Phase 1 endpoint is under `/api/v1/`. Backward-compatible additions remain v1. Breaking semantic/schema changes require `/api/v2/` or another coordinated compatibility mechanism explicitly approved by ADR.

## Alternatives Considered
- Header/media-type versioning: powerful but less visible/debuggable for this project.
- No explicit version: rejected because breaking evolution would be unsafe.

## Reasoning
URL versioning is explicit in logs, documentation, routing, tests, and client configuration.

## Consequences
- Route modules are organized by version.
- Shared internal services may support multiple API versions.
- Deprecation notices and migration guidance are required before retiring a supported version.

## Future Implications
Future `/api/v2/` can coexist while v1 is maintained for an announced period. Internal schema migrations do not automatically require an API version change.
