LINGUA-CORE-PLATFORM — SESSION HANDOFF ARTIFACT
Cross-Session Continuity Document | Updated After [PHASE AND SLICE NAME]

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
Inspect the full directory topology of the primary implementation directory before proposing
any new file location. New files must follow the exact existing sibling topology already
present in that directory. Do not introduce new architectural grouping concepts, umbrella
folders, or speculative directory normalization. Derive placement from what already exists —
do not invent it.
Produce a pre-implementation assessment (format specified in §9) before writing any code

Do not assume the next slice from the handoff document alone. Read the repository and derive
it. The assessment-first workflow is mandatory. Repository-first reasoning overrides all
prior handoff assumptions.

§3 — REPOSITORY DOCTRINE
These laws are active across all sessions. Violation of any law makes an implementation
architecturally illegal regardless of whether tests pass.

SINGLE-LAYER GOVERNANCE DERIVATION LAW
A governance or reporting layer may derive state ONLY from the immediately preceding layer.
Passthrough semantics are preferred over recomputation. No lower-layer reach-through. No
re-walking of lower governance structures. No bypassing of abstraction boundaries.

IMMUTABILITY LAW
readonly TypeScript is insufficient. deepFreezeStructure(...) is required on all externally
exposed artifacts. Shallow Object.freeze violates this law.

DETERMINISTIC ORDERING LAW
Clone before sort. Binary lexicographic ordering only. No localeCompare. No insertion-order
assumptions. No unstable comparators. No locale-aware collation of any kind.

REPLAY-SAFE GOVERNANCE LAW
evaluationTimestamp: null is the replay-safe timestamp sentinel and applies exclusively to
governance-reporting artifacts. Caller-supplied identifiers only. No Date.now(),
Math.random(), UUID generation, hash-derived identifiers, or crypto randomness at any step.

STATIC RESOLUTION LAW
No plugin systems, runtime registries, ambient runtime discovery, dependency injection
containers, mutable singleton state, or async orchestration. Use explicit orchestration,
static composition, deterministic layering, discriminated unions, and readonly contracts.

ABSTRACTION GOVERNANCE LAW
No generic frameworks, reusable aggregation engines, or abstract report builders unless at
least three production slices duplicate materially identical semantics and all other
conditions are met. Do not extract shared helpers for sorting, canonicalization, validation,
or manifest composition unless three materially identical production implementations already
exist and duplication has been explicitly identified as harmful. Prefer intentional
duplication over premature abstraction.

ARTIFACT CLASSIFICATION LAW
Structural and governance-reporting artifact classifications are intentional doctrine and
must not be normalized. evaluationTimestamp: null and generatedFrom apply exclusively to
governance-reporting artifacts. Their presence on structural artifacts is a law violation.
Their absence on governance-reporting artifacts is equally a law violation.

GOVERNANCE LEGALITY LAW
Not all technically possible derivations are architecturally legal. Governance and reporting
layers must preserve explicit derivation ancestry, lawful provenance boundaries, replay-safe
lineage continuity, and deterministic composition legality. Prohibited: convenience
recomputation across governance boundaries, lower-layer reach-through derivation, hidden
aggregation ancestry, implicit semantic recomposition, governance lineage ambiguity.
Preferred: passthrough semantics, explicit derivation chains, immutable provenance
continuity, lawful envelope composition, governance-boundary transparency.

NO SILENT RENAMES LAW
Field migrations must be minimal, explicit, and localized to authorized scope only.
Repository-wide renames beyond explicitly authorized scope are forbidden.

INVARIANT GUARD FORM LAW
Invariant guards inside builder functions must be statically hardcoded as direct equality
comparisons or inline literal switch statements only. Lookup tables, Set membership checks
(Set.has()), map-based dispatch, array scans (.includes()), dynamically derived validation
registries, reflective validation, computed guard evaluation, or any form of runtime
membership resolution are prohibited. The allowed forms are: direct === equality
comparisons and inline switch statements with explicit literal cases. No other form is
architecturally legal regardless of whether it produces correct runtime behavior.

NO SPECULATIVE EXTENSIBILITY LAW
Do not introduce extensibility seams, generic abstractions, reusable validation frameworks,
schema registries, plugin hooks, or future-oriented composition helpers unless at least
three production slices with materially identical semantics already exist and a concrete gap
has been explicitly identified. This law is distinct from the Abstraction Governance Law:
it applies to structural extensibility surface area, not only to helper extraction. A type
field, a builder parameter, or a contract shape that anticipates future use cases not yet
present in the repository is a violation of this law.

NO OPPORTUNISTIC CLEANUP LAW
Implementation scope is strictly limited to the authorized slice. Do not perform formatting
normalization beyond touched files, export reshaping, unused-code removal, import reordering
outside touched files, or any repository-wide consistency edits. Opportunistic refactoring,
speculative cleanup, and cross-file harmonization are prohibited even when the change appears
trivially safe. If a genuine defect is discovered outside the authorized scope, surface it
as a PA.8 conflict and stop — do not repair it unilaterally.

