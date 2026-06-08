ADR-0017 — Derived Linguistic Artifact Provenance (Grounding)
Status: Accepted (acceptance contingent on the co-merged ARCHITECTURE.md amendment)
Phase: — (non-phase foundational core thread; lexical layer)
Supersedes: —
Related: ADR-0009 (Contracts-Only Dictionary Data Boundary With Mandatory Typed
Provenance Embedding); ADR-0010 (Typed Reference Provenance Fields Replace Raw String
Identifiers); ADR-0016 (Lexical Lookup th→en Whitespace Rejection Surfaced as a Returned
Diagnostic — for the ARCHITECTURE-amendment-as-grounding-instrument precedent).

Context
The platform can store a generated linguistic value but cannot represent how that value
was derived. Confirmed from source: SpellingEntry (src/core/lexical/spelling/spelling-entry.ts)
carries phoneticNotation and toneClassification as required, non-empty strings wrapping a
CanonicalDictionaryEntry — they hold a pronunciation or tone value, but record only the
value, not its derivation (no generator identity, no generator version, no link to the
input headword's lineage). The one other pronunciation-adjacent slot, LexicalEntry.romanized?
(src/core/lexical/contracts.ts), is an optional free string with the same limitation.
DictionarySourceProvenance (src/core/lexical/provenance/dictionary-source-provenance.ts) is
source-shaped — sourceId, displayName, sourceUrl, licenseType, licenseUrl,
attributionRequired, attributionPayload — so it records where source data came from, not
how a value was derived; reusing it for a generator would conflate generated surfaces with
source data. The internal generatedFrom marker (e.g. "lexical-lookup-trace" on
LexicalLookupTrace, "lexical-dataset-validation-report" on the dataset-validation report) is
an artifact-classification discriminant governed by the ARTIFACT CLASSIFICATION LAW; it
classifies an internal computed/governance-reporting artifact, not the content provenance of
an externally generated linguistic surface. The representability gap is therefore real:
between holding a derived value and recording its lineage.

This gap matters because of a recorded product decision (SESSION_STATE.md — Per-PR Update
Block): tone IS a product requirement for UseThai; runtime tone inference is OUT; and a
generated-and-stored, offline/precomputed derived tone surface is the intended direction,
subject to governance. A stored generated pronunciation/tone surface is a derived artifact
whose lineage — generator identity + generator version + input headword lineage — has no
provenance home distinct from source provenance today. (The originating investigation is
docs/spikes/tone-generation-feasibility-spike.md §6–7; that spike is a throwaway,
non-governed document and is NOT grounding authority — the existing type signatures it cites
are. The §7 human-curated override/exception-table case is noted there as a related but
separate provenance concern.)

Decision

1. Establish derived linguistic artifact provenance as a binding architectural concept: the
   lineage of a linguistic surface the platform derives, distinct from source provenance.
   Source provenance records where source data came from; derived-artifact provenance records
   how a derived value was produced. The two lineages must not be collapsed.
2. The only case grounded here is the machine-generated, precomputed pronunciation and tone
   surface. No other derived surface is grounded; any additional case requires its own future
   grounding.
3. The required lineage, as concept and not as fields, is generator identity + generator
   version + input headword lineage. The posture is deterministic-at-pin and
   generator-version-aware (a generator-version change is a deliberate, audited regeneration,
   not silent drift), precompute/offline/static only and never runtime inference (REPLAY-SAFE
   GOVERNANCE LAW; STATIC RESOLUTION LAW; Explicit Non-Goal "No AI dependency as a core runtime
   requirement"), and generator-agnostic (no rule-vs-ML or library selection).
4. The concept is explicitly distinguished from, and must not overload, either
   DictionarySourceProvenance (source-shaped) or the internal generatedFrom
   artifact-classification marker.
5. Per the operator ruling that Accepted ADRs do not constitute field-grounding evidence
   (SESSION_STATE.md — Resolved doctrinal rulings), this ADR grounds no field. It introduces
   no type name, field name, builder signature, structural shape, or schema version literal.
   All implementation shape is deferred to a later §9 pre-implementation assessment.

Grounding instrument
The grounding-of-record for this concept is the co-merged ARCHITECTURE.md amendment "Derived
Linguistic Artifact Provenance," not this ADR. This ADR's acceptance is contingent on that
amendment, mirroring ADR-0016 §"Grounding instrument" and the "Static Content Address"
precedent (ADR-0014 §6), where an ARCHITECTURE.md amendment — never an ADR — is the
grounding-of-record when a concept would otherwise be ungrounded. The existing type
signatures named in Context (SpellingEntry, LexicalEntry.romanized?, DictionarySourceProvenance,
the generatedFrom usages) ground the source-vs-derived distinction; the ARCHITECTURE amendment
grounds the concept and its boundaries.

Consequences
What this makes possible. A future §9 pre-implementation assessment can design a
derived-artifact provenance representation on grounded footing, knowing the concept, its
required lineage, its precompute-only/never-runtime posture, and its distinction from the two
adjacent provenance concepts.

What remains unchanged. No contract field changes. SpellingEntry,
DictionarySourceProvenance, and the generatedFrom marker are untouched. No schema version
literal is introduced or migrated, and no phase-coupled migration semantics are defined
(SESSION_STATE.md — Phase label invariant; HANDOFF_TEMPLATE.md §6). This thread adds no tests
and touches no source.

Non-Goals / Deferred (decided here only that they are out of scope, not how to resolve them):

- The concrete representation — standalone provenance type vs. a field, its name, and which
  existing fields would hold derived values — is deferred to a later §9 pre-implementation
  assessment under the DOCUMENTARY DERIVATION LAW and TYPED REFERENCE LAW.
- Human-curated override / exception-table provenance (human-curation lineage, plus the
  curated correction's own licensing) is related but out of scope here; grounding it later
  requires a future additive ARCHITECTURE.md amendment under explicit operator authorization.
- No generator and no generator selection (rule-based vs. machine-learned); no ingestion path,
  parser, loader, adapter, or orchestration; and no runtime inference of any kind.

Grounding Sources
ARCHITECTURE.md — "Derived Linguistic Artifact Provenance" (the co-merged amendment;
grounding-of-record), and the concept-grounds-but-defers-shape precedents it mirrors,
"Static Content Address" and "Canonical Language Identity"; Explicit Non-Goals ("No AI
dependency as a core runtime requirement").
Existing type signatures (read this session, not for field grounding):
src/core/lexical/spelling/spelling-entry.ts (phoneticNotation, toneClassification hold a
value, not its derivation); src/core/lexical/contracts.ts (LexicalEntry.romanized?,
LexicalDefinition); src/core/lexical/provenance/dictionary-source-provenance.ts (source-shaped
fields); the generatedFrom usages in src/core/lexical/diagnostics/lexical-lookup-trace.ts and
src/core/lexical/validation/lexical-dataset-validation-report.ts (internal
artifact-classification marker).
HANDOFF_TEMPLATE.md §3 — REPLAY-SAFE GOVERNANCE LAW, STATIC RESOLUTION LAW, DOCUMENTARY
DERIVATION LAW (and its closing enumeration — only DATA_SOURCES.md, ARCHITECTURE.md, and
existing type signatures ground fields; ADRs do not), TYPED REFERENCE LAW, ARTIFACT
CLASSIFICATION LAW (generatedFrom), GOVERNANCE DOCUMENT PRECEDENCE LAW, NO OPPORTUNISTIC
CLEANUP LAW, NO SPECULATIVE EXTENSIBILITY LAW; §6 (schema version / phase-label invariant — no
literal introduced or migrated).
SESSION_STATE.md — Per-PR Update Block (the recorded product decision: tone IS a product
requirement; runtime tone inference OUT; generate-and-store/precompute the intended
direction; this documentation-only grounding thread); Resolved doctrinal rulings (Accepted
ADRs are not field grounding).
Precedent — ADR-0016 §"Grounding instrument" and ADR-0014 §6 / ARCHITECTURE.md "Static
Content Address": an ARCHITECTURE amendment, not an ADR, is the grounding-of-record. ADR-0009
and ADR-0010 establish DictionarySourceProvenance and the typed-reference provenance posture
this concept is distinguished from.
Context only (not grounding authority): docs/spikes/tone-generation-feasibility-spike.md §6–7
— the originating investigation that surfaced the representability gap; a throwaway,
non-governed spike whose cited type signatures, not its prose, are the grounded facts.

Omission note
This ADR records a decision only. It proposes no type names, field names, interface members,
builder signatures, structural shapes, or schema version literals, and it grounds no field
(Accepted ADRs are not field grounding). The concrete representation — standalone type vs.
field, names, and which existing fields would hold derived values — is withheld for a later
§9 pre-implementation assessment, consistent with the omission discipline of ADR-0011 through
ADR-0016.
