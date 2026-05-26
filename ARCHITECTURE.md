# Architecture Blueprint

`lingua-core-platform` is a governance-first modular monolith platform engine for Thai-English linguistic tooling, tokenizer/search infrastructure, SEO-first educational content, and future multilingual expansion.

This document defines the platform principles: system identity, core architectural constraints, directory layout, public/private boundary, and the deterministic query explainability model. Major architectural decisions are captured in `docs/adr/`. The phase-by-phase implementation roadmap is at `.claude/ROADMAP.md`.

## System Overview

The platform is intended to serve multiple language-learning and linguistic experiences from one shared core. A request enters through a tenant-aware routing layer, resolves the appropriate tenant configuration, applies tenant-specific presentation and language settings, and delegates to shared platform capabilities.

The central engine should own reusable infrastructure such as routing conventions, tokenizer interfaces, lookup/search abstractions, dictionary data access, tenant configuration boundaries, and shared validation logic.

## Core Architectural Principles

- Preserve a modular monolith as the default architecture.
- Keep tenant domains and language domains in one repository with clear internal module boundaries.
- Treat tokenization and linguistic parsing as pluggable infrastructure.
- Keep the public repository focused on shared platform infrastructure and open governance.
- Separate public/open data from premium, proprietary, or private data.
- Prefer static rendering, SEO durability, dictionary/search foundations, and browser-native fallbacks before interactive multi-user features.
- Avoid framework, hosting, database, or AI-provider lock-in in this blueprint.
- Record major architectural decisions in ADRs before making them binding.

## Directory Layout

Current high-level layout confirmed from working tree:

```text
.
├── src/
│   └── core/
│       ├── lexical/
│       │   ├── contracts.ts
│       │   ├── index.ts
│       │   ├── datasets/
│       │   │   └── thai-english/
│       │   ├── diagnostics/
│       │   ├── identity/
│       │   ├── index/
│       │   ├── lookup/
│       │   ├── normalization/
│       │   ├── provenance/
│       │   ├── reading/
│       │   ├── spelling/
│       │   ├── validation/
│       │   └── writing/
│       └── tokenizers/
│           ├── index.ts
│           ├── drivers/
│           │   ├── dictionary/
│           │   └── mock/
│           ├── normalization/
│           ├── pipeline/
│           └── search/
│               ├── index-primitives/
│               ├── matching/
│               ├── pipeline/
│               ├── query-engine/
│               ├── query-ir/
│               ├── query-lexical-interop/
│               ├── query-parser/
│               ├── query-pipeline/
│               ├── query-snapshots/
│               ├── query-tracing/
│               ├── runtime-capabilities/
│               ├── shared/
│               └── utils/
├── docs/
│   ├── adr/
│   ├── architecture/
│   └── validation/
├── ARCHITECTURE.md
├── DATA_SOURCES.md
├── AGENTS.md
└── README.md
```

Directory responsibilities:

- `src/core/lexical/`: lexical identity contracts, dataset access, diagnostics, normalization rules, index, lookup, dictionary data boundary contracts (`provenance/`), and dataset validation.
- `src/core/tokenizers/`: tokenizer driver interface and implementations (dictionary, mock), text normalization pipeline, tokenization pipeline, and the search subsystem — query parsing, query IR, query execution engine, query snapshots and replay governance, query tracing and explainability, runtime capability governance, and query-lexical interoperability.
- `docs/adr/`: architecture decision records documenting durable platform decisions.
- `docs/architecture/`: supplementary architecture reference documents covering ordering guarantees, replay governance lifecycle, and certification foundations.
- `docs/validation/`: validation checklists and manual testing scenarios for tokenizer and search behavior.

## Learning Surface Layer

The learning surface layer is the Phase 12 structural boundary positioned
between the dictionary data boundary (Phase 11) and the search-to-learning
integration layer (Phase 13).

It introduces two structural types representing learner-facing projections
of canonical dictionary entries. Both types embed `CanonicalDictionaryEntry`
directly and are classified as structural (no `evaluationTimestamp`, no
`generatedFrom`).

### Types

**`ReadingPrimitive`** — `src/core/lexical/reading/reading-primitive.ts`
Represents a reading exercise unit. Contains the target dictionary entry
and any licensed example usage content associated with it. Example sentence
fields require a grounded candidate dataset in `DATA_SOURCES.md` with
compatible licensing before they may be introduced.

**`WritingPrimitive`** — `src/core/lexical/writing/writing-primitive.ts`
Represents a writing exercise unit. Contains the target dictionary entry,
the reference character form for the exercise, and the exercise mode
(free fill or template overlay). Handwriting capture, stroke interpretation,
user input evaluation, and scoring are out of scope for this layer and are
deferred to a later phase.

### Layer Position

IngestionReadyDictionaryEntry (Phase 11 — dictionary data boundary)
↓
ReadingPrimitive (Phase 12 — learning surface)
WritingPrimitive (Phase 12 — learning surface)
↓
[Phase 13 integration types] (Phase 13 — search-to-learning)

### Scope Boundaries

- Lesson grouping, sequencing, tenant-specific weighting, and curriculum
  organization belong to Phase 15 (tenant and content configuration) and
  must not appear in Phase 12 types.
