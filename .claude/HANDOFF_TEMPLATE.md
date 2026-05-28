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
The new session must perform these actions before proposing any contract, file,
or implementation:

Repository: [GITHUB URL]

Read CLAUDE.md, ARCHITECTURE.md, AGENTS.md, DATA_SOURCES.md in full
Read .claude/SESSION_STATE.md in full — this is the authoritative state
document and is required before PA.3 can be completed
Read all files in [PRIMARY IMPLEMENTATION DIRECTORY] — confirm which exist and
read all that do
Read [KEY SEAM FILE] — confirm [KEY FUNCTION OR TYPE] is present
Read [TEST DIRECTORY] — confirm [KEY TEST FILE] is present
Read [SECONDARY IMPLEMENTATION DIRECTORY] — full directory tree and all file
contents
Inspect the full directory topology of the primary implementation directory
before proposing any new file location. New files must follow the exact
existing sibling topology already present in that directory. Do not introduce
new architectural grouping concepts, umbrella folders, or speculative directory
normalization. Derive placement from what already exists — do not invent it.
Match the internal structure of sibling files, not only their directory
placement. If existing sibling files in the target directory are each a single
self-contained file defining their type, builder, and schema version literal
together, the new file must follow that same pattern. Do not separate types
from builders, introduce parallel subdirectories for types vs. implementations,
or create any structural split that is not already established by existing
sibling files. Derive internal file structure from confirmed sibling files —
do not invent it.
Produce a pre-implementation assessment (format specified in §9) before writing
any code

Do not assume the next slice from the handoff document alone. Read the
repository and derive it. The assessment-first workflow is mandatory.
Repository-first reasoning overrides all prior handoff assumptions.

§3 — REPOSITORY DOCTRINE
These laws are active across all sessions. Violation of any law makes an
implementation architecturally illegal regardless of whether tests pass.

SINGLE-LAYER GOVERNANCE DERIVATION LAW
A governance or reporting layer may derive state ONLY from the immediately
preceding layer. Passthrough semantics are preferred over recomputation. No
lower-layer reach-through. No re-walking of lower governance structures. No
bypassing of abstraction boundaries.

IMMUTABILITY LAW
readonly TypeScript is insufficient. deepFreezeStructure(...) is required on
all externally exposed artifacts. Shallow Object.freeze violates this law.

DETERMINISTIC ORDERING LAW
Clone before sort. Binary lexicographic ordering only. No localeCompare. No
insertion-order assumptions. No unstable comparators. No locale-aware
collation of any kind.

REPLAY-SAFE GOVERNANCE LAW
evaluationTimestamp: null is the replay-safe timestamp sentinel and applies
exclusively to governance-reporting artifacts. Caller-supplied identifiers
only. No Date.now(), Math.random(), UUID generation, hash-derived identifiers,
or crypto randomness at any step. This law extends to structural artifact
fields: no field on a structural artifact may have a default value, a
generated fallback, or an internal derivation routine for identifier values.
All identifier-bearing fields must accept caller-supplied primitives only with
no internal construction path.

STATIC RESOLUTION LAW
No plugin systems, runtime registries, ambient runtime discovery, dependency
injection containers, mutable singleton state, or async orchestration. Use
explicit orchestration, static composition, deterministic layering,
discriminated unions, and readonly contracts.

ABSTRACTION GOVERNANCE LAW
No generic frameworks, reusable aggregation engines, or abstract report
builders unless at least three production slices duplicate materially identical
semantics and all other conditions are met. Do not extract shared helpers for
sorting, canonicalization, validation, or manifest composition unless three
materially identical production implementations already exist and duplication
has been explicitly identified as harmful. Prefer intentional duplication over
premature abstraction.

ARTIFACT CLASSIFICATION LAW
Structural and governance-reporting artifact classifications are intentional
doctrine and must not be normalized. evaluationTimestamp: null and generatedFrom
apply exclusively to governance-reporting artifacts. Their presence on structural
artifacts is a law violation. Their absence on governance-reporting artifacts is
equally a law violation.

