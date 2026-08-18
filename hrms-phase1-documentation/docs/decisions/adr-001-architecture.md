# ADR-001 — Phase 1 System Architecture

## Purpose
Record and govern the architectural decision represented by ADR-001, including its rationale, consequences, and future change boundary.


## Status
Accepted

## Context
The HRMS includes platform administration, tenant HR modules, onboarding, document security, workflows, and strong multi-tenancy. Phase 1 needs clear module boundaries without premature distributed-system complexity.

## Decision
Use a modular-monolith application architecture with a separately deployed frontend, versioned backend API, relational database, and private object storage. Keep domain modules logically separated behind services/repositories so selected modules can be extracted later if scale or organizational needs justify it.

## Alternatives Considered
- Microservices from day one: rejected for Phase 1 due distributed transactions, operational overhead, tenant-security surface, and premature service boundaries.
- Single unstructured monolith: rejected because it encourages cross-module coupling and weak ownership boundaries.
- Serverless functions with direct per-function persistence logic: rejected if it bypasses required backend layering.

## Reasoning
A modular monolith supports transactional HR workflows, consistent security policies, and simpler deployment while maintaining internal boundaries.

## Consequences
- Shared runtime failure domain must be monitored.
- Modules require discipline to avoid direct repository/domain shortcuts.
- Scaling is initially application/database oriented rather than per-microservice.

## Future Implications
Future payroll, reporting, integration, or high-volume document processing can be extracted behind stable internal/API boundaries if evidence justifies it.
