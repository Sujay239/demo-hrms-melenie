# Backend Architecture

## Purpose
Define mandatory layers and responsibilities.

## Mandatory path
```text
Route → Controller → Service → Repository → Database
```

### Route
Defines URL/method/middleware. No persistence or business rules.

### Controller
- Maps validated HTTP input and authenticated context to service call.
- Maps domain outcome/error to common response.
- No raw database queries.
- No substantive business logic.

### Service
- Business rules.
- Resource-level authorization.
- Transaction boundaries.
- Cross-repository/storage orchestration.
- Idempotency/state transitions.
- Audit emission.
- `Promise.allSettled()` for independent concurrent work when partial failure is valid.

### Repository
- ORM/SQL/data access.
- Tenant-scoped methods.
- Stable pagination/sorting.
- Query optimization/N+1 prevention.
- No permission decision logic.

## Transactions
Required for leave approval + ledger effect, explicit New Hire conversion, conflict-safe room booking, and other multi-write invariants. Do not hold DB transactions open across slow external storage/scanning work unless explicitly justified.

## Validation
Boundary schema validates shape/type/format. Service enforces domain rules. DB constraints provide final integrity protection.

## Errors
Domain errors use stable machine codes and safe messages. Infrastructure errors are logged with request ID but expose no stack/SQL/storage secrets.