GOVERNANCE LEGALITY LAW
Not all technically possible derivations are architecturally legal. Governance
and reporting layers must preserve explicit derivation ancestry, lawful
provenance boundaries, replay-safe lineage continuity, and deterministic
composition legality. Prohibited: convenience recomputation across governance
boundaries, lower-layer reach-through derivation, hidden aggregation ancestry,
implicit semantic recomposition, governance lineage ambiguity. Preferred:
passthrough semantics, explicit derivation chains, immutable provenance
continuity, lawful envelope composition, governance-boundary transparency.

NO SILENT RENAMES LAW
Field migrations must be minimal, explicit, and localized to authorized scope
only. Repository-wide renames beyond explicitly authorized scope are forbidden.

INVARIANT GUARD FORM LAW
Invariant guards inside builder functions must be statically hardcoded as
direct equality comparisons or inline literal switch statements only. Lookup
tables, Set membership checks (Set.has()), map-based dispatch, array scans
(.includes()), dynamically derived validation registries, reflective
validation, computed guard evaluation, or any form of runtime membership
resolution are prohibited. Helper utilities or structural abstractions that
mask iterative linear lookups are equally prohibited — all branch logic
evaluating literal matches must be immediately transparent to static analysis
without symbol cross-referencing. The allowed forms are: direct === equality
comparisons and inline switch statements with explicit literal cases. No other
form is architecturally legal regardless of whether it produces correct runtime
behavior. Invariant guards validating entry properties or literal union fields
must fail fast with crisp, explicit, statically declared error literals.
Runtime dynamic map evaluation, string interpolation inside invariant checks,
and computed error message construction are baseline doctrine violations.
Extra-functional or delegated validation routines are strictly prohibited.
Every business invariant, type guard, and shape restriction must execute
directly and inline inside the body of the builder function. Calling private
validation helpers, external predicate functions, or extracted sub-routines
to offload rule evaluation is a doctrine violation regardless of whether the
sub-routine itself uses only permitted guard forms. A guard of the form
`if (validateX(input) === true)` where validateX contains the actual invariant
logic is not compliant — it is a structural bypass of this law. The invariant
logic itself must be present inline in the builder body.
Builder scope: any deterministic compose/create/build function returning a
structural or governance artifact is a builder for purposes of this law and
all audit and assessment requirements that reference builders.

Accepted patterns — resolved by operator ruling and not subject to future
audit challenge:

- (field.schemaVersion as unknown) !== SCHEMA_VERSION_CONSTANT — the as
  unknown cast is a TypeScript type system accommodation preventing ESLint
  no-unnecessary-condition from flagging a structurally correct runtime guard
  as dead code. The underlying guard form remains a direct !== literal
  comparison. Do not flag this pattern in future audits.

- String content checks — guards that test what a string value contains
  (rather than whether a string value belongs to a set of permitted identity
  values) are compliant. The law targets runtime membership resolution over
  declared literal unions, not string content introspection. Accepted forms:
  /\s/.test(input.query) (regex content check), canonicalKey.includes(":")
  (single-character substring check), input.field.trim() === "" (empty-string
  content check). The prohibition on Array.prototype.includes() and equivalent
  literal-union membership resolution remains fully in force.

NO SPECULATIVE EXTENSIBILITY LAW
Do not introduce extensibility seams, generic abstractions, reusable validation
frameworks, schema registries, plugin hooks, or future-oriented composition
helpers unless at least three production slices with materially identical
semantics already exist and a concrete gap has been explicitly identified. This
law is distinct from the Abstraction Governance Law: it applies to structural
extensibility surface area, not only to helper extraction. A type field, a
builder parameter, or a contract shape that anticipates future use cases not
yet present in the repository is a violation of this law.

NO OPPORTUNISTIC CLEANUP LAW
Implementation scope is strictly limited to the authorized slice. Do not
perform formatting normalization beyond touched files, export reshaping, unused-
code removal, import reordering outside touched files, or any repository-wide
consistency edits. Opportunistic refactoring, speculative cleanup, and cross-
file harmonization are prohibited even when the change appears trivially safe.
If a genuine defect is discovered outside the authorized scope, surface it as a
PA.8 conflict and stop — do not repair it unilaterally.

