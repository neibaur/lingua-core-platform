# docs/architecture

Supplementary architecture reference documents for `lingua-core-platform`.

## Purpose

Files in this directory are deep subsystem reference documents. They exist
alongside `docs/adr/` but serve a different purpose:

- **`docs/adr/`** records *why* a decision was made — the context, the
  decision, the consequences, and the alternatives considered. ADRs are
  the authoritative source for architectural decisions.

- **`docs/architecture/`** explains *how* a completed subsystem works in
  operational detail — lifecycle stages, ordering contracts, invariants,
  and forward-looking constraints on subsequent phases. These documents
  exist when an ADR alone is not enough for a future implementer to navigate
  the subsystem correctly without accidentally violating its contracts.

## When a File Belongs Here

A subsystem warrants a file in this directory when it has one or more of
the following:

- A multi-stage lifecycle with precise transition rules (e.g. snapshot
  boundaries, reconstruction, validation, governance report composition)
- Formal ordering contracts that implementers must preserve (e.g. a
  three-key ordering matrix for diagnostics and mismatches)
- Forward-looking constraints written at a phase boundary to govern what
  the subsequent phase may and may not introduce

Not every phase produces a file here. Phases whose architectural decisions
are fully captured by their ADRs and whose subsystems have no multi-stage
lifecycle or formal ordering contracts do not require a companion document.
The absence of a file for a given phase is intentional, not a gap.

## Current Files

| File | Phase | Subject |
| --- | --- | --- |
| `deterministic-ordering-guarantees.md` | Phase 8/9 | Ordering matrix for replay governance report diagnostics, artifact summaries, aggregation stages, and canonical JSON serialization |
| `replay-governance-lifecycle.md` | Phase 8/9 | Replay lifecycle state machine from raw query ingestion through replay audit envelope composition |
| `replay-certification-foundations.md` | Phase 8→9 bridge | Certification philosophy, verification concepts, and constraints written at the Phase 8/9 boundary to govern Phase 9 scope. Phase 9 is complete; this document is retained as architectural history. |

## Relationship to Bootstrap Governance Files

These documents are **not** in the standard session bootstrap reading list.
They are subsystem-specific and too detailed for every session. The correct
pattern is to include a specific file from this directory in an implementation
prompt only when the slice being implemented touches the subsystem that file
describes.

Root-level governance files (`ARCHITECTURE.md`, `DATA_SOURCES.md`) and
`.claude/` session documents (`SESSION_STATE.md`, `HANDOFF_TEMPLATE.md`,
`ROADMAP.md`) are the active governance layer read at every session. Files
in this directory are reference material consulted on demand.

## Staleness Policy

Each file in this directory reflects the implementation state of a completed
phase. If a future phase modifies a subsystem described here, the corresponding
file must be updated as part of that phase's authorized scope and noted in the
relevant PR description. Stale subsystem reference documents are a PA.8
conflict surface for any implementation prompt that explicitly includes them
in its required reading list.