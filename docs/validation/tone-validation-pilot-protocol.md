# Thai Tone-Validation Pilot Protocol (Calibration-Only)

> **Status:** Planning artifact — records operator decisions on the tone-validation pilot
> methodology. Calibration-only; no pass/fail gate applies at the pilot stage.
> Version-pinned to `tltk` 1.10 under the ADR-0017 derived-artifact-lineage concept
> (generator identity + generator version + input headword lineage).
> **Authorizes no execution**: building or annotating the pilot, running `tltk`, installing
> dependencies, sourcing annotators, or any subsequent step requires a separate operator
> authorization.

## Preamble — Nature and Scope of This Pilot

This is an **exploratory / calibration-only** pilot. It is **not** a formal pass/fail
validation. Its four purposes are: (1) test the annotation process; (2) estimate rough
`tltk` behavior; (3) expose scoring/comparison issues; (4) inform proposal-only threshold
candidates for the later full gold set.

The pilot computes metrics **as estimates** and applies **no pass/fail thresholds**. The
formal composite quality gate — an overall whole-word exact-match gate **plus** an
independent §4-irregular-stratum floor, with per-syllable tone accuracy diagnostic-only —
applies **only to the later full validation set, after thresholds are fixed**, and is out of
scope here.

**Standing constraints (binding on this protocol):**

- The pilot is **calibration-only**; no pass/fail gate is applied at the pilot stage.
- Validation is **version-pinned to `tltk` 1.10** under the ADR-0017 derived-artifact-lineage
  concept. A version bump requires re-validation.
- The pilot lives **untracked / sandboxed, spike-style** (alongside the existing
  `.spike-local/` boundary); it touches **no tracked repository data**, no `src/core`, no
  `apps/usethai`, no `DATA_SOURCES.md` promotion.
- **Ground truth is human annotation only.** The licensed-reference / pronunciation-dictionary
  path is **closed** for this track; any licensed dictionary is a separate future
  sourcing/governance decision.
- This protocol **authorizes nothing**: building or annotating the pilot, running `tltk`,
  installing dependencies, sourcing annotators, or any later step is a **separate operator
  authorization**.
- **Out of scope and not advanced here:** the §9 derived-provenance-shape assessment; the
  override/exception-table provenance thread; ingestion; Volubilis; any precompute pipeline;
  any generated-data commit; any type, field, schema literal, normalizer, scoring tool, or
  storage representation. No file edits to tracked source.
- No actual Thai headwords are selected, listed, or invented in this protocol. Strata are
  defined by **linguistic characteristic**; allocation is expressed as **planning-target
  counts/proportions** only.

---

## Section 1 — Pilot Strata

### 1.1 Strata defined by linguistic characteristic

The pilot is stratified into the **six §4 failure categories** from the tone-generation
feasibility spike (`docs/spikes/tone-generation-feasibility-spike.md`), plus **one contrast
stratum**:

1. **Loanwords** — recent English / Pali–Sanskrit loans whose spoken tone the orthographic
   rule would not predict (unwritten/irregular tone; silent letters; inherent-vowel patterns).
2. **Proper nouns** — names/places, idiosyncratic and often un-tone-marked in writing while
   tone-bearing in speech.
3. **Ambiguous / irregular spellings** — orthography underspecifies vowel length or consonant
   class; the rule table has more than one admissible reading.
4. **Compounds** — tone correctness depends on correct syllable boundary; compounding
   introduces boundary ambiguity and optional linking vowels (error inherited from
   segmentation).
5. **Implicit / unwritten vowels** — inherent vowels written by omission that the generator
   must insert, changing syllable count and resulting tone.
6. **Leading-consonant / false-cluster cases (อักษรนำ)** — a leading consonant governs the
   class (hence tone) of the following syllable; distinguishing a true initial cluster from a
   leading-consonant pair is a classic rule ambiguity that directly flips the predicted tone.