- Handwriting interpretation runtime belongs to a phase after Phase 13 and
  must not appear in Phase 12 types.
- These boundaries are governed by ADR-0011.

## Multi-Tenant Routing Concept

Tenant routing should be resolved before business logic runs.

1. A hostname or domain request enters middleware.
2. Middleware resolves tenant configuration from a tenant registry or data store.
3. Layout, branding, search behavior, tokenizer preferences, and content boundaries are applied to the request context.
4. The central engine serves the request through shared infrastructure and tenant-aware configuration.

```mermaid
flowchart TD
    A[Browser request] --> B[Hostname or domain]
    B --> C[Middleware]
    C --> D[Resolve tenant configuration]
    D --> E[Apply layout and branding settings]
    D --> F[Apply search and tokenization settings]
    E --> G[Central platform engine]
    F --> G
    G --> H[Render content or return data]
```

## Pluggable Tokenizer And Search Abstraction

The core lookup/search engine must not depend directly on one language implementation. Language-specific behavior should sit behind stable interfaces so Thai-first support can expand to Mandarin and other languages without rewriting core search logic.

Example driver responsibilities:

- Thai tokenizer driver: segmentation, normalization, tone-aware metadata, transliteration or romanization hooks where licensed data allows.
- Future Mandarin tokenizer driver: segmentation, normalization, pinyin hooks, simplified/traditional metadata, and language-specific ranking hints.
- Core lookup/search engine: receives normalized token output and metadata through shared interfaces, then handles indexing, lookup, filtering, and ranking in a language-agnostic way.

```mermaid
flowchart LR
    A[Source content or dictionary data] --> B[Ingestion pipeline]
    B --> C{Tokenizer driver}
    C --> D[Thai tokenizer]
    C --> E[Future Mandarin tokenizer]
    C --> F[Other language tokenizer]
    D --> G[Normalized token records]
    E --> G
    F --> G
    G --> H[Language-agnostic lookup/search engine]
    H --> I[Dictionary, content, or search response]
```

## Database Blueprint

This schema is conceptual and subject to ADRs and future migration decisions. It does not select a production database, migration framework, hosting provider, or ORM.

Candidate entities:

- `tenants`: tenant identity, hostname/domain mapping, locale defaults, enabled languages, branding references, and feature flags.
- `dictionary_entries`: normalized dictionary headwords, definitions, language metadata, tokenization metadata, source provenance, and licensing references.
- `dictionary_tenant_tags`: tenant-specific tagging, visibility, curation, lesson grouping, or search weighting applied to dictionary entries.
- `users`: future account identity, roles, tenant membership, and preference metadata if interactive account-based features are introduced.

The first implementation should keep data access boundaries explicit and avoid scattering persistence details across core language logic.

## Public Core And Future Private Envelope

The public repository owns shared platform infrastructure, governance files, open documentation, reusable tokenizer/search abstractions, and source code that can be safely distributed under the repository license.

Future private repositories or private deployment envelopes may own premium educational content, proprietary AI orchestration, monetization logic, analytics integrations, secrets, private prompts, and tenant-specific commercial data.

```mermaid
flowchart LR
    subgraph PublicCore[Public core repository]
        A[Shared platform infrastructure]
        B[Tokenizer and search abstractions]
        C[Open documentation]
        D[Governance and CI policy]
    end

    subgraph PrivateEnvelope[Future private envelope]
        E[Premium content]
        F[Proprietary AI orchestration]
        G[Monetization and analytics]
        H[Secrets and private configuration]
    end

    PublicCore --> I[Stable extension boundaries]
    PrivateEnvelope --> I
```

## Explicit Non-Goals

- No microservices yet.
- No frontend framework lock-in in this document.
- No production schema migrations yet.
- No AI dependency as a core runtime requirement.
- No commitment to a specific database, hosting provider, ORM, or deployment platform.
- No proprietary content, private prompts, commercial datasets, analytics secrets, or tenant-specific private data in the public core.

## Deterministic Query Explainability

The search query pipeline is intentionally shaped like a deterministic
compiler/runtime boundary:

```text
Raw Query
-> Lexer
-> Parser AST
-> Planner / Compiler
-> Execution Plan IR
-> Runtime Query Execution
-> Match Results / Diagnostics
```

Explainability infrastructure is an additive introspection layer over these
stage artifacts. It must not rewrite queries, inspect corpus state for planning,
introduce ranking, or mutate runtime execution. Equivalent inputs must produce
equivalent explanations, traces, stage artifacts, and serialized output.

Query explanations summarize structural remnants from each deterministic stage:
lexing, parsing, AST shape, compilation, execution-plan IR, runtime query shape,
execution results, and diagnostics. Explanation artifacts preserve source-span
provenance where the stage provides it and avoid retaining live runtime objects.

Execution traces are structural artifacts, not telemetry systems. They are not
performance profilers, metrics systems, tracing SDK integrations, adaptive
runtime infrastructure, or optimization signals. Trace identifiers and step
identifiers must be deterministic, timestamps must remain absent or explicitly
null, and metadata must be serialization-safe primitive data only.
