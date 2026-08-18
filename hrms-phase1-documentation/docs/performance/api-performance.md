# API Performance

## Purpose
Define server efficiency.

Validate/authenticate/tenant-scope before expensive work. Limit nested expansions/page sizes. Use explicit summary endpoints. Concurrent independent aggregates may use `Promise.allSettled()`. Apply timeouts to storage/scanning. Cache only safe tenant-keyed stable data. Do not carry large files as base64 JSON.
