# ADR 0005: Deterministic Query Explainability And Tracing

## Status

Accepted

## Context

The query pipeline now has deterministic compiler/runtime stages through the
Execution Plan IR. The platform needs explainability and traceability artifacts
without changing execution semantics or adding telemetry infrastructure.

## Decision

Add query explainability and execution tracing under
`src/core/tokenizers/search/query-tracing/`.

The layer is additive and consumes completed pipeline results as read-only
structural input. It emits immutable, serialization-safe artifacts with stable
ordering, deterministic IDs, null timestamps, and source-span provenance where
available.

Trace metadata is limited to strings, numbers, booleans, and arrays or records
of those primitive values. Physical index instances, iterators, functions,
generators, clocks, UUIDs, randomness, and profiler data are not valid trace
metadata.

## Consequences

- Equivalent pipeline inputs produce equivalent explanations and traces.
- The pipeline can expose explainability artifacts without changing query
  execution behavior.
- Traces remain replay diagnostics, not telemetry or optimization input.
- Future phases may extend artifact summaries, but must preserve deterministic
  serialization and compiler/runtime boundaries.
