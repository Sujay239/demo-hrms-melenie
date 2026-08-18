# Pagination, Filtering and Sorting

## Purpose
Define consistent collection query behavior for `/api/v1/`.

## Default Pagination
Growing collections are paginated. Canonical query parameters:
- `page`: positive integer, default `1`;
- `pageSize`: allow-listed positive integer with a conservative default and server maximum.

The implementation team must select final numeric limits once expected tenant sizes and deployment capacity are known; limits must be documented before release.

## Response Metadata
```json
{
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "total": 240,
      "totalPages": 10
    }
  }
}
```

## Filtering
Each endpoint explicitly allow-lists filter fields. Common examples:
- `status`
- `departmentId`
- `regionId`
- `designationId`
- `managerId`
- date ranges
- search text on specifically indexed/searchable fields

Unknown or unauthorized filters must not be turned into arbitrary SQL.

## Sorting
Use `sort` and `order=asc|desc` only for endpoint allow-listed fields. Stable sorting should include a deterministic tie-breaker such as ID when necessary.

## Search
Search behavior is module-specific. It must be bounded, tenant-scoped, and not become an unrestricted wildcard query across sensitive fields.

## Tenant Rule
Every database collection query applies verified tenant scope before filtering, sorting, counting, or pagination. The total count must never include inaccessible tenants or resources.

## Cursor Pagination
Cursor pagination may be introduced for high-volume feeds without breaking semantics, but it is not required as the Phase 1 default. A module that uses a cursor must document it explicitly.

## Related Documents
- `api-standards.md`
- `../database/indexes.md`
- `../performance/database-performance.md`
