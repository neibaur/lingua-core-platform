# apps/usethai — Warrant Review 2026-06-07

## Header

- **Date:** 2026-06-07
- **Evidence basis:** 13 FIXTURE entries (F-0001–F-0013), post-P1 enriched seed fixture
- **Real data:** none — all entries are FIXTURE-tagged; no REAL-tagged entries exist yet
- **Core-capability warrant issued:** none — FIXTURE basis forecloses all bucket (c) outcomes;
  no not-present core capability is warranted by this review

---

## Shared Understanding Confirmed Before Triage

**Entries in scope:** 13 real F-entries (F-0001 through F-0013). EX-01/EX-02 excluded as
illustrative, not evidence. All 13 are FIXTURE-tagged. Data snapshot for every entry:
"enriched seed fixture (post-P1)."

**Directions present:** both — en→th (F-0001, 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0012) and th→en (F-0009, 0010, 0011, 0013).

**Capability-bucket eligibility:** not eligible — bucket (c) requires REAL-tagged,
confirmed-present-target, QUERY-FORM-UNMATCHED clusters; every entry here is FIXTURE-tagged,
so none can carry a not-present-core-capability warrant regardless of signal clarity.
Buckets (a) and (b) remain available.

**Data-licensing state:** every DATA_SOURCES candidate sits at `candidate` status; none is
`approved_for_ingestion`.

---

## Triage

**Scope reminder:** 13 real F-entries, all FIXTURE-tagged, both directions. Bucket (c) is
foreclosed for every cluster — no REAL-tagged, confirmed-present, QUERY-FORM-UNMATCHED
evidence exists, so nothing here can warrant a not-present core capability. No entry is a
ranking / "did you mean" / relevance / partial-as-you-type NON-GOAL-DESIRE; two clusters (5, 7) touch matching behaviors the Lexical Key Normalization Policy documents as non-goals,
routed accordingly.

---

### Cluster 1 — Lookup direction not reflected in the page title

- **Entries:** F-0004 (representative)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE (but data-independent — this is chrome, not content)
- **Bucket:** **(a) app-tier presentation fix** — actionable
- **Rationale:** Active lookup direction is app state; the title "Use Thai - Thai word lookup"
  never changes for en→th. Reflecting direction in the heading is wholly within app-tier
  latitude (APP_SHELL_GUIDELINES "Latitude"); no core surface involved. FIXTURE tag is
  irrelevant — the friction is not about data content. Bucket (c) N/A.
- **Recommended next action:** Scope a P2 app-tier presentation slice making the page
  heading/title reflect the active direction (th→en vs en→th).

---

### Cluster 2 — Query echo preserves raw mixed-case input

- **Entries:** F-0005 ("To eAt", lookup succeeded → กิน)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE (data-independent)
- **Bucket:** **(a) app-tier presentation**, guardrail-constrained — near working-as-intended
- **Rationale:** The verbatim raw echo is a deliberate doctrine choice per SESSION_STATE: echo
  is "sourced from raw client controls (never result.query) — preserves the no-normalized-key
  guardrail." Any cosmetic adjustment must NOT surface the canonical/normalized key, or it
  breaks that guardrail. This is closer to working-as-designed than a defect. Bucket (c) N/A.
- **Recommended next action:** Low-priority only — if pursued, a cosmetic-presentation review
  explicitly bounded by the no-normalized-key guardrail. Acceptable to close as intended
  behavior. Not a standalone slice warrant.
- **Operator disposition:** Closed as intended, bounded by the no-normalized-key guardrail.

---

### Cluster 3 — Multi-entry homograph returned with identical gloss, no disambiguation

- **Entries:** F-0006 (เก่า + แก่ both glossed "old")
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE
- **Bucket:** **(a) app-tier presentation — conditional**
- **Rationale:** SESSION_STATE confirms this is a structural core fact (en→th admits multiple
  entries per key; seed แก่/เก่า both "old"), not a defect, and the render order is core's.
  The actionable question is whether the entries carry already-app-reachable distinguishing
  fields the UI isn't surfacing — the lexical barrel exposes `LexicalPartOfSpeech` and
  `LexicalDefinition` (full definition set). If populated, surfacing them is bucket (a). If
  the entries genuinely lack distinguishing data, the residue is a data-content gap, not
  app-fixable. Bucket (c) N/A.
- **Recommended next action:** Scope a small app-tier investigation-then-presentation slice:
  surface available distinguishing fields (part-of-speech, full definition list) on
  multi-entry results. Flag low expected payoff on fixture data; confirm field population
  first.
