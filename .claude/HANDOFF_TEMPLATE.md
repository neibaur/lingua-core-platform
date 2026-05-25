LINGUA-CORE-PLATFORM — SESSION HANDOFF ARTIFACT
Cross-Session Continuity Document | Updated After Phase 11 — First Slice (DictionarySourceProvenance)

§1 — REPOSITORY IDENTITY
This repository is evolving into:

a deterministic multilingual runtime substrate
a replay-safe lexical infrastructure platform
a provenance-preserving governance system
an immutable runtime composition engine
a canonical deterministic execution architecture

The repository intentionally behaves more like:

a compiler/runtime substrate
a governance-oriented execution engine
a replay-safe composition platform
a deterministic provenance system

The repository is NOT:

a CRUD dictionary application
a heuristic search engine
a plugin ecosystem
a workflow orchestration framework
a generalized runtime framework
a vector-search platform
a telemetry-first architecture
a dynamically extensible runtime system

§2 — FIRST REQUIRED ACTIONS
The new session must perform these actions before proposing any contract, file, or implementation:

Repository: [GITHUB URL]

Read CLAUDE.md, ARCHITECTURE.md, AGENTS.md, DATA_SOURCES.md in full
Read all files in [PRIMARY IMPLEMENTATION DIRECTORY] — confirm which exist and read all that do
Read [KEY SEAM FILE] — confirm [KEY FUNCTION OR TYPE] is present
Read [TEST DIRECTORY] — confirm [KEY TEST FILE] is present
Read [SECONDARY IMPLEMENTATION DIRECTORY] — full directory tree and all file contents
Produce a pre-implementation assessment (format specified in §9) before writing any code

Do not assume the next slice from the handoff document alone. Read the repository and derive it. The assessment-first workflow is mandatory. Repository-first reasoning overrides all prior handoff assumptions.

§3 — REPOSITORY DOCTRINE
These laws are active across all sessions. Violation of any law makes an implementation architecturally illegal regardless of whether tests pass.

SINGLE-LAYER GOVERNANCE DERIVATION LAW
A governance or reporting layer may derive state ONLY from the immediately preceding layer. Passthrough semantics are preferred over recomputation. No lower-layer reach-through. No re-walking of lower governance structures. No bypassing of abstraction boundaries.

IMMUTABILITY LAW
readonly TypeScript is insufficient. deepFreezeStructure(...) is required on all externally exposed artifacts. Shallow Object.freeze violates this law.

DETERMINISTIC ORDERING LAW
Clone before sort. Binary lexicographic ordering only. No localeCompare. No insertion-order assumptions. No unstable comparators. No locale-aware collation of any kind.

REPLAY-SAFE GOVERNANCE LAW
evaluationTimestamp: null is the replay-safe timestamp sentinel and applies exclusively to governance-reporting artifacts. Caller-supplied identifiers only. No Date.now(), Math.random(), UUID generation, hash-derived identifiers, or crypto randomness at any step.

STATIC RESOLUTION LAW
No plugin systems, runtime registries, ambient runtime discovery, dependency injection containers, mutable singleton state, or async orchestration. Use explicit orchestration, static composition, deterministic layering, discriminated unions, and readonly contracts.

ABSTRACTION GOVERNANCE LAW
No generic frameworks, reusable aggregation engines, or abstract report builders unless at least three production slices duplicate materially identical semantics and all other conditions are met. Do not extract shared helpers for sorting, canonicalization, validation, or manifest composition unless three materially identical production implementations already exist and duplication has been explicitly identified as harmful. Prefer intentional duplication over premature abstraction.

ARTIFACT CLASSIFICATION LAW
Structural and governance-reporting artifact classifications are intentional doctrine and must not be normalized. evaluationTimestamp: null and generatedFrom apply exclusively to governance-reporting artifacts. Their presence on structural artifacts is a law violation. Their absence on governance-reporting artifacts is equally a law violation.

GOVERNANCE LEGALITY LAW
Not all technically possible derivations are architecturally legal. Governance and reporting layers must preserve explicit derivation ancestry, lawful provenance boundaries, replay-safe lineage continuity, and deterministic composition legality. Prohibited: convenience recomputation across governance boundaries, lower-layer reach-through derivation, hidden aggregation ancestry, implicit semantic recomposition, governance lineage ambiguity. Preferred: passthrough semantics, explicit derivation chains, immutable provenance continuity, lawful envelope composition, governance-boundary transparency.

