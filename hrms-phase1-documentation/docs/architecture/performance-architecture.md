# Performance Architecture

## Purpose
Define performance practices without inventing production SLO numbers.

## Principles
- Bounded pagination.
- Tenant-first indexes for tenant queries.
- Avoid N+1.
- Aggregate in DB where appropriate.
- Concurrency for independent operations.
- `Promise.allSettled()` when partial results are meaningful.
- Do not parallelize dependent/atomic workflow steps.
- Stream/direct controlled storage transfer for files.
- Cache only with safe tenant-aware keys/invalidation.

## Dashboard
Predefined Phase 1 sections. Independent metrics may run concurrently and return per-section unavailable/error state rather than failing the entire dashboard.

## Frontend
Route-level splitting, lazy non-critical requests, efficient lists/tables and optimized images/thumbnails.