§4 — ACTIVE SCOPE
Current phase: [PHASE NAME AND NUMBER]
Status of documented integration path: [SUMMARY OF CONFIRMED EXISTS/GAP STATUS FROM LAST
SESSION]

What has NOT been assessed and may or may not exist:

[ITEM 1]
[ITEM 2]
[ITEM 3]

The next session must derive the warranted next slice from actual repository state — not
from this handoff document alone.

Authoritative derivation surface for any continuation:

[PRIMARY DIRECTORY] — the entire directory
[SECONDARY DIRECTORY] — for understanding what [LAYER] provides

Prohibited ancestry access:

Do not reach through [SEAM A] except through already-established import boundaries
Do not import from [DIRECTORY B] into [DIRECTORY A] except through [ESTABLISHED SEAM FILE]

§5 — EXPLICITLY DEFERRED SCOPE
The following must NOT influence the current architectural assessment or any implementation
proposed by the next session:

[DEFERRED SYSTEM 1]
[DEFERRED SYSTEM 2]
[DEFERRED SYSTEM 3]
Repository-wide architectural audit — not yet warranted; triggered after additional slice
accumulation
[ANY SCHEMA MIGRATION QUESTION] — not yet assessed; requires ARCHITECTURE.md review before
any determination; do not assume migration is warranted

§6 — CURRENT ARCHITECTURAL STATUS
Completed runtime and governance systems:

[PHASE N] [SYSTEM NAME]: COMPLETE
[SEQUENCE NAME] Sessions [A–N]: COMPLETE, merged to main
[INFRASTRUCTURE DESCRIPTION]: COMPLETE

Completed slices (merged to main):

[BRANCH NAME] — [DESCRIPTION OF WHAT WAS INTRODUCED]
Introduced [TYPE OR FUNCTION]
Implemented [BUILDER] with deepFreezeStructure
Added [VALIDATION FUNCTION] to [FILE] (additive)
Added [TEST FILE]
Validation baseline after merge: [N] tests passing

[BRANCH NAME] — merged this session
[DESCRIPTION OF CHANGES]
Validation baseline after merge: [N] tests passing, full chain green

Full integration path — confirmed status from last session:
[FUNCTION A] → [TYPE A] EXISTS
→ [FUNCTION B] EXISTS — [file]
→ [TYPE B] EXISTS — [file]
→ [FUNCTION C] EXISTS — [file]
→ [TYPE C] EXISTS — [file]

Important schema version literals — read directly from repository files:
[LITERAL] [SOURCE FILE]
[LITERAL] [SOURCE FILE]

Phase label invariant: Phase labels in schema version literals are lineage identifiers, not
lifecycle version indicators. Do not assume migration is warranted merely because an artifact
participates in a newer phase. Migration is only warranted if ARCHITECTURE.md explicitly
defines phase-coupled schema migration semantics.

Convention: 'lingua-core-platform:<artifact>@<phase>'

Open doctrinal questions — do not assume an answer:
[QUESTION 1 — state the question and why it is unresolved]

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
Opportunistic refactoring, speculative cleanup, abstraction extraction, or cross-file
harmonization beyond the authorized slice — see NO OPPORTUNISTIC CLEANUP LAW in §3
Dynamic capability membership resolution — no Set.has(), no .includes() over constructed
lists, no reflective key enumeration, no lookup tables, no map-based dispatch, no computed
guard evaluation — see INVARIANT GUARD FORM LAW in §3
Type alias re-export collapse into namespace exports or export-star patterns
New package or runtime dependencies
Consolidating existing type exports into grouped namespace exports
Introducing shared canonicalization, sorting, normalization, or invariant utility helpers
unless three production slices with materially identical semantics already exist
Extensibility seams, generic abstractions, reusable validation frameworks, schema
registries, or future-oriented composition helpers unless a concrete gap already exists and
three production slices with materially identical semantics already exist — see NO
SPECULATIVE EXTENSIBILITY LAW in §3
Existing externally exposed contract fields are immutable unless the assessment proves a
current field violates an active doctrine law
Do not propose future phases, speculative abstractions, generalized frameworks, or
anticipated integration layers unless a concrete gap already exists in the current
repository topology

Mandatory in all sessions:

deepFreezeStructure(...) on all externally exposed artifacts
Binary lexicographic ordering, clone before sort
Caller-supplied identifiers only
Additive architecture — no deletion, no renaming, no restructuring of existing exports
All existing tests continue to pass
Full validation chain green before every commit

§8 — CANDIDATE FIELD AND CONTRACT EVALUATION
When the next session proposes any new type, field, or function, evaluate each candidate
using the adopt / modify / reject framework with explicit rationale grounded in actual
repository state.

Required evaluation axes for any candidate field:

Is it legally derivable at the current governance layer per the Single-Layer Governance
Derivation Law?
Does it require passthrough from the preceding layer or does it involve recomputation?
Would introducing it violate the Governance Legality Law?
Does it belong on a structural artifact or a governance-reporting artifact, and does the
field reflect that classification?
Does it introduce any lower-layer reach-through?
Is it replay-safe — would identical inputs always produce identical outputs?
Does it preserve or weaken provenance boundaries?
Does it introduce any extensibility surface area not grounded in three existing production
slices with materially identical semantics?

