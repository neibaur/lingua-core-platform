# LINGUA-CORE-PLATFORM — SESSION STATE

Cross-Session State Document | Updated After Each PR Cycle

## Per-PR Update Block

> Single source of truth for values that change most cycles. Update them here and
> nowhere else; every other file points to this block rather than restating it.
> Completed Slices, Schema Version Literals, and Open Doctrinal Questions below
> are append-only logs. Record the last MERGED PR (stable, knowable post-merge);
> never record the current branch or a self-referential commit hash.

- Current phase: Phase 15 — COMPLETE (closure ADR-0015 accepted; tenant identity +
  enabled-language configuration realized by TenantConfiguration + CanonicalLanguageTag).
  The ADR-0016 corrective core thread (th→en whitespace returned diagnostic) is IMPLEMENTED
  and merged (#181); the apps/usethai consumption slice is merged (#182). No core slice pending.
- Next action: First FIXTURE triage cycle COMPLETE. Cluster 1 (lookup
  direction in page heading/title) implemented via the P2 direction-aware
  chrome slice (#189); Cluster 3 field-population investigation confirmed
  the expected outcome — the remaining multi-entry ambiguity is a
  data-content gap, not a render omission, so no app change was warranted.
  Cluster 2 (mixed-case echo) remains closed as intended, bounded by the
  no-normalized-key guardrail; Clusters 5 and 8 remain HELD under
  reachability-≠-warrant pending a mapping REAL signal; Cluster 4 remains
  data/core-schema-gated; Clusters 6/7 remain core-governance-class only
  if REAL evidence accumulates; Cluster 9 remains closed as fixture noise.
  No core slice pending. Continue gathering REAL lookup friction through
  docs/usethai/ux-friction-log.md before considering any search-related
  warrant. Phase 16/17 remain PENDING AUTHORIZATION (HANDOFF §9 audit
  first).
  Dataset-readiness review (step 4) complete. Volubilis data-shape spike merged — a throwaway, non-governed, docs-only investigation (report: docs/spikes/volubilis-data-shape-spike.md, snapshot SHA-pinned). Findings: Volubilis is a license-verified CC BY-SA 4.0 TH↔EN foundation (~114k rows; headword/romanization/POS ~100%, English gloss 93%) that maps to the existing LexicalEntry/CanonicalDictionaryEntry via a moderate adapter — sense-split on ;, a lossy 73→10 TYPE→LexicalPartOfSpeech map — plus decisions (Thai whitespace ~7.5% throws; romanization-column choice; duplicate-headword merge ~11.4k rows). Critically: no native tone (length only) — a tone-marked surface would be a generated transcriber dependency, so Volubilis does not close Cluster 4 on its own; ~46% of rows are multi-word expressions. Ingestion is a core initiative, not authorized here; it remains gated on (a) a product-posture / CC BY-SA ShareAlike decision and (b) whether tone is a product requirement. Any future adapter, contract extension, or ingestion goes through normal core governance. No core slice pending.
- UX friction evidence log added (docs/usethai/ux-friction-log.md, #184) — the append-only
  evidence vehicle for the UX-maturation phase. Captures real lookup friction (FIXTURE vs REAL,
  target-confirmed-present, descriptive friction types); warrant/triage is a separate deferred
  review. Only REAL clustered query-form-unmatched signals can support a core search-capability
  warrant; fixture-only friction is discounted.
- Last accepted ADR: ADR-0016 (docs/adr/0016-lexical-lookup-whitespace-diagnostic-surfacing.md),
  Accepted — implemented in #181
- Tests passing: 859
- Test files: 62
- Statement coverage: 92.79%
- Last merged PR: #190 — docs(spikes): add Volubilis data-shape assessment

## Application-tier — current state

- App status: shell + Cloudflare adapter (build-green) + layout/component
  baseline + honest lookup states + P1 lookup presentation maturation +
  P2 direction-aware chrome (reactive heading/title), all merged.
- Active app branch: none.
- Evidence: friction log seeded — 13 FIXTURE entries (both directions);
  triage complete (docs/usethai/warrant-review-2026-06-07.md). Cluster 1
  disposition implemented (#189); Cluster 3 investigation confirmed a
  data-content gap rather than a render omission. No REAL data yet. Volubilis license independently verified (CC BY-SA 4.0, rights-holder Francis Bastien) and a fixed snapshot pinned (v25.3, SHA-256) via the data-shape spike; data shape now known. Still candidate — not approved_for_ingestion (ShareAlike intent / commercial posture unresolved). Volubilis data-shape spike (docs/spikes/volubilis-data-shape-spike.md): viable CC BY-SA 4.0 foundation, moderate adapter, no native tone, ~46% multi-word expressions — ingestion is a gated core decision, not undertaken.

Completed Slices, the validation baseline, and Schema Version Literals track core
(src/core) only. Application-tier load-bearing learnings (durable; for the next
planning session):

- The core consumes cleanly as source via a Vite path alias (@core ->
  ../../src/core); no core build/exports/dist is needed yet.
- Exact-key lexical lookup may be insufficient for a mature dictionary UX — prefix/substring/
  fuzzy is suspected wanted, but this is to be confirmed by app-use evidence before any core
  search work is warranted (evidence-driven, not architecture-driven).
- en→th whole-phrase lookup is delivered in core (feat/lexical-english-phrase-keying;
  ARCHITECTURE "Lexical Key Normalization Policy" — symmetric whole-phrase canonical English
  key, exact-equality only) AND is now reachable through the apps/usethai UI: the blanket
  whitespace pre-guard was removed in #182, so "to eat" → กิน resolves and renders. th→en
  whitespace queries now surface core's REAL LEXICAL_KEY_WHITESPACE_REJECTED diagnostic through
  the PR-177 honest-states taxonomy (categoryForDiagnostic → rejected-input); the app no longer
  fabricates the code. Known consequence: the real diagnostic severity is "warning" (core's
  grounded value), where the app's prior fabricated diagnostic claimed "error" — the severity
  badge now reflects core's true value (state/category unchanged). Empty/whitespace-only input
  rests in a neutral awaiting-input state without calling core.
- Barrel denominator captured — docs/architecture/tokenizer-search-barrel-inventory.md
  (merged). Two search surfaces are already app-reachable: lexical exact-key lookup
  (composeLexicalLookup) and a tokenizer corpus token/phrase path
  (buildSearchProjection -> CorpusIndexer -> executeQuery / executePhraseQuery).
  prefix / substring / fuzzy are NOT PRESENT and non-goaled in lexical lookup; if
  ever warranted they belong to the tokenizer/search layer only. Phase 13 search
  projections and Phase 14 route delivery contracts sit in a leaf-only barrel
  (query-learning-interop) with no app-legal path today.
- P1 lookup presentation maturation merged (#186, app-tier; no core change).
  Diagnostics render via orderLexicalDiagnostics (all diagnostics, not just [0]).
  Policy B: app copy primary for mapped diagnostic codes, core's verbatim
  diagnostic.message primary for unmapped codes (the generic fallback was removed),
  with core's verbatim message also disclosed as secondary; severity always from
  core's diagnostic.severity. Result rendering exercises multi-definition and
  multi-entry paths in core-returned order, no app sort. Raw query + direction echo
  on every state, sourced from raw client controls (never result.query) — preserves
  the no-normalized-key guardrail.
- Direction-aware chrome (page heading + document title) now reflects the
  currently selected lookup direction independent of lookup execution.
  SSR seeds the default direction for first paint; client-side direction
  changes update both surfaces without triggering lookup. The copy source
  is centralized in app presentation code and shared between SSR and
  client synchronization.
- Lexical index homograph asymmetry (confirmed during P1 fixture enrichment): th→en
  is one-entry-per-key by construction (thaiToEnglish: Record<string, LexicalEntry>,
  last-writer-wins), so th→en cannot surface homographs; en→th admits multiple
  entries per key (englishToThai: Record<string, readonly LexicalEntry[]>, dedup by
  reference identity only). The multi-entry render path is fixture-observable only
  via en→th (seed: แก่/เก่า both "old"). Structural core fact, not an app defect —
  any UX consequence is a friction-log observation, not a core change.
- Reachability ≠ warrant: the app-reachable corpus token/phrase path
  (buildSearchProjection → CorpusIndexer → executeQuery/executePhraseQuery) is held
  UNWIRED pending a logged friction signal that maps to it. matchSearchTerm is
  token-exact, not substring (inventory Observation 4), so it would not deliver
  partial/narrowing behavior regardless.

- Friction triage (2026-06-07) is persisted at
  docs/usethai/warrant-review-2026-06-07.md; clusters 5 and 8 are recorded HELD there
  pending REAL evidence — do not re-litigate them from FIXTURE.

Application-tier work is governed and tracked separately per
APP_SHELL_GUIDELINES.md.

## Current Phase and Status

- Phase 11 status: COMPLETE (all four slices merged)
- Phase 12 status: COMPLETE (all three slices merged)
- Phase 12 first slice COMPLETE: SpellingEntry (feat/phase12-spelling-entry)
- Phase 12 second slice COMPLETE: ReadingPrimitive (feat/phase12-reading-primitive)
- Phase 12 third slice COMPLETE: WritingPrimitive (feat/phase12-writing-primitive)
- Phase 13 status: COMPLETE (all three slices merged)
- Phase 13 ADR: ADR-0012 COMPLETE (docs/adr/0012-search-to-learning-integration-boundary.md)
- Phase 13 — Search-to-Learning Integration (all three slices merged)
- Phase 14 ADR: ADR-0013 ACCEPTED (docs/adr/0013-ui-api-delivery-boundary.md)
- Phase 14 status: COMPLETE (route category — three route delivery contracts merged: Reading/Writing/Spelling
  SearchProjectionRouteDeliveryContract; foundational delivery primitive assessed and found unwarranted; remaining chartered categories deferred — see Deferred Scope)
- fix/adr-0013-foundational-primitive-clarification — authorized foundational delivery primitive as structural
  precursor to chartered categories; updated "exactly one category" clause; corrected Context and Grounding Sources pre-authorization snapshot references
- fix/phase14-delivery-vocabulary-amendment — added Structural Vocabulary section to ADR-0013 establishing
  chartered delivery categories, canonical delivery identity, and static content address as repository-grounded concepts
- fix/phase14-delivery-boundary-architecture-grounding — added ARCHITECTURE.md Delivery Boundary Layer
  grounding for Phase 14 delivery-contract content concepts, including static content address and deterministic structural delivery contracts; documentation-only governance clarification, no implementation slice delivered
- fix/adr-0013-delivery-boundary-companion-clarification — aligned ADR-0013 with the ARCHITECTURE.md Delivery
  Boundary Layer grounding; clarified that future Phase 14 assessments may evaluate directly chartered delivery contracts against the new architectural grounding; documentation-only clarification, no implementation slice delivered
- Phase 15 ADR: ADR-0014 ACCEPTED (docs/adr/0014-tenant-and-content-configuration-boundary.md)
- Phase 15 status: COMPLETE (binding-grounded surface — tenant identity + enabled-language
  configuration, backed by canonical language identity — fully realized; closure via ADR-0015
  (docs/adr/0015-phase-15-closure-tenant-and-content-configuration.md); grounded-surface-exhausted
  finding: no additive slice warranted under current grounding)

Repository-wide architectural audit (pre-Phase-12) complete — 29 conflicts resolved; Phase 12 authorized. Phases 13 and 14 proceeded under per-slice pre-implementation assessments; no separate Phase 13→14 transition audit was recorded. The Phase 14→15 phase-transition audit (HANDOFF §9) was completed and CONFIRMED CLEAN across all five audit categories (Audit A schema-literal reconciliation 37/37 bidirectional; Audits B–E clean), with the validation chain green at 824 tests / 60 files / 92.73% statement coverage; Phase 15 was AUTHORIZED for ADR-0014 boundary drafting (Phase 15 since closed — ADR-0015).

## Completed Systems

- Phase 9 Runtime Governance: COMPLETE
- Governance Audit Correction Sequence Sessions A–E: COMPLETE, merged to main
- Query snapshot, replay governance, replay audit, query execution plan,
  query explanation, query execution trace infrastructure: COMPLETE
- Phase 10 Lexical Foundation and Interoperability: COMPLETE
- Lexical interop contracts, query enrichment, runtime capability declaration,
  and manifest bridge: COMPLETE
- Phase 10 artifact classification remediation: COMPLETE (PR fix/phase10-artifact-classification)
- Phase 11 first slice — DictionarySourceProvenance: COMPLETE (PR #69)
- Phase 12 Learning Surface Layer: COMPLETE (SpellingEntry, ReadingPrimitive,
  WritingPrimitive — all three slices merged)
- Search-to-learning integration (Phase 13) — COMPLETE (all 3 slices merged)

## Completed Slices (Merged to Main)

- fix/phase10-artifact-classification — removed evaluationTimestamp: null
  from LexicalIndex, LexicalLookupResult, LexicalDatasetValidationResult;
  added generatedFrom: "lexical-lookup-trace" to LexicalLookupTrace
- feat/phase11-dictionary-source-provenance — introduced
  DictionarySourceProvenance structural type, DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION
  (@phase11), composeDictionarySourceProvenance builder, 23 tests
- feat/phase11-dictionary-licensing-boundary — introduced
  DictionaryLicensingBoundary structural type, DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION
  (@phase11), composeDictionaryLicensingBoundary builder, 30 tests (Issue #73)
- feat/phase11-canonical-dictionary-entry — introduced
  CanonicalDictionaryEntry structural type, CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION
  (@phase11), composeCanonicalDictionaryEntry builder, 25 tests (Issue #74)
- feat/phase11-ingestion-ready-entry — introduced IngestionReadyDictionaryEntry
  structural type, INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION (@phase11),
  composeIngestionReadyDictionaryEntry builder, 13 tests (Issue #75)
- fix/claude-md-phase11-status — corrected CLAUDE.md Phase 10 test count
  from 575 to 595; added Phase 11 IN PROGRESS entry; updated HANDOFF_TEMPLATE.md
  session state
- fix/audit-a-session-state-schema-literals — added six missing @phase9
  schema version literals to SESSION_STATE.md: query-snapshot,
  query-explanation, query-execution-trace, query-execution-plan,
  replay-governance-report, replay-audit-report
- fix/audit-b-introspection-envelope-classification — added missing
  evaluationTimestamp: null to RuntimeCapabilityIntrospectionEnvelope
  interface and builder return; additive only
- fix/audit-b-enrichment-result-classification — added missing
  generatedFrom: "lexical-query-enrichment-result" to
  LexicalQueryEnrichmentResult interface and both builder return paths;
  additive only
- fix/audit-c-typed-references-adr — renamed LexicalEntry.sourceId and
  DictionaryLicensingBoundary.sourceId to provenance: DictionarySourceProvenance;
  removed now-redundant string guard from composeDictionaryLicensingBoundary;
  deleted two inapplicable guard tests; added ADR-0010
- fix/audit-d-invariant-guard-inlining — inlined delegated invariant
  guards in composeEntryId, composeLexicalLookup, and composeLexicalIndex;
  replaced .includes() deduplication with compliant inline loop
- fix/audit-e-barrel-export-hygiene — removed 19 internal symbols from
  three public barrels (lexical/index.ts, runtime-capabilities/index.ts,
  query-snapshots/index.ts); updated one consumer import path
- fix/audit-d-phase9-guard-inlining — inlined delegated invariant guards
  in nine Phase 9 builders (composeRuntimeCapabilityManifest,
  composeRuntimeCapabilityGovernanceReport,
  composeRuntimeCapabilityCertificationAuditSnapshot,
  composeRuntimeGovernanceClosure, composeRuntimeGovernanceProvenance,
  composeRuntimeOperationalGovernanceManifest,
  composeLexicalInteropCapabilityDeclaration, composeReplayAuditReport,
  buildRuntimeCapabilityIntrospectionEnvelope); deleted five zero-caller
  helpers (assertNonEmptyIdentifier, assertSchemaVersion,
  assertNonEmptyDeclarationId, assertLexicalInteropCapabilityId,
  assertComposedAtSequence); cleaned six import statements; applied
  as unknown cast at schema version comparison sites to satisfy ESLint
  no-unnecessary-condition while preserving direct !== comparison form;
  identified by second pre-authorization audit for Phase 12 (Audit D)
  (PR #95)
- fix/audit-e-dictionary-driver-barrel-hygiene — removed THAI_FIXTURE_DICTIONARY
  and ThaiFixtureDictionaryEntry from drivers/dictionary/index.ts; identified
  by second pre-authorization audit for Phase 12 (Audit E)
- fix/audit-a-test-fixture-reconciliation-scope — added Test Fixture Literals
  subsection to SESSION_STATE.md Schema Version Literals section documenting
  "lingua-core-platform:wrong@phase10" as excluded from bidirectional
  reconciliation scope; resolves Audit A conflict from second pre-authorization
  audit for Phase 12
- feat/phase12-spelling-entry — introduced SpellingEntry structural type,
  SPELLING_ENTRY_SCHEMA_VERSION (@phase12), composeSpellingEntry builder with
  inline invariant guards for entry.schemaVersion, phoneticNotation, and
  toneClassification; 18 tests (680 total)
  Validation baseline after merge: 680 tests passing, full chain green
- feat/phase12-reading-primitive — introduced ReadingPrimitive structural
  type, READING_PRIMITIVE_SCHEMA_VERSION (@phase12), composeReadingPrimitive
  builder with inline invariant guards for entry.schemaVersion and
  readingPrimitiveId; 15 tests (695 total)
  Validation baseline after merge: 695 tests passing, full chain green
- feat/phase12-writing-primitive — introduced WritingPrimitive structural
  type, WritingPrimitiveExerciseMode literal union ("free-fill" |
  "template-overlay"), WRITING_PRIMITIVE_SCHEMA_VERSION (@phase12),
  composeWritingPrimitive builder with four inline invariant guards for
  entry.schemaVersion, writingPrimitiveId, referenceCharacterForm, and
  exerciseMode (inline switch); 21 tests (716 total)
  Validation baseline after merge: 716 tests passing, full chain green
- feat/phase13-reading-primitive-search-projection — introduced
  ReadingPrimitiveSearchProjection structural type,
  READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION (@phase13),
  composeReadingPrimitiveSearchProjection builder with three inline
  invariant guards for enrichmentResult.schemaVersion,
  readingPrimitive.schemaVersion, and projectionId; 18 tests (734 total)
  Validation baseline after merge: 734 tests passing, full chain green
- feat/phase13-writing-primitive-search-projection — introduced
  WritingPrimitiveSearchProjection structural type,
  ComposeWritingPrimitiveSearchProjectionInput input interface,
  WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION (@phase13),
  composeWritingPrimitiveSearchProjection builder with three inline
  invariant guards for enrichmentResult.schemaVersion,
  writingPrimitive.schemaVersion, and projectionId; 18 tests (752 total)
  Validation baseline after merge: 752 tests passing, full chain green
- feat/phase13-spelling-entry-search-projection — introduced
  SpellingEntrySearchProjection structural type,
  ComposeSpellingEntrySearchProjectionInput input interface,
  SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION (@phase13),
  composeSpellingEntrySearchProjection builder with three inline
  invariant guards for enrichmentResult.schemaVersion,
  spellingEntry.schemaVersion, and projectionId; 18 tests (770 total)
  Validation baseline after merge: 770 tests passing, full chain green
- feat/phase14-reading-primitive-search-projection-route-delivery-contract —
  introduced ReadingPrimitiveSearchProjectionRouteDeliveryContract structural
  type (first Phase 14 slice; public application route delivery contract),
  ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput input
  interface,
  READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION
  (@phase14), composeReadingPrimitiveSearchProjectionRouteDeliveryContract
  builder with three inline invariant guards for searchProjection.schemaVersion,
  deliveryId, and staticContentAddress; derives directly from
  ReadingPrimitiveSearchProjection (single-layer; no foundational delivery
  primitive); 18 tests (788 total)
  Validation baseline after merge: 788 tests passing, full chain green
- feat/phase14-writing-primitive-search-projection-route-delivery-contract —
  introduced WritingPrimitiveSearchProjectionRouteDeliveryContract structural
  type (second Phase 14 slice; public application route delivery contract),
  ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput input
  interface,
  WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION
  (@phase14), composeWritingPrimitiveSearchProjectionRouteDeliveryContract
  builder with three inline invariant guards for searchProjection.schemaVersion,
  deliveryId, and staticContentAddress; derives directly from
  WritingPrimitiveSearchProjection (single-layer; no foundational delivery
  primitive); barrel append (fifth export block); 18 tests (806 total)
  Validation baseline after merge: 806 tests passing, full chain green
- feat/phase14-spelling-entry-search-projection-route-delivery-contract —
  introduced SpellingEntrySearchProjectionRouteDeliveryContract structural
  type (third and final Phase 14 route slice; public application route
  delivery contract),
  ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput input
  interface,
  SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION
  (@phase14), composeSpellingEntrySearchProjectionRouteDeliveryContract
  builder with three inline invariant guards for searchProjection.schemaVersion,
  deliveryId, and staticContentAddress; derives directly from
  SpellingEntrySearchProjection (single-layer; no foundational delivery
  primitive); barrel append (sixth export block); 18 tests (824 total)
  Validation baseline after merge: 824 tests passing, full chain green
- Phase 15 slice 1 — Tenant configuration. Foundational CanonicalLanguageTag =
  "th" | "en" (src/core/language/, new module + barrel; no schemaVersion) and
  STRUCTURAL TenantConfiguration { schemaVersion, tenantId, enabledLanguages:
  readonly CanonicalLanguageTag[] } via composeTenantConfiguration (src/core/tenant/,
  new module + barrel). Guards: tenantId non-empty; per-element membership
  ("th"/"en"); clone-before-sort binary ordering; adjacent-equality duplicate
  rejection; empty set permitted. Parallel (ADR-0014 §5(c)); terminal
  deepFreezeStructure. Branch feat/phase15-tenant-configuration, commit 3824cad.
  843 / 61 / 92.78%.
- fix/lexical-key-normalization-grounding — added ARCHITECTURE.md "Lexical Key Normalization
  Policy" grounding for en→th whole-phrase English-key lookup (Option D): per-direction key
  normalization (Thai keys whitespace-free via unchanged normalizeLexicalKey; English keys
  whitespace-canonicalized whole phrases composing existing collapse-whitespace /
  trim-boundary-whitespace primitives + case folding), exact-equality only, no
  tokenization/prefix/fuzzy/ranking, no new contract field. Documentation-only governance
  grounding; no implementation slice delivered.
- feat/lexical-english-phrase-keying — en→th whole-phrase English-key lookup (ARCHITECTURE
  "Lexical Key Normalization Policy"): new internal canonicalizeEnglishKey (collapse + trim +
  lowercase, composing existing primitives; not barrel-exported), symmetric en→th keying at
  index + lookup, per-direction whitespace guard (en→th admits whole-phrase queries; th→en
  unchanged). normalizeLexicalKey/assertNoWhitespace untouched; LEXICAL_KEY_WHITESPACE_REJECTED
  discrepancy untouched. Test-additive (+13 / +1 file). 856 tests / 62 files / 92.78%.
- Lexical lookup th→en whitespace diagnostic surfacing (ADR-0016) — decision recorded; pending §9
  implementation slice in composeLexicalLookup. Derivation surface: src/core/lexical/{lookup,
  contracts,diagnostics}; downstream interop whitespace bucket transitions from always-empty to
  populated.
- fix/adr-0016-lexical-whitespace-diagnostic-surfacing — added ADR-0016 (th→en whitespace rejection
  surfaced as a returned diagnostic, Option A) plus a one-sentence ARCHITECTURE "Lexical Key
  Normalization Policy" clarification grounding the returned-diagnostic surfacing posture.
  Documentation-only governance grounding; no implementation slice delivered. Baseline unchanged:
  856 / 62 / 92.78%.
- feat/lexical-th-en-whitespace-diagnostic (#181) — implemented ADR-0016 Option A.
  composeLexicalLookup th→en whitespace branch changed throw → emit-and-return: one inline
  LEXICAL_KEY_WHITESPACE_REJECTED diagnostic (severity "warning", path ["query"], plain message;
  [lexical invariant] prefix dropped), first position before the empty-index check,
  deepFreezeStructure-wrapped, entries: []. /\s/.test detection byte-unchanged. No new public
  surface (no new type / field / schema literal / diagnostic-code member / status member);
  LexicalLookupResultStatus maps the rejection to existing "not-found". Tests: 3 throw-asserting
  tests rewritten result-asserting; +1 lookup positive, +1 interop bucket-populates-via-passthrough,
  +1 trace "not-found"; net +3. Baseline 856 → 859 / 62 / 92.78% → 92.79%. Schema literals unchanged.

## Active Scope and Derivation Surface

- UI/API delivery boundary (Phase 14) — COMPLETE (route category:
  ReadingPrimitiveSearchProjectionRouteDeliveryContract, WritingPrimitiveSearchProjectionRouteDeliveryContract, SpellingEntrySearchProjectionRouteDeliveryContract — all merged). Remaining chartered categories (API, static/SEO rendering, browser-native fallback) deferred — see Deferred Scope.

## Deferred Scope

The following must NOT influence any assessment or implementation until
explicitly authorized:

- Phase 15 deferred concepts (ADR-0015 Decision §4; Phase 15 COMPLETE): each requires a
  further binding ARCHITECTURE.md amendment plus explicit operator authorization before
  any future slice:
  - content organization — curriculum, lesson grouping, content sequencing,
    tenant-specific weighting;
  - content visibility — grounded only in the conceptual Database Blueprint
    dictionary_tenant_tags entity; insufficiently grounded for any field; runtime
    content-visibility resolution prohibited;
  - branding;
  - feature boundaries / feature flags.
- AI-assisted private envelope (Phase 16) — PENDING AUTHORIZATION
- Multilingual expansion beyond Thai-first (Phase 17) — PENDING AUTHORIZATION
- Ingestion pipelines, parsers, loaders, adapters, orchestration, or source
  synchronization systems — explicitly prohibited until proven immediately
  required by current repository topology
- Repository-wide architectural audit — COMPLETE (first audit: 26
  conflicts resolved across five audit categories: schema literal
  reconciliation, artifact classification, typed reference law, invariant
  guard form, export surface governance; second pre-authorization audit:
  3 additional conflicts resolved across fix/audit-e-dictionary-driver-
  barrel-hygiene, fix/audit-a-test-fixture-reconciliation-scope, and
  fix/audit-d-phase9-guard-inlining; targeted re-audit confirmed
  repository clean; Phase 12 authorized to proceed) (records the pre-Phase-12 audit only; the Phase 14→15 phase-transition audit per HANDOFF §9 is COMPLETE and CONFIRMED CLEAN — see Current Phase and Status)
- Schema version migration for any existing constant through @phase15 (@phase9–@phase15) —
  not warranted; ARCHITECTURE.md defines no phase-coupled migration semantics
- Phase 14 chartered categories — API contract, static/SEO rendering contract, browser-native fallback
  contract — DEFERRED. The Phase 14 closure assessment determined each resolves to no structurally distinct artifact under current grounding: all would be field-identical to the route delivery contract ({schemaVersion, deliveryId, searchProjection, staticContentAddress}), distinguished only by name, with any category-specific field being domain-convention invention (DOCUMENTARY DERIVATION LAW) or prohibited vocabulary (ADR-0013). The groundable structural delivery surface is a single contract shape realized per-projection (the route category). Building any deferred category as a distinct type requires new ARCHITECTURE.md content grounding — an operator architectural decision, not yet warranted.

## Schema Version Literals (Confirmed from Repository Files)

- "lingua-core-platform:runtime-capability-manifest@phase9"
- "lingua-core-platform:runtime-certification-summary@phase9"
- "lingua-core-platform:runtime-introspection-envelope@phase9"
- "lingua-core-platform:runtime-governance-report@phase9"
- "lingua-core-platform:runtime-certification-audit-snapshot@phase9"
- "lingua-core-platform:runtime-operational-governance-manifest@phase9"
- "lingua-core-platform:runtime-governance-provenance@phase9"
- "lingua-core-platform:runtime-governance-closure@phase9"
- "lingua-core-platform:query-snapshot@phase9"
- "lingua-core-platform:query-explanation@phase9"
- "lingua-core-platform:query-execution-trace@phase9"
- "lingua-core-platform:query-execution-plan@phase9"
- "lingua-core-platform:replay-governance-report@phase9"
- "lingua-core-platform:replay-audit-report@phase9"
- "lingua-core-platform:lexical-interop-capability-declaration@phase10"
- "lingua-core-platform:lexical-interop-enrichment@phase10"
- "lingua-core-platform:lexical-interop-report@phase10"
- "lingua-core-platform:lexical-query-report@phase10"
- "lingua-core-platform:lexical-index@phase10"
- "lingua-core-platform:lexical-lookup-result@phase10"
- "lingua-core-platform:lexical-lookup-trace@phase10"
- "lingua-core-platform:lexical-dataset-validation-result@phase10"
- "lingua-core-platform:lexical-dataset-validation-report@phase10"
- "lingua-core-platform:dictionary-source-provenance@phase11"
- "lingua-core-platform:dictionary-licensing-boundary@phase11"
- "lingua-core-platform:canonical-dictionary-entry@phase11"
- "lingua-core-platform:ingestion-ready-dictionary-entry@phase11"
- "lingua-core-platform:spelling-entry@phase12"
- "lingua-core-platform:reading-primitive@phase12"
- "lingua-core-platform:writing-primitive@phase12"
- "lingua-core-platform:reading-primitive-search-projection@phase13"
- "lingua-core-platform:writing-primitive-search-projection@phase13"
- "lingua-core-platform:spelling-entry-search-projection@phase13"
- "lingua-core-platform:reading-primitive-search-projection-route-delivery-contract@phase14"
- "lingua-core-platform:writing-primitive-search-projection-route-delivery-contract@phase14"
- "lingua-core-platform:spelling-entry-search-projection-route-delivery-contract@phase14"
- "lingua-core-platform:tenant-configuration@phase15"

### Test Fixture Literals — Excluded from Bidirectional Reconciliation

The following literal appears in multiple test files as an intentionally
invalid negative-case fixture value used to assert schema version rejection.
It is not a production schema version constant and is excluded from
bidirectional reconciliation scope at all locations:

- "lingua-core-platform:wrong@phase10" — known locations:
  - src/core/tokenizers/search/runtime-capabilities/tests/
    lexical-interop-capability-declaration.test.ts:135
  - src/core/lexical/spelling/tests/spelling-entry.test.ts:169
  - src/core/lexical/reading/tests/reading-primitive.test.ts:165
  - src/core/lexical/writing/tests/writing-primitive.test.ts:198

Any future slice that introduces a schema-version rejection guard test
is expected to use this same fixture literal. New occurrences are covered
by this class-based exclusion and do not require individual enumeration.

Phase label invariant: Phase labels are lineage identifiers, not lifecycle
version indicators. No migration of any existing literal is warranted unless
ARCHITECTURE.md explicitly defines phase-coupled migration semantics.

## Open Doctrinal Questions

- INVARIANT GUARD FORM LAW compliance of Number.isFinite() / Number.isInteger()
  predicate calls in composeReplayAuditReport (src/core/tokenizers/search/
  query-snapshots/audit-report.ts). The inlined guard preserves the helper's
  original predicate form per fix/audit-d-phase9-guard-inlining's semantic-
  identity requirement, but the strict reading of the law allows only direct
  === equality comparisons and inline switch statements with explicit literal
  cases. Whether built-in JavaScript numeric type-predicate function calls
  (Number.isFinite, Number.isInteger) qualify under or violate this restriction
  is not yet resolved by ARCHITECTURE.md or HANDOFF_TEMPLATE.md. Defer to a
  future session for explicit doctrinal ruling.

Accepted patterns (not open questions — resolved by fix/audit-d-phase9-guard-inlining):

- as unknown cast at schema version comparison sites: the pattern
  (field.schemaVersion as unknown) !== SCHEMA_VERSION_CONSTANT is
  explicitly accepted as compliant with the INVARIANT GUARD FORM LAW.
  The cast is a TypeScript type system accommodation preventing ESLint
  no-unnecessary-condition from flagging a structurally correct runtime
  guard as dead code. The underlying guard form remains a direct !==
  literal comparison. Do not flag this pattern in future audits.
- String content checks: guards that test what a string value contains
  (rather than whether it belongs to a set of permitted identity values)
  are compliant. Accepted forms: /\s/.test(input.query) (regex content
  check), canonicalKey.includes(":") (single-character substring check),
  input.field.trim() === "" (already accepted; restated for completeness).
  The prohibition on Array.prototype.includes() and equivalent literal-union
  membership resolution remains fully in force. Resolved by
  fix/audit-d-string-content-guard-ruling.

Prior PA.8 conflicts (resolved):

- CLAUDE.md stale phase status line: RESOLVED (fix/claude-md-phase11-status)
- Phase 10 artifact classification violations: RESOLVED
  (fix/phase10-artifact-classification)
- SESSION_STATE.md test-fixture exclusion scope (single location enumerated,
  two additional occurrences present in source): RESOLVED — exclusion note
  restated as class-based exclusion covering all present and future
  negative-case fixture occurrences of this literal

Resolved doctrinal rulings:

- Accepted ADRs and field grounding (operator ruling): Accepted ADRs PERMIT and
  scope concepts, boundaries, vocabulary, and prohibitions, but do NOT constitute
  field-grounding evidence under the DOCUMENTARY DERIVATION LAW. The grounding
  sources for contract fields — ARCHITECTURE.md, DATA_SOURCES.md, and existing
  type signatures — are exhaustive; docs/adr/\*.md are not field-grounding sources.
  Basis: the DDL closing enumeration ("Only DATA_SOURCES.md, ARCHITECTURE.md, and
  confirmed existing type signatures qualify"), and unanimous Phase 11–14
  precedent (zero ADR-originated fields; staticContentAddress was grounded by an
  ARCHITECTURE.md amendment, not by ADR-0013). This is why ADR-0014 §6 names an
  ARCHITECTURE.md grounding amendment as the precondition for the first Phase 15
  slice.

- Canonical language identity (ADR-0014 §7, resolved): the platform represents
  delivered languages by standard language tag (BCP 47 / ISO 639); the delivered
  set is {th, en}. Grounded in ARCHITECTURE.md — Canonical Language Identity,
  forward-only and additive: existing language types (SupportedLanguageCode,
  LexicalLanguageCode, LexicalLanguageDirection) are not migrated, and the
  spelling divergence with LexicalLanguageCode ("thai") is tolerated legacy
  (ABSTRACTION GOVERNANCE LAW). Reuse of SupportedLanguageCode was rejected on the
  "zh"/Phase-17 constraint; full-word English spelling was rejected in favor of
  standard tags for unambiguous dialect identity.

- Enabled-language set semantics (operator decision): tenant-scoped enabled-language
  configuration is set-valued — each delivered language appears at most once.
  Duplicate entries are invalid and rejected at construction (not silently
  de-duplicated), keeping caller input un-normalized and consistent with the
  fail-fast guard and no-internal-derivation posture. The set is deterministically
  ordered; an empty set is permitted (no non-empty invariant). Grounded in
  ARCHITECTURE.md — Tenant-Scoped Enabled-Language Configuration.

- th→en whitespace declared-but-unemitted diagnostic — RESOLVED by ADR-0016 (reconcile-to-return,
  Option A). composeLexicalLookup surfaces th→en whitespace rejection as a returned
  LEXICAL_KEY_WHITESPACE_REJECTED diagnostic, replacing the inline /\s/.test throw; the
  index-construction whitespace invariant is unchanged. Grounded-of-record by the ARCHITECTURE
  "Lexical Key Normalization Policy" clarification co-merged with ADR-0016; the existing union member
  and LexicalLookupResult.diagnostics ground the reused surface. Implementation pending a §9
  assessment, which must verify the existing LexicalLookupResultStatus union (found | not-found |
  empty-index) can represent the rejection without a new member. Implemented and merged in #181: the throw is removed and composeLexicalLookup returns the
  diagnostic; the premise check held — the rejection maps to the existing "not-found" status
  with no new LexicalLookupResultStatus member. apps/usethai consumes the real diagnostic as of
  #182 (pre-guard removed). Thread closed end-to-end.