NO SILENT RENAMES LAW
Field migrations must be minimal, explicit, and localized to authorized scope only. Repository-wide renames beyond explicitly authorized scope are forbidden.

§4 — ACTIVE SCOPE
Current phase: Phase 11 — Dictionary Data Boundary (IN PROGRESS)
Status of documented integration path: DictionarySourceProvenance (first slice) complete and merged to main as PR #69 (commit 2904000). Three Phase 11 concepts remain unimplemented: licensing boundary contracts, canonical dictionary entry shape, and deterministic ingestion-ready shapes. No further slice is warranted from mechanical dependency alone; the phase is not complete. Do not skip to Phase 12 without explicitly authorizing and implementing remaining Phase 11 slices.

What has NOT been assessed and may or may not exist:

Licensing boundary contracts (DictionaryLicensingBoundary) — no structured type, no builder, not implemented
Canonical dictionary entry shape — typed contract integrating lexical content with provenance references — not implemented
Deterministic ingestion-ready shapes — canonical frozen entry record, contracts only, no ingestion pipeline — not implemented

The next session must derive the warranted next slice from actual repository state — not from this handoff document alone.

Authoritative derivation surface for any continuation:

src/core/lexical/ — the entire directory
src/core/tokenizers/search/runtime-capabilities/ — for understanding what deepFreezeStructure and the established capability layer provides

Prohibited ancestry access:

Do not reach through runtime-capabilities artifacts except through already-established import boundaries (deepFreezeStructure via src/core/tokenizers/search/runtime-capabilities/index)
Do not import from src/core/tokenizers/search/query-lexical-interop into src/core/lexical/ except through established seam files

§5 — EXPLICITLY DEFERRED SCOPE
The following must NOT influence the current architectural assessment or any implementation proposed by the next session:

Phase 12 — Reading and Writing Learning Surface — do not begin until all Phase 11 slices are authorized and implemented
Phase 13 and beyond — all subsequent phases
Ingestion pipelines, parsers, loaders, adapters, orchestration, or source synchronization systems — forbidden unless immediately required by current repository topology
Repository-wide architectural audit — not yet warranted; triggered after additional slice accumulation
Any schema migration question — not yet assessed; requires ARCHITECTURE.md review before any determination; do not assume migration is warranted

§6 — CURRENT ARCHITECTURAL STATUS
Completed runtime and governance systems:

Phase 9 — Full governance pipeline (manifest → certification → summary → introspection → governance-report → audit-snapshot → operational-manifest → provenance → closure): COMPLETE
Phase 10 — Lexical Foundation and Interoperability (lexical interop contracts, query enrichment, runtime capability declaration, manifest bridge): COMPLETE, merged to main
Phase 11 — Dictionary Data Boundary: IN PROGRESS — DictionarySourceProvenance (first slice) complete; three concepts remain unimplemented

Completed slices (merged to main):

feat/phase11-dictionary-source-provenance — introduced DictionarySourceProvenance structural type
Introduced DictionarySourceProvenance interface and DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION = "lingua-core-platform:dictionary-source-provenance@phase11"
Implemented composeDictionarySourceProvenance with deepFreezeStructure and invariant guards on sourceId and displayName
Added src/core/lexical/provenance/tests/dictionary-source-provenance.test.ts (23 tests)
Added provenance exports to src/core/lexical/index.ts
Validation baseline after merge: 595 tests passing, full chain green

fix/phase10-artifact-classification — remediated Artifact Classification Law violations in Phase 10 lexical contracts
Removed evaluationTimestamp: null from LexicalIndex and LexicalLookupResult (structural artifacts)
Removed evaluationTimestamp: null from LexicalDatasetValidationResult (structural artifact)
Added generatedFrom: "lexical-lookup-trace" to LexicalLookupTrace to complete governance-reporting classification
Removed stale evaluationTimestamp assertions from lexical-index.test.ts, lexical-lookup.test.ts, lexical-dataset-validation.test.ts
Validation baseline after merge: 572 tests passing, full chain green

