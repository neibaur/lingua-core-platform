# lingua-core-platform — Claude Code Project Memory

## Project Identity

This is a governance-first deterministic multilingual linguistic runtime platform.
Phase 9 and Phase 10 are both complete. This is NOT a greenfield project.

The repository behaves like:

- deterministic compiler/runtime infrastructure
- replay-safe execution architecture
- canonical serialization platform
- provenance-preserving governance system
- deterministic replay certification engine

## Hard Non-Goals

Do NOT introduce:

- heuristic execution
- semantic or vector search
- ranking systems
- optimizer behavior
- distributed runtimes
- plugin-hosting systems
- runtime discovery
- workflow engines
- AI orchestration frameworks
- new subsystems unless explicitly directed

## Phase 9 Architectural Doctrine

### Single-Layer Governance Derivation Law

Every governance layer derives state ONLY from the immediately preceding governance layer.

- closure derives only from `provenance.attestationStatus`
- provenance derives only from `operationalManifest.governanceStatus`
- operational manifests derive only from audit snapshots
- audit snapshots derive only from governance reports

STRICTLY FORBIDDEN:

- lower-layer reach-through recomputation
- re-walking lower governance structures
- bypassing abstraction boundaries

### Schema Version Doctrine

Phase 9 schemaVersion values are deterministic domain literals, NOT semver.
Pattern: `'lingua-core-platform:<artifact>@phase9'`

### Immutability Law

Readonly TypeScript is NOT sufficient. All externally exposed governance/runtime artifacts MUST pass through `deepFreezeStructure(...)` before return.

### Deterministic Ordering Law

- numerical ascending
- lexicographical binary ordering
- clone before sort
- no `localeCompare`
- no insertion-order assumptions
- no unstable comparators

### Replay-Safe Governance Law

- `evaluationTimestamp: null` is the replay-safe timestamp sentinel
- caller-supplied identifiers only

STRICTLY FORBIDDEN:

- UUID generation
- hashing-based identifiers
- `Date.now()`
- `Math.random()`
- crypto randomness

### Static Resolution Law

STRICTLY PROHIBITED:

- plugin systems
- runtime registries
- ambient runtime discovery
- DI containers
- mutable singleton state
- async orchestration

Use:

- explicit orchestration
- static composition
- deterministic layering
- discriminated unions
- readonly contracts

## Toolchain

- Node 22+
- pnpm 10
- TypeScript 6
- ES Modules

Validation chain (run in order):

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm validate
```

## Implementation Cadence

1. Define immutable readonly contracts
2. Compose deterministic governance artifact
3. Enforce canonical ordering
4. Apply `deepFreezeStructure(...)`
5. Add replay-safe deterministic tests
6. Preserve additive architecture
7. Update barrels minimally
8. Run validation chain
9. Merge to main
10. Generate next additive slice

## Current Phase Status

Phase 9: COMPLETE

Phase 10: COMPLETE — lexical interop contracts, query enrichment, runtime capability declaration, and manifest bridge. 595 tests passing, full chain green.

Phase 11: IN PROGRESS — first slice (DictionarySourceProvenance) complete and merged to main. Three concepts remain unimplemented: licensing boundary contracts, canonical dictionary entry shape, and deterministic ingestion-ready shapes.

## Active Branch Conventions

- Feature/normalization work: `spike/<descriptor>`
- Do not commit directly to main
- Conventional commits required
