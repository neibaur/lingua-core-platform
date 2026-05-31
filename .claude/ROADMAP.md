# Architectural Roadmap

This roadmap is directional, not an implementation mandate. Each phase must be
derived repository-first, assessed before implementation, and captured in ADRs
when it introduces binding architecture decisions.

Authoritative phase completion status: `.claude/SESSION_STATE.md`

Phase 15 and beyond must be explicitly authorized before any work begins.

## Phase Status

| Phase    | Title                                                                           | Status                                  |
| -------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 8  | Deterministic query explainability, replay governance, and audit infrastructure | COMPLETE                                |
| Phase 9  | Deterministic runtime capability governance                                     | COMPLETE                                |
| Phase 10 | Lexical foundation and interoperability                                         | COMPLETE                                |
| Phase 11 | Dictionary data boundary                                                        | COMPLETE                                |
| Phase 12 | Reading and writing learning surface                                            | COMPLETE                                |
| Phase 13 | Search-to-learning integration                                                  | COMPLETE                                |
| Phase 14 | UI/API delivery boundary                                                        | COMPLETE                                |
| Phase 15 | Tenant and content configuration                                                | AUTHORIZED — ADR-0014 boundary drafting |
| Phase 16 | AI-assisted private envelope                                                    | PENDING AUTHORIZATION                   |
| Phase 17 | Multilingual expansion                                                          | PENDING AUTHORIZATION                   |

## Phase Summaries

**Phase 8** — Deterministic query explainability, replay governance, and audit
infrastructure. Snapshot lifecycle, reconstruction, compatibility evaluation,
diff governance, diagnostic aggregation, governance report composition, and
replay audit envelope composition.

**Phase 9** — Deterministic runtime capability governance. Governance layer
stack from capability manifest through governance closure. Single-layer
derivation law, caller-supplied identifiers, deepFreezeStructure requirement,
and domain-literal schema version convention formalized.

**Phase 10** — Lexical foundation and interoperability. Deterministic lexical
identity contracts, replay-safe lookup traces, diagnostic ordering guarantees,
lexical query enrichment contracts, execution plan snapshots, caller-supplied
trace identifiers, and typed interoperability seams between lexical, query,
and runtime systems.

**Phase 11** — Dictionary data boundary. Contracts-only dictionary data
boundary layer: DictionarySourceProvenance, DictionaryLicensingBoundary,
CanonicalDictionaryEntry, IngestionReadyDictionaryEntry. Typed provenance
embedding established as a mandatory pattern. No ingestion pipeline — structural
contracts only, with deterministic builders and deepFreezeStructure throughout.

**Phase 12** — Reading and writing learning surface. Deterministic reading and
writing practice primitives, spelling and orthography representation, and
learner-faced content structures. Delivered SpellingEntry, ReadingPrimitive,
and WritingPrimitive as independent structural types under `src/core/lexical/`.
All three slices complete and merged.

**Phase 13** — Search-to-learning integration. Connect deterministic query and
search outputs to dictionary, reading, and writing learning experiences without
introducing heuristic runtime behavior.

**Phase 14** — UI/API delivery boundary. Public application routes, API
contracts, static and SEO-first rendering, and browser-native fallbacks.
Delivered as the route category (three route delivery contracts deriving directly from the Phase 13 projections). The closure assessment found the four chartered categories resolve to a single groundable structural shape; API, static/SEO, and browser-native fallback are deferred as not structurally distinct under current grounding.

**Phase 15** — Tenant and content configuration. Tenant and language
configuration, feature boundaries, branding, and content visibility controls.
Requires explicit authorization.

**Phase 16** — AI-assisted private envelope. Optional private-envelope AI
workflows for explanation, generation, tutoring, or enrichment. AI must not
become a core runtime dependency. Requires explicit authorization.

**Phase 17** — Multilingual expansion. Extend the deterministic language
substrate beyond Thai-first support, including Mandarin and future language
modules. Requires explicit authorization.
