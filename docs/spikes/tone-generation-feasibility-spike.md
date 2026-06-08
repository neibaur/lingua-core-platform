# Thai Tone-Generation Feasibility Spike

> **Status: throwaway investigation spike.** This document is a written report
> only. It touches neither `src/core` nor `apps/usethai`, authorizes no core
> implementation, no contract change, no ingestion, and adds no governed
> dependency. No §9 implementation assessment is required and none is performed;
> this report emits no PRE-IMPLEMENTATION ASSESSMENT token and no PA.1–PA.8
> format. Any future generator, contract extension, override table, or ingestion
> path implied below must go through the normal core governance process.

## Scope and method

This spike determines whether **Thai tone-marked learner pronunciation can be
generated from Thai orthography** with (a) acceptable accuracy and (b) on terms
compatible with the platform's determinism / replay-safe posture, for UseThai. It
is motivated by the Volubilis data-shape finding that the candidate dictionary
carries **vowel length but no native tone** (`docs/spikes/volubilis-data-shape-spike.md`
§2): a tone-marked surface, the obvious learner-facing value, would have to be a
**generated, derived artifact**, not lifted from source.

Candidate libraries, models, and their dependencies were installed into a local,
untracked, throwaway virtualenv (`.spike-local/venv/`, covered by the existing
`.gitignore` entry on line 7) and exercised over generic illustrative tokens only.
No governed dependency was added to any project manifest. No third-party
dictionary rows or bulk generated output are reproduced here; only library/version
facts, license facts, aggregate behavior, determinism hashes, and a handful of
short generic tokens used to **name** error categories are reported. All findings
are pinned to the versions recorded in §9.

Per the spike's execution boundary, **no local binary or platform tool was run
against any file under `src/core` or `apps/usethai`**, and the project's own
scripts were not run against them. Contract-fit below is reasoned purely by reading
the named TypeScript and Markdown source files. Candidate evaluation ran **only**
inside the throwaway virtualenv over local data, never touching the tracked source
tree.

Core source consulted (read-only) to ground the representability answer:

- `src/core/lexical/contracts.ts` — `LexicalEntry` (the `romanized?` slot),
  `LexicalDefinition`, `LexicalPartOfSpeech`.
- `src/core/lexical/spelling/spelling-entry.ts` — `SpellingEntry`, the existing
  `phoneticNotation` and `toneClassification` fields (the closest existing
  representation of pronunciation and tone).
- `src/core/lexical/provenance/dictionary-source-provenance.ts`,
  `dictionary-licensing-boundary.ts`, `canonical-dictionary-entry.ts`.
- `ARCHITECTURE.md` — "Lexical Key Normalization Policy," "Pluggable Tokenizer And
  Search Abstraction," "Public Core And Future Private Envelope," and Explicit
  Non-Goals; `.claude/HANDOFF_TEMPLATE.md` — REPLAY-SAFE GOVERNANCE LAW and STATIC
  RESOLUTION LAW.

---

## 1. The Thai tone rule system (characterized, not implemented)

Surface tone of a Thai syllable is, in the regular case, a **deterministic
function of four orthographic inputs**, which is the structural reason rule-based
generation is feasible at all:

1. **Initial-consonant class** — high / mid / low (a fixed three-way partition of
   the consonant inventory).
2. **Syllable liveness** — _live_ (long vowel, or a sonorant `-m -n -ŋ -j -w`
   final) vs. _dead_ (short vowel in an open syllable, or a stop `-p -t -k`
   final).
3. **Tone mark**, if any — one of four (_mai ek, mai tho, mai tri, mai chattawa_)
   or none.
4. **Vowel length** — short vs. long, which changes the outcome for dead
   syllables and interacts with class.

The cross-product of {class} × {live/dead} × {mark / no mark} × {length} maps onto
the five surface tones (mid, low, falling, high, rising). This is a **finite,
closed decision table** — the favourable case for a deterministic, replay-safe
generator. The difficulty is not the table; it is (i) obtaining the _inputs_ the
table consumes (syllable boundaries, the correct vowel-length and class reading of
an ambiguous spelling) and (ii) the words that **do not obey the table**, treated
in §4.

---

## 2. Syllable segmentation is a precondition (and where it gets ML-shaped)

