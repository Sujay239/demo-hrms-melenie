# Performance Architecture

## Purpose

Define performance practices for the multi-database HRMS platform without inventing production SLO numbers.

## Multi-Database Performance

### Connection Pooling

Each database has an independent connection pool sized for its workload:

| Database | Pool Size | Characteristics |
|---|---|---|
| DB-CORE | 10–20 | Fast auth queries, medium frequency |
| DB-HR | 10–20 | Employee CRUD, moderate concurrency |
| DB-DOCS | 5–15 | Document metadata, lower volume |
| DB-OPS | 15–30 | Highest volume: attendance, leave, all operational modules |
| DB-AUDIT | 5–10 | Append-only writes, admin read queries |

Pool size tuning is based on measured workload. Never over-allocate connections — each pool competes for the same application memory.

### Cross-Database Query Optimization

Since cross-database JOINs are prohibited:

1. **Batch Reference Resolution**: When listing data that needs cross-DB context (e.g., employee names on leave requests), use batch service calls: `getEmployeesByIds(tenantId, [id1, id2, ...])` rather than per-row lookups.
2. **Cached Cross-DB References**: Frequently needed references (tenant name, employee name, department name) may be cached in application memory with tenant-aware keys and 5–15 minute TTL.
3. **Denormalized Read Models**: For dashboard aggregations, consider materialized views or cached summary tables within each database to avoid cross-DB calls.

### Read Replica Routing

- **DB-AUDIT read replica**: Route admin audit log views and reporting queries to read replica. Tolerable lag: 1–5 seconds.
- **DB-OPS read replica**: Consider for dashboard aggregation queries (leave summaries, attendance reports).
- Query routing: Use connection pool middleware that routes `SELECT` queries to replica and writes to primary.

## General Principles

- Bounded pagination. All list endpoints require page/limit parameters with enforced maximums.
- Tenant-first indexes for tenant queries — `tenant_id` is the leading column in most composite indexes.
- Avoid N+1 — use eager loading, JOINs (within same database), or batch queries.
- Aggregate in DB where appropriate (COUNT, SUM within a single database).
- Concurrency for independent operations.
- `Promise.allSettled()` when partial results are meaningful (e.g., dashboard sections from different databases).
- Do not parallelize dependent/atomic workflow steps.
- Stream/direct controlled storage transfer for files — never buffer entire file in application memory.
- Cache only with safe tenant-aware keys/invalidation.

## File Storage Performance

### Upload
- Use pre-signed URLs for direct-to-S3 uploads — avoids routing file bytes through the API server.
- Multipart upload for files > 5 MB.
- Content hash computation can be parallelized with upload.

### Download
- Pre-signed GET URLs with 30-second TTL — client downloads directly from S3.
- Server-side streaming as fallback for environments without direct S3 access.
- Content-Disposition headers prevent browser from rendering potentially dangerous files.

### CDN / Edge Caching
- Phase 1: No CDN for documents (private by default).
- Public assets (tenant logos on login page): CDN with `Cache-Control: public, max-age=3600`.
- Future: CloudFront signed cookies for authorized document delivery.

## Document Access Token Caching

- Hot tokens (recently generated, high-access documents) may be cached in application memory.
- Cache key: `doc_token:{token_hash}` — verified against DB on first access, then cached with remaining TTL.
- Cache invalidation on token revocation.
- Expired tokens evicted by TTL — no need for explicit cache cleanup.

## Dashboard

Predefined Phase 1 sections. Independent metrics may run concurrently across multiple databases and return per-section unavailable/error state rather than failing the entire dashboard.

```text
Dashboard Request
  ├─ DB-CORE: tenant info (cached)
  ├─ DB-HR: employee count, department stats
  ├─ DB-OPS: leave summary, attendance today, open tickets
  └─ DB-AUDIT: recent audit events (optional, degradable)

Use Promise.allSettled() — each section renders independently.
```

## Frontend

- Route-level splitting — lazy load non-critical pages.
- Lazy non-critical requests — defer loading of secondary data.
- Efficient lists/tables — virtual scrolling for large datasets.
- Optimized images/thumbnails — serve appropriately sized images.
- Optimistic UI updates where safe (e.g., mark announcement as read).

## Monitoring

- Per-database connection pool utilization metrics.
- Per-database query latency percentiles (p50, p95, p99).
- S3/storage operation latency.
- Document access token generation/verification latency.
- Slow query logging per database.
- Cross-DB enrichment call latency.
