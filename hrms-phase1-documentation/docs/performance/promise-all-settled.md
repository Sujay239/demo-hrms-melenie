# Promise.allSettled Concurrency Rule

## Purpose
Define when the future JavaScript/TypeScript implementation should use `Promise.allSettled()`.

## Use it when
Operations are independent, can start concurrently and one failure should not invalidate all useful results.

Good candidates:
- dashboard counts;
- independent leave/attendance/ticket/announcement statistics;
- non-critical independent enrichments;
- separate repository reads with no dependency.

## Partial failure
Inspect each result individually. Return successful sections and explicit unavailable/error metadata for failed optional sections. Never replace failure with `0` unless zero is known.

## Do not use it when
- B depends on A.
- State transition must be sequential.
- Writes require all-or-nothing transaction.
- Partial results are misleading.
- Too many parallel operations would overload DB/storage.

Wrong examples: employee creation followed by dependent record before ID exists; leave approval separated from ledger transaction; room overlap check and insert without atomicity.

## Logging
Each failed independent operation logs request ID and operation label; public output is safe.

## Load
Concurrency can reduce latency but increase dependency pressure. Prefer one efficient aggregate query over dozens of parallel tiny queries.