Tone is assigned **per syllable**, so any generator must first divide a headword
into syllables and identify each syllable's initial, vowel, and final. Two
distinct segmentation needs are involved, and they must not be conflated:

- **Word segmentation** — splitting running text / multi-word expressions into
  words. PyThaiNLP's default `newmm` is **dictionary-based maximal matching**:
  rule/dictionary-driven and deterministic at a pinned dictionary version
  (verified: identical hash across repeated calls). `longest` is likewise
  dictionary-based.
- **Syllable segmentation** — PyThaiNLP's `syllable_tokenize` default path is a
  **CRF (machine-learned) sequence model** (it failed in this venv precisely
  because it requires the `pycrfsuite` C-extension). That is an ML segmenter, with
  the replay caveats of §5.
- **In-generator syllabification** — `tltk`'s rule-based G2P performs its **own
  rule-based syllabification internally** (its output carries explicit `~`
  syllable separators), so for that candidate, segmentation-for-tone and
  tone-assignment travel together in one deterministic rule engine and do not
  require the CRF path.

**Cross-reference (single, light, and bounded).** Syllable segmentation overlaps
the Thai-segmentation territory of the **HELD Cluster 8** (Thai multi-token) in
`.claude/SESSION_STATE.md`. The relationship is noted, but the warrant is
**separate**: segmentation-for-tone is a **precompute / ingestion-time** concern
(run once, offline, when a derived surface is generated), whereas
segmentation-for-search-query is a **runtime** concern. Tone feasibility is **not**
a reason to wire search, and nothing here advances any search-capability warrant.

---

## 3. Candidate engines evaluated

All candidates were installed and (where the interpreter permitted) executed in the
throwaway venv. The host interpreter is **Python 3.14.4** — bleeding-edge — which
is itself a material finding: every machine-learned or native-extension path lacked
a `cp314` wheel and could not be built without a C/C++ toolchain, while the
**pure-Python rule-based** paths installed trivially. The toneless engines are the
ones that installed cleanly; the tone-bearing rule engine required dependency
surgery (see §9).

| Candidate (engine)                                             | Approach                                                              | Carries tone?                                       | Ran here?                               | Dependency reality on Py 3.14                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| PyThaiNLP `romanize(engine="royin")`                           | Rule-based RTGS romanization                                          | **No** (RTGS is toneless by design)                 | Yes                                     | Pure Python (`re`)                                               |
| PyThaiNLP `transliterate(engine="iso_11940")`                  | Orthographic transliteration (reversible char map)                    | **No** (transliterates spelling, not pronunciation) | Yes                                     | Pure Python                                                      |
| PyThaiNLP `transliterate(engine="thaig2p")`                    | **ML** seq2seq grapheme→phoneme (IPA **with tone**)                   | **Yes**                                             | No                                      | Needs `torch` + runtime-downloaded model; no `cp314` torch wheel |
| PyThaiNLP `transliterate(engine="thaig2p_v2")`                 | **ML** transformer G2P                                                | **Yes**                                             | No                                      | Needs `transformers` (→`torch`)                                  |
| PyThaiNLP `transliterate(engine="thai2rom")` / `thai2rom_onnx` | **ML** romanizer                                                      | **No** (romanization, not tone)                     | No                                      | `torch`, or `onnxruntime`+`numpy` for the ONNX path              |
| **`tltk` `g2p` / `th2ipa`**                                    | **Rule-based** G2P (IPA **with tone**, internal rule syllabification) | **Yes**                                             | **Yes** (after dependency stubbing, §9) | Pure-Python rule tables, but its package pulls heavy deps        |
| PyThaiNLP `transliterate(engine="ipa")`                        | `epitran` rule mapping                                                | Partial                                             | No                                      | `epitran`→`editdistance` C-extension, no `cp314` wheel           |

**Observed behavior (the two engines that ran).**

- `royin` confirmed **toneless**: it emits Royal Thai General System strings with
  no tone diacritic or tone digit on any token. (It also showed minor
  segmentation/transcription artifacts on a couple of inputs — noted only to
  confirm it is a lossy, toneless romanizer, not a pronunciation source.)
