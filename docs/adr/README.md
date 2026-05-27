# Architecture Decision Records

Architecture Decision Records (ADRs) document durable architectural decisions, system constraints, and tradeoffs for `lingua-core-platform`.

Create an ADR when a change affects core architecture, module boundaries, tenant isolation, tokenizer/search strategy, data-governance posture, deployment topology, or public/private repository boundaries. ADRs are not required for granular implementation commits, small refactors, routine dependency updates, or local code cleanup.

## Numbering Convention

ADRs use a four-digit sequence and a short kebab-case title:

```text
0001-short-decision-title.md
```

Numbers are never reused. If a decision changes, create a new ADR and mark the older ADR as Superseded or Deprecated.

## Status Values

- Proposed: under discussion and not yet binding.
- Accepted: approved as current architectural direction.
- Superseded: replaced by a later ADR.
- Deprecated: no longer recommended, but not directly replaced.

## Index

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](0001-modular-monolith-architecture.md) | Accepted | Use a governance-first modular monolith architecture. |
| [0002](0002-typescript-platform-foundation.md) | Accepted | Use TypeScript as the initial platform language. |
| [0003](0003-open-core-public-private-boundary.md) | Accepted | Use an open-core public/private repository boundary. |
| [0004](0004-search-and-tokenization-abstraction.md) | Accepted | Treat search and tokenization as first-class language-agnostic abstractions. |
| [0005](0005-deterministic-query-explainability-tracing.md) | Accepted | Add deterministic query explainability and execution tracing. |
| [0006](0006-deterministic-replay-governance-architecture.md) | Accepted | Formalize deterministic replay governance as an architecture boundary. |
| [0007](0007-deterministic-runtime-capability-governance.md) | Accepted | Formalize deterministic runtime capability governance as an architecture boundary. |
| [0008](0008-typed-structural-interoperability-seams.md) | Accepted | Formalize typed structural interoperability seams across lexical, query, and runtime boundaries. |
| [0009](0009-contracts-only-dictionary-data-boundary.md) | Accepted | Establish a contracts-only dictionary data boundary with mandatory typed provenance embedding. |
| [0010](0010-typed-reference-provenance-fields.md) | Accepted | Enforce typed structural references across all lexical and dictionary boundary contracts. |
| [0011](0011-learning-surface-layer.md) | Accepted | Define scope boundaries for the reading and writing learning surface layer. |
| [0012](0012-search-to-learning-integration-boundary.md) | Proposed | Define the architectural boundary for search-to-learning integration. |