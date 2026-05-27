ADR-0012 — Search-to-Learning Integration Boundary
Status: Accepted
Phase: Phase 13
Supersedes: —
Related: ADR-0011 (Learning Surface Scope Boundaries)

Context
Phase 12 delivered three structural types representing learner-facing projections of canonical dictionary entries: SpellingEntry, ReadingPrimitive, and WritingPrimitive (SESSION_STATE.md — Completed Slices). These types are positioned between the dictionary data boundary (Phase 11) and search-to-learning integration (Phase 13) in the platform's layer stack (ARCHITECTURE.md — Learning Surface Layer).
The deterministic query and search pipeline delivers structured outputs through a confirmed integration path: query execution, query-lexical interoperability contracts, and lexical lookup results (SESSION_STATE.md — Completed Systems; ARCHITECTURE.md — Deterministic Query Explainability). No structural seam currently exists connecting those query outputs to Phase 12 learning primitives. That gap is the authorized scope of Phase 13.
Phase 13 is authorized for ADR drafting and planning only. No implementation is authorized by this document.

Decision
Phase 13 introduces deterministic structural projection and association contracts that structurally associate query and search outputs with Phase 12 learning primitives. These contracts form a structural seam — not a runtime selection engine, ranking system, or routing layer.
The integration seam must satisfy the following architectural constraints, all derived from active doctrine:
Determinism. Integration contracts must be structurally deterministic. Equivalent query inputs must produce equivalent structural associations. No heuristic scoring, probabilistic ranking, adaptive weighting, or runtime-variable selection logic is permitted at this layer (ARCHITECTURE.md — Deterministic Query Explainability; HANDOFF_TEMPLATE.md §3 — REPLAY-SAFE GOVERNANCE LAW).
Structural projection and association contracts only. Phase 13 delivers structural types and their deterministic builders. It does not deliver: UI or API delivery surfaces, tenant configuration, lesson sequencing, curriculum organization, AI-assisted enrichment, ingestion pipelines, handwriting interpretation, scoring, persistence, session state, mutable learning workflow state, or runtime orchestration. These belong to Phases 14–17 respectively and remain deferred (ROADMAP.md — Phase Summaries; ADR-0011 — Scope Boundaries).
Single-layer derivation. Phase 13 contracts derive state only from the immediately preceding layer. Passthrough semantics are preferred over recomputation. No lower-layer reach-through. No re-walking of Phase 11 or Phase 12 internals beyond established import boundaries (HANDOFF_TEMPLATE.md §3 — SINGLE-LAYER GOVERNANCE DERIVATION LAW).
No heuristic runtime behavior. The prohibition in ROADMAP.md Phase 13 summary ("without introducing heuristic runtime behavior") is a hard architectural constraint, not a preference. Any field, function, or contract shape that would require runtime scoring, dynamic weighting, or adaptive behavior to produce a meaningful result is out of scope for this phase.
Typed references. Any Phase 13 type that references a Phase 12 type (ReadingPrimitive, WritingPrimitive, SpellingEntry) or a query/lexical type must use the typed structural form. Raw string coupling to a typed concept is a doctrine violation (HANDOFF_TEMPLATE.md §3 — TYPED REFERENCE LAW).
Immutability. All externally exposed Phase 13 artifacts must be deep-frozen via deepFreezeStructure (HANDOFF_TEMPLATE.md §3 — IMMUTABILITY LAW).
Replay safety. No Date.now(), Math.random(), UUID generation, or hash-derived identifiers. Caller-supplied identifiers only. evaluationTimestamp: null applies to any governance-reporting artifact introduced at this layer (HANDOFF_TEMPLATE.md §3 — REPLAY-SAFE GOVERNANCE LAW).
File placement deferred. The exact directory location and file topology for Phase 13 types must be derived from repository-first assessment at the start of the authorized implementation session. This ADR describes the architectural layer; it does not prescribe file placement.
Schema version convention. Phase 13 schema version literals must follow the established convention: lingua-core-platform:<kebab-case-artifact-slug>@phase13.

Consequences
What becomes possible. A deterministic structural seam between query outputs and Phase 12 learning primitives exists as a typed projection and association contract. Phases 14 and beyond can consume this seam without reaching through query or lexical internals directly.
What remains prohibited at this layer. Selection logic, ranking, scoring, lesson sequencing, curriculum organization, tenant-specific weighting, UI rendering contracts, API response shapes, AI-assisted enrichment, ingestion pipelines, persistence, session state, mutable learning workflow state, and runtime orchestration. User-progress adaptation, personalization, mastery tracking, and learner-state mutation are out of scope for this layer. Discovery of any of these during pre-implementation assessment is a PA.8 conflict.
What this ADR does not decide. Exact type names, field shapes, file placement, slice count, and builder signatures. These are derived during pre-implementation assessment and governed by the Documentary Derivation Law, the Typed Reference Law, and existing sibling topology.

Prohibited Vocabulary
The following terms must not appear in any Phase 13 type name, field name, builder name, schema version literal, test description, or inline comment. Their presence is an indicator of scope drift into deferred phases:
lesson, exercise plan, recommendation, curriculum, difficulty, adaptive, learning path, session, queue, progress, mastery, personalization, learner state, attempt, scoring

Grounding Sources

ROADMAP.md — Phase 13 summary: "Connect deterministic query and search outputs to dictionary, reading, and writing learning experiences without introducing heuristic runtime behavior"
ARCHITECTURE.md — Learning Surface Layer: layer position diagram and scope boundaries
ARCHITECTURE.md — Deterministic Query Explainability: query pipeline structure and explainability constraints
ADR-0011 — Learning Surface Scope Boundaries: precedent for scope prohibition language and deferred-phase enumeration
SESSION_STATE.md — Completed Systems and Completed Slices: confirmed integration path and Phase 12 baseline