- `tltk` **rule-based G2P produced tone-marked output** for every test token, in
  two notations: its native phonetic scheme (syllables separated by `~`, a
  trailing **tone digit 0–4** per syllable) and IPA via `th2ipa` (syllables
  separated by `.`, a trailing **tone digit 1–5** per syllable). Tone is present on
  ~100% of syllables, as a tonal language requires — the decisive contrast with the
  Volubilis romanization columns (~3% tone-bearing, §2 of that spike).

`tltk` is therefore the only **rule-based, tone-bearing, runnable** candidate found;
`thaig2p`/`thaig2p_v2` are the **ML** tone-bearing alternatives (not runnable on
this interpreter, characterized from their source imports and published basis, not
measured here).

---

## 4. Known exception categories (where rule-based tone fails or is ambiguous)

Each is reported as a **named error category**. These are the cases where the §1
decision table either lacks a correct input or is overridden by convention. Short
generic tokens are used only to name a category; no dataset content is reproduced.

1. **Loanwords (esp. English / Pali–Sanskrit).** Recent loans frequently carry a
   spoken tone that the orthographic rule would not predict (unwritten/irregular
   tone), and Indic loans introduce silent letters and inherent-vowel patterns the
   table mis-reads. (Category namer: a transliterated _computer_-type loan — the
   rule engine assigns a plausible but not authoritative tone.)
2. **Proper nouns (names, places).** Idiosyncratic and often un-tone-marked in
   writing while tone-bearing in speech; no general rule recovers the intended
   tone. (Namer: a _Bangkok_-type place name.)
3. **Ambiguous / irregular spellings.** Where orthography underspecifies vowel
   length or class, the table has more than one admissible reading and must guess.
4. **Compounds.** Tone is correct only if the **syllable boundary** is correct;
   compounding introduces boundary ambiguity and optional linking vowels, so the
   error is inherited from §2 segmentation rather than from the tone table itself.
5. **Implicit / unwritten vowels.** Thai writes many inherent vowels by omission
   (e.g. inherent `-a-`/`-o-` in consonant sequences); the generator must _insert_
   them, and the choice changes both the syllable count and the resulting tone.
6. **Leading-consonant / false-cluster cases (อักษรนำ).** A leading consonant can
   govern the class — hence the tone — of the following syllable; distinguishing a
   true initial cluster from a leading-consonant pair is a classic rule-based
   ambiguity that directly flips the predicted tone.

These categories are the structural argument for an **override / exception table**
(§7) rather than rule output alone.

---

## 5. Determinism and replay-safe fit (per candidate, two distinct properties)

The two properties the spike was asked to separate, reported independently:

- **(a) Deterministic at a pinned version** — same input → same output.
- **(b) Replay-stable across versions** — whether output can change between
  library/model versions.

| Candidate                                    | (a) Deterministic at pin?                                                                                                     | (b) Replay-stable across versions?                                                                                         | Basis                                             |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `tltk` rule G2P (`g2p` / `th2ipa`)           | **Yes — verified.** Byte-identical SHA-256 over the test set across **three independent fresh processes**                     | **No** — rule-table edits between `tltk` releases can change output; stability holds **only** within a pinned version      | Measured here (§9 hash)                           |
| PyThaiNLP `royin` (rule)                     | Yes (rule-based; toneless — not a tone candidate)                                                                             | No (RTGS/dictionary edits across releases)                                                                                 | Observed                                          |
| PyThaiNLP `newmm` word seg                   | Yes — identical hash across calls                                                                                             | No (bundled dictionary changes across releases)                                                                            | Measured here                                     |
| PyThaiNLP `thaig2p` / `thaig2p_v2` (ML tone) | **Plausibly (a)** under greedy/deterministic decode at a pinned model + library, **but not verified here** (no `torch` wheel) | **No** — model weights and library versions change output across releases; this is the classic (a)-yes / (b)-no ML profile | Source inspection + published basis, not measured |
| PyThaiNLP `thai2rom(_onnx)` (ML, toneless)   | Plausibly (a) at pinned weights                                                                                               | No                                                                                                                         | Not measured                                      |
| PyThaiNLP CRF `syllable_tokenize` (ML seg)   | Plausibly (a) at pinned model                                                                                                 | No                                                                                                                         | Could not run (needs `pycrfsuite`)                |