AUTHORIZED CORRECTION EXCEPTION PATTERN
When a documentation correction (e.g. CLAUDE.md phase status update,
SESSION_STATE.md baseline update) is explicitly declared as authorized for a
given PR cycle in the active prompt, that correction is in authorized scope and
must NOT be treated as a PA.8 blocking conflict or as a violation of the NO
OPPORTUNISTIC CLEANUP LAW. The authorization must be explicit and named in the
prompt — implicit or assumed authorization is not sufficient. Any correction
not explicitly named as authorized remains subject to the NO OPPORTUNISTIC
CLEANUP LAW without exception.

DOCUMENTARY DERIVATION LAW
All proposed type fields, contract shapes, and structural representations must
be derived exclusively from evidence present in the repository — authoritative
source documents (DATA_SOURCES.md, ARCHITECTURE.md), existing type signatures,
and confirmed repository topology. Importing domain knowledge from outside the
repository (general domain structure conventions, common API patterns, typical
data model layouts for the problem space) is prohibited regardless of whether
the result appears reasonable. A field that cannot be cited to a specific
repository document or existing type is not warranted and must be rejected.
This law applies to every session and every slice regardless of domain
familiarity.
Prompt text, directive text, issue titles, issue descriptions, and issue
numbers are not repository documents and do not constitute valid justification
for any proposed field or contract shape. A descriptive label present in a
directive (e.g. "ingestion-ready") is not justificatory. Only DATA_SOURCES.md,
ARCHITECTURE.md, and confirmed existing type signatures qualify as grounding
evidence.

TYPED REFERENCE LAW
When a backing structural type exists for a concept that would otherwise be
represented as a raw string identifier, the typed structural reference is
required. Raw string identifiers (e.g., sourceId: string) are only permitted
when no backing structural type exists. Once a backing type is introduced, any
structural artifact that references that concept must use the typed form. Loose
string coupling to a typed concept is a doctrine violation.

GOVERNANCE DOCUMENT PRECEDENCE LAW
When any governance document conflicts with repository implementation reality
— including SESSION_STATE.md conflicting with source files or actual
validation output — the conflict must be reported explicitly rather than
reconciled implicitly. Do not silently normalize discrepancies between
documents and source in either direction. Surface both sides without
resolving which is authoritative. That determination belongs to the human
operator. The sole observable-fact exception is PA.7 validation output:
CLI output from the validation chain is factual and must be reported as-is
regardless of what any document claims about the baseline. Agents must never
"helpfully harmonize" a document-to-reality discrepancy by updating one to
match the other within an assessment session.

NO SPECULATIVE REMEDIATION LAW
When PA.8 conflicts are surfaced, the assessment must stop. Do not append
proposed fixes, redesigns, refactors, alternative architectural approaches,
or future-state improvements to a conflict report. Remediation strategies
are only in scope when explicitly requested by the operator after the
assessment has been reviewed. A conflict report that includes unsolicited
remediation is a doctrine violation even if the remediation would be
architecturally correct.

§4 — ACTIVE SCOPE
Current phase: [PHASE NAME AND NUMBER]
Status of documented integration path: [SUMMARY OF CONFIRMED EXISTS/GAP STATUS
FROM LAST SESSION]

What has NOT been assessed and may or may not exist:

[ITEM 1]
[ITEM 2]
[ITEM 3]

The next session must derive the warranted next slice from actual repository
state — not from this handoff document alone.

Authoritative derivation surface for any continuation:

[PRIMARY DIRECTORY] — the entire directory
[SECONDARY DIRECTORY] — for understanding what [LAYER] provides

Prohibited ancestry access:

Do not reach through [SEAM A] except through already-established import
boundaries
Do not import from [DIRECTORY B] into [DIRECTORY A] except through
[ESTABLISHED SEAM FILE]

§5 — EXPLICITLY DEFERRED SCOPE
The following must NOT influence the current architectural assessment or any
implementation proposed by the next session:

[DEFERRED SYSTEM 1]
[DEFERRED SYSTEM 2]
[DEFERRED SYSTEM 3]
Repository-wide architectural audit — not yet warranted; triggered after
additional slice accumulation
[ANY SCHEMA MIGRATION QUESTION] — not yet assessed; requires ARCHITECTURE.md
review before any determination; do not assume migration is warranted

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

