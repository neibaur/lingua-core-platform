# ADR 0008: Typed Structural Interoperability Seams Across Lexical, Query, And Runtime Boundaries

## Status

Accepted

## Context

The query pipeline (Phases 8 and earlier), replay governance (Phase 8), and
runtime capability governance (Phase 9) each produce replay-safe governance
artifacts under `src/core/tokenizers/search/`. The lexical infrastructure
introduced in Phase 10 under `src/core/lexical/` provides a separate domain:
typed lexical identity, dataset access, normalization, lookup, and validation.

Before Phase 10, no typed structural seam existed to connect the lexical
infrastructure to query processing or to runtime capability declaration.
Without typed interoperability contracts, cross-system integration would require
raw string identifiers, loose coupling, or runtime discovery — all of which are
incompatible with the deterministic, replay-safe, statically composable model
that governs every other system boundary in this repository.

The platform required a mechanism by which the lexical system could supply
typed structural contracts to query enrichment and runtime capability
declaration without introducing dynamic coupling, ambient discovery, or
mutable shared state.

## Decision

Establish typed structural interoperability contracts as the architectural law
for all cross-system boundaries between the lexical, query, and runtime
capability layers. All interoperability seams must be expressed as immutable
typed interfaces and consumed by the receiving layer through explicit static
composition.

No raw string identifier, runtime registry, dynamic import, ambient discovery
mechanism, or mutable shared state may serve as a cross-layer integration
point. Where a backing structural type exists for a concept that would otherwise
be represented as a raw string, the typed structural form is required.

The `src/core/tokenizers/search/query-lexical-interop/` module and the lexical
interoperability capability declaration within
`src/core/tokenizers/search/runtime-capabilities/` are the reference
implementations of this decision. They establish the pattern that all future
cross-system interoperability seams must follow.

## Consequences

Cross-layer integration becomes statically verifiable at compile time,
replay-safe, and immutable. Changes to any shared contract surface produce
type errors at the boundary rather than silent runtime failures, making
interoperability regressions visible before they reach the test suite.

All future interoperability work between additional platform layers must follow
this contract-first, typed-seam pattern. A new cross-system integration point
must be expressed as an immutable typed interface consumed through explicit
static composition before any implementation proceeds.

Coupling via loose string identifiers, runtime discovery, dynamic registries,
class reflection, plugin loading, or ambient interoperability mechanisms is
architecturally prohibited at all current and future cross-system boundaries.

## Alternatives Considered

**Raw string identifier coupling**: Rejected. String-based cross-system
identifiers are not statically verifiable, produce runtime failures rather than
compile-time errors, and are incompatible with the deterministic, replay-safe
composition model required throughout this repository.

**Runtime registry or capability discovery**: Rejected. Runtime discovery
is environment-sensitive, non-deterministic, and incompatible with the
replay-safe, in-memory artifact model required by the governance contract.
It also violates the Static Resolution Law established in the repository
doctrine.

**Ad-hoc per-seam coupling**: Rejected. Informal coupling patterns with no
architectural law produce inconsistent integration surfaces that cannot be
statically governed or uniformly extended.

## Non-Goals

This decision does not introduce rendering, markdown report generation, CLI
output, persistence, telemetry, async orchestration, plugin registries,
runtime capability discovery, distributed execution, optimizer-driven search
behavior, or AI orchestration. It does not define the internal shape of any
specific interoperability artifact — it defines the law that governs how
cross-system integration surfaces must be expressed.