**Relation to the platform laws.** A generated pronunciation surface, **if ever
stored**, would be **PRECOMPUTED derived data**, produced offline by a pinned
generator and committed as a static artifact — **never a runtime model call**.
This is required by the REPLAY-SAFE GOVERNANCE LAW (`.claude/HANDOFF_TEMPLATE.md`:
no `Date.now()`, randomness, hash-/model-derived values at runtime; caller-supplied
primitives only), the STATIC RESOLUTION LAW (no runtime registries, plugins, async
orchestration, ambient discovery), and the ARCHITECTURE Explicit Non-Goal **"No AI
dependency as a core runtime requirement."** Consequences per candidate:

- **`tltk` rule G2P** and **PyThaiNLP rule paths** are compatible with a
  **precompute-and-store** model: deterministic at a pin (property a), so the
  pinned generator version becomes part of the artifact's lineage; property (b) is
  managed by treating a generator-version bump as a deliberate, audited
  regeneration.
- **`thaig2p` / `thaig2p_v2` (ML)** are compatible with precompute-and-store
  **only** as an offline generator — never as a runtime dependency — and they
  carry a heavier (b) burden (weights are an additional version axis). They are
  **incompatible** with any runtime-inference shape, which the laws prohibit
  regardless.

The dividing line is **precompute (allowed for any deterministic-at-pin generator)
vs. runtime inference (prohibited for all)** — not rule-vs-ML per se, though the
rule engine has the smaller version surface and the cleaner audit story.

---

## 6. Representability of generated tone as derived data (no fields proposed)

Generated tone is a **DERIVED artifact** whose lineage is _(generator identity +
generator version + input headword lineage)_. It is **not** source-provenanced
Volubilis data and must never be conflated with it. Grounding the representation
question against the **actual** fields in source (no change proposed):

- **`LexicalEntry`** (`contracts.ts`) and **`CanonicalDictionaryEntry`**
  (`canonical-dictionary-entry.ts`) expose exactly **one** pronunciation-adjacent
  slot: `romanized?: string` (optional, free string). There is **no** phonetic,
  IPA, or tone field on either type, and **no** field expressing how a value was
  derived.
- **`SpellingEntry`** (`spelling-entry.ts`) is the **closest existing
  representation of pronunciation and tone**: it carries `phoneticNotation:
string` and `toneClassification: string`, both **required, non-empty** strings,
  wrapping a `CanonicalDictionaryEntry`. These two fields can **hold** generated
  values (a phonetic string and a tone label), but they record **only the value,
  not its derivation**: there is no generator id, no generator version, and no link
  to the input headword's lineage.
- **`DictionarySourceProvenance`** (`dictionary-source-provenance.ts`) is shaped
  for **source** datasets — `sourceId`, `displayName`, `sourceUrl`, `licenseType`,
  `licenseUrl`, `attributionRequired`, `attributionPayload`. Reusing it to describe
  a _generator_ would **conflate generated tone with source data**, which is
  exactly the conflation this spike is required to prevent.

**Representability gap (flag, not a change — mirrors the Volubilis ShareAlike
flag).** The current contracts can **store a generated tone/phonetic value** (in
`SpellingEntry.toneClassification` / `phoneticNotation`, or a romanized string in
`romanized?`), but they **cannot represent derived-artifact provenance** —
_(generator identity + generator version + input headword lineage)_ — for that
value **at all**. A generated pronunciation surface presently has **no provenance
home** distinct from source provenance. The artifact-classification marker
`generatedFrom` used elsewhere in the lexical layer (e.g. lookup-trace,
validation-report) classifies _internal computed artifacts_; it is not a content
provenance for an externally generated linguistic surface. This is an **observation
for governance**, not a proposed field.

---

## 7. Would an override / exception table be needed? (characterized, not designed)

Yes — almost certainly. The §4 categories (loanwords, proper nouns, ambiguous
spellings, leading-consonant cases, implicit vowels) are precisely where rule
output is wrong or underdetermined, and they cannot be fixed by improving the rule
table because the correct tone is **not recoverable from orthography**. The
conventional remedy is a curated **override table** keyed by headword that supplies
the correct pronunciation for known exceptions, consulted ahead of the generator.

Characterized (no contract designed): such a table would itself be **derived /
curated data** carrying its **own** provenance and licensing — _(who supplied the
correction, under what license, at what version)_ — and would inherit the same §6
representability gap, plus a human-curation provenance the source-provenance type
does not model. Whether overrides live as data or as a contract is a **core
governance decision**, out of scope here.