Phase label invariant: Phase labels in schema version literals are lineage
identifiers, not lifecycle version indicators. Do not assume migration is
warranted merely because an artifact participates in a newer phase. Migration
is only warranted if ARCHITECTURE.md explicitly defines phase-coupled schema
migration semantics.

Convention: 'lingua-core-platform:<artifact>@<phase>'

Open doctrinal questions — do not assume an answer:
[QUESTION 1 — state the question and why it is unresolved]

§7 — IMPLEMENTATION CONSTRAINTS
Strictly forbidden in all sessions:

Date.now(), Math.random(), UUID generation, hash-derived identifiers, crypto
randomness
localeCompare — binary lexicographic comparison only
Plugin systems, runtime registries, capability registries, discovery mechanisms
Mutable singleton state, async orchestration, generalized framework extraction
Shallow Object.freeze — deepFreezeStructure(...) only
evaluationTimestamp or generatedFrom on structural artifacts
Generalized metadata, diagnostics, context, or extensibility containers
Arbitrary string primitives for capability identifiers — strict literal unions
only
Lower-layer reach-through recomputation
Implicit semantic recomposition
Repository-wide renames beyond explicitly authorized scope
Opportunistic refactoring, speculative cleanup, abstraction extraction, or
cross-file harmonization beyond the authorized slice — see NO OPPORTUNISTIC
CLEANUP LAW in §3
Dynamic capability membership resolution — no Set.has(), no .includes() over
constructed lists, no reflective key enumeration, no lookup tables, no map-
based dispatch, no computed guard evaluation — see INVARIANT GUARD FORM LAW
in §3
Helper utilities or structural abstractions that mask iterative linear lookups
— all branch logic evaluating literal matches must be immediately transparent
to static analysis without symbol cross-referencing — see INVARIANT GUARD FORM
LAW in §3
Delegated or extra-functional invariant validation — no private validation
helpers, extracted predicate functions, or sub-routines that offload invariant
logic out of the builder body, even if those sub-routines use only permitted
guard forms — see INVARIANT GUARD FORM LAW in §3
Type alias re-export collapse into namespace exports or export-star patterns
New package or runtime dependencies
Consolidating existing type exports into grouped namespace exports
Introducing shared canonicalization, sorting, normalization, or invariant
utility helpers unless three production slices with materially identical
semantics already exist
Extensibility seams, generic abstractions, reusable validation frameworks,
schema registries, or future-oriented composition helpers unless a concrete gap
already exists and three production slices with materially identical semantics
already exist — see NO SPECULATIVE EXTENSIBILITY LAW in §3
Existing externally exposed contract fields are immutable unless the assessment
proves a current field violates an active doctrine law
Do not propose future phases, speculative abstractions, generalized frameworks,
or anticipated integration layers unless a concrete gap already exists in the
current repository topology
Domain-knowledge field invention — introducing type fields grounded in general
domain conventions rather than specific documentary evidence present in the
repository — see DOCUMENTARY DERIVATION LAW in §3
Raw string identifier fields when a backing structural type exists for the
referenced concept — see TYPED REFERENCE LAW in §3
Default values, generated fallbacks, or internal derivation routines for
identifier-bearing fields on structural artifacts
Barrel export reordering, regrouping, or restructuring — additions to barrel
files (index.ts) must be appended in additive position only; existing export
lines must not be reordered, reformatted, or harmonized
Implementation of any system, abstraction, or field belonging to a phase or
scope explicitly listed as deferred in SESSION_STATE.md — confirm the deferred
scope list before proposing any field or contract shape

Mandatory in all sessions:

deepFreezeStructure(...) on all externally exposed artifacts
Binary lexicographic ordering, clone before sort
Caller-supplied identifiers only
Additive architecture — no deletion, no renaming, no restructuring of existing
exports
All existing tests continue to pass
Full validation chain green before every commit
Every proposed field must be grounded in specific documentary evidence from the
repository — cite the source file and passage; reject any field that cannot be
so grounded