Full integration path — confirmed status from last session:
composeDictionarySourceProvenance(input: ComposeDictionarySourceProvenanceInput): DictionarySourceProvenance
→ DictionarySourceProvenance EXISTS — src/core/lexical/provenance/dictionary-source-provenance.ts
→ Exported from barrel — src/core/lexical/index.ts
→ DICTIONARY_SOURCE_PROVENANCE_SCHEMA_VERSION EXISTS — "lingua-core-platform:dictionary-source-provenance@phase11"

Important schema version literals — read directly from repository files:
"lingua-core-platform:lexical-index@phase10" src/core/lexical/contracts.ts
"lingua-core-platform:lexical-lookup-result@phase10" src/core/lexical/contracts.ts
"lingua-core-platform:lexical-dataset-validation-result@phase10" src/core/lexical/validation/lexical-dataset-validation.ts
"lingua-core-platform:lexical-dataset-validation-report@phase10" src/core/lexical/validation/lexical-dataset-validation-report.ts
"lingua-core-platform:lexical-lookup-trace@phase10" src/core/lexical/diagnostics/lexical-lookup-trace.ts
"lingua-core-platform:dictionary-source-provenance@phase11" src/core/lexical/provenance/dictionary-source-provenance.ts

Phase label invariant: Phase labels in schema version literals are lineage identifiers, not lifecycle version indicators. Do not assume migration is warranted merely because an artifact participates in a newer phase. Migration is only warranted if ARCHITECTURE.md explicitly defines phase-coupled schema migration semantics.

Convention: 'lingua-core-platform:<artifact-slug>@<phase>'

Open doctrinal questions — do not assume an answer:
No open doctrinal questions from Phase 11 first slice. Artifact Classification Law violations in Phase 10 were remediated in fix/phase10-artifact-classification. CLAUDE.md intro line (line 6 still reads "It is in late-stage Phase 9 stabilization") is a known documentation drift acknowledged in PA.8; it is not an architectural conflict. PA.8 conflict from prior session is resolved.

§7 — IMPLEMENTATION CONSTRAINTS
Strictly forbidden in all sessions:

Date.now(), Math.random(), UUID generation, hash-derived identifiers, crypto randomness
localeCompare — binary lexicographic comparison only
Plugin systems, runtime registries, capability registries, discovery mechanisms
Mutable singleton state, async orchestration, generalized framework extraction
Shallow Object.freeze — deepFreezeStructure(...) only
evaluationTimestamp or generatedFrom on structural artifacts
Generalized metadata, diagnostics, context, or extensibility containers
Arbitrary string primitives for capability identifiers — strict literal unions only
Lower-layer reach-through recomputation
Implicit semantic recomposition
Repository-wide renames beyond explicitly authorized scope
Opportunistic refactoring, speculative cleanup, abstraction extraction
Dynamic capability membership resolution — no Set, no .includes() over constructed lists, no reflective key enumeration
Type alias re-export collapse into namespace exports or export-star patterns
New package or runtime dependencies
Consolidating existing type exports into grouped namespace exports
Introducing shared canonicalization, sorting, normalization, or invariant utility helpers unless three production slices with materially identical semantics already exist
Existing externally exposed contract fields are immutable unless the assessment proves a current field violates an active doctrine law
Do not propose future phases, speculative abstractions, generalized frameworks, or anticipated integration layers unless a concrete gap already exists in the current repository topology

Mandatory in all sessions:

deepFreezeStructure(...) on all externally exposed artifacts
Binary lexicographic ordering, clone before sort
Caller-supplied identifiers only
Additive architecture — no deletion, no renaming, no restructuring of existing exports
All existing tests continue to pass
Full validation chain green before every commit

§8 — CANDIDATE FIELD AND CONTRACT EVALUATION
When the next session proposes any new type, field, or function, evaluate each candidate using the adopt / modify / reject framework with explicit rationale grounded in actual repository state.

Required evaluation axes for any candidate field:

Is it legally derivable at the current governance layer per the Single-Layer Governance Derivation Law?
Does it require passthrough from the preceding layer or does it involve recomputation?
Would introducing it violate the Governance Legality Law?
Does it belong on a structural artifact or a governance-reporting artifact, and does the field reflect that classification?
Does it introduce any lower-layer reach-through?
Is it replay-safe — would identical inputs always produce identical outputs?
Does it preserve or weaken provenance boundaries?

The next session must NOT blindly inherit prior handoff assumptions about field shapes. All contracts must be derived from actual repository state confirmed by file reads.

