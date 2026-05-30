ADR-0013 — UI/API Delivery Boundary
Status: Accepted
Phase: Phase 14
Supersedes: —
Related: ADR-0012 (Search-to-Learning Integration Boundary); ADR-0011 (Learning Surface Scope Boundaries)

Context
SESSION_STATE.md records the integration path as terminating at the Phase 13 search projections — ReadingPrimitiveSearchProjection, WritingPrimitiveSearchProjection, and SpellingEntrySearchProjection — with Phase 13 marked COMPLETE (all three slices merged) and Phase 14 listed under Deferred Scope as PENDING AUTHORIZATION (SESSION_STATE.md — Current Phase and Status; Completed Slices; Deferred Scope). The roadmap concurs: Phase 13 COMPLETE, Phase 14 PENDING AUTHORIZATION (ROADMAP.md — Phase Status).

These Phase 13 projection outputs are the terminal structural artifacts of the deterministic pipeline as it currently exists. No structural seam connects those outputs to public-facing delivery shapes. Specifically, no contract presently connects Phase 13 projection outputs to public application routes, API response envelopes, static/SEO rendering contracts, or browser-native fallback contracts. ARCHITECTURE.md anticipates this surface as platform principle — "Prefer static rendering, SEO durability, dictionary/search foundations, and browser-native fallbacks before interactive multi-user features" (ARCHITECTURE.md — Core Architectural Principles) — and the roadmap scopes it as "Public application routes, API contracts, static and SEO-first rendering, and browser-native fallbacks" (ROADMAP.md — Phase 14 summary). That structural gap is the authorized scope of Phase 14.

Phase 14 is authorized for ADR drafting and planning only. No implementation is authorized by this document. Acceptance of this ADR authorizes Phase 14 assessment and planning only. Implementation authorization for each slice remains governed by SESSION_STATE.md and ROADMAP.md and requires a repository-first pre-implementation assessment per HANDOFF_TEMPLATE.md §9 before any code is written.

Decision
Phase 14 introduces deterministic structural delivery contracts that connect Phase 13 projection outputs to public-facing delivery shapes — public application routes, API response envelopes, static/SEO rendering contracts, and browser-native fallback contracts. These contracts form a structural seam only. They are not a runtime resolution engine, a rendering orchestration layer, or a transport framework. The seam must satisfy the following architectural constraints, all grounded by citation or named-law derivation below.

No runtime resolution.
Phase 14 defines delivery contracts only. It does not perform runtime route resolution, rendering strategy selection, adaptive fallback negotiation, content negotiation, or transport orchestration. Any field, function, or contract shape that would require runtime delivery resolution to produce a meaningful result is out of scope for this phase.
Grounding: This is a derived doctrinal consequence of the STATIC RESOLUTION LAW, which prohibits "plugin systems, runtime registries, ambient runtime discovery, dependency injection containers, mutable singleton state, or async orchestration" and mandates "explicit orchestration, static composition, deterministic layering, discriminated unions, and readonly contracts" (HANDOFF_TEMPLATE.md §3 — STATIC RESOLUTION LAW). It is further grounded in the GOVERNANCE LEGALITY LAW: "Not all technically possible derivations are architecturally legal," prohibiting "convenience recomputation across governance boundaries" and "implicit semantic recomposition" and preferring "passthrough semantics, explicit derivation chains" (HANDOFF_TEMPLATE.md §3 — GOVERNANCE LEGALITY LAW). A contract requiring runtime negotiation to yield meaning is a runtime resolution path, not a static structural derivation, and is therefore architecturally illegal at this layer under both named laws.

Structural contracts only.
Phase 14 delivers structural types and deterministic builders. It does not deliver: UI rendering implementation, actual router or framework bindings, HTTP transport, serialization implementation, authentication, rate limiting, sitemap generation, robots orchestration, metadata ranking, dynamic SEO mutation, bundle configuration, service worker implementation, session state, persistence, tenant configuration, AI-assisted enrichment, or multilingual expansion.
Deferred-phase ownership where the supplied documents confirm the assignment:

Tenant configuration → Phase 15 (Tenant and content configuration) — PENDING AUTHORIZATION (ROADMAP.md — Phase 15 summary; SESSION_STATE.md — Deferred Scope). The middleware-resolved tenant configuration surface described in ARCHITECTURE.md — Multi-Tenant Routing Concept (hostname → middleware → resolve tenant configuration → apply layout/branding/search/tokenizer settings) belongs to that phase.
AI-assisted enrichment → Phase 16 (AI-assisted private envelope) — PENDING AUTHORIZATION (ROADMAP.md — Phase 16 summary; SESSION_STATE.md — Deferred Scope; ARCHITECTURE.md — Explicit Non-Goals: "No AI dependency as a core runtime requirement").
Multilingual expansion → Phase 17 (Multilingual expansion beyond Thai-first) — PENDING AUTHORIZATION (ROADMAP.md — Phase 17 summary; SESSION_STATE.md — Deferred Scope).
The remaining excluded items — session state, persistence, HTTP transport, serialization implementation, authentication, rate limiting, sitemap generation, robots orchestration, metadata ranking, dynamic SEO mutation, bundle configuration, service worker implementation, router/framework bindings, and UI rendering implementation — are not assigned to a single numbered phase in the supplied documents. Their exclusion here is a derived doctrinal consequence rather than a phase-ownership citation: each is a runtime delivery-resolution or mutable-runtime concern excluded by the STATIC RESOLUTION LAW (no runtime registries, ambient discovery, mutable singleton state, or async orchestration) and, for state-bearing items (session state, persistence), by the REPLAY-SAFE GOVERNANCE LAW (HANDOFF_TEMPLATE.md §3). I note explicitly that I do not assign these to a specific deferred phase, because no supplied document does; I ground them on named law only. ARCHITECTURE.md — Explicit Non-Goals additionally confirms the platform takes "No frontend framework lock-in" and "No commitment to a specific database, hosting provider, ORM, or deployment platform," which forecloses framework bindings, transport, persistence, and bundle/service-worker delivery mechanics at the architectural-principle level.

Single-layer derivation.
Phase 14 contracts derive state only from Phase 13 projection outputs (ReadingPrimitiveSearchProjection, WritingPrimitiveSearchProjection, SpellingEntrySearchProjection). No reach-through to Phase 12 or earlier layers beyond established import boundaries. Passthrough semantics are preferred over recomputation.
Grounding: SINGLE-LAYER GOVERNANCE DERIVATION LAW — "A governance or reporting layer may derive state ONLY from the immediately preceding layer. Passthrough semantics are preferred over recomputation. No lower-layer reach-through. No re-walking of lower governance structures. No bypassing of abstraction boundaries" (HANDOFF_TEMPLATE.md §3). The Phase 13 projections are the immediately preceding layer per the confirmed terminal integration state (SESSION_STATE.md — Active Scope and Derivation Surface; ARCHITECTURE.md — Learning Surface Layer / Layer Position).

Typed references.
The pre-implementation assessment for each slice must confirm whether a reusable typed provenance carrier exists in the Phase 13 projections before any provenance-bearing field is shaped as a string primitive. If such a backing structural type exists, the typed structural form is required.
Grounding: TYPED REFERENCE LAW — "When a backing structural type exists for a concept that would otherwise be represented as a raw string identifier, the typed structural reference is required. Raw string identifiers … are only permitted when no backing structural type exists … Loose string coupling to a typed concept is a doctrine violation" (HANDOFF_TEMPLATE.md §3). The determination of which Phase 13 type members qualify as backing carriers is a matter for the per-slice assessment under the DOCUMENTARY DERIVATION LAW and is not pre-decided here.

Immutability, replay safety, determinism.
The following active laws are carried forward from HANDOFF_TEMPLATE.md §3 without modification and apply in full to every Phase 14 artifact and builder:

IMMUTABILITY LAW — "readonly TypeScript is insufficient. deepFreezeStructure(...) is required on all externally exposed artifacts. Shallow Object.freeze violates this law" (HANDOFF_TEMPLATE.md §3).
REPLAY-SAFE GOVERNANCE LAW — caller-supplied identifiers only; "No Date.now(), Math.random(), UUID generation, hash-derived identifiers, or crypto randomness at any step"; no structural-artifact field may carry a default value, generated fallback, or internal derivation routine for identifier values; evaluationTimestamp: null is the replay-safe sentinel for governance-reporting artifacts exclusively (HANDOFF_TEMPLATE.md §3).
DETERMINISTIC ORDERING LAW — "Clone before sort. Binary lexicographic ordering only. No localeCompare … No locale-aware collation of any kind" (HANDOFF_TEMPLATE.md §3). Equivalent inputs must produce equivalent delivery contracts and equivalent structural output, consistent with the determinism guarantee in ARCHITECTURE.md — Deterministic Query Explainability ("Equivalent inputs must produce equivalent explanations, traces, stage artifacts, and serialized output").
ARTIFACT CLASSIFICATION LAW — structural and governance-reporting classifications are intentional and must not be normalized; evaluationTimestamp: null and generatedFrom apply exclusively to governance-reporting artifacts, and their presence on a structural artifact (or absence on a governance-reporting artifact) is a law violation (HANDOFF_TEMPLATE.md §3). Each Phase 14 artifact's classification is determined at assessment time, not pre-decided here.
INVARIANT GUARD FORM LAW — all builder invariant guards must execute directly and inline in the builder body as direct === equality comparisons or inline literal switch statements only; no Set.has(), .includes() over constructed lists, lookup tables, map-based dispatch, computed guard evaluation, or delegated validation routines (HANDOFF_TEMPLATE.md §3).
GOVERNANCE LEGALITY LAW — preserve explicit derivation ancestry, lawful provenance boundaries, replay-safe lineage continuity, and deterministic composition legality (HANDOFF_TEMPLATE.md §3).
Schema version convention.
Phase 14 schema version literals must follow the established repository convention: lingua-core-platform:<kebab-case-artifact-slug>@phase14 (HANDOFF_TEMPLATE.md §6 — Convention; SESSION_STATE.md — Schema Version Literals, where every phase-labelled literal observes this exact pattern). Per the Phase label invariant, phase labels are lineage identifiers and not lifecycle version indicators; no migration of any existing @phase9–@phase13 literal is warranted, and ARCHITECTURE.md defines no phase-coupled migration semantics (SESSION_STATE.md — Deferred Scope; Phase label invariant).

File placement deferred.
The exact directory location and file topology for Phase 14 types must be derived from repository-first assessment at the start of each authorized implementation session, following existing sibling topology exactly. This ADR describes the architectural layer; it does not prescribe file placement (HANDOFF_TEMPLATE.md §2 — directory-topology derivation requirement; §12 — "Inspect directory topology before proposing any file placement").

Consequences
What becomes possible. A deterministic structural seam exists between the Phase 13 projection outputs and public-facing delivery shapes, expressed as typed delivery contracts and their deterministic builders. Phase 15 and beyond can consume these contracts without reaching through Phase 13 internals directly, preserving the single-layer derivation boundary (HANDOFF_TEMPLATE.md §3 — SINGLE-LAYER GOVERNANCE DERIVATION LAW) and the public-core/private-envelope separation and content-first progression described in ARCHITECTURE.md (Core Architectural Principles; Public Core And Future Private Envelope).

What remains prohibited at this layer. Runtime route resolution, rendering strategy selection, fallback negotiation, content negotiation, and transport orchestration; UI rendering implementation, router/framework bindings, HTTP transport, serialization implementation, authentication, rate limiting, sitemap generation, robots orchestration, metadata ranking, dynamic SEO mutation, bundle configuration, service worker implementation, session state, and persistence; tenant configuration (Phase 15), AI-assisted enrichment (Phase 16), and multilingual expansion (Phase 17). Discovery of any of these as a requirement during pre-implementation assessment is a PA.8 conflict to be surfaced, not reconciled (HANDOFF_TEMPLATE.md §9 — PA.8; NO SPECULATIVE REMEDIATION LAW).

What this ADR does not decide. Exact type names, field names, field shapes, interface members, builder parameters, builder signatures, structural payload shapes, slice count, and file placement. These are derived during pre-implementation assessment and governed by the DOCUMENTARY DERIVATION LAW, the TYPED REFERENCE LAW, the ARTIFACT CLASSIFICATION LAW, and existing sibling topology (HANDOFF_TEMPLATE.md §3, §9).

Prohibited Vocabulary
The following terms must not appear in any Phase 14 type name, field name, builder name, schema version literal, test description, or inline comment. Each is grounded in a specific deferred phase or governing law. Presence of any is treated as an indicator of scope drift.

Required terms:

render engine — UI rendering implementation is excluded (Decision §2); derived from STATIC RESOLUTION LAW (no runtime orchestration).
hydration — runtime client rendering; STATIC RESOLUTION LAW (no ambient runtime discovery / async orchestration).
router — router/framework bindings excluded (Decision §2); STATIC RESOLUTION LAW (no runtime registries/discovery); ARCHITECTURE.md — Explicit Non-Goals (no frontend framework lock-in).
session — session state excluded (Decision §2); STATIC RESOLUTION LAW (no mutable singleton state) and REPLAY-SAFE GOVERNANCE LAW.
cache — runtime mutable state; STATIC RESOLUTION LAW (no mutable singleton state).
personalization — derived runtime/user-state adaptation; out of scope per ADR-0012 precedent and Phase 16 (AI-assisted private envelope) / Phase 15; ROADMAP.md — Phase 15/16 summaries.
negotiation — content/fallback negotiation is runtime resolution (Decision §1); STATIC RESOLUTION LAW.
middleware — tenant-resolution middleware belongs to Phase 15 (ARCHITECTURE.md — Multi-Tenant Routing Concept; ROADMAP.md — Phase 15); STATIC RESOLUTION LAW.
SSR runtime — runtime rendering execution; STATIC RESOLUTION LAW (no async orchestration).
orchestration — STATIC RESOLUTION LAW (no async orchestration); transport/rendering orchestration excluded (Decision §1–§2).
adapter registry — STATIC RESOLUTION LAW (no plugin systems, runtime registries, ambient discovery).
sitemap — sitemap generation excluded (Decision §2); derived from STATIC RESOLUTION LAW / no-runtime-resolution constraint.
robots — robots orchestration excluded (Decision §2); STATIC RESOLUTION LAW.
metadata ranking — metadata ranking excluded (Decision §2); derived from no-runtime-resolution constraint and the no-ranking determinism posture (ARCHITECTURE.md — Deterministic Query Explainability: explainability "must not … introduce ranking").
dynamic SEO — dynamic SEO mutation excluded (Decision §2); REPLAY-SAFE GOVERNANCE LAW and DETERMINISTIC ORDERING LAW; "dynamic" denotes runtime resolution barred by STATIC RESOLUTION LAW.
evaluation map — map-based dispatch / computed guard evaluation; INVARIANT GUARD FORM LAW (HANDOFF_TEMPLATE.md §3).
lesson — Phase 15 curriculum/content organization (ARCHITECTURE.md — Learning Surface Layer / Scope Boundaries; ROADMAP.md — Phase 15); ADR-0012 prohibited-vocabulary precedent.
exercise — deferred learning-content vocabulary; ADR-0011/ADR-0012 precedent; Phase 15 (ROADMAP.md — Phase 15).
recommendation — heuristic/learning-selection vocabulary; ADR-0012 precedent; STATIC RESOLUTION LAW (no adaptive selection).
curriculum — Phase 15 curriculum organization (ARCHITECTURE.md — Scope Boundaries; ROADMAP.md — Phase 15); ADR-0012 precedent.
difficulty — adaptive learning-state vocabulary; ADR-0012 precedent; derived from no-runtime-resolution constraint.
adaptive — adaptive runtime behavior; STATIC RESOLUTION LAW and no-runtime-resolution constraint (Decision §1); ADR-0012 precedent.
learning path — sequencing/curriculum vocabulary; Phase 15 (ARCHITECTURE.md — Scope Boundaries); ADR-0012 precedent.
progress — learner-state mutation; REPLAY-SAFE GOVERNANCE LAW (no mutable runtime state); ADR-0012 precedent.
mastery — learner-state tracking; REPLAY-SAFE GOVERNANCE LAW; ADR-0012 precedent.
scoring — runtime scoring; ADR-0012 precedent; STATIC RESOLUTION LAW and no-runtime-resolution constraint (Decision §1).
Additional terms identified as scope-drift indicators (governing law or deferred phase stated for each):

authentication / auth — excluded (Decision §2); STATIC RESOLUTION LAW (no mutable runtime/session state); no supplied document assigns it a phase, so grounded on named law only.
rate limiting — excluded (Decision §2); STATIC RESOLUTION LAW (runtime resolution / mutable state).
transport — HTTP transport excluded (Decision §2); STATIC RESOLUTION LAW; ARCHITECTURE.md — Explicit Non-Goals (no hosting/deployment commitment).
serializer / serialization runtime — serialization implementation excluded (Decision §2); STATIC RESOLUTION LAW (the seam is a contract, not a transport implementation).
service worker — excluded (Decision §2); STATIC RESOLUTION LAW (ambient runtime).
bundle — bundle configuration excluded (Decision §2); ARCHITECTURE.md — Explicit Non-Goals (no framework/deployment lock-in).
persistence / store — excluded (Decision §2); REPLAY-SAFE GOVERNANCE LAW; ARCHITECTURE.md — Explicit Non-Goals (no database/ORM commitment).
tenant — tenant configuration belongs to Phase 15 (ROADMAP.md — Phase 15; ARCHITECTURE.md — Multi-Tenant Routing Concept).
telemetry / analytics — barred platform identity; ARCHITECTURE.md — Explicit Non-Goals and §11 architectural identity (the repository is NOT a telemetry or analytics system; HANDOFF_TEMPLATE.md §11).
registry / plugin / discovery — STATIC RESOLUTION LAW (no plugin systems, runtime registries, ambient runtime discovery).
middleware-resolved / runtime-resolve (and equivalent runtime-resolution verbs) — no-runtime-resolution constraint (Decision §1); STATIC RESOLUTION LAW.
Grounding Sources