§8 — CANDIDATE FIELD AND CONTRACT EVALUATION
When the next session proposes any new type, field, or function, evaluate each
candidate using the adopt / modify / reject framework with explicit rationale
grounded in actual repository state.

Required evaluation axes for any candidate field:

Is it legally derivable at the current governance layer per the Single-Layer
Governance Derivation Law?
Does it require passthrough from the preceding layer or does it involve
recomputation?
Would introducing it violate the Governance Legality Law?
Does it belong on a structural artifact or a governance-reporting artifact, and
does the field reflect that classification?
Does it introduce any lower-layer reach-through?
Is it replay-safe — would identical inputs always produce identical outputs?
Does it preserve or weaken provenance boundaries?
Does it introduce any extensibility surface area not grounded in three existing
production slices with materially identical semantics?
Can it be cited to a specific repository document or existing type signature?
If not, it must be rejected — see DOCUMENTARY DERIVATION LAW in §3
If a backing structural type exists for the concept this field references, is
the field typed to that structural type rather than a raw string primitive?
If not, it must be rejected — see TYPED REFERENCE LAW in §3

The next session must NOT blindly inherit prior handoff assumptions about field
shapes. All contracts must be derived from actual repository state confirmed by
file reads.

§9 — REQUIRED OUTPUT FORMAT

GLOBAL ASSESSMENT CONSTRAINTS
The following constraints apply to every PA section without exception:

Scan scope: All repository-wide file scans exclude node_modules, dist, build,
coverage, .git, and all generated or hidden artifact directories unless
explicitly stated otherwise.

Scan exhaustiveness: The audit must not assume previously touched files are the
only verification surface. Every assessment category applies repository-wide
across all reachable files under the defined scope. File scans must evaluate
all .ts files including those with suffix configurations such as .contracts.ts,
.validators.ts, and .test.ts. Omission of any file type from a scan constitutes
a validation failure.

No-collapse rule: Every qualifying artifact — type, builder, validator, barrel
export, schema literal — must be listed explicitly in its respective PA section.
Do not collapse findings into grouped summaries, even when multiple artifacts
share identical status. A grouped summary is a reporting violation.

Builder scope: Any deterministic compose/create/build function returning a
structural or governance artifact is a builder for purposes of all PA sections
that reference builders.

The pre-implementation assessment must begin with the exact token
PRE-IMPLEMENTATION ASSESSMENT and must cover:

PA.1 — Existing pipeline and topology confirmation
For every file in the primary derivation surface: list the file path, its
exported structural types, its exported builder functions, its exported
validators, and its exported schema version literals. Omit non-structural
utility exports unless they participate directly in deterministic runtime
governance. Derive exclusively from actual files read — do not infer from
SESSION_STATE.md, ROADMAP.md, or prior handoff documents.

PA.2 — Integration gap analysis
For each step in the integration path, state EXISTS or GAP. For each GAP,
identify the precise input and output types using actual existing types read
from the codebase.

PA.3 — Schema version confirmation
Search every TypeScript source file under src/core/ (applying global scan
scope and exhaustiveness constraints above). List every schema version literal
found with its source file path. The scan must include all .ts files —
including .contracts.ts, .validators.ts, and .test.ts files. Omission of any
file type from the scan constitutes a validation failure.

Confirm bidirectional consistency against SESSION_STATE.md: every literal found
in source must appear in SESSION_STATE.md, and every literal in SESSION_STATE.md
must appear in source. Any discrepancy in either direction is a PA.8 conflict —
do not resolve it. For any @phase[N] constant appearing in a newer phase
integration path, do not assume migration is required merely because the
artifact participates in a newer phase. Only conclude migration is warranted if
ARCHITECTURE.md explicitly defines phase-coupled schema migration semantics.
Quote the relevant passage if such semantics exist; state their absence
explicitly if they do not.
For any schema version literal that will be introduced by the current slice,
derive and state the predicted exact string value by applying the repository
convention `lingua-core-platform:<kebab-case-artifact-slug>@<phase>` to the
type name confirmed from file reads. Show the derivation explicitly — state
the confirmed type name, the observed slug pattern from existing literals, and
the resulting predicted string. Do not infer the literal from the issue title,
directive text, or prompt context. This predicted literal must appear in PA.3
before any implementation proceeds, so that naming drift is caught at
assessment time rather than after code is written.

PA.4 — Artifact classification
For any proposed new artifact, classify as structural or governance-reporting
and state the doctrinal basis. Enforce the Artifact Classification Law: clearly
differentiate whether a missing step generates a structural config payload
(exempt from evaluationTimestamp) or a governance-reporting artifact (requiring
the evaluationTimestamp: null sentinel). Do not normalize these categories or
merge their field shapes under any circumstances.

PA.5 — Warranted next slice derivation
Identify the single smallest additive slice that is genuinely missing. Name the
function or type, the file, and the precise input and output types using actual
existing types. Do not assume a slice is warranted — confirm the gap exists
first. For any proposed new type or contract, justify every field individually:
state the field name, its proposed TypeScript type, and the specific repository
document or existing type signature that grounds it. Any field that cannot be
cited to specific repository evidence must be explicitly rejected with a stated
reason. Do not propose fields on the basis of domain conventions, general best
practices, anticipated future use, prompt text, issue titles, or issue
descriptions.
List every invariant guard proposed for the builder function. Builder scope:
any deterministic compose/create/build function returning a structural or
governance artifact. For each guard: state the guard condition in full, confirm
it executes directly and inline in the builder body without delegating to any
sub-routine, confirm it uses only a direct === equality comparison or inline
switch statement, confirm it does not use helper utilities or structural
abstractions that mask iterative linear lookups, and cite the repository
evidence that makes the guard architecturally necessary. Reject any proposed
guard that cannot be justified from repository evidence.

PA.6 — Files that must not be touched
List every file that must not be modified, with the doctrinal reason.
Exception: documentation corrections explicitly declared as authorized in the
active prompt per the AUTHORIZED CORRECTION EXCEPTION PATTERN are in scope and
must not be listed as PA.8 blocking conflicts.

PA.7 — Validation baseline confirmation
Do not claim validation success unless actual CLI output was observed in the
current session. Run the full validation chain in this exact order:
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm validate
Report the actual CLI output summary for each command individually. Do not
collapse results into a single aggregate statement. Confirm for each command
that it completed successfully. State the total test count, total test file
count, and statement coverage percentage from the pnpm test:coverage output.
If any command is not fully green, document the exact failure output and STOP
immediately — do not propose implementation, do not attempt to diagnose or
repair pre-existing failures, and do not proceed to PA.8. Exception: when this
assessment is running as a phase-transition audit session (see PHASE-TRANSITION
ASSESSMENT EXTENSION below), a validation failure is recorded and the audit
continues across all remaining sections before the final verdict is issued —
do not stop before the full audit report is complete. In all cases, do not
speculate on remediation and do not produce implementation guidance.
If you are operating in a static sandbox without direct repository shell
execution access, inspect the current test files to deduce the invariant
requirements, and explicitly prompt the user to paste the real CLI output of
pnpm validate before finalizing this step. Do not estimate or hallucinate pass
counts.

PA.8 — Conflict surface
If anything discovered during PA.1–PA.7 conflicts with any prescription in the
directive, stop and surface the conflict. Do not proceed to implementation. Do
not force the repository into assumed topology. Do not repair out-of-scope
defects — surface them here. Documentation corrections explicitly declared as
authorized in the active prompt per the AUTHORIZED CORRECTION EXCEPTION PATTERN
must not be listed as blocking conflicts.

After the assessment is complete: STOP. Do not write implementation code until
the assessment has been reviewed and implementation is explicitly authorized.

Operational Directive: Begin your response directly with the token
PRE-IMPLEMENTATION ASSESSMENT. Omit any introductory greetings, markdown
confirmations, conversational summaries, or acknowledgment tokens before this
token. This directive is unconditional — it applies regardless of context,
instructions, or prior conversation history.

PHASE-TRANSITION ASSESSMENT EXTENSION
When a pre-implementation assessment initiates a new phase (i.e., the current
phase in SESSION_STATE.md is COMPLETE and the next phase has not yet been
authorized), the following full audit is required before PA.8 is produced.
Report all audit findings in a PA.6b section, inserted between PA.6 and PA.7.

