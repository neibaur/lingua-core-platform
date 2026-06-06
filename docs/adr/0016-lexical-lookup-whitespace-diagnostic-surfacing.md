ADR-0016 — Lexical Lookup th→en Whitespace Rejection Surfaced as a Returned Diagnostic
Status: Accepted
Phase: — (non-phase corrective core thread; lexical layer, Phase 10 foundation)
Supersedes: —
Related: ADR-0008 (Typed Structural Interoperability Seams Across Lexical, Query, and
Runtime Boundaries). No prior ADR established the lexical lookup diagnostic union or the
lookup-result contract; these contracts were introduced in code at Phase 10 (#53).

Context
The lexical lookup contract publishes a reporting model in which a lookup outcome is
carried as data: LexicalLookupResult exposes a diagnostics array of
LexicalLookupDiagnostic records, and LexicalLookupDiagnosticCode declares three members
— LEXICAL_KEY_NOT_FOUND, LEXICAL_INDEX_EMPTY, and LEXICAL_KEY_WHITESPACE_REJECTED
(confirmed from source: src/core/lexical/contracts.ts). Two of the three are emitted by
the builder as returned diagnostics (the LEXICAL_INDEX_EMPTY and LEXICAL_KEY_NOT_FOUND
paths push an object literal onto diagnostics and return a frozen result). The third,
LEXICAL_KEY_WHITESPACE_REJECTED, is never emitted: composeLexicalLookup rejects a th→en
whitespace-bearing query by THROWING an invariant error (inline /\s/.test guard,
src/core/lexical/lookup/lexical-lookup.ts ~L29-33), so the declared code is structurally
unreachable on the result. The downstream interop report registers and buckets that code
(query-lexical-interop reporting), making the bucket structurally always-empty.

This is an internal contradiction between two halves of one published contract: the
type-and-registry surface models whitespace rejection as a returned diagnostic, while the
builder surfaces it as a thrown error. Provenance, confirmed from git history (05a6fd3
#53; fb33441 #87; 0094b4f #163): the rejection has been a throw since the Phase 10
lexical foundation (#53), where it was a delegated assertNoWhitespace(...) throwing call;
#87 inlined it into the present /\s/.test guard; #163 made the guard per-direction
(admitting en→th whole-phrase queries). No commit message in this lineage, and no ADR,
records a rationale for surfacing the rejection as a throw rather than as the declared
returned diagnostic. This ADR therefore records a decision for a behavior that no prior
ADR has governed; it is the resolution of an internal contradiction in the published
contract, NOT a correction of drift from a previously decided posture.

Decision

1. For a th→en lookup, composeLexicalLookup surfaces a whitespace-bearing query by
   RETURNING a LexicalLookupResult that carries a LEXICAL_KEY_WHITESPACE_REJECTED
   diagnostic, replacing the current thrown invariant error. The result thereby becomes
   the single authority that emits every code its contract declares.
2. The lookup-side INPUT guard is distinguished from the index-side DATA guard. This
   decision governs only the lookup-time rejection of a caller's query. The
   index-construction whitespace invariant on headword keys (reached via
   normalizeLexicalKey at index build) is a data-integrity guard and is UNCHANGED: it
   remains a fail-fast throw.
3. The en→th path is unaffected (it admits whitespace-bearing whole phrases and resolves
   by exact equality), and the empty-query behavior is unaffected.
4. This ADR records the decision and names its grounding instrument (see Grounding
   Sources). Per the operator ruling that Accepted ADRs do not constitute field-grounding
   evidence (SESSION_STATE.md — Resolved doctrinal rulings), this ADR grounds no field.
   It introduces no type name, field name, builder signature, structural shape, severity
   selection, or schema version literal; the lookup-result schema version literal
   (lingua-core-platform:lexical-lookup-result@phase10) is unchanged, as the result's
   field set does not change. All implementation shape is deferred to a §9
   pre-implementation assessment (see "Deferred to implementation").

Grounding instrument
The grounding-of-record for the returned-diagnostic posture is a one-sentence
clarification to ARCHITECTURE.md — "Lexical Key Normalization Policy" — co-merged with
this ADR in the same change, stating that th→en whitespace rejection is surfaced at
lookup as a returned lookup diagnostic rather than a thrown error. This ADR's acceptance
is contingent on that clarification. The existing LEXICAL_KEY_WHITESPACE_REJECTED union
member and the existing LexicalLookupResult.diagnostics field (existing type signatures)
ground the reused surface; the ARCHITECTURE clarification grounds the surfacing posture.

Consequences
What this makes possible. The lexical lookup contract becomes internally consistent:
every declared LexicalLookupDiagnosticCode is reachable on the result, and the interop
report's previously always-empty LEXICAL_KEY_WHITESPACE_REJECTED bucket becomes
populable. A th→en whitespace query yields a deterministic, inspectable result rather
than a thrown error.

Downstream consequence (consequence only, not justification or grounding). The
application tier (apps/usethai) currently fabricates LEXICAL_KEY_WHITESPACE_REJECTED at
its endpoint because core never emits it; once core returns the code, the app may consume
core's real diagnostic instead of minting one. This is a downstream effect of resolving
the contradiction; it is NOT the warrant for this decision. The warrant is the internal
contract contradiction, grounded as above; app-tier need is not grounding (DOCUMENTARY
DERIVATION LAW; APP_SHELL_GUIDELINES governs the separate app slice).

What remains unchanged. The index-construction whitespace invariant (a fail-fast data
guard); the en→th whole-phrase behavior; the empty-query behavior; the result and index
schema version literals; and the lexical key normalization policy's th→en whitespace-free
guarantee itself (only the surfacing mechanism at lookup changes).

Deferred to implementation (a future §9 pre-implementation assessment, not decided here):

- the form of the guard removal/replacement and the exact branch placement relative to
  the empty-index check;
- whether the diagnostic is constructed inline or via the existing createLexicalDiagnostic
  factory (subject to the INVARIANT GUARD FORM LAW's prohibition on offloading builder
  logic);
- the severity selection ("error" vs "warning") and the path/message content;
- deterministic-ordering considerations for the returned diagnostics;
- the test changes (the three throw-asserting tests that must become result-asserting,
  and the interop bucket transitioning from always-empty to populated);
- PREMISE CHECK: verification that the existing LexicalLookupResultStatus union
  ("found" | "not-found" | "empty-index") can represent a returned whitespace-rejection
  outcome without introducing a new status member. Any pull toward a new status member
  reopens the no-new-public-surface premise of this ADR and must be surfaced as a
  conflict rather than implemented.

Grounding Sources
ARCHITECTURE.md — "Lexical Key Normalization Policy" (th→en whitespace-free guarantee; "a
query containing whitespace is rejected"), as clarified by the companion one-sentence
amendment co-merged with this ADR that grounds-of-record the returned-diagnostic
surfacing posture.
Existing type signatures (src/core/lexical/contracts.ts) — LexicalLookupDiagnosticCode
(the LEXICAL_KEY_WHITESPACE_REJECTED union member), LexicalLookupDiagnostic,
LexicalLookupResult.diagnostics; the lookup-result schema version literal (unchanged).
HANDOFF_TEMPLATE.md §3 — DOCUMENTARY DERIVATION LAW; INVARIANT GUARD FORM LAW (the
fail-fast-vs-return tension this decision resolves); GOVERNANCE DOCUMENT PRECEDENCE LAW;
§6 (schema version / phase-label invariant — no literal introduced or migrated); §9
(per-slice assessment for the implementation).
SESSION_STATE.md — Per-PR Update Block (the corrective core thread); Open Doctrinal
Questions (the declared-but-unemitted diagnostic; the reconcile-to-return vs.
remain-fail-fast question this ADR settles in favor of return); Resolved doctrinal rulings
(Accepted ADRs are not field grounding).
Precedent — ADR-0014 §6 and ARCHITECTURE.md "Static Content Address": an ARCHITECTURE
amendment, not an ADR, is the grounding-of-record when a posture/field would otherwise be
ungrounded.

Omission note
This ADR records a decision only. It proposes no type names, field names, interface
members, builder signatures, structural shapes, severity selection, or schema version
literals, and it grounds no field (Accepted ADRs are not field grounding). The
implementation shape — guard form, diagnostic construction, severity, ordering, the
status-union premise check, and the changed tests — is withheld for the §9
pre-implementation assessment, consistent with the omission discipline of ADR-0011
through ADR-0015.
