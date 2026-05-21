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