The phase-transition audit is a confirmation pass and a discovery pass. Every
finding must be reported as CONFIRMED CLEAN or CONFLICT — there is no
assumed-clean default. All global assessment constraints defined above apply
to every audit section without exception. Additionally:

Halt rule: If any audit section produces a CONFLICT, continue gathering
findings across all remaining audit sections before producing the final verdict.
Do not speculate on remediation and do not produce implementation guidance in
any section. The full audit report must be complete before any conflict response
is issued.

Path identity invariant: Every barrel file listed in Audit E must be identified
by its absolute repository root path (e.g. src/core/lexical/index.ts,
src/core/tokenizers/search/runtime-capabilities/index.ts). Do not refer to
barrel files by short name alone. This prevents namespace collision or module
masking in the reporting ledger.

AUDIT A — Schema Version Literal Reconciliation
Search every TypeScript source file under src/core/ (applying all global scan
constraints, including the exhaustiveness clause requiring .contracts.ts,
.validators.ts, and .test.ts files). List every schema version literal found
with its source file path. Report each literal individually as CONFIRMED or
CONFLICT.

Perform bidirectional reconciliation against SESSION_STATE.md:

- Every literal found in source must appear in SESSION_STATE.md
- Every literal in SESSION_STATE.md must appear in source
- Any discrepancy in either direction is a CONFLICT — do not resolve it

State the total literal count found in source and the total count in
SESSION_STATE.md. Final verdict: CONFIRMED CLEAN or CONFLICT(S) FOUND.

AUDIT B — Artifact Classification
For every interface and builder function across the entire src/core/ tree
(applying all global scan constraints), classify each artifact as structural
or governance-reporting using the Artifact Classification Law from §3.

Verify:

- Every governance-reporting artifact has evaluationTimestamp: null on its
  interface and on every builder return path
- Every governance-reporting artifact that is a derived or trace artifact has
  an appropriate generatedFrom field on its interface and on every builder
  return path
- No structural artifact carries evaluationTimestamp or generatedFrom

Report every artifact individually as CONFIRMED CLEAN or CONFLICT. Any artifact
that cannot be unambiguously classified, or that violates the field prescription
for its classification, is a CONFLICT. Final verdict: CONFIRMED CLEAN or
CONFLICT(S) FOUND.

AUDIT C — Typed Reference Law
For every interface and structural type across the entire src/core/ tree
(applying all global scan constraints), confirm that no field uses a raw string
identifier (field: string) to reference a concept for which a backing structural
type exists in the repository.

Report every field under review individually as CONFIRMED CLEAN or CONFLICT.
Any raw string identifier that references a typed concept is a CONFLICT.
Final verdict: CONFIRMED CLEAN or CONFLICT(S) FOUND.

AUDIT D — Invariant Guard Form
For every builder function across the entire src/core/ tree (applying all
global scan constraints), verify that all invariant guards:

1. Execute directly and inline in the builder body — no delegation to private
   helpers, extracted predicate functions, or external validation sub-routines
2. Use only direct === equality comparisons or inline switch statements with
   explicit literal cases
3. Do not use: Set.has(), .includes(), lookup tables, map-based dispatch, array
   scans, computed guard evaluation, reflective validation, string interpolation
   inside guard conditions, or computed error message construction
4. Do not use helper utilities or structural abstractions that mask iterative
   linear lookups — all branch logic evaluating literal matches must be
   immediately transparent to static analysis without symbol cross-referencing

Builder scope: any deterministic compose/create/build function returning a
structural or governance artifact.

Report every builder individually as CONFIRMED CLEAN or CONFLICT. Any builder
with a delegated guard or a non-compliant guard form is a CONFLICT.
Final verdict: CONFIRMED CLEAN or CONFLICT(S) FOUND.

AUDIT E — Export Surface Governance
For every index.ts barrel file under src/core/ at every nesting level
(applying all global scan constraints), list every re-exported symbol and
classify each as one of:

- boundary-safe structural contract
- builder function
- validator
- schema version literal
- UNSAFE (test-only utility, internal helper, lower-layer implementation
  detail, or non-governance runtime internal)