Cautionary terms — not prohibited, pending assessment:
The following terms are runtime-resolution indicators in behavioral contexts but may prove warranted in purely structural contexts depending on what a repository-first pre-implementation assessment finds. They are flagged here as scope-drift risks rather than outright prohibited. If any appears in a Phase 14 implementation, the pre-implementation assessment must explicitly confirm that its use is structural and does not introduce runtime route resolution, pattern matching, or parameter evaluation behavior — any such use would be barred by the no-runtime-resolution constraint and the STATIC RESOLUTION LAW regardless of vocabulary.

wildcard — implies dynamic pattern matching at runtime; only acceptable if a structural route contract demonstrably requires a statically typed representation of open route positions and no matching behavior is introduced
route pattern — implies runtime pattern resolution; only acceptable if a structural route contract demonstrably requires a typed representation of route shape without any evaluation semantics
parameter schema — implies runtime parameter resolution or validation; only acceptable if a structural typing requirement is confirmed by repository evidence and no runtime evaluation is introduced

SESSION_STATE.md — Current Phase and Status; Completed Slices; Active Scope and Derivation Surface; Deferred Scope: confirms the integration path terminates at the three Phase 13 search projections, Phase 13 COMPLETE, and Phase 14 PENDING AUTHORIZATION.
SESSION_STATE.md — Schema Version Literals; Phase label invariant: confirms the lingua-core-platform:<artifact>@<phase> convention and the no-migration posture.
ROADMAP.md — Phase Status table and Phase 14–17 summaries: scopes Phase 14 (public routes, API contracts, static/SEO-first rendering, browser-native fallbacks) and assigns deferred ownership for Phases 15–17.
ARCHITECTURE.md — Core Architectural Principles: "Prefer static rendering, SEO durability … and browser-native fallbacks before interactive multi-user features"; "Avoid framework, hosting, database, or AI-provider lock-in"; "Record major architectural decisions in ADRs before making them binding."
ARCHITECTURE.md — Multi-Tenant Routing Concept: middleware/tenant-resolution surface assigned to Phase 15.
ARCHITECTURE.md — Deterministic Query Explainability: determinism, no-ranking, and equivalent-input/equivalent-output guarantees.
ARCHITECTURE.md — Learning Surface Layer / Layer Position / Scope Boundaries: confirmed layer stack and deferred learning-content vocabulary.
ARCHITECTURE.md — Explicit Non-Goals: no frontend framework lock-in, no production schema migrations, no AI core dependency, no database/hosting/ORM/deployment commitment, no analytics/telemetry secrets in public core.
HANDOFF_TEMPLATE.md §3 — named doctrine laws: STATIC RESOLUTION LAW, GOVERNANCE LEGALITY LAW, SINGLE-LAYER GOVERNANCE DERIVATION LAW, TYPED REFERENCE LAW, IMMUTABILITY LAW, REPLAY-SAFE GOVERNANCE LAW, DETERMINISTIC ORDERING LAW, ARTIFACT CLASSIFICATION LAW, INVARIANT GUARD FORM LAW, DOCUMENTARY DERIVATION LAW, NO SPECULATIVE REMEDIATION LAW.
HANDOFF_TEMPLATE.md §2, §6, §9, §12: directory-topology derivation requirement, schema version convention and phase-label invariant, PA.8 conflict surface, and file-placement-at-assessment requirement.
HANDOFF_TEMPLATE.md §11 — Architectural Identity Reinforcement: the repository is NOT a telemetry/analytics system, plugin ecosystem, or dynamically extensible runtime.
ADR-0012 — Search-to-Learning Integration Boundary: structural template for scope-prohibition language, deferred-phase enumeration, and prohibited-vocabulary section, and source of the carried-forward learning-content prohibited terms.
ADR-0011 — Learning Surface Scope Boundaries: precedent for deferred curriculum/sequencing vocabulary.
Omission note: No candidate type names, field names, interface members, builder parameters, or structural payload shapes are proposed in this ADR. Per the Type shape constraint and the DOCUMENTARY DERIVATION LAW, any such shape that cannot be grounded in a supplied repository document or existing type signature is withheld for the per-slice pre-implementation assessment rather than pre-designed here. Where the directive's enumerated exclusions (e.g., session state, persistence, transport, authentication) are not assigned to a numbered phase by any supplied document, I have grounded them on named law only and explicitly declined to invent a phase assignment.