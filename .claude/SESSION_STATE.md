# LINGUA-CORE-PLATFORM — SESSION STATE

Cross-Session State Document | Updated After Each PR Cycle

## Current Phase and Status

- Current phase: Phase 12 — Reading and Writing Learning Surface
- Phase 11 status: COMPLETE (all four slices merged)
- Phase 12 status: COMPLETE (all three slices merged)
- Phase 12 first slice complete: SpellingEntry (feat/phase12-spelling-entry)
- Phase 12 second slice complete: ReadingPrimitive (feat/phase12-reading-primitive)
- Phase 12 third slice complete: WritingPrimitive (feat/phase12-writing-primitive)
- Phase 13 must be explicitly authorized before any Phase 13 work begins
- Phase 13 ADR: ADR-0012 DRAFTED (docs/adr/0012-search-to-learning-integration-boundary.md)

Repository-wide architectural audit complete — Phase 12 authorized to proceed.

## Validation Baseline

- Tests passing: 716
- Test files: 54
- Statement coverage: 92.55%
- Full chain green: yes
- Branch at time of last update: feat/phase12-writing-primitive
- Commit at time of last update: 86aad97

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

## Active Scope and Derivation Surface

Phase 12 is COMPLETE. Phase 13 requires explicit authorization before
any work begins. The authoritative derivation surface for Phase 13
planning will be derived from repository-first assessment at the start
of the next authorized phase session.

## Deferred Scope

The following must NOT influence any assessment or implementation until
explicitly authorized:

- Search-to-learning integration (Phase 13) — ADR DRAFTED, PENDING IMPLEMENTATION AUTHORIZATION
- UI/API delivery boundary (Phase 14) — PENDING AUTHORIZATION
- Tenant and content configuration (Phase 15) — PENDING AUTHORIZATION
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
  repository clean; Phase 12 authorized to proceed)
- Schema version migration for any existing @phase9, @phase10, @phase11,
  or @phase12 constants — not warranted; ARCHITECTURE.md defines no
  phase-coupled migration semantics

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