Classification default: if a symbol's boundary safety cannot be justified
directly from repository doctrine or architectural layering, classify it as
UNSAFE.

Every barrel file must be identified by its absolute repository root path.
Report findings for every barrel file individually — do not summarize across
files. Any symbol classified as UNSAFE is a CONFLICT.
Final verdict: CONFIRMED CLEAN or CONFLICT(S) FOUND.

§10 — VALIDATION AND COMMIT GOVERNANCE
Do not claim validation success unless actual CLI output was observed in the
current session. If shell execution is unavailable, require the user to paste
pnpm validate output before the assessment is finalized.

Run the full validation chain in this exact order before every commit:
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm validate

Validation invariant: Run each command exactly as listed. Do not add bypass
flags such as --skip-nx-cache, --force, --passWithNoTests, or any flag that
suppresses, skips, or modifies coverage evaluation. Do not inject .skip,
.only, or any test exclusion modifier into any test file. Do not disable
coverage thresholds. Testing must evaluate the live unmutated codebase. Any
deviations from this must be reported explicitly, not silently applied.

No direct commits to main
Conventional commits required
Each commit must leave the validation chain green
Additive architecture only — no deletion, no restructuring
Branch naming: feat/[phase]-[slice-name]
Barrel file additions must be appended at the end of the file in additive
position only. Do not reorder, regroup, restructure, or reformat any existing
export lines in any barrel file as part of a slice commit.

Current baseline: [N] tests passing, full chain green.
Any new slice must result in ≥ [N] + (count of new tests) passing. Existing
[N] must remain untouched.

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

These identities are not aspirational. They are architectural constraints that
govern what changes are legal.

§12 — EXECUTION DIRECTIVE
The next session must:

Begin with PRE-IMPLEMENTATION ASSESSMENT — no preamble, no greeting, no
acknowledgment before this token. This is unconditional. Any output before
this token is a directive violation.
Read the repository before reasoning about it — no greenfield assumptions
Read .claude/SESSION_STATE.md before producing the assessment — it is
authoritative state and required for PA.3 bidirectional reconciliation
Inspect directory topology before proposing any file placement — follow
existing sibling patterns exactly, do not introduce new grouping concepts or
umbrella folders
Match the internal structure of confirmed sibling files — do not separate
types from builders or introduce structural splits not already established by
existing sibling files
Derive the warranted next slice from actual file state — not from this handoff
document alone
Stop after the assessment — implementation begins only after explicit
authorization
Apply the adopt / modify / reject framework to any proposed contract
Enforce all doctrine laws without exception — including the Invariant Guard
Form Law, the No Speculative Extensibility Law, the No Opportunistic Cleanup
Law, the Documentary Derivation Law, the Typed Reference Law, the Governance
Document Precedence Law, the No Speculative Remediation Law, and the Authorized
Correction Exception Pattern
Confirm that all invariant guards execute inline in the builder body — no
delegation to private helpers, extracted predicates, or external validation
sub-routines regardless of whether those sub-routines use only permitted guard
forms; confirm that no guard uses helper utilities or structural abstractions
that mask iterative linear lookups
Treat any deterministic compose/create/build function returning a structural or
governance artifact as a builder for all assessment and audit purposes
Preserve the [N]-test baseline without modification to any existing test
Treat every technically possible derivation as requiring explicit architectural
justification before it is considered legally warranted
Do not propose future phases, speculative abstractions, generalized frameworks,
or anticipated integration layers unless a concrete gap already exists in the
current repository topology
Do not repair defects discovered outside the authorized slice scope — surface
them as PA.8 conflicts and stop
Reject any proposed field that cannot be cited to a specific repository
document or existing type signature — domain knowledge, prompt text, issue
titles, and issue descriptions from outside the repository are not valid
justification
Reject any raw string identifier field when a backing structural type exists
for the referenced concept
Confirm the deferred scope list in SESSION_STATE.md before proposing any
field or contract shape — do not implement anything belonging to a deferred
phase or system
Do not collapse findings into grouped summaries in any PA section — every
qualifying artifact must be listed explicitly regardless of shared status