- **Operator disposition:** Folded into Cluster 1's P2 presentation slice (expected to resolve
  to a data-content gap, since P1 already surfaces POS and full definitions).

---

### Cluster 4 — Romanized forms lack tone information

- **Entries:** F-0003, F-0012 (same observation, two sessions — เก่า/แก่ romanized without
  tone marks)
- **Friction type:** RESULT-PRESENT-HARD-TO-USE
- **Data basis:** FIXTURE
- **Bucket:** **None of (a)/(b)/(c) — data-content matter, not actionable here**
- **Rationale:** The romanized string is core entry data. The app cannot fabricate
  tone-marked romanization it does not hold without violating provenance discipline
  (APP_SHELL_GUIDELINES "Data": fixtures must not fabricate lineage). This is not a
  presentation fix and not a reachable-surface wiring. It is a data-field/content question
  gated by DATA_SOURCES — and every candidate (incl. Volubilis, which offers romanized Thai
  but with IPA/tone "unconfirmed") sits at `candidate`, none `approved_for_ingestion`.
  FIXTURE + no approved source = capability-claim-discounted. Bucket (c) N/A regardless.
- **Recommended next action:** None this session. Record as a data-sourcing + (eventual)
  core-schema question outside app-tier scope.
- **Operator disposition:** Data/core-schema-gated; no action.

---

### Cluster 5 — English token sits inside a multi-word gloss

- **Entries:** F-0002 ("eat" vs whole-phrase key "to eat")
- **Friction type:** QUERY-FORM-UNMATCHED
- **Data basis:** FIXTURE
- **Bucket:** **(b)-shaped but HELD** (not actionable now)
- **Rationale:** This is the one entry whose mechanism genuinely maps to an already-reachable
  surface: the corpus token path (`buildSearchProjection → CorpusIndexer →
executeTokenQuery`) would token-match "eat" against a corpus that tokenized "to eat".
  Reachability is real (inventory §3.2; SESSION_STATE). But reachability ≠ warrant, and the
  standing discipline holds that path UNWIRED "pending a logged friction signal that maps to
  it." A single FIXTURE-tagged signal — where the target's presence is itself a fixture
  artifact and the underlying desire (sub-phrase reach) is a documented Lexical Key
  Normalization Policy non-goal for the lexical substrate — does not lift that hold.
  Bucket (c) N/A (FIXTURE).
- **Recommended next action:** Hold. If this recurs on REAL data, scope a deliberate
  evaluation of whether to wire the corpus token/phrase surface as a separate search
  affordance (bucket b) — never as a change to exact-key lexical lookup.
- **Operator disposition:** HELD under reachability-≠-warrant; re-evaluate only on REAL
  evidence.

---

### Cluster 6 — Inflected / morphological English form

- **Entries:** F-0008 ("eating" → "eat"/"to eat")
- **Friction type:** QUERY-FORM-UNMATCHED
- **Data basis:** FIXTURE
- **Bucket:** **Not-present capability — discounted, not actionable**
- **Rationale:** Unlike Cluster 5, this does not map to any present surface: token matching
  is token-exact (`matchSearchTerm`/`executeTokenQuery`; inventory Observation 4 per
  SESSION_STATE), so "eating" never reaches "eat" without stemming, and fuzzy matching is NOT
  PRESENT anywhere and explicitly non-goaled in lexical. So it could only ever be bucket (c)
  — which is foreclosed by the FIXTURE tag. Capability-claim-discounted explicitly.
- **Recommended next action:** None. If ever pursued, it is a tokenizer/search-layer concern
  requiring its own core grounding + §9 assessment — out of this session's reach and
  unwarranted on this evidence.
- **Operator disposition:** Core-governance-class only if REAL evidence accumulates.

---

### Cluster 7 — Trailing punctuation blocks an otherwise-canonical key

- **Entries:** F-0007 ("old!"), F-0013 ("กิน?")
- **Friction type:** QUERY-FORM-UNMATCHED
- **Data basis:** FIXTURE
- **Bucket:** **Key-normalization-policy (core domain) — discounted, not actionable**
- **Rationale:** Neither normalization path strips punctuation — English canonicalization
  composes only collapse-whitespace / trim-boundary / case-fold; Thai folds
  tone-marks/digits and rejects whitespace. So "old!"/"กิน?" don't normalize to
  "old"/"กิน". Punctuation handling is a Lexical Key Normalization Policy question — and
  the app must not invent a divergent app-side normalization rule (APP_SHELL_GUIDELINES:
  reusable business rules must be promoted through core governance, not smuggled into the
  app; the platform's whole point is one authoritative canonicalization at index and
  lookup). So this is neither bucket (a) nor (b). It could only be a core
  key-normalization-policy change — bucket (c)-class — foreclosed by FIXTURE.
