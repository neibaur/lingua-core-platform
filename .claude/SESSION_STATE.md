# LINGUA-CORE-PLATFORM — SESSION STATE

Cross-Session State Document | Updated After Each PR Cycle

## Per-PR Update Block

> Single source of truth for values that change most cycles. Update them here and
> nowhere else; every other file points to this block rather than restating it.
> Completed Slices, Schema Version Literals, and Open Doctrinal Questions below
> are append-only logs. Record the last MERGED PR (stable, knowable post-merge);
> never record the current branch or a self-referential commit hash.

- Current phase: Phase 15 — COMPLETE (closure ADR-0015 accepted; binding-grounded
  surface — tenant identity + enabled-language configuration, backed by canonical
  language identity — realized by TenantConfiguration + CanonicalLanguageTag)
- Next action: Phase 15 COMPLETE (ADR-0015); no core phase active. Phase 16
  PENDING AUTHORIZATION — premature; requires explicit authorization and a §9
  Phase-15→16 transition audit (Audits A–E) before any work. Open non-phase
  thread: friction-evidence pass complete; next step is the search/tokenizer warrant
  deliberation (app-only consumption vs thin core seam vs core slice), now unblocked
  by that evidence.
- Last accepted ADR: ADR-0015 — Phase 15 Closure
  (docs/adr/0015-phase-15-closure-tenant-and-content-configuration.md), Accepted
- Tests passing: 856
- Test files: 62
- Statement coverage: 92.78%
- Last merged PR: #177 — feat(usethai): add honest lookup state rendering

Completed Slices, the validation baseline, and Schema Version Literals track core
(src/core) only. Application-tier work (apps/usethai) — first shell merged;
load-bearing learnings for the next planning session:

- The core consumes cleanly as source via a Vite path alias (@core ->
  ../../src/core); no core build/exports/dist is needed yet.
- Exact-key lexical lookup is insufficient for a real dictionary UX — prefix/
  substring/fuzzy is wanted.
- en→th lookup of multi-word glosses (e.g. "to eat") was unreachable (full-definition-string
  English key + whitespace-rejecting lookup). Resolution is now GROUNDED via ARCHITECTURE.md
  "Lexical Key Normalization Policy" (Option D: symmetric whole-phrase canonical English key,
  exact-equality only). DELIVERED via feat/lexical-english-phrase-keying; resolved through core
  governance, not an app workaround.
- Barrel denominator captured — docs/architecture/tokenizer-search-barrel-inventory.md
  (merged). Two search surfaces are already app-reachable: lexical exact-key lookup
  (composeLexicalLookup) and a tokenizer corpus token/phrase path
  (buildSearchProjection -> CorpusIndexer -> executeQuery / executePhraseQuery).
  prefix / substring / fuzzy are NOT PRESENT and non-goaled in lexical lookup; if
  ever warranted they belong to the tokenizer/search layer only. Phase 13 search
  projections and Phase 14 route delivery contracts sit in a leaf-only barrel
  (query-learning-interop) with no app-legal path today.

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

Repository-wide architectural audit (pre-Phase-12) complete — 29 conflicts resolved; Phase 12 authorized. Phases 13 and 14 proceeded under per-slice pre-implementation assessments; no separate Phase 13→14 transition audit was recorded. The Phase 14→15 phase-transition audit (HANDOFF §9) was completed and CONFIRMED CLEAN across all five audit categories (Audit A schema-literal reconciliation 37/37 bidirectional; Audits B–E clean), with the validation chain green at 824 tests / 60 files / 92.73% statement coverage; Phase 15 is AUTHORIZED for ADR-0014 boundary drafting (see Current Phase and Status).

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
  not warranted;ARCHITECTURE.md defines no phase-coupled migration semantics
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