§9 — REQUIRED OUTPUT FORMAT
The pre-implementation assessment must begin with the exact token PRE-IMPLEMENTATION ASSESSMENT and must cover:

PA.1 — Existing pipeline and topology confirmation
List every relevant function and type that already exists, with file location and current signature. Do not assume from the handoff — confirm from files read.

PA.2 — Integration gap analysis
For each step in the integration path, state EXISTS or GAP. For each GAP, identify the precise input and output types using actual existing types read from the codebase.

PA.3 — Schema version confirmation
List every schema version literal read directly from files. For any @phase[N] constant appearing in a newer phase integration path, do not assume migration is required merely because the artifact participates in a newer phase. Only conclude migration is warranted if ARCHITECTURE.md explicitly defines phase-coupled schema migration semantics. Quote the relevant passage if such semantics exist; state their absence explicitly if they do not.

PA.4 — Artifact classification
For any proposed new artifact, classify as structural or governance-reporting and state the doctrinal basis. Enforce the Artifact Classification Law: clearly differentiate whether a missing step generates a structural config payload (exempt from evaluationTimestamp) or a governance-reporting artifact (requiring the evaluationTimestamp: null sentinel). Do not normalize these categories or merge their field shapes under any circumstances.

PA.5 — Warranted next slice derivation
Identify the single smallest additive slice that is genuinely missing. Name the function or type, the file, and the precise input and output types using actual existing types. Do not assume a slice is warranted — confirm the gap exists first.

PA.6 — Files that must not be touched
List every file that must not be modified, with the doctrinal reason.

PA.7 — Validation baseline confirmation
Do not claim validation success unless actual CLI output was observed in the current session. Run the full validation chain in this exact order and report the actual results:
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm validate
State the current test count and confirm the chain is green before any new work begins. If you are operating in a static sandbox without direct repository shell execution access, inspect the current test files to deduce the invariant requirements, and explicitly prompt the user to paste the real CLI output of pnpm validate before finalizing this step. Do not estimate or hallucinate pass counts.

PA.8 — Conflict surface
If anything discovered during PA.1–PA.7 conflicts with any prescription in the directive, stop and surface the conflict. Do not proceed to implementation. Do not force the repository into assumed topology.

After the assessment is complete: STOP. Do not write implementation code until the assessment has been reviewed and implementation is explicitly authorized.

Operational Directive: Begin your response directly with the token PRE-IMPLEMENTATION ASSESSMENT. Omit any introductory greetings, markdown confirmations, or conversational summaries.

§10 — VALIDATION AND COMMIT GOVERNANCE
Do not claim validation success unless actual CLI output was observed in the current session. If shell execution is unavailable, require the user to paste pnpm validate output before the assessment is finalized.

Run the full validation chain in this exact order before every commit:
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm validate

No direct commits to main
Conventional commits required
Each commit must leave the validation chain green
Additive architecture only — no deletion, no restructuring
Branch naming: feat/[phase]-<descriptor>

Current baseline: 595 tests passing (48 files), full chain green.
Any new slice must result in ≥ 595 + (count of new tests) passing. Existing 595 must remain untouched.

§11 — ARCHITECTURAL IDENTITY REINFORCEMENT
This repository is evolving toward:

deterministic runtime infrastructure
replay-safe governance systems
immutable lexical and runtime composition
provenance-preserving execution architecture
canonical serialization and governance artifacts

This repository is NOT:

a CRUD application
an orchestration-first system
a plugin ecosystem
heuristic search infrastructure
a generalized framework platform
a telemetry or analytics system
a dynamically extensible runtime

These identities are not aspirational. They are architectural constraints that govern what changes are legal.

§12 — EXECUTION DIRECTIVE
The next session must:

Begin with PRE-IMPLEMENTATION ASSESSMENT — no preamble, no greeting, no acknowledgment before this token
Read the repository before reasoning about it — no greenfield assumptions
Derive the warranted next slice from actual file state — not from this handoff document alone
Stop after the assessment — implementation begins only after explicit authorization
Apply the adopt / modify / reject framework to any proposed contract
Enforce all doctrine laws without exception
Preserve the 595-test baseline without modification to any existing test
Treat every technically possible derivation as requiring explicit architectural justification before it is considered legally warranted
Do not propose future phases, speculative abstractions, generalized frameworks, or anticipated integration layers unless a concrete gap already exists in the current repository topology