- **Recommended next action:** None. Candidate for a separate core grounding on punctuation
  in the key-normalization policy only if it accumulates REAL evidence; record and discount
  for now.
- **Operator disposition:** Core-governance-class only if REAL evidence accumulates.

---

### Cluster 8 — Thai multi-token / whitespace / full-sentence input

- **Entries:** F-0009 (whitespace place-name, diagnostic), F-0010 ("กิน ข้าว", diagnostic),
  F-0011 ("ฉันกินข้าว" sentence, no match)
- **Friction type:** QUERY-FORM-UNMATCHED
- **Data basis:** FIXTURE (target presence: yes for F-0010; unknown for F-0009, F-0011)
- **Bucket:** **(b)-shaped but HELD** (not actionable now); the rejection itself is
  grounded-correct
- **Rationale:** F-0009/F-0010 hit the documented Thai-key whitespace rejection — that is
  correct, grounded behavior (Lexical Key Normalization Policy: Thai keys are
  whitespace-free; rejection surfaced as a diagnostic, already honestly rendered post-P1),
  not a defect. The underlying desire is Thai word segmentation / multi-token lookup, which
  the policy explicitly assigns to "the tokenizer/search abstraction," NOT lexical.
  Tokenization (`tokenizeText` / `buildSearchProjection`) is app-reachable, so a
  segment-then-per-token-lookup affordance maps to an existing surface (bucket b). But same
  hold as Cluster 5: FIXTURE-tagged, partial target-presence unknown, and the
  corpus/tokenizer path is held UNWIRED pending a mapping REAL signal. Bucket (c) N/A.
- **Recommended next action:** Hold. If this recurs on REAL data, scope an evaluation of a
  tokenizer-driven multi-token Thai lookup affordance (bucket b) — distinct from the
  exact-key lexical surface. No change to the (correct) whitespace-rejection behavior.
- **Operator disposition:** HELD under reachability-≠-warrant; re-evaluate only on REAL
  evidence.

---

### Cluster 9 — Entry genuinely absent

- **Entries:** F-0001 ("hello", no Thai entry)
- **Friction type:** ENTRY-ABSENT
- **Data basis:** FIXTURE
- **Bucket:** **None — closed as fixture-coverage noise**
- **Rationale:** The log's own rubric: ENTRY-ABSENT is weak evidence, "usually fixture size,
  not a capability gap." FIXTURE + ENTRY-ABSENT is doubly discounted; carries no warrant of
  any kind. Lookup behaved correctly (exact-key not-found).
- **Recommended next action:** None. Close.
- **Operator disposition:** Closed as fixture noise.

---

## Summary Table

| Cluster                    | Entries                | Bucket verdict          | Operator disposition                      |
| -------------------------- | ---------------------- | ----------------------- | ----------------------------------------- |
| 1 Direction not in title   | F-0004                 | (a) presentation        | Authorized — P2 slice                     |
| 2 Mixed-case echo          | F-0005                 | (a), guardrail-bound    | Closed as intended                        |
| 3 Homograph disambiguation | F-0006                 | (a) conditional         | Folded into Cluster 1 P2 slice            |
| 4 Romanization tone gap    | F-0003, F-0012         | data-content            | Data/core-schema-gated; no action         |
| 5 Token-in-gloss (en)      | F-0002                 | (b)-shaped, HELD        | HELD — re-eval on REAL                    |
| 6 Inflection/stemming (en) | F-0008                 | not-present, discounted | Core-governance-class if REAL accumulates |
| 7 Punctuation adjacency    | F-0007, F-0013         | key-norm policy/core    | Core-governance-class if REAL accumulates |
| 8 Thai multi-token         | F-0009, F-0010, F-0011 | (b)-shaped, HELD        | HELD — re-eval on REAL                    |
| 9 Entry absent             | F-0001                 | fixture noise           | Closed                                    |

**One genuinely actionable app-tier item** (Cluster 1, with Cluster 3 folded in) and Cluster
2 closed as intended. Everything capability-shaped (5, 6, 7, 8) is FIXTURE-capped — no
bucket (c) warrant leaves this review, and the two reachable-surface candidates (5, 8) stay
HELD under the reachability-≠-warrant / UNWIRED-pending-REAL-signal discipline.