7. **Regular / rule-table-obeying contrast stratum** — items whose tone the §1 decision table
   is expected to assign correctly. This stratum is required so the overall-vs-§4 distinction
   is measurable and so the routing-3c "clearly weak on regular vocabulary" signal can be read;
   without it, a weak-on-regular outcome could not be distinguished from a weak-on-everything
   outcome.

No headwords are selected for any stratum. The operational definition of "regular" and actual
headword selection/sourcing are **deferred** to a separately authorized execution-planning
step and are not defined here.

### 1.2 Stratum overlap handling — decided

Each item carries one **primary stratum label** (used for allocation, cell-count, and accuracy
math) plus a lightweight **"also exhibits" overlap flag set** (used for qualitative diagnosis
only; never included in cell-count or accuracy computations).

This keeps per-stratum counts partitioned and scoring clean, while preserving the overlap
signal at the intersections most likely to drive `tltk` failure. Overlap flags feed qualitative
diagnosis at the routing stage; they do not enter any metric.

---

## Section 2 — Sample Allocation

### 2.1 Planning target and posture

**Planning target: 240 items.** This is a **planning target only — it is not execution
authorization**. Building or running the pilot requires a separate operator authorization.

Allocation shape: **Shape B** — §4-weighted (~70–75% across the six §4 strata, roughly even
per category) with a defensible regular contrast cell (~25–30%).

**Rationale:** the regular contrast is load-bearing for two of the three routing signals (the
overall-vs-§4 separation and the routing-3c "weak on regular vocabulary" trigger). An
under-powered regular cell would blunt the pilot's main diagnostic purpose. Even per-§4 depth
is the default; per-category weights can be revisited at execution-planning time if product
reasoning changes.

**Small-cell caveat (binding):** at this band, each per-stratum cell is too small for
confirmation. The pilot is **directional only** — it estimates, it does not confirm. No
per-stratum estimate may be read as a quality measurement, and no threshold may be derived
directly from a single cell.

### 2.2 Approximate per-stratum planning allocation (planning-only ranges — not execution authorization)

At 240 items and Shape B proportions, the approximate planning-target ranges are:

- **Six §4 strata combined:** ~168–180 items (~70–75%)
  - Per §4 stratum (roughly even, six strata): ~28–30 items each
- **Regular contrast stratum:** ~60–72 items (~25–30%)

These ranges are **planning-target only**. Exact counts are operator-set at execution-planning
time.

### 2.3 Per-stratum minimums — to be set at execution-planning time

Each §4 stratum must carry enough items for a directional read and enough double-annotated
items to estimate inter-annotator agreement (Section 5). These are two distinct minimums:

- a **per-stratum directional-read minimum** (single-annotated population per cell);
- a **per-stratum double-annotated minimum**, prioritizing §4 strata.

Both minimums are **to be set by the operator at execution-planning time**. No numeric floor
is proposed here; a per-cell numeric floor at the planning stage would edge toward a threshold,
which is out of scope for a calibration pilot.

---

## Section 3 — Annotation Sheet Content (Plain-Document Headings Only)

The full annotation load is retained. This section describes **annotation-sheet headings
only**. It builds nothing, instantiates nothing, selects no headwords, and proposes no
repository type, field, contract, or schema. The sheet is a plain working document in the
untracked sandbox. Ground truth is human-only.

### 3.1 Per-item headings

- **Opaque item id** — an arbitrary non-meaningful handle; carries no orthographic or tonal
  information and no lineage to any tracked artifact.
- **Primary stratum label** — the item's single primary stratum (Section 1.2), used in
  allocation, cell-count, and accuracy math.
- **Overlap flags ("also exhibits")** — the lightweight secondary-characteristic flag set
  (Section 1.2), used for qualitative diagnosis only.
- **Orthographic-input slot** — empty at the protocol stage; to be populated only when the
  build step is separately authorized. No headword is entered here.
- **Whole-word IPA-with-tone-digit transcription** — the annotator's transcription of the
  entire word in the agreed comparison form (Section 4.1).