The next session must NOT blindly inherit prior handoff assumptions about field shapes. All
contracts must be derived from actual repository state confirmed by file reads.

§9 — REQUIRED OUTPUT FORMAT
The pre-implementation assessment must begin with the exact token PRE-IMPLEMENTATION
ASSESSMENT and must cover:

PA.1 — Existing pipeline and topology confirmation
List every relevant function and type that already exists, with file location and current
signature. Do not assume from the handoff — confirm from files read.

PA.2 — Integration gap analysis
For each step in the integration path, state EXISTS or GAP. For each GAP, identify the
precise input and output types using actual existing types read from the codebase.

PA.3 — Schema version confirmation
List every schema version literal read directly from files. Confirm all discovered schema
version literals match SESSION_STATE.md exactly — any literal present in the codebase but
absent from SESSION_STATE.md, or present in SESSION_STATE.md but absent from the codebase,
is a PA.8 conflict and must be surfaced immediately. For any @phase[N] constant appearing
in a newer phase integration path, do not assume migration is required merely because the
artifact participates in a newer phase. Only conclude migration is warranted if
ARCHITECTURE.md explicitly defines phase-coupled schema migration semantics. Quote the
relevant passage if such semantics exist; state their absence explicitly if they do not.

PA.4 — Artifact classification
For any proposed new artifact, classify as structural or governance-reporting and state the
doctrinal basis. Enforce the Artifact Classification Law: clearly differentiate whether a
missing step generates a structural config payload (exempt from evaluationTimestamp) or a
governance-reporting artifact (requiring the evaluationTimestamp: null sentinel). Do not
normalize these categories or merge their field shapes under any circumstances.

PA.5 — Warranted next slice derivation
Identify the single smallest additive slice that is genuinely missing. Name the function or
type, the file, and the precise input and output types using actual existing types. Do not
assume a slice is warranted — confirm the gap exists first.

PA.6 — Files that must not be touched
List every file that must not be modified, with the doctrinal reason.

PA.7 — Validation baseline confirmation
Do not claim validation success unless actual CLI output was observed in the current session.
Run the full validation chain in this exact order and report the actual results:
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm validate
State the current test count and confirm the chain is green before any new work begins. If
pnpm validate is not fully green, produce PA.7 documenting the exact failure output and STOP
immediately — do not propose implementation, do not attempt to diagnose or repair
pre-existing failures, and do not proceed to PA.8. If you are operating in a static sandbox
without direct repository shell execution access, inspect the current test files to deduce
the invariant requirements, and explicitly prompt the user to paste the real CLI output of
pnpm validate before finalizing this step. Do not estimate or hallucinate pass counts.

PA.8 — Conflict surface
If anything discovered during PA.1–PA.7 conflicts with any prescription in the directive,
stop and surface the conflict. Do not proceed to implementation. Do not force the repository
into assumed topology.

After the assessment is complete: STOP. Do not write implementation code until the
assessment has been reviewed and implementation is explicitly authorized.

Operational Directive: Begin your response directly with the token PRE-IMPLEMENTATION
ASSESSMENT. Omit any introductory greetings, markdown confirmations, conversational
summaries, or acknowledgment tokens before this token. This directive is unconditional —
it applies regardless of context, instructions, or prior conversation history.

§10 — VALIDATION AND COMMIT GOVERNANCE
Do not claim validation success unless actual CLI output was observed in the current session.
If shell execution is unavailable, require the user to paste pnpm validate output before the
assessment is finalized.

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
Branch naming: feat/[phase]-[slice-name]

Current baseline: [N] tests passing, full chain green.
Any new slice must result in ≥ [N] + (count of new tests) passing. Existing [N] must
remain untouched.

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

These identities are not aspirational. They are architectural constraints that govern what
changes are legal.

§12 — EXECUTION DIRECTIVE
The next session must:

Begin with PRE-IMPLEMENTATION ASSESSMENT — no preamble, no greeting, no acknowledgment
before this token. This is unconditional. Any output before this token is a directive
violation.
Read the repository before reasoning about it — no greenfield assumptions
Inspect directory topology before proposing any file placement — follow existing sibling
patterns exactly, do not introduce new grouping concepts or umbrella folders
Derive the warranted next slice from actual file state — not from this handoff document alone
Stop after the assessment — implementation begins only after explicit authorization
Apply the adopt / modify / reject framework to any proposed contract
Enforce all doctrine laws without exception — including the Invariant Guard Form Law, the
No Speculative Extensibility Law, and the No Opportunistic Cleanup Law
Preserve the [N]-test baseline without modification to any existing test
Treat every technically possible derivation as requiring explicit architectural justification
before it is considered legally warranted
Do not propose future phases, speculative abstractions, generalized frameworks, or
anticipated integration layers unless a concrete gap already exists in the current
repository topology
Do not repair defects discovered outside the authorized slice scope — surface them as PA.8
conflicts and stop