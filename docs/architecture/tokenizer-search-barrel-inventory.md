# Tokenizer / Search Barrel Inventory

Reconnaissance artifact for the prefix/fuzzy search scoping thread. Establishes
the public-barrel surface of `src/core/tokenizers/` and `src/core/lexical/` as the
**exposed-capability denominator** against which a future `apps/usethai`
barrel-reach friction log will be measured.

---

## 1. Method

### Files read

- `.claude/SESSION_STATE.md` — phase and baseline confirmation
- `ARCHITECTURE.md` — authoritative source for documented matching semantics
- `APP_SHELL_GUIDELINES.md` + `AGENTS.md` — public-barrel boundary rules
- All `index.ts` barrels under `src/core/tokenizers/` and `src/core/lexical/`
- Selected leaf source files consulted for one-line capability descriptions and
  capability-matrix answers only (no implementation audit)

### Branch and commit

Inventory reflects branch `spike/tokenizer-search-barrel-inventory`, derived
from `main` at commit `4c067ab` (docs: close phase 15 and add ADR-0015, #165).

### Definitions

- **APP-REACHABLE**: symbol survives the full re-export chain to a **top-level
  public barrel** — one of `src/core/tokenizers/index.ts` or
  `src/core/lexical/index.ts` (the outermost module-level barrels; no
  `src/core/index.ts` exists). Per `APP_SHELL_GUIDELINES.md`, the app may only
  consume core through public barrel exports.
- **INTERMEDIATE**: symbol exists in at least one intermediate barrel (re-exported
  by some higher barrel) but does NOT reach a top-level barrel.
- **LEAF-ONLY**: symbol exists only in a barrel that no higher-level barrel
  re-exports (the barrel itself is a dead end in the upward chain).
- **INTERNAL**: symbol lives in a source file with no barrel exposure at any level.
- **EXPORTED** (capability verdict): an app-reachable symbol or type directly
  enabling the capability.
- **NOT PRESENT** (capability verdict): no implementation exists anywhere in
  source that could provide the capability.

---

## 2. Barrel Map

### Top-level public barrels (APP-REACHABLE boundary)

```
src/core/tokenizers/index.ts            ← top-level tokenizer barrel
src/core/lexical/index.ts               ← top-level lexical barrel
```

Additional top-level module barrels (out of scope for this inventory but noted
for completeness): `src/core/language/index.ts` (Phase 15, exports
`CanonicalLanguageTag`), `src/core/tenant/index.ts` (Phase 15, exports
`TenantConfiguration` and builder).

### Intermediate barrel chain — tokenizers/search/

```
src/core/tokenizers/search/index.ts
  ├── src/core/tokenizers/search/index-primitives/index.ts
  │     (re-exported by search → re-exported by tokenizers/index.ts ✓ APP-REACHABLE)
  ├── src/core/tokenizers/search/matching/index.ts
  │     (re-exported by search → re-exported by tokenizers/index.ts ✓ APP-REACHABLE)
  ├── src/core/tokenizers/search/query-engine/index.ts
  │     (re-exported by search → re-exported by tokenizers/index.ts ✓ APP-REACHABLE)
  ├── src/core/tokenizers/search/query-parser/index.ts
  │     ├── src/core/tokenizers/search/query-parser/ast/index.ts          (leaf→parser→search→tokenizers ✓)
  │     ├── src/core/tokenizers/search/query-parser/lexer/index.ts        (leaf→parser→search→tokenizers ✓)
  │     ├── src/core/tokenizers/search/query-parser/parser/index.ts       (leaf→parser→search→tokenizers ✓)
  │     ├── src/core/tokenizers/search/query-parser/shared/index.ts       (leaf→parser→search→tokenizers ✓)
  │     ├── src/core/tokenizers/search/query-parser/diagnostics/index.ts  (leaf→parser→search→tokenizers ✓)
  │     └── src/core/tokenizers/search/query-parser/query-planner/index.ts(leaf→parser→search→tokenizers ✓)
  │     (query-parser/index.ts itself re-exported by search → tokenizers ✓ APP-REACHABLE)
  ├── src/core/tokenizers/search/query-pipeline/index.ts
  │     (partially re-exported by search → tokenizers; two types NOT forwarded — see §3)
  ├── src/core/tokenizers/search/query-ir/index.ts
  │     (re-exported by search/index.ts; NOT re-exported by tokenizers/index.ts ✗ INTERMEDIATE ONLY)
  ├── src/core/tokenizers/search/query-snapshots/index.ts
  │     (partially re-exported by search/index.ts; NOT re-exported by tokenizers/index.ts ✗ INTERMEDIATE ONLY)
  ├── src/core/tokenizers/search/query-tracing/index.ts
  │     (re-exported by search/index.ts; NOT re-exported by tokenizers/index.ts ✗ INTERMEDIATE ONLY)
  └── src/core/tokenizers/search/runtime-capabilities/index.ts
        (partially re-exported by search/index.ts; NOT re-exported by tokenizers/index.ts ✗ INTERMEDIATE ONLY)
```

### Barrels with NO upward re-export (leaf-only dead ends)

```
src/core/tokenizers/search/query-learning-interop/index.ts   ✗ LEAF-ONLY
src/core/tokenizers/search/query-lexical-interop/index.ts    ✗ LEAF-ONLY
```

### Intermediate barrels — tokenizers/ (non-search)

```
src/core/tokenizers/normalization/index.ts
  (partially re-exported by tokenizers/index.ts; three rule symbols NOT forwarded)
src/core/tokenizers/drivers/dictionary/index.ts
  (re-exported by tokenizers/index.ts ✓ APP-REACHABLE)
src/core/tokenizers/drivers/mock/index.ts
  (re-exported by tokenizers/index.ts ✓ APP-REACHABLE)
```

### Lexical barrel (flat — no sub-barrels)

```
src/core/lexical/index.ts
  (directly re-exports from leaf source files; all exports APP-REACHABLE)
```

---

## 3. Per-Barrel Export Tables

Tables cover each barrel under the two inventory roots. Reachability uses the
three-level classification from §1.

### 3.1 `src/core/lexical/index.ts` — top-level lexical barrel

All symbols are APP-REACHABLE (direct leaf-to-top-level chain; no sub-barrels).

| symbol                                             | kind             | type-only? | reachability  | one-line capability                                                        |
| -------------------------------------------------- | ---------------- | ---------- | ------------- | -------------------------------------------------------------------------- |
| `LEXICAL_INDEX_SCHEMA_VERSION`                     | const/value      | runtime    | app-reachable | Schema version string for LexicalIndex artifacts                           |
| `LEXICAL_LOOKUP_RESULT_SCHEMA_VERSION`             | const/value      | runtime    | app-reachable | Schema version string for LexicalLookupResult artifacts                    |
| `LexicalDefinition`                                | type/interface   | type-only  | app-reachable | Shape of a single dictionary definition entry                              |
| `LexicalEntry`                                     | type/interface   | type-only  | app-reachable | Full dictionary entry (headword + definitions)                             |
| `LexicalIndex`                                     | type/interface   | type-only  | app-reachable | Indexed dictionary structure keyed by normalized lexical key               |
| `LexicalIndexSchemaVersion`                        | type/interface   | type-only  | app-reachable | Branded type for the index schema version string                           |
| `LexicalLanguageDirection`                         | type/interface   | type-only  | app-reachable | Literal union of lookup directions (`"th-en"` \| `"en-th"`)                |
| `LexicalLookupDiagnostic`                          | type/interface   | type-only  | app-reachable | Single diagnostic produced during lexical lookup                           |
| `LexicalLookupDiagnosticCode`                      | type/interface   | type-only  | app-reachable | Literal union of diagnostic codes (e.g. `LEXICAL_KEY_WHITESPACE_REJECTED`) |
| `LexicalLookupDiagnosticSeverity`                  | type/interface   | type-only  | app-reachable | Literal union of diagnostic severities                                     |
| `LexicalLookupInput`                               | type/interface   | type-only  | app-reachable | Input shape for `composeLexicalLookup`                                     |
| `LexicalLookupResult`                              | type/interface   | type-only  | app-reachable | Result of a lexical lookup operation                                       |
| `LexicalLookupResultSchemaVersion`                 | type/interface   | type-only  | app-reachable | Branded type for the lookup-result schema version                          |
| `LexicalPartOfSpeech`                              | type/interface   | type-only  | app-reachable | Literal union of part-of-speech values                                     |
| `createLexicalDiagnostic`                          | function/builder | runtime    | app-reachable | Factory for constructing a LexicalLookupDiagnostic                         |
| `orderLexicalDiagnostics`                          | function/builder | runtime    | app-reachable | Sorts diagnostics by severity then code                                    |
| `LEXICAL_LOOKUP_TRACE_SCHEMA_VERSION`              | const/value      | runtime    | app-reachable | Schema version for LexicalLookupTrace artifacts                            |
| `composeLexicalLookupTrace`                        | function/builder | runtime    | app-reachable | Builds a provenance trace record for a lookup operation                    |
| `ComposeLexicalLookupTraceInput`                   | type/interface   | type-only  | app-reachable | Input shape for `composeLexicalLookupTrace`                                |
| `LexicalLookupResultStatus`                        | type/interface   | type-only  | app-reachable | Literal union of lookup result statuses                                    |
| `LexicalLookupTrace`                               | type/interface   | type-only  | app-reachable | Structural lookup provenance record (Phase 10 artifact)                    |
| `LexicalLookupTraceSchemaVersion`                  | type/interface   | type-only  | app-reachable | Branded type for the trace schema version                                  |
| `assertValidLexicalEntryId`                        | function/builder | runtime    | app-reachable | Throws if a LexicalEntryId is structurally invalid                         |
| `composeEntryId`                                   | function/builder | runtime    | app-reachable | Constructs a canonical LexicalEntryId string                               |
| `ComposeEntryIdInput`                              | type/interface   | type-only  | app-reachable | Input shape for `composeEntryId`                                           |
| `LexicalEntryId`                                   | type/interface   | type-only  | app-reachable | Branded string type for a fully qualified lexical entry identifier         |
| `LexicalLanguageCode`                              | type/interface   | type-only  | app-reachable | Literal union of lexical language codes (`"thai"` \| `"en"`)               |
| `composeLexicalIndex`                              | function/builder | runtime    | app-reachable | Builds and freezes a LexicalIndex from raw entry array                     |
| `ComposeLexicalIndexInput`                         | type/interface   | type-only  | app-reachable | Input shape for `composeLexicalIndex`                                      |
| `composeLexicalLookup`                             | function/builder | runtime    | app-reachable | Exact-key lookup against a LexicalIndex (both directions, key-normalized)  |
| `LEXICAL_DATASET_VALIDATION_RESULT_SCHEMA_VERSION` | const/value      | runtime    | app-reachable | Schema version for dataset validation result artifacts                     |
| `validateLexicalDataset`                           | function/builder | runtime    | app-reachable | Validates raw entry array against structural rules                         |
| `LexicalDatasetValidationDiagnostic`               | type/interface   | type-only  | app-reachable | Single diagnostic from dataset validation                                  |
| `LexicalDatasetValidationDiagnosticCode`           | type/interface   | type-only  | app-reachable | Literal union of dataset validation diagnostic codes                       |
| `LexicalDatasetValidationDiagnosticSeverity`       | type/interface   | type-only  | app-reachable | Literal union of dataset validation severities                             |
| `LexicalDatasetValidationResult`                   | type/interface   | type-only  | app-reachable | Result of `validateLexicalDataset`                                         |
| `LexicalDatasetValidationResultSchemaVersion`      | type/interface   | type-only  | app-reachable | Branded type for validation result schema version                          |
| `LexicalDatasetValidationStatus`                   | type/interface   | type-only  | app-reachable | Literal union of validation statuses                                       |
| `ValidateLexicalDatasetInput`                      | type/interface   | type-only  | app-reachable | Input shape for `validateLexicalDataset`                                   |
| `LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION` | const/value      | runtime    | app-reachable | Schema version for dataset validation report artifacts                     |
| `LEXICAL_DATASET_VALIDATION_RULE_CODES`            | const/value      | runtime    | app-reachable | Frozen set of all validation rule code strings                             |
| `composeLexicalDatasetValidationReport`            | function/builder | runtime    | app-reachable | Aggregates validation results into a structured report                     |
| `ComposeLexicalDatasetValidationReportInput`       | type/interface   | type-only  | app-reachable | Input shape for `composeLexicalDatasetValidationReport`                    |
| `LexicalDatasetDiagnosticsByCode`                  | type/interface   | type-only  | app-reachable | Map of validation diagnostics grouped by code                              |
| `LexicalDatasetValidationReport`                   | type/interface   | type-only  | app-reachable | Aggregated validation report (Phase 10 artifact)                           |
| `LexicalDatasetValidationReportSchemaVersion`      | type/interface   | type-only  | app-reachable | Branded type for the report schema version                                 |
| `DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION`      | const/value      | runtime    | app-reachable | Schema version for DictionarySourceProvenance (Phase 11)                   |
| `composeDictionarySourceProvenance`                | function/builder | runtime    | app-reachable | Builds a source-provenance record for a dictionary                         |
| `ComposeDictionarySourceProvenanceInput`           | type/interface   | type-only  | app-reachable | Input shape for `composeDictionarySourceProvenance`                        |
| `DictionarySourceProvenance`                       | type/interface   | type-only  | app-reachable | Source-provenance structural type (Phase 11)                               |
| `DictionarySourceProvenanceSchemaVersion`          | type/interface   | type-only  | app-reachable | Branded type for Phase 11 source-provenance schema version                 |
| `DICTIONARY_LICENSING_BOUNDARY_SCHEMA_VERSION`     | const/value      | runtime    | app-reachable | Schema version for DictionaryLicensingBoundary (Phase 11)                  |
| `composeDictionaryLicensingBoundary`               | function/builder | runtime    | app-reachable | Builds a licensing-boundary record for a dictionary                        |
| `ComposeDictionaryLicensingBoundaryInput`          | type/interface   | type-only  | app-reachable | Input shape for `composeDictionaryLicensingBoundary`                       |
| `DictionaryLicensingBoundary`                      | type/interface   | type-only  | app-reachable | Licensing-boundary structural type (Phase 11)                              |
| `DictionaryLicensingBoundarySchemaVersion`         | type/interface   | type-only  | app-reachable | Branded type for Phase 11 licensing-boundary schema version                |
| `DictionaryLicensingVerdict`                       | type/interface   | type-only  | app-reachable | Literal union of licensing verdict values                                  |
| `CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION`        | const/value      | runtime    | app-reachable | Schema version for CanonicalDictionaryEntry (Phase 11)                     |
| `composeCanonicalDictionaryEntry`                  | function/builder | runtime    | app-reachable | Builds a canonical (provenanced) dictionary entry                          |
| `CanonicalDictionaryEntry`                         | type/interface   | type-only  | app-reachable | Canonical provenanced dictionary entry structural type (Phase 11)          |
| `CanonicalDictionaryEntrySchemaVersion`            | type/interface   | type-only  | app-reachable | Branded type for Phase 11 canonical-entry schema version                   |
| `ComposeCanonicalDictionaryEntryInput`             | type/interface   | type-only  | app-reachable | Input shape for `composeCanonicalDictionaryEntry`                          |
| `INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION`  | const/value      | runtime    | app-reachable | Schema version for IngestionReadyDictionaryEntry (Phase 11)                |
| `composeIngestionReadyDictionaryEntry`             | function/builder | runtime    | app-reachable | Builds an ingestion-ready dictionary entry from a canonical entry          |
| `ComposeIngestionReadyDictionaryEntryInput`        | type/interface   | type-only  | app-reachable | Input shape for `composeIngestionReadyDictionaryEntry`                     |
| `IngestionReadyDictionaryEntry`                    | type/interface   | type-only  | app-reachable | Ingestion-ready entry structural type (Phase 11)                           |
| `IngestionReadyDictionaryEntrySchemaVersion`       | type/interface   | type-only  | app-reachable | Branded type for Phase 11 ingestion-ready schema version                   |
| `SPELLING_ENTRY_SCHEMA_VERSION`                    | const/value      | runtime    | app-reachable | Schema version for SpellingEntry (Phase 12)                                |
| `composeSpellingEntry`                             | function/builder | runtime    | app-reachable | Builds a SpellingEntry learning-surface artifact (Phase 12)                |
| `ComposeSpellingEntryInput`                        | type/interface   | type-only  | app-reachable | Input shape for `composeSpellingEntry`                                     |
| `SpellingEntry`                                    | type/interface   | type-only  | app-reachable | Spelling exercise unit structural type (Phase 12)                          |
| `SpellingEntrySchemaVersion`                       | type/interface   | type-only  | app-reachable | Branded type for Phase 12 spelling-entry schema version                    |
| `READING_PRIMITIVE_SCHEMA_VERSION`                 | const/value      | runtime    | app-reachable | Schema version for ReadingPrimitive (Phase 12)                             |
| `composeReadingPrimitive`                          | function/builder | runtime    | app-reachable | Builds a ReadingPrimitive learning-surface artifact (Phase 12)             |
| `ComposeReadingPrimitiveInput`                     | type/interface   | type-only  | app-reachable | Input shape for `composeReadingPrimitive`                                  |
| `ReadingPrimitive`                                 | type/interface   | type-only  | app-reachable | Reading exercise unit structural type (Phase 12)                           |
| `ReadingPrimitiveSchemaVersion`                    | type/interface   | type-only  | app-reachable | Branded type for Phase 12 reading-primitive schema version                 |
| `WRITING_PRIMITIVE_SCHEMA_VERSION`                 | const/value      | runtime    | app-reachable | Schema version for WritingPrimitive (Phase 12)                             |
| `composeWritingPrimitive`                          | function/builder | runtime    | app-reachable | Builds a WritingPrimitive learning-surface artifact (Phase 12)             |
| `ComposeWritingPrimitiveInput`                     | type/interface   | type-only  | app-reachable | Input shape for `composeWritingPrimitive`                                  |
| `WritingPrimitive`                                 | type/interface   | type-only  | app-reachable | Writing exercise unit structural type (Phase 12)                           |
| `WritingPrimitiveExerciseMode`                     | type/interface   | type-only  | app-reachable | Literal union of exercise modes (`"free-fill"` \| `"template-overlay"`)    |
| `WritingPrimitiveSchemaVersion`                    | type/interface   | type-only  | app-reachable | Branded type for Phase 12 writing-primitive schema version                 |

### 3.2 `src/core/tokenizers/index.ts` — top-level tokenizer barrel (app-reachable subset)

This table covers only symbols originating in the **search subsystem** that reach
this barrel. Driver, normalization, pipeline, and shared symbols are noted in
summary form.

**Non-search symbols (summary):** `SupportedLanguageCode`, `TokenizerDriver`,
`DictionaryTokenizerDriver`, `DictionaryTokenizerDriverOptions`,
`MockTokenizerDriver`, `MockTokenizerDriverOptions`, `normalizeText`,
`IndexMap`, `NormalizationResult`, `NormalizationRule`, `NormalizationRuleInput`,
`NormalizationRuleOutput`, `tokenizeText`, `SearchIndexDocument`,
`NormalizedToken`, `Token`, `TokenizationResult` — all app-reachable.

**Search-origin symbols reaching tokenizers/index.ts (APP-REACHABLE):**

| symbol                              | kind             | type-only? | reachability  | one-line capability                                                                           |
| ----------------------------------- | ---------------- | ---------- | ------------- | --------------------------------------------------------------------------------------------- |
| `buildSearchProjection`             | function/builder | runtime    | app-reachable | Normalizes and tokenizes input text into a SearchProjectionPipelineResult for corpus indexing |
| `CorpusIndexer`                     | function/builder | runtime    | app-reachable | Class that accumulates document projections into a frozen inverted-index SearchCorpus         |
| `SEARCH_CORPUS_FORMAT_VERSION`      | const/value      | runtime    | app-reachable | Format version string for serialized SearchCorpus artifacts                                   |
| `canonicalizeSearchCorpus`          | function/builder | runtime    | app-reachable | Produces a stable canonical form of a SearchCorpus for deterministic comparison               |
| `deserializeSearchCorpus`           | function/builder | runtime    | app-reachable | Deserializes a SearchCorpus from a JSON-safe representation                                   |
| `serializeSearchCorpus`             | function/builder | runtime    | app-reachable | Serializes a SearchCorpus to a JSON-safe representation                                       |
| `executeBooleanQuery`               | function/builder | runtime    | app-reachable | Executes a boolean (AND/OR) query against an inverted index                                   |
| `executePhraseQuery`                | function/builder | runtime    | app-reachable | Executes a phrase (quoted sequence) query against an inverted index                           |
| `executeQuery`                      | function/builder | runtime    | app-reachable | Dispatches any Query variant to the appropriate execution function                            |
| `executeTokenQuery`                 | function/builder | runtime    | app-reachable | Executes a single-token query against an inverted index                                       |
| `groupPostingsByDocument`           | function/builder | runtime    | app-reachable | Groups posting records by document ID                                                         |
| `intersectMatchedDocuments`         | function/builder | runtime    | app-reachable | Intersects two sets of matched documents (AND semantics)                                      |
| `mergeDocumentMatches`              | function/builder | runtime    | app-reachable | Merges match spans within a single document                                                   |
| `reconstructQuerySpan`              | function/builder | runtime    | app-reachable | Reconstructs the original source span of a matched query sequence                             |
| `unionMatchedDocuments`             | function/builder | runtime    | app-reachable | Unions two sets of matched documents (OR semantics)                                           |
| `executeQueryPipeline`              | function/builder | runtime    | app-reachable | Runs the full lex→parse→compile→execute pipeline end-to-end                                   |
| `compileQueryAst`                   | function/builder | runtime    | app-reachable | Compiles a parsed QueryAstNode into a CompiledQueryPlan                                       |
| `lexQuery`                          | function/builder | runtime    | app-reachable | Tokenizes a raw query string into QueryLexeme sequence                                        |
| `parseQuery`                        | function/builder | runtime    | app-reachable | Parses a lexed query into a QueryAstNode tree with diagnostics                                |
| `matchSearchTerm`                   | function/builder | runtime    | app-reachable | Exact normalized-phrase equality match against token projection windows                       |
| `buildPhraseWindow`                 | function/builder | runtime    | app-reachable | Constructs a contiguous phrase window from a token projection subsequence                     |
| `extractMatchSpan`                  | function/builder | runtime    | app-reachable | Extracts the original source span covered by a match                                          |
| `extractOriginalSpan`               | function/builder | runtime    | app-reachable | Maps a normalized character range back to the original input span                             |
| `isContiguousMatch`                 | function/builder | runtime    | app-reachable | Returns true when a set of token positions forms a contiguous run                             |
| `mapNormalizedRangeToOriginalRange` | function/builder | runtime    | app-reachable | Translates a normalized offset range to the original text range                               |
| `validateProjectionOffsets`         | function/builder | runtime    | app-reachable | Validates that projection offset pairs are structurally sound                                 |
| `BooleanQuery`                      | type/interface   | type-only  | app-reachable | Boolean (AND/OR) query shape for the query engine                                             |
| `CorpusDocument`                    | type/interface   | type-only  | app-reachable | Single document record stored in a SearchCorpus                                               |
| `CorpusIndexDocumentInput`          | type/interface   | type-only  | app-reachable | Input shape for `CorpusIndexer.addDocument`                                                   |
| `CorpusStatistics`                  | type/interface   | type-only  | app-reachable | Aggregate statistics snapshot of a SearchCorpus                                               |
| `InvertedIndex`                     | type/interface   | type-only  | app-reachable | Map from token string to sorted PostingRecord array                                           |
| `MatchedDocument`                   | type/interface   | type-only  | app-reachable | Document with one or more matched span records                                                |
| `MatchedSpan`                       | type/interface   | type-only  | app-reachable | Single matched span within a document                                                         |
| `PhraseQuery`                       | type/interface   | type-only  | app-reachable | Phrase (quoted sequence) query shape                                                          |
| `PostingRecord`                     | type/interface   | type-only  | app-reachable | Single inverted-index posting (document + position + offset)                                  |
| `ProjectionOffsetValidationResult`  | type/interface   | type-only  | app-reachable | Result of `validateProjectionOffsets`                                                         |
| `ProjectionSourceRange`             | type/interface   | type-only  | app-reachable | Original-text source range for a projection                                                   |
| `PhraseMatchResult`                 | type/interface   | type-only  | app-reachable | Result of `buildPhraseWindow` containing matched tokens and offsets                           |
| `Query`                             | type/interface   | type-only  | app-reachable | Union of all query variant types                                                              |
| `QueryExecutionResult`              | type/interface   | type-only  | app-reachable | Result returned by any query execution function                                               |
| `QueryPostingMatch`                 | type/interface   | type-only  | app-reachable | Single posting match within a query execution result                                          |
| `CompileQueryPipelineDiagnostic`    | type/interface   | type-only  | app-reachable | Diagnostic from the compile stage of the query pipeline                                       |
| `ExecuteQueryPipelineInput`         | type/interface   | type-only  | app-reachable | Input shape for `executeQueryPipeline`                                                        |
| `ExecuteQueryPipelineResult`        | type/interface   | type-only  | app-reachable | Full result from `executeQueryPipeline`                                                       |
| `ExecuteQueryPipelineDiagnostic`    | type/interface   | type-only  | app-reachable | Diagnostic from the execute stage of the query pipeline                                       |
| `LexQueryPipelineDiagnostic`        | type/interface   | type-only  | app-reachable | Diagnostic from the lex stage of the query pipeline                                           |
| `ParseQueryPipelineDiagnostic`      | type/interface   | type-only  | app-reachable | Diagnostic from the parse stage of the query pipeline                                         |
| `QueryPipelineDiagnostic`           | type/interface   | type-only  | app-reachable | Union of all pipeline stage diagnostics                                                       |
| `QueryPipelineDiagnosticBase`       | type/interface   | type-only  | app-reachable | Base fields common to all pipeline diagnostics                                                |
| `QueryPipelineMetadata`             | type/interface   | type-only  | app-reachable | Metadata attached to a pipeline execution result                                              |
| `QueryPipelineStage`                | type/interface   | type-only  | app-reachable | Literal union of pipeline stage names                                                         |
| `QueryPipelineStageResult`          | type/interface   | type-only  | app-reachable | Per-stage result record in a pipeline execution                                               |
| `QueryLexeme`                       | type/interface   | type-only  | app-reachable | Single token produced by `lexQuery`                                                           |
| `QueryLexemeType`                   | type/interface   | type-only  | app-reachable | Literal union of lexeme type codes                                                            |
| `ParseQueryResult`                  | type/interface   | type-only  | app-reachable | Output of `parseQuery` (AST + diagnostics)                                                    |
| `BooleanQueryNode`                  | type/interface   | type-only  | app-reachable | AST node for a boolean (AND/OR) expression                                                    |
| `GroupedQueryNode`                  | type/interface   | type-only  | app-reachable | AST node for a parenthesized group expression                                                 |
| `PhraseQueryNode`                   | type/interface   | type-only  | app-reachable | AST node for a quoted phrase                                                                  |
| `QueryAstBaseNode`                  | type/interface   | type-only  | app-reachable | Base interface for all AST node types                                                         |
| `QueryAstNode`                      | type/interface   | type-only  | app-reachable | Union of all AST node variants                                                                |
| `QueryNodeType`                     | type/interface   | type-only  | app-reachable | Literal union of AST node type strings                                                        |
| `CompiledQueryPlan`                 | type/interface   | type-only  | app-reachable | Output of `compileQueryAst` — a compiled, planner-level query representation                  |
| `CompileQueryResult`                | type/interface   | type-only  | app-reachable | Output shape of `compileQueryAst` (plan + diagnostics)                                        |
| `QueryCompileDiagnostic`            | type/interface   | type-only  | app-reachable | Diagnostic from the compile stage                                                             |
| `QueryParserDiagnostic`             | type/interface   | type-only  | app-reachable | Diagnostic from the parse stage                                                               |
| `QueryParserDiagnosticSeverity`     | type/interface   | type-only  | app-reachable | Literal union of parser diagnostic severities                                                 |
| `TokenQueryNode`                    | type/interface   | type-only  | app-reachable | AST node for a single search token                                                            |
| `SearchCorpus`                      | type/interface   | type-only  | app-reachable | Frozen search corpus with inverted index and statistics                                       |
| `SearchCorpusFormatVersion`         | type/interface   | type-only  | app-reachable | Branded type for the corpus format version                                                    |
| `SearchMatch`                       | type/interface   | type-only  | app-reachable | Single match produced by `matchSearchTerm`                                                    |
| `SearchMatchRange`                  | type/interface   | type-only  | app-reachable | Offset range for a search match                                                               |
| `SearchProjectionPipelineResult`    | type/interface   | type-only  | app-reachable | Full output of `buildSearchProjection` (normalization + tokenization + records)               |
| `SearchProjectionRecord`            | type/interface   | type-only  | app-reachable | Single token projection record (token + offsets + position)                                   |
| `SearchProjectionTokenType`         | type/interface   | type-only  | app-reachable | Literal union of token type values in a projection                                            |
| `SourceSpan`                        | type/interface   | type-only  | app-reachable | Character-offset span (start, end) in query source text                                       |
| `TokenQuery`                        | type/interface   | type-only  | app-reachable | Single-token query shape                                                                      |

### 3.3 `src/core/tokenizers/search/index.ts` — intermediate search barrel

This table lists symbols that are in search/index.ts but **NOT forwarded** to
`tokenizers/index.ts` (all are INTERMEDIATE only, not APP-REACHABLE).

| symbol                                                   | kind             | type-only? | reachability | one-line capability                                           |
| -------------------------------------------------------- | ---------------- | ---------- | ------------ | ------------------------------------------------------------- |
| `buildQueryExecutionPlan`                                | function/builder | runtime    | intermediate | Builds a QueryExecutionPlan IR from a CompiledQueryPlan       |
| `QUERY_EXECUTION_PLAN_SCHEMA_VERSION`                    | const/value      | runtime    | intermediate | Schema version string for QueryExecutionPlan artifacts        |
| `BooleanExecutionPlanNode`                               | type/interface   | type-only  | intermediate | Execution plan node for a boolean (AND/OR) operation          |
| `PhraseExecutionPlanNode`                                | type/interface   | type-only  | intermediate | Execution plan node for a phrase sequence                     |
| `QueryExecutionPlan`                                     | type/interface   | type-only  | intermediate | Full execution plan IR (Phase 9 artifact)                     |
| `QueryExecutionPlanDiagnostic`                           | type/interface   | type-only  | intermediate | Diagnostic attached to an execution plan                      |
| `QueryExecutionPlanMetadata`                             | type/interface   | type-only  | intermediate | Metadata block on a QueryExecutionPlan                        |
| `QueryExecutionPlanNode`                                 | type/interface   | type-only  | intermediate | Union of all execution plan node types                        |
| `QueryExecutionPlanNodeType`                             | type/interface   | type-only  | intermediate | Literal union of plan node type strings                       |
| `QueryExecutionPlanSchemaVersion`                        | type/interface   | type-only  | intermediate | Branded type for the execution plan schema version            |
| `TokenExecutionPlanNode`                                 | type/interface   | type-only  | intermediate | Execution plan node for a single token                        |
| `ExecuteQueryPipelineOptions`                            | type/interface   | type-only  | intermediate | Optional settings for `executeQueryPipeline`                  |
| `PlanQueryPipelineDiagnostic`                            | type/interface   | type-only  | intermediate | Diagnostic from the plan stage of the query pipeline          |
| `aggregateReplayDiagnostics`                             | function/builder | runtime    | intermediate | Aggregates diagnostics from multiple replay results           |
| `buildReplayGovernanceReport`                            | function/builder | runtime    | intermediate | Builds a replay governance report from replay results         |
| `canonicalizeForEquivalence`                             | function/builder | runtime    | intermediate | Normalizes a snapshot value to its canonical equivalence form |
| `createQueryReplaySnapshot`                              | function/builder | runtime    | intermediate | Creates a QueryReplaySnapshot from pipeline artifacts         |
| `createQuerySnapshotBundle`                              | function/builder | runtime    | intermediate | Bundles multiple snapshots into a QuerySnapshotBundle         |
| `deserializeQueryReplaySnapshot`                         | function/builder | runtime    | intermediate | Deserializes a QueryReplaySnapshot from stored JSON           |
| `deserializeQuerySnapshotBundle`                         | function/builder | runtime    | intermediate | Deserializes a QuerySnapshotBundle from stored JSON           |
| `diffJsonValues`                                         | function/builder | runtime    | intermediate | Produces a structural diff between two JSON values            |
| `diffQueryReplaySnapshots`                               | function/builder | runtime    | intermediate | Diffs two replay snapshots to detect changes                  |
| `evaluateQueryReplayCompatibility`                       | function/builder | runtime    | intermediate | Classifies compatibility between two snapshots                |
| `reconstructQueryReplaySnapshot`                         | function/builder | runtime    | intermediate | Reconstructs a replay snapshot from its envelope form         |
| `reconstructQuerySnapshotBundle`                         | function/builder | runtime    | intermediate | Reconstructs a snapshot bundle from its stored form           |
| `replayQuerySnapshotBundle`                              | function/builder | runtime    | intermediate | Re-executes queries in a bundle against the current engine    |
| `REPLAY_GOVERNANCE_REPORT_SCHEMA_VERSION`                | const/value      | runtime    | intermediate | Schema version for ReplayGovernanceReport artifacts           |
| `stableJsonStringify`                                    | function/builder | runtime    | intermediate | Produces deterministic (key-sorted) JSON serialization        |
| `summarizeReplayCompatibility`                           | function/builder | runtime    | intermediate | Produces a human-readable compatibility summary               |
| `summarizeReplayDiff`                                    | function/builder | runtime    | intermediate | Produces a human-readable diff summary                        |
| `validateExecutionPlanArtifact`                          | function/builder | runtime    | intermediate | Validates a replay artifact as a QueryExecutionPlan           |
| `validateQueryExplanationArtifact`                       | function/builder | runtime    | intermediate | Validates a replay artifact as a QueryExplanation             |
| `validateQueryExecutionTraceArtifact`                    | function/builder | runtime    | intermediate | Validates a replay artifact as a QueryExecutionTrace          |
| `validateQueryPipelineArtifact`                          | function/builder | runtime    | intermediate | Validates a replay artifact as a QueryPipelineSnapshot        |
| `validateQueryReplaySnapshot`                            | function/builder | runtime    | intermediate | Validates the structure of a QueryReplaySnapshot              |
| `validateQueryReplaySnapshotWithArtifacts`               | function/builder | runtime    | intermediate | Validates a snapshot including all embedded artifacts         |
| `validateQuerySnapshotBundle`                            | function/builder | runtime    | intermediate | Validates the structure of a QuerySnapshotBundle              |
| `validateReplayArtifactByKind`                           | function/builder | runtime    | intermediate | Dispatches artifact validation by artifact kind               |
| `validateSnapshotEnvelopeArtifact`                       | function/builder | runtime    | intermediate | Validates a snapshot envelope artifact                        |
| `verifyCanonicalStructuralEquivalence`                   | function/builder | runtime    | intermediate | Checks whether two snapshot values are canonically equivalent |
| `buildQueryExecutionTrace`                               | function/builder | runtime    | intermediate | Builds a QueryExecutionTrace from pipeline stage results      |
| `buildQueryExplanation`                                  | function/builder | runtime    | intermediate | Builds a QueryExplanation from pipeline stage artifacts       |
| `QUERY_EXECUTION_TRACE_SCHEMA_VERSION`                   | const/value      | runtime    | intermediate | Schema version for QueryExecutionTrace artifacts              |
| `QUERY_EXPLANATION_SCHEMA_VERSION`                       | const/value      | runtime    | intermediate | Schema version for QueryExplanation artifacts                 |
| `QueryExecutionTrace`                                    | type/interface   | type-only  | intermediate | Structural execution trace (Phase 9 artifact)                 |
| `QueryExecutionTraceMetadata`                            | type/interface   | type-only  | intermediate | Metadata block on a QueryExecutionTrace                       |
| `QueryExecutionTraceSchemaVersion`                       | type/interface   | type-only  | intermediate | Branded type for trace schema version                         |
| `QueryExecutionTraceStage`                               | type/interface   | type-only  | intermediate | Single stage record within a trace                            |
| `QueryExecutionTraceStatus`                              | type/interface   | type-only  | intermediate | Literal union of trace status values                          |
| `QueryExecutionTraceStep`                                | type/interface   | type-only  | intermediate | Single step record within a trace stage                       |
| `QueryExplanation`                                       | type/interface   | type-only  | intermediate | Structural query explanation (Phase 9 artifact)               |
| `QueryExplanationArtifact`                               | type/interface   | type-only  | intermediate | Embedded artifact within a query explanation                  |
| `QueryExplanationArtifactType`                           | type/interface   | type-only  | intermediate | Literal union of explanation artifact types                   |
| `QueryExplanationSchemaVersion`                          | type/interface   | type-only  | intermediate | Branded type for explanation schema version                   |
| `QueryExplanationStage`                                  | type/interface   | type-only  | intermediate | Single stage within a query explanation                       |
| `QueryTraceMetadataPrimitive`                            | type/interface   | type-only  | intermediate | Primitive metadata value type used in traces                  |
| `buildRuntimeCapabilityCertificationSummary`             | function/builder | runtime    | intermediate | Aggregates certification results into a summary artifact      |
| `buildRuntimeCapabilityIntrospectionEnvelope`            | function/builder | runtime    | intermediate | Builds a runtime capability introspection envelope            |
| `certifyRuntimeCapabilityManifest`                       | function/builder | runtime    | intermediate | Certifies a manifest against a declared capability set        |
| `composeRuntimeCapabilityCertificationAuditSnapshot`     | function/builder | runtime    | intermediate | Builds a certification audit snapshot (Phase 9 artifact)      |
| `composeRuntimeCapabilityGovernanceReport`               | function/builder | runtime    | intermediate | Builds a runtime governance report from manifest results      |
| `composeRuntimeCapabilityManifest`                       | function/builder | runtime    | intermediate | Builds a runtime capability manifest from declarations        |
| `composeRuntimeGovernanceClosure`                        | function/builder | runtime    | intermediate | Builds a governance closure record                            |
| `composeRuntimeGovernanceProvenance`                     | function/builder | runtime    | intermediate | Builds a governance provenance record                         |
| `composeRuntimeOperationalGovernanceManifest`            | function/builder | runtime    | intermediate | Builds an operational governance manifest                     |
| `evaluateRuntimeCapabilityCompatibility`                 | function/builder | runtime    | intermediate | Evaluates compatibility between two runtime capability sets   |
| `RUNTIME_CERTIFICATION_AUDIT_SNAPSHOT_SCHEMA_VERSION`    | const/value      | runtime    | intermediate | Schema version for audit snapshot artifacts                   |
| `RUNTIME_GOVERNANCE_REPORT_SCHEMA_VERSION`               | const/value      | runtime    | intermediate | Schema version for governance report artifacts                |
| `RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION`             | const/value      | runtime    | intermediate | Schema version for capability manifest artifacts              |
| `RUNTIME_GOVERNANCE_CLOSURE_SCHEMA_VERSION`              | const/value      | runtime    | intermediate | Schema version for governance closure artifacts               |
| `RUNTIME_GOVERNANCE_PROVENANCE_SCHEMA_VERSION`           | const/value      | runtime    | intermediate | Schema version for governance provenance artifacts            |
| `RUNTIME_INTROSPECTION_ENVELOPE_SCHEMA_VERSION`          | const/value      | runtime    | intermediate | Schema version for introspection envelope artifacts           |
| `RUNTIME_OPERATIONAL_GOVERNANCE_MANIFEST_SCHEMA_VERSION` | const/value      | runtime    | intermediate | Schema version for operational governance manifest artifacts  |
| `validateRuntimeCapabilityManifest`                      | function/builder | runtime    | intermediate | Validates a capability manifest against declared constraints  |
| _(+ ~40 runtime-capability type exports)_                | type/interface   | type-only  | intermediate | Full type set for runtime governance infrastructure           |
| _(+ ~40 query-snapshot type exports)_                    | type/interface   | type-only  | intermediate | Full type set for snapshot/replay governance infrastructure   |

### 3.4 `src/core/tokenizers/search/query-learning-interop/index.ts` — LEAF-ONLY barrel

No higher barrel re-exports this barrel. All symbols are LEAF-ONLY (not app-reachable).

| symbol                                                                       | kind             | type-only? | reachability | one-line capability                                                          |
| ---------------------------------------------------------------------------- | ---------------- | ---------- | ------------ | ---------------------------------------------------------------------------- |
| `READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION`                         | const/value      | runtime    | leaf-only    | Schema version for ReadingPrimitiveSearchProjection (Phase 13)               |
| `composeReadingPrimitiveSearchProjection`                                    | function/builder | runtime    | leaf-only    | Builds a reading-primitive search projection from a lookup enrichment result |
| `ComposeReadingPrimitiveSearchProjectionInput`                               | type/interface   | type-only  | leaf-only    | Input shape for the reading projection builder                               |
| `ReadingPrimitiveSearchProjection`                                           | type/interface   | type-only  | leaf-only    | Reading-primitive search projection structural type (Phase 13)               |
| `ReadingPrimitiveSearchProjectionSchemaVersion`                              | type/interface   | type-only  | leaf-only    | Branded type for Phase 13 reading-projection schema version                  |
| `WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION`                         | const/value      | runtime    | leaf-only    | Schema version for WritingPrimitiveSearchProjection (Phase 13)               |
| `composeWritingPrimitiveSearchProjection`                                    | function/builder | runtime    | leaf-only    | Builds a writing-primitive search projection from a lookup enrichment result |
| `ComposeWritingPrimitiveSearchProjectionInput`                               | type/interface   | type-only  | leaf-only    | Input shape for the writing projection builder                               |
| `WritingPrimitiveSearchProjection`                                           | type/interface   | type-only  | leaf-only    | Writing-primitive search projection structural type (Phase 13)               |
| `WritingPrimitiveSearchProjectionSchemaVersion`                              | type/interface   | type-only  | leaf-only    | Branded type for Phase 13 writing-projection schema version                  |
| `SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION`                            | const/value      | runtime    | leaf-only    | Schema version for SpellingEntrySearchProjection (Phase 13)                  |
| `composeSpellingEntrySearchProjection`                                       | function/builder | runtime    | leaf-only    | Builds a spelling-entry search projection from a lookup enrichment result    |
| `ComposeSpellingEntrySearchProjectionInput`                                  | type/interface   | type-only  | leaf-only    | Input shape for the spelling projection builder                              |
| `SpellingEntrySearchProjection`                                              | type/interface   | type-only  | leaf-only    | Spelling-entry search projection structural type (Phase 13)                  |
| `SpellingEntrySearchProjectionSchemaVersion`                                 | type/interface   | type-only  | leaf-only    | Branded type for Phase 13 spelling-projection schema version                 |
| `READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION` | const/value      | runtime    | leaf-only    | Schema version for ReadingPrimitive route delivery contract (Phase 14)       |
| `composeReadingPrimitiveSearchProjectionRouteDeliveryContract`               | function/builder | runtime    | leaf-only    | Builds a reading-primitive route delivery contract                           |
| `ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput`          | type/interface   | type-only  | leaf-only    | Input shape for the reading delivery contract builder                        |
| `ReadingPrimitiveSearchProjectionRouteDeliveryContract`                      | type/interface   | type-only  | leaf-only    | Reading-primitive route delivery contract structural type (Phase 14)         |
| `ReadingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion`         | type/interface   | type-only  | leaf-only    | Branded type for Phase 14 reading delivery contract schema version           |
| `WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION` | const/value      | runtime    | leaf-only    | Schema version for WritingPrimitive route delivery contract (Phase 14)       |
| `composeWritingPrimitiveSearchProjectionRouteDeliveryContract`               | function/builder | runtime    | leaf-only    | Builds a writing-primitive route delivery contract                           |
| `ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput`          | type/interface   | type-only  | leaf-only    | Input shape for the writing delivery contract builder                        |
| `WritingPrimitiveSearchProjectionRouteDeliveryContract`                      | type/interface   | type-only  | leaf-only    | Writing-primitive route delivery contract structural type (Phase 14)         |
| `WritingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion`         | type/interface   | type-only  | leaf-only    | Branded type for Phase 14 writing delivery contract schema version           |
| `SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION`    | const/value      | runtime    | leaf-only    | Schema version for SpellingEntry route delivery contract (Phase 14)          |
| `composeSpellingEntrySearchProjectionRouteDeliveryContract`                  | function/builder | runtime    | leaf-only    | Builds a spelling-entry route delivery contract                              |
| `ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput`             | type/interface   | type-only  | leaf-only    | Input shape for the spelling delivery contract builder                       |
| `SpellingEntrySearchProjectionRouteDeliveryContract`                         | type/interface   | type-only  | leaf-only    | Spelling-entry route delivery contract structural type (Phase 14)            |
| `SpellingEntrySearchProjectionRouteDeliveryContractSchemaVersion`            | type/interface   | type-only  | leaf-only    | Branded type for Phase 14 spelling delivery contract schema version          |

### 3.5 `src/core/tokenizers/search/query-lexical-interop/index.ts` — LEAF-ONLY barrel

No higher barrel re-exports this barrel. All symbols are LEAF-ONLY.

| symbol                                           | kind             | type-only? | reachability | one-line capability                                               |
| ------------------------------------------------ | ---------------- | ---------- | ------------ | ----------------------------------------------------------------- |
| `composeLexicalQueryEnrichment`                  | function/builder | runtime    | leaf-only    | Enriches a parsed query with lexical lookup results               |
| `LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION`        | const/value      | runtime    | leaf-only    | Schema version for LexicalQueryEnrichmentResult (Phase 10)        |
| `ComposeLexicalQueryEnrichmentInput`             | type/interface   | type-only  | leaf-only    | Input shape for `composeLexicalQueryEnrichment`                   |
| `LexicalQueryEnrichmentOrigin`                   | type/interface   | type-only  | leaf-only    | Literal union of enrichment origin values                         |
| `LexicalQueryEnrichmentResult`                   | type/interface   | type-only  | leaf-only    | Enrichment result (Phase 10 artifact)                             |
| `LexicalQueryEnrichmentSchemaVersion`            | type/interface   | type-only  | leaf-only    | Branded type for enrichment schema version                        |
| `LexicalTermEnrichment`                          | type/interface   | type-only  | leaf-only    | Enrichment result for a single query term                         |
| `LexicalTermEnrichmentStatus`                    | type/interface   | type-only  | leaf-only    | Literal union of per-term enrichment status values                |
| `composeLexicalEnrichmentReport`                 | function/builder | runtime    | leaf-only    | Builds an enrichment report from enrichment results               |
| `LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION` | const/value      | runtime    | leaf-only    | Schema version for LexicalQueryEnrichmentReport (Phase 10)        |
| `ComposeLexicalQueryEnrichmentReportInput`       | type/interface   | type-only  | leaf-only    | Input shape for `composeLexicalEnrichmentReport`                  |
| `LexicalEnrichmentDiagnosticsByCode`             | type/interface   | type-only  | leaf-only    | Map of enrichment diagnostics grouped by code                     |
| `LexicalQueryEnrichmentReport`                   | type/interface   | type-only  | leaf-only    | Enrichment report structural type (Phase 10 artifact)             |
| `LexicalQueryEnrichmentReportSchemaVersion`      | type/interface   | type-only  | leaf-only    | Branded type for enrichment report schema version                 |
| `LexicalQueryEnrichmentStatus`                   | type/interface   | type-only  | leaf-only    | Literal union of enrichment report status values                  |
| `composeLexicalQueryReport`                      | function/builder | runtime    | leaf-only    | Builds a combined lexical query report                            |
| `LEXICAL_QUERY_REPORT_SCHEMA_VERSION`            | const/value      | runtime    | leaf-only    | Schema version for LexicalQueryReport (Phase 10)                  |
| `ComposeLexicalQueryReportInput`                 | type/interface   | type-only  | leaf-only    | Input shape for `composeLexicalQueryReport`                       |
| `LexicalQueryReport`                             | type/interface   | type-only  | leaf-only    | Combined lexical query report structural type (Phase 10 artifact) |
| `LexicalQueryReportSchemaVersion`                | type/interface   | type-only  | leaf-only    | Branded type for query report schema version                      |

### 3.6 `src/core/tokenizers/search/runtime-capabilities/index.ts` — symbols NOT forwarded by search/index.ts

These symbols exist in the intermediate barrel but are neither forwarded by
`search/index.ts` nor by `tokenizers/index.ts` (INTERMEDIATE, not APP-REACHABLE).

| symbol                                                  | kind             | type-only? | reachability | one-line capability                                                      |
| ------------------------------------------------------- | ---------------- | ---------- | ------------ | ------------------------------------------------------------------------ |
| `deepFreezeStructure`                                   | function/builder | runtime    | intermediate | Recursively deep-freezes a plain object structure                        |
| `orderCertificationSummaryMismatches`                   | function/builder | runtime    | intermediate | Sorts mismatches within a certification summary                          |
| `orderRuntimeCapabilityCertifications`                  | function/builder | runtime    | intermediate | Sorts certification records by a stable key                              |
| `orderRuntimeCapabilityManifests`                       | function/builder | runtime    | intermediate | Sorts runtime capability manifests by a stable key                       |
| `orderCertificationMismatches`                          | function/builder | runtime    | intermediate | Sorts mismatches within a single certification result                    |
| `orderRuntimeCapabilityDiagnostics`                     | function/builder | runtime    | intermediate | Sorts capability diagnostics by severity then code                       |
| `validateLexicalInteropCapabilityDeclaration`           | function/builder | runtime    | intermediate | Validates a LexicalInteropCapabilityDeclaration against structural rules |
| `composeLexicalInteropCapabilityDeclaration`            | function/builder | runtime    | intermediate | Builds a lexical interop capability declaration                          |
| `LEXICAL_INTEROP_CAPABILITY_DECLARATION_SCHEMA_VERSION` | const/value      | runtime    | intermediate | Schema version for LexicalInteropCapabilityDeclaration (Phase 10)        |
| `composeManifestFromLexicalInteropDeclaration`          | function/builder | runtime    | intermediate | Builds a RuntimeCapabilityManifest from a lexical interop declaration    |
| `RUNTIME_CERTIFICATION_SUMMARY_SCHEMA_VERSION`          | const/value      | runtime    | intermediate | Schema version for RuntimeCapabilityCertificationSummary                 |
| `ComposeRuntimeCapabilityManifestInput`                 | type/interface   | type-only  | intermediate | Input shape for `composeRuntimeCapabilityManifest`                       |
| `BuildRuntimeCapabilityIntrospectionEnvelopeInput`      | type/interface   | type-only  | intermediate | Input shape for `buildRuntimeCapabilityIntrospectionEnvelope`            |
| `ComposeRuntimeGovernanceProvenanceInput`               | type/interface   | type-only  | intermediate | Input shape for `composeRuntimeGovernanceProvenance`                     |
| `ComposeRuntimeGovernanceClosureInput`                  | type/interface   | type-only  | intermediate | Input shape for `composeRuntimeGovernanceClosure`                        |
| `RuntimeCapabilityCertificationSummarySchemaVersion`    | type/interface   | type-only  | intermediate | Branded type for certification summary schema version                    |
| `ComposeManifestFromLexicalInteropDeclarationInput`     | type/interface   | type-only  | intermediate | Input shape for `composeManifestFromLexicalInteropDeclaration`           |
| `ComposeLexicalInteropCapabilityDeclarationInput`       | type/interface   | type-only  | intermediate | Input shape for `composeLexicalInteropCapabilityDeclaration`             |
| `LexicalInteropCapabilityDeclaration`                   | type/interface   | type-only  | intermediate | Lexical interop capability declaration structural type (Phase 10)        |
| `LexicalInteropCapabilityDeclarationEntry`              | type/interface   | type-only  | intermediate | Single entry within a lexical interop declaration                        |
| `LexicalInteropCapabilityDeclarationSchemaVersion`      | type/interface   | type-only  | intermediate | Branded type for declaration schema version                              |
| `LexicalInteropCapabilityId`                            | type/interface   | type-only  | intermediate | Branded type for a lexical interop capability identifier                 |

### 3.7 `src/core/tokenizers/search/query-snapshots/index.ts` — symbols NOT forwarded by search/index.ts

| symbol                               | kind             | type-only? | reachability | one-line capability                                       |
| ------------------------------------ | ---------------- | ---------- | ------------ | --------------------------------------------------------- |
| `QUERY_SNAPSHOT_SCHEMA_VERSION`      | const/value      | runtime    | intermediate | Schema version for QueryReplaySnapshot envelope artifacts |
| `composeReplayAuditReport`           | function/builder | runtime    | intermediate | Builds a replay audit report from audit inputs            |
| `REPLAY_AUDIT_REPORT_KIND`           | const/value      | runtime    | intermediate | Artifact kind string for replay audit reports             |
| `REPLAY_AUDIT_REPORT_SCHEMA_VERSION` | const/value      | runtime    | intermediate | Schema version for ReplayAuditReport artifacts            |
| `ComposeReplayAuditReportInput`      | type/interface   | type-only  | intermediate | Input shape for `composeReplayAuditReport`                |
| `ReplayAuditReport`                  | type/interface   | type-only  | intermediate | Replay audit report structural type                       |
| `ReplayAuditReportSchemaVersion`     | type/interface   | type-only  | intermediate | Branded type for audit report schema version              |

### 3.8 `src/core/tokenizers/normalization/index.ts` — symbols NOT forwarded by tokenizers/index.ts

`normalizeText` and the shared types ARE forwarded. The three rule symbols are not.

| symbol                       | kind        | type-only? | reachability | one-line capability                                                     |
| ---------------------------- | ----------- | ---------- | ------------ | ----------------------------------------------------------------------- |
| `collapseWhitespaceRule`     | const/value | runtime    | intermediate | Pre-built normalization rule that collapses internal whitespace runs    |
| `thaiDigitNormalizationRule` | const/value | runtime    | intermediate | Pre-built normalization rule that maps Thai digit characters to ASCII   |
| `trimBoundaryWhitespaceRule` | const/value | runtime    | intermediate | Pre-built normalization rule that trims leading and trailing whitespace |

---

## 4. Capability Verdict Matrix

For each capability, verdict is exactly EXPORTED / INTERNAL / NOT PRESENT per
the definitions in §1. Supporting path uses extensionless barrel specifiers
matching repository convention.

| capability                       | verdict     | supporting path                                                                                                                                                                           | basis                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **exact-key lookup**             | EXPORTED    | `src/core/lexical/index` → `composeLexicalLookup`                                                                                                                                         | `composeLexicalLookup` is app-reachable. ARCHITECTURE.md "Lexical Key Normalization Policy" documents exact-equality resolution for both th→en and en→th directions.                                                                                                                                                             |
| **English whole-phrase lookup**  | EXPORTED    | `src/core/lexical/index` → `composeLexicalLookup`                                                                                                                                         | Same function; ARCHITECTURE.md "Lexical Key Normalization Policy" explicitly grounds en→th whole-phrase query acceptance with exact-equality matching (no tokenization, no prefix, no fuzzy). Delivered by `feat/lexical-english-phrase-keying`.                                                                                 |
| **prefix matching**              | NOT PRESENT | —                                                                                                                                                                                         | No exported or internal function implementing prefix matching exists in `src/core/tokenizers/` or `src/core/lexical/`. ARCHITECTURE.md "Lexical Key Normalization Policy" lists "no prefix matching" as an explicit non-goal. The search layer architecture (Deterministic Query Explainability) documents no prefix capability. |
| **substring matching**           | NOT PRESENT | —                                                                                                                                                                                         | No exported or internal function implementing substring matching exists. ARCHITECTURE.md documents no substring matching capability in either the lexical or search layers.                                                                                                                                                      |
| **fuzzy matching**               | NOT PRESENT | —                                                                                                                                                                                         | No exported or internal function implementing fuzzy matching exists. ARCHITECTURE.md "Lexical Key Normalization Policy" lists "no fuzzy matching" as an explicit non-goal. The search layer architecture documents no fuzzy capability.                                                                                          |
| **tokenization-driven matching** | EXPORTED    | `src/core/tokenizers/index` → `buildSearchProjection`, `CorpusIndexer`, `executeQuery` / `executeTokenQuery` / `executeBooleanQuery` / `executePhraseQuery`                               | The pipeline from `buildSearchProjection` (normalize+tokenize→projection records) through `CorpusIndexer` (inverted index build) to `executeQuery` (corpus query execution) is fully app-reachable. ARCHITECTURE.md "Pluggable Tokenizer And Search Abstraction" documents this as a core platform capability.                   |
| **phrase matching**              | EXPORTED    | `src/core/tokenizers/index` → `executePhraseQuery`, `matchSearchTerm`, `buildPhraseWindow`, `PhraseQuery`, `PhraseMatchResult`, `PhraseQueryNode`                                         | `executePhraseQuery` executes phrase queries against a corpus index. `matchSearchTerm` performs exact normalized-phrase equality matching against token windows. `PhraseQueryNode` is an AST node type grounded in ARCHITECTURE.md's query pipeline model. All are app-reachable.                                                |
| **query parser surface**         | EXPORTED    | `src/core/tokenizers/index` → `lexQuery`, `parseQuery`, `compileQueryAst`, AST node types, `QueryLexeme`, `CompiledQueryPlan`                                                             | Full lex→parse→compile surface is app-reachable. Corresponds to "Lexer → Parser AST → Planner / Compiler" stages in ARCHITECTURE.md "Deterministic Query Explainability".                                                                                                                                                        |
| **query IR surface**             | INTERNAL    | `src/core/tokenizers/search/index` → `buildQueryExecutionPlan`, `QueryExecutionPlan`, execution plan node types                                                                           | `buildQueryExecutionPlan` and all `QueryExecutionPlan` IR types are in `src/core/tokenizers/search/index.ts` (intermediate) but NOT forwarded by `src/core/tokenizers/index.ts`. ARCHITECTURE.md documents the "Execution Plan IR" stage in the query pipeline.                                                                  |
| **execution-plan surface**       | INTERNAL    | `src/core/tokenizers/search/index` → `buildQueryExecutionPlan`, `QUERY_EXECUTION_PLAN_SCHEMA_VERSION`, `QueryExecutionPlanDiagnostic`, `QueryExecutionPlanMetadata`                       | Same module as query IR surface; the builder and schema version constant are not forwarded to the top-level barrel.                                                                                                                                                                                                              |
| **explainability surface**       | INTERNAL    | `src/core/tokenizers/search/index` → `buildQueryExplanation`, `buildQueryExecutionTrace`, `QUERY_EXPLANATION_SCHEMA_VERSION`, `QUERY_EXECUTION_TRACE_SCHEMA_VERSION`, query-tracing types | All explainability builders, constants, and types are in `src/core/tokenizers/search/index.ts` (intermediate) but NOT forwarded by `src/core/tokenizers/index.ts`. ARCHITECTURE.md "Deterministic Query Explainability" documents this as a defined platform capability.                                                         |

---

## 5. Observations

1. **Top-level tokenizer barrel deliberately omits governance infrastructure.** The
   query-ir, query-snapshots, query-tracing, and runtime-capabilities modules are all
   accessible at the intermediate search barrel but are not forwarded to
   `src/core/tokenizers/index.ts`. The boundary is intentional: the top-level
   barrel surfaces the execution-oriented symbols (corpus build, query execute,
   parser pipeline) while keeping the replay-governance, explainability, and
   runtime-certification infrastructure below the public surface.

2. **Phase 13/14 delivery artifacts are unreachable.** The Phase 13 search
   projections (`ReadingPrimitiveSearchProjection`, `WritingPrimitiveSearchProjection`,
   `SpellingEntrySearchProjection`) and the Phase 14 route delivery contracts are in
   a leaf-only barrel (`src/core/tokenizers/search/query-learning-interop/index.ts`)
   that no higher barrel re-exports. An application that needs these must import them
   from that barrel directly, which APP_SHELL_GUIDELINES prohibits. The types are
   present in source and tested, but the app-facing barrel surface does not include
   them.

3. **Lexical normalization is fully internal.** `normalizeLexicalKey`,
   `canonicalizeEnglishKey`, `assertNoWhitespace`, and the Thai tone-mark
   normalization rule are in `src/core/lexical/normalization/` source files with no
   barrel exposure at any level. This is by design: SESSION_STATE.md explicitly
   records `canonicalizeEnglishKey` as "internal, not barrel-exported."

4. **`matchSearchTerm` is token-exact, not substring.** Source inspection confirms
   that `matchSearchTerm` matches only when a contiguous token-window's concatenated
   phrase equals the normalized query string exactly. It does not search for the
   query as a substring of any token.

5. **Three pre-built normalization rules are not app-reachable.** `collapseWhitespaceRule`,
   `thaiDigitNormalizationRule`, and `trimBoundaryWhitespaceRule` are in the
   intermediate normalization barrel but are not forwarded by `tokenizers/index.ts`.
   Only `normalizeText` (the pipeline runner) is app-reachable; individual rules are
   internal.

6. **Lexical barrel is a flat, no-sub-barrel structure.** All `src/core/lexical/index.ts`
   exports are direct leaf-to-top-level re-exports. Every symbol in that barrel is
   app-reachable; there is no intermediate layer to lose symbols in.

7. **`ExecuteQueryPipelineOptions` and `PlanQueryPipelineDiagnostic` are pipeline
   types that did not make it to the top-level barrel.** Both are in
   `src/core/tokenizers/search/index.ts` (intermediate) but absent from
   `tokenizers/index.ts`. This means the app can call `executeQueryPipeline` but
   cannot directly type the options parameter or the plan-stage diagnostic using a
   top-level import.

---

## Appendix A — Potential App-Reach Friction Candidates

Every search-related symbol that is NOT app-reachable through a top-level barrel.
Facts only; no recommendation about exposing any of them.

### A.1 Phase 13/14 learning and delivery artifacts (leaf-only — `query-learning-interop`)

`composeReadingPrimitiveSearchProjection` · `ReadingPrimitiveSearchProjection` ·
`READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION` ·
`ComposeReadingPrimitiveSearchProjectionInput` ·
`ReadingPrimitiveSearchProjectionSchemaVersion`

`composeWritingPrimitiveSearchProjection` · `WritingPrimitiveSearchProjection` ·
`WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION` ·
`ComposeWritingPrimitiveSearchProjectionInput` ·
`WritingPrimitiveSearchProjectionSchemaVersion`

`composeSpellingEntrySearchProjection` · `SpellingEntrySearchProjection` ·
`SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION` ·
`ComposeSpellingEntrySearchProjectionInput` ·
`SpellingEntrySearchProjectionSchemaVersion`

`composeReadingPrimitiveSearchProjectionRouteDeliveryContract` ·
`ReadingPrimitiveSearchProjectionRouteDeliveryContract` ·
`READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION` ·
`ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput` ·
`ReadingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion`

`composeWritingPrimitiveSearchProjectionRouteDeliveryContract` ·
`WritingPrimitiveSearchProjectionRouteDeliveryContract` ·
`WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION` ·
`ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput` ·
`WritingPrimitiveSearchProjectionRouteDeliveryContractSchemaVersion`

`composeSpellingEntrySearchProjectionRouteDeliveryContract` ·
`SpellingEntrySearchProjectionRouteDeliveryContract` ·
`SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION` ·
`ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput` ·
`SpellingEntrySearchProjectionRouteDeliveryContractSchemaVersion`

### A.2 Lexical query enrichment and reporting (leaf-only — `query-lexical-interop`)

`composeLexicalQueryEnrichment` · `LexicalQueryEnrichmentResult` ·
`LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION` · `ComposeLexicalQueryEnrichmentInput` ·
`LexicalQueryEnrichmentOrigin` · `LexicalQueryEnrichmentSchemaVersion` ·
`LexicalTermEnrichment` · `LexicalTermEnrichmentStatus`

`composeLexicalEnrichmentReport` · `LexicalQueryEnrichmentReport` ·
`LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION` ·
`ComposeLexicalQueryEnrichmentReportInput` · `LexicalEnrichmentDiagnosticsByCode` ·
`LexicalQueryEnrichmentReportSchemaVersion` · `LexicalQueryEnrichmentStatus`

`composeLexicalQueryReport` · `LexicalQueryReport` ·
`LEXICAL_QUERY_REPORT_SCHEMA_VERSION` · `ComposeLexicalQueryReportInput` ·
`LexicalQueryReportSchemaVersion`

### A.3 Query execution plan IR (intermediate — `search/index.ts`, not forwarded to `tokenizers/index.ts`)

`buildQueryExecutionPlan` · `QUERY_EXECUTION_PLAN_SCHEMA_VERSION` ·
`QueryExecutionPlan` · `QueryExecutionPlanMetadata` · `QueryExecutionPlanDiagnostic` ·
`QueryExecutionPlanNode` · `QueryExecutionPlanNodeType` · `QueryExecutionPlanSchemaVersion` ·
`BooleanExecutionPlanNode` · `PhraseExecutionPlanNode` · `TokenExecutionPlanNode`

`ExecuteQueryPipelineOptions` · `PlanQueryPipelineDiagnostic`

### A.4 Explainability infrastructure (intermediate — `search/index.ts`, not forwarded)

`buildQueryExplanation` · `QUERY_EXPLANATION_SCHEMA_VERSION` ·
`QueryExplanation` · `QueryExplanationArtifact` · `QueryExplanationArtifactType` ·
`QueryExplanationSchemaVersion` · `QueryExplanationStage`

`buildQueryExecutionTrace` · `QUERY_EXECUTION_TRACE_SCHEMA_VERSION` ·
`QueryExecutionTrace` · `QueryExecutionTraceMetadata` · `QueryExecutionTraceSchemaVersion` ·
`QueryExecutionTraceStage` · `QueryExecutionTraceStatus` · `QueryExecutionTraceStep` ·
`QueryTraceMetadataPrimitive`

### A.5 Snapshot / replay governance (intermediate — `search/index.ts`, not forwarded)

`aggregateReplayDiagnostics` · `buildReplayGovernanceReport` ·
`canonicalizeForEquivalence` · `createQueryReplaySnapshot` ·
`createQuerySnapshotBundle` · `deserializeQueryReplaySnapshot` ·
`deserializeQuerySnapshotBundle` · `diffJsonValues` · `diffQueryReplaySnapshots` ·
`evaluateQueryReplayCompatibility` · `reconstructQueryReplaySnapshot` ·
`reconstructQuerySnapshotBundle` · `replayQuerySnapshotBundle` ·
`REPLAY_GOVERNANCE_REPORT_SCHEMA_VERSION` · `stableJsonStringify` ·
`summarizeReplayCompatibility` · `summarizeReplayDiff` ·
`validateExecutionPlanArtifact` · `validateQueryExplanationArtifact` ·
`validateQueryExecutionTraceArtifact` · `validateQueryPipelineArtifact` ·
`validateQueryReplaySnapshot` · `validateQueryReplaySnapshotWithArtifacts` ·
`validateQuerySnapshotBundle` · `validateReplayArtifactByKind` ·
`validateSnapshotEnvelopeArtifact` · `verifyCanonicalStructuralEquivalence`

`QUERY_SNAPSHOT_SCHEMA_VERSION` · `composeReplayAuditReport` ·
`REPLAY_AUDIT_REPORT_KIND` · `REPLAY_AUDIT_REPORT_SCHEMA_VERSION` ·
`ComposeReplayAuditReportInput` · `ReplayAuditReport` · `ReplayAuditReportSchemaVersion`

_(Full type set for snapshots: ~40 type-only exports — see §3.3 for full list)_

### A.6 Runtime capability governance (intermediate — partial; not forwarded past search or not forwarded to tokenizers)

`deepFreezeStructure` · `orderCertificationSummaryMismatches` ·
`orderRuntimeCapabilityCertifications` · `orderRuntimeCapabilityManifests` ·
`orderCertificationMismatches` · `orderRuntimeCapabilityDiagnostics` ·
`validateLexicalInteropCapabilityDeclaration` · `composeLexicalInteropCapabilityDeclaration` ·
`LEXICAL_INTEROP_CAPABILITY_DECLARATION_SCHEMA_VERSION` ·
`composeManifestFromLexicalInteropDeclaration` · `RUNTIME_CERTIFICATION_SUMMARY_SCHEMA_VERSION`

_(associated input types and branded schema-version types — see §3.6 for full list)_

_(All runtime-capabilities functions/consts that ARE in search/index.ts are also
non-app-reachable since they are not forwarded to tokenizers/index.ts — see §3.3)_

### A.7 Pre-built normalization rules (intermediate — `normalization/index.ts`, not forwarded to `tokenizers/index.ts`)

`collapseWhitespaceRule` · `thaiDigitNormalizationRule` · `trimBoundaryWhitespaceRule`

### A.8 Internal lexical normalization functions (no barrel exposure at any level)

`normalizeLexicalKey` · `canonicalizeEnglishKey` · `assertNoWhitespace` ·
Thai tone-mark normalization rule (defined in
`src/core/lexical/normalization/thai-tone-mark-normalization-rule.ts`)

---

_End of inventory. No source changes were made._