- **Per-syllable IPA-with-tone-digit transcription** — the annotator's transcription at
  per-syllable granularity. Required independently of the whole-word line because tone is
  assigned per syllable.
- **Annotator syllable segmentation** — the annotator's own syllable boundaries, recorded
  explicitly. Segmentation disagreement must be separable from tone disagreement at scoring
  and adjudication (Sections 4 and 5).
- **Uncertainty / notes** — free text for the annotator's reasoning and stated uncertainty.
  Annotator reasoning only; **must not be a licensed-dictionary citation** (the
  licensed-reference path is closed).

### 3.2 Double-annotation / adjudication headings

- **Annotator id** — opaque identifier of the annotator producing the primary transcription.
- **Second transcription** — the independent second annotator's whole-word and per-syllable
  IPA-with-tone-digit transcription plus their own syllable segmentation, for the
  double-annotated subset.
- **Agreement flag** — records whether the two transcriptions agree, using the
  segmentation-vs-tone distinction (Section 5.3).
- **Adjudicated final** — the human-adjudicated final transcription for items routed to
  adjudication.

---

## Section 4 — Scoring Procedure (Estimates Only — No Thresholds)

All scoring produces **estimates**. **No pass/fail threshold is applied** at the pilot stage.

### 4.1 Comparison form — decided

The generator side uses `tltk`'s `th2ipa` output — IPA with tone digits (syllables separated
by `.`, tone digits 1–5 per syllable) — consistent with the canonical IPA-with-tone-digit
evaluation notation.

For the **whole-word exact-match spine**: syllable separators are **normalized out / ignored**
before comparison, so the whole-word comparison is segmentation-agnostic and uncontaminated
by segmentation disagreement.

This is a **measurement requirement only**: it names the comparison form and the
separator-normalization rule; it designs no normalizer, tool, type, field, or storage
representation.

### 4.2 Metrics computed (as estimates)

- **Whole-word exact match** — the share of items whose `tltk` `th2ipa` whole-word output
  (separators stripped) exactly matches the human ground truth whole-word transcription
  (separators stripped), reported **overall** and **per stratum**. This is the metric the
  later full gate is built on; here it is a directional estimate only.
- **Per-syllable tone accuracy** — share of syllables with a matching tone digit, reported
  **overall** and **per stratum**, **diagnostic-only** (Section 4.3). Per-syllable accuracy
  **never substitutes** for the whole-word measure.

Every per-stratum estimate is reported **with explicit uncertainty** and a restated small-cell
caveat (Section 2.1). No estimate is presented as a measurement or a bar.

### 4.3 Per-syllable scoring — segmentation handling — decided

Per-syllable tone accuracy is computed **only over items where the annotator's syllable
segmentation and `tltk`'s internal syllabification agree** (matching syllable count and
boundaries). Items where they diverge are recorded as **"segmentation-divergent"** and
excluded from the per-syllable tone estimate; they are still scored for whole-word exact match.

**The segmentation-divergence rate is a first-class pilot finding**, reported independently.
A high divergence rate signals either a methodology issue or a structural segmentation
challenge for these categories, and directly feeds routing outcome (b).

**Interpretation caveat:** for §4-heavy strata — especially compounds and
leading-consonant/false-cluster cases — per-syllable tone diagnostics may be thin because
segmentation divergence rates may be high for these categories. This is acceptable provided
the segmentation-divergence rate is treated as a primary diagnostic finding, not hidden.

---

## Section 5 — Adjudication Procedure (§4-Prioritized Double-Annotated Subset)

Applies to the **double-annotated subset**, which prioritizes §4 strata (Section 2.3).
Adjudicators consult **neither a generator nor a licensed dictionary** — generator-independence
and the closed licensed-reference path are preserved throughout.

### 5.1 Inter-annotator agreement — decided

Simple, separately-reported rates:

- **Segmentation-agreement rate** — proportion of double-annotated items where both annotators
  produce the same syllable segmentation.
- **Tone-agreement rate** — proportion of double-annotated items (or syllables on
  segmentation-agreeing items) where both annotators produce the same tone digit.