---

## 8. Licensing (posture-neutral, per candidate, version-pinned)

Verified from each project's own current sources in the installed packages
(`importlib.metadata`, the bundled `corpus_license.md`); not asserted from prior
knowledge. The product posture (commercial vs. CC BY-SA ShareAlike) is undecided,
so each candidate is classified so the result is usable under either.

| Candidate                                             | Version                                             | License                                                                                                                  | Class                                                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `tltk` (rule G2P — the runnable tone candidate)       | 1.10                                                | **BSD-3-Clause** (`importlib.metadata`: `License: BSD-3-Clause`)                                                         | **Commercial-safe** (attribution/notice retention)                                                                         |
| PyThaiNLP **library code**                            | 5.1.2                                               | **Apache-2.0** (`importlib.metadata`)                                                                                    | **Commercial-safe**                                                                                                        |
| PyThaiNLP **rule engines** (`royin`, `iso_11940`)     | 5.1.2                                               | Apache-2.0 (library code; no separate corpus)                                                                            | Commercial-safe                                                                                                            |
| PyThaiNLP **language models** (`thaig2p`, `thai2rom`) | per `default_db` catalog (runtime-downloaded)       | **CC-BY 4.0** — bundled `corpus_license.md`: "Language models created by PyThaiNLP project are released under CC-BY 4.0" | **Commercial-safe under attribution** (verify the specific model's catalog entry at download time; models are not bundled) |
| PyThaiNLP **CC0 word/syllable lists**                 | 5.1.2                                               | CC0 1.0 (`corpus_license.md`)                                                                                            | Commercial-safe, no attribution                                                                                            |
| PyThaiNLP **name corpora** (`*_names_*.txt`)          | 5.1.2                                               | **CC-BY-SA 4.0** (`corpus_license.md`)                                                                                   | **ShareAlike** — avoid unless posture permits SA                                                                           |
| `epitran` (`ipa` engine)                              | not installed (no `cp314` wheel for `editdistance`) | Apache-2.0 (epitran) per project; not verified in-venv                                                                   | Not evaluated                                                                                                              |

**Key licensing finding:** the **rule-based tone path (`tltk`, BSD-3-Clause) and
PyThaiNLP library code (Apache-2.0) are commercial-safe and posture-neutral.** The
**ML tone models are CC-BY 4.0** (attribution, also posture-neutral). The only
ShareAlike entanglement in this candidate set is PyThaiNLP's _name corpora_, which
the tone path does not require. Critically, this means **tone generation does not
inherit the Volubilis CC BY-SA ShareAlike question** — the generator and the
dictionary are independently licensed, and a tone surface generated from a Thai
headword by a BSD/Apache rule engine is not encumbered by Volubilis's SA term
(though the _headword's_ own source provenance still travels per §6).

---

## 9. Reproducibility (pinned versions, hashes, environment)

| Property           | Value                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Host interpreter   | **CPython 3.14.4** (64-bit, Windows) — only interpreter available; no 3.10–3.12 present                           |
| Isolation          | Throwaway virtualenv `.spike-local/venv/` (untracked; `.gitignore` line 7 `.spike-local/`)                        |
| Determinism probe  | `.spike-local/run_g2p.py` (untracked) — SHA-256 of `tltk` `g2p`+`th2ipa` over a fixed 7-token set                 |
| Determinism result | `134d5f0cc6424136f66a6cf2be08978bd212bc496f13173dc639f428c1d99f4f` — **identical across 3 independent processes** |

Pinned package versions (from `pip freeze` in the venv):

| Package            | Version | Role                                                      |
| ------------------ | ------- | --------------------------------------------------------- |
| `pythainlp`        | 5.1.2   | romanization/transliteration/segmentation engines         |
| `tltk`             | 1.10    | rule-based tone-bearing G2P (the runnable tone candidate) |
| `numpy`            | 2.4.6   | dep (ML paths)                                            |
| `pandas`           | 3.0.3   | `tltk` dep                                                |
| `nltk`             | 3.9.4   | `tltk` dep                                                |
| `scikit-learn`     | 1.9.0   | `tltk` dep                                                |
| `scipy`            | 1.17.1  | transitive dep                                            |
| `sklearn-crfsuite` | 0.5.0   | `tltk` dep (installed `--no-deps`)                        |
| `requests`         | 2.34.2  | `pythainlp` dep                                           |

**Reproducibility caveats (recorded honestly).**

- **No model file was downloaded or SHA-pinned**, because the tone _models_
  (`thaig2p`, `thai2rom`) require `torch`/`onnxruntime`, which have no `cp314`
  wheel; those engines were characterized from their source imports and published
  basis, **not executed**.
- To make `tltk`'s **rule-based** G2P importable on this interpreter (its package
  pulls `gensim`, used only for word-vectors, and `pycrfsuite`, used only for CRF
  segmentation — neither used by `g2p`), two **local, untracked, throwaway stub
  modules** (`gensim`, `pycrfsuite`) were placed in the venv's `site-packages` so
  the import chain completed. The stubs raise on any actual call, so they cannot
  have contributed to the rule G2P output; the determinism hash is over genuine
  rule-table output. This is an artefact of the bleeding-edge interpreter, not of
  the engine, and lives entirely inside `.spike-local/`.

**Honest accuracy framing.** "Acceptable accuracy" **cannot be measured here** —
there is no gold reference, and this spike asserts no accuracy number. Qualitatively:
the rule engine produced plausible tone on every test token (~100% syllable tone
coverage), and the §1 decision table is sound for _regular_ vocabulary; expected
real-world error concentrates in the §4 categories. Any quantitative figure must be
attributed to a specific candidate's own published benchmark at a stated version,
not presented as measured here. A validation methodology is proposed below.

---

## Recommended decision points

These are decisions for the operator, not a chosen course.

1. **Is tone a product requirement at all?** This is the upstream gate inherited
   from the Volubilis spike (decision point 1 there). If no, this whole surface is
   deferred. If yes, proceed.

2. **Rule-based vs. ML generator.** The rule engine (`tltk`, BSD-3-Clause) is
   deterministic-at-pin (verified), commercial-safe, has the smaller version
   surface and the cleaner audit story, and bundles its own rule syllabification.
   The ML engines (`thaig2p`, CC-BY 4.0) may have higher accuracy on irregular
   vocabulary but carry a heavier replay/version burden and could not be evaluated
   here. Decide which is the generator — both are precompute-only; neither may be a
   runtime dependency (REPLAY-SAFE / STATIC RESOLUTION / "no AI at runtime").

3. **Accuracy-validation methodology (proposed, not performed).** Before relying on
   any generator, establish a gold set: a stratified sample (e.g. ~1,000 headwords)
   drawn to over-represent the §4 categories (loanwords, proper nouns,
   leading-consonant cases), with ground-truth tone supplied by a qualified human
   annotator or a licensed reference pronunciation dictionary (not by another
   generator), scored by **per-syllable tone accuracy** and **whole-word exact
   match**. This produces a defensible accuracy figure the spike cannot.

4. **Tone/phonetic notation choice.** `tltk` offers two notations (its phonetic
   scheme with tone digits 0–4, and IPA with tone digits 1–5); other engines emit
   IPA. Decide the canonical learner-facing notation, since it determines what a
   `toneClassification` / `phoneticNotation` value would even contain.

5. **Derived-artifact provenance (the §6 representability gap).** Decide whether a
   stored generated surface must carry _(generator identity + generator version +
   input headword lineage)_, and if so, that the existing source-shaped
   `DictionarySourceProvenance` must **not** be overloaded for it — a new
   provenance representation would be a governed core change. Until then, the gap
   is a flag, not a field.

6. **Override / exception table (the §7 question).** Decide whether known-exception
   corrections are needed for launch quality, and if so, the governance/provenance
   shape of that curated data (its own license + human-curation lineage), as a
   separate core decision.

7. **Precompute pipeline boundary.** Confirm that generation is an
   ingestion-time / offline step producing a static artifact, consistent with the
   Volubilis spike's "any tone-marked surface would be generated, derived" finding
   and with the no-runtime-AI laws. Generation is a core initiative gated on
   decisions 1–2 and is **not** authorized here.

8. **Segmentation boundary discipline.** Keep segmentation-for-tone (precompute)
   strictly separate from any segmentation-for-search (runtime, HELD Cluster 8).
   This spike does not advance any search-capability warrant.

_End of report. No implementation is proposed or begun._