No chance-correction is applied at pilot scale. Both rates are explicitly labelled directional
and uncertainty-bounded. Chance-corrected statistics are deferred to the later full set, where
cell sizes can support them.

### 5.2 Adjudication step — decided

A **single designated qualified adjudicator** resolves disagreements under a **written
segmentation-vs-tone adjudication rule**, recording the basis for each resolution. The
adjudicator **must be independent of both annotators who disagreed** on the item in question.

Generator-independence and the closed licensed-reference path are preserved: the adjudicator
consults neither a generator nor a licensed dictionary.

The qualified-annotator and qualified-adjudicator definitions — the competence and independence
bar, and the hard generator-independence constraint operationalized — are **operator-set** and
are not defined in this protocol.

### 5.3 Segmentation-vs-tone distinction in adjudication

In every disagreement, the adjudicator records whether the disagreement is:

- **Segmentation** — different syllable boundary choices;
- **Tone** — same boundaries, different tone digit assignment; or
- **Both** — disagreement on both dimensions simultaneously.

This distinction (a) keeps the per-syllable diagnostic honest (Section 4.3) and (b) feeds
routing: a disagreement pattern dominated by segmentation divergence routes toward outcome (b)
revisit methodology, not toward an accuracy conclusion.

---

## Section 6 — Routing Decision Table

This table encodes the three broad pilot outcomes. It is **explicitly not a set of formal
thresholds**. All signals are read as **directional, uncertainty-bounded estimates** at small
cell sizes; no numeric bar is attached to any entry. The **formal composite gate** — overall
whole-word exact-match gate plus an independent §4 floor, with per-syllable tone accuracy
diagnostic-only — is **reserved for the later full set after thresholds are fixed**.

Signals are keyed off two families:

- **PROCESS signals** — inter-annotator agreement (segmentation and tone, Section 5); whether
  comparison-form alignment and scoring can be performed cleanly (Section 4);
  segmentation-divergence rate.
- **DIRECTIONAL accuracy signals** — rough whole-word and per-syllable estimates on
  **regular** vs. **§4** strata.

| Outcome                                       | PROCESS signals                                                                                                                                                               | DIRECTIONAL accuracy signals                                                                                                                | Routing                                                                                                                                                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **(a) Proceed to full gold-set planning**     | Annotation works; segmentation and tone agreement are adequate (directional); comparison-form alignment and scoring performed cleanly; segmentation-divergence rate tractable | `tltk` directionally promising — plausibly strong on regular, with §4 weakness concentrated as expected (not catastrophic across the board) | Proceed to **full gold-set planning** (where formal thresholds are then fixed and the composite gate is defined). No threshold is set by the pilot.                                                                      |
| **(b) Revisit methodology**                   | Annotation agreement poor; or comparison-form alignment/scoring cannot be performed cleanly; or segmentation-divergence rate is high and unresolved                           | Accuracy signals **uninterpretable** because process problems prevent clean measurement                                                     | **Revisit methodology** — refine annotation guidance, qualified-annotator definition, comparison form, or segmentation-handling before any full set. Adjudication disagreement patterns (Section 5.3) feed this outcome. |
| **(c) Investigate ML comparator feasibility** | Process is sound (annotation and scoring work cleanly)                                                                                                                        | `tltk` **clearly weak** — especially **weak on regular vocabulary** (the routing-3c signal) or **severely weak on §4 strata**               | Open an **ML comparator feasibility investigation only** (thaig2p / thaig2p_v2), subject to all three preconditions below. **Authorizes no ML run.**                                                                     |
| **(Ambiguous / inconclusive)**                | Mixed or borderline process signals                                                                                                                                           | Mixed or borderline accuracy signals; small cells leave the read genuinely unclear                                                          | **Route back to operator judgement** — expand the pilot, revise methodology, or re-decide. Do not force a call into (a)/(b)/(c).                                                                                         |

### 6.1 Outcome (c) preconditions

Outcome (c) opens an ML comparator **feasibility investigation only**, and only when **all
three** preconditions are met:

1. **Runnable environment** — a Python environment in which the ML G2P engines
   (`thaig2p`/`thaig2p_v2`) actually run. (The feasibility spike could not run them: no
   `cp314` torch/onnx wheel on the available interpreter.)
2. **Determinism-at-pin** — verified deterministic output at a pinned model + library version.
   (The spike marks this plausible but unverified for the ML paths.)
3. **Model-version pinning** — model weights pinned as an explicit additional version axis
   under the ADR-0017 lineage concept (generator identity + generator version + input headword
   lineage).

Even with all three met, outcome (c) **authorizes no ML run** — only an investigation into
feasibility. ML comparator logic otherwise remains deferred and out of scope.

### 6.2 What this table does not do

It sets no thresholds, defines no pass/fail bar, and does not stand in for the later formal
gate. It is a **routing aid for operator judgement** at the end of a calibration exercise.

---

## Decisions of Record

The following decisions are recorded in this protocol. They are **methodology decisions only**;
none authorizes execution, data, dependencies, tooling, or any tracked-repository change.

- **Strata:** six §4 failure categories (loanwords; proper nouns; ambiguous/irregular
  spellings; compounds; implicit/unwritten vowels; leading-consonant/false-cluster) plus one
  regular contrast stratum. Operational definition of "regular" and headword selection are
  deferred to execution-planning.
- **Overlap handling:** primary stratum label (for allocation/scoring) plus lightweight
  "also exhibits" overlap flags (qualitative diagnosis only; never in cell-count or accuracy
  math).
- **Planning target:** 240 items, Shape B (~70–75% §4 over six failure categories / ~25–30%
  regular contrast; §4 strata roughly even, ~28–30 items each).
- **Comparison form:** `tltk` `th2ipa` output (IPA with tone digits 1–5, `.`-separated);
  syllable separators normalized out / ignored for the whole-word exact-match spine.
- **Whole-word exact match:** segmentation-agnostic (separators stripped before comparison);
  primary pilot metric and the metric the later formal gate is built on.
- **Per-syllable diagnostic:** computed only on segmentation-agreeing items; segmentation-
  divergence rate is a first-class pilot finding, reported independently.
- **Agreement measure:** simple, separately-reported segmentation-agreement and
  tone-agreement rates; no chance-correction at pilot scale; labeled directional and
  uncertainty-bounded.
- **Adjudication:** single designated qualified adjudicator, who must be independent of both
  annotators who disagreed on the item, operating under a written segmentation-vs-tone
  adjudication rule; no generator or licensed-dictionary consultation.
- **Routing:** three broad outcomes (proceed to full gold-set planning / revisit methodology /
  ML-feasibility-investigation) plus ambiguous→operator-judgement; directional signals only;
  formal composite gate reserved for the full set after thresholds are fixed.
- **ML comparator:** deferred unless outcome (c) is triggered and all three preconditions are
  met (runnable environment; determinism-at-pin; model-version pinning). Authorizes no ML run.

## Remaining to Set at Execution-Planning Time

The following are **not defined in this protocol** and must be set by the operator before any
execution step is authorized:

- **Per-stratum directional-read minimum** — the minimum single-annotated item count per cell
  for the pilot to yield a directional read.
- **Per-stratum double-annotated minimum** — the minimum double-annotated item count per cell,
  prioritizing §4 strata.
- **Operational definition of "regular"** — the linguistic criteria distinguishing items the
  §1 decision table is expected to serve correctly.
- **Qualified-annotator and qualified-adjudicator bar** — the competence and independence
  definition; the hard generator-independence constraint operationalized.
- **Any residual comparison-form symbol edge cases** — e.g. diacritic normalization variants
  within the IPA-with-tone-digit scheme, discovered during execution.

**No step listed above is authorized by this protocol. Building or annotating the pilot,
running `tltk`, installing dependencies, sourcing annotators, or any other execution step
requires a separate, explicit operator authorization.**
