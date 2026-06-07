# Volubilis Data-Shape Spike

> **Status: throwaway investigation spike.** This document is a written report
> only. It touches neither `src/core` nor `apps/usethai`, authorizes no core
> implementation, no contract change, and no ingestion. No §9 implementation
> assessment is required. Any future adapter, contract extension, or ingestion
> path implied below must go through the normal core governance process.

## Scope and method

This spike reads the comprehensive Volubilis multilingual Thai database to
determine how cleanly the source maps onto the platform's existing Phase 10/11
lexical contracts and lexical-key normalization policy, **with no core
changes**. The dataset was downloaded to a local, untracked location
(`.spike-local/`, covered by a new `.gitignore` entry) and inspected with a
throwaway local `openpyxl` script run from an isolated virtualenv. No governed
dependency was added. No source rows, cells, or derived records are reproduced
here; only column headers, controlled-vocabulary tag codes, counts, and
aggregate statistics are reported, all pinned to the recorded source version
(see §9).

Volubilis is third-party data licensed CC BY-SA 4.0 (rights-holder Francis
Bastien / "Belisan"); see `DATA_SOURCES.md` for the candidate audit record. The
dataset file itself is **not** committed.

Core source consulted (read-only) to ground the contract-fit and key-policy
answers:

- `src/core/lexical/contracts.ts` — `LexicalEntry`, `LexicalDefinition`,
  `LexicalPartOfSpeech`, `LexicalIndex`.
- `src/core/lexical/provenance/canonical-dictionary-entry.ts`,
  `dictionary-source-provenance.ts`, `dictionary-licensing-boundary.ts`.
- `src/core/lexical/identity/lexical-entry-id.ts` — `composeEntryId`.
- `src/core/lexical/normalization/normalize-lexical-key.ts`,
  `assert-no-whitespace.ts`, `thai-tone-mark-normalization-rule.ts`,
  `canonicalize-english-key.ts`, and the tokenizer normalization rules
  (`thai-digit-normalization`, `collapse-whitespace`, `trim-boundary-whitespace`).
- `src/core/lexical/index/lexical-index.ts` — how keys are derived at index build.
- `ARCHITECTURE.md` "Lexical Key Normalization Policy".

### Source structure observed

- One worksheet (`Volubilis`). Physical extent is 27 columns wide, but only the
  first **15** columns are named and populated; columns 16–27 are unused in
  every data row (0 populated cells).
- Row 1 is a title/banner row (project name, version label, entry count, project
  URL). Row 2 is the header row. Data begins at row 3.
- **114,177 data rows**, matching the version's stated entry count.

---

## 1. Exact column names and meanings

Fifteen named columns (header text as it appears in row 2, font hints stripped):

| #   | Header           | Holds (interpretation)                                                        |
| --- | ---------------- | ----------------------------------------------------------------------------- |
| 1   | `THAIROM`        | Primary Volubilis romanization of the Thai headword (Latin, with diacritics). |
| 2   | `EASYTHAI`       | Simplified ASCII-friendly transliteration (diacritic-free variant).           |
| 3   | `THAIPHON`       | Phonetic transcription of the headword (Latin, with diacritics).              |
| 4   | `ETYMO`          | Etymology / source-language note.                                             |
| 5   | `THA (Thai)`     | **Thai headword** (the lexical key on the Thai side).                         |
| 6   | `ENG (English)`  | English gloss(es). May pack multiple senses in one cell (see §5).             |
| 7   | `FRA (French)`   | French gloss(es).                                                             |
| 8   | `TYPE`           | Part-of-speech / entry-type tag (controlled vocabulary; see §6).              |
| 9   | `USAGE`          | Usage / register annotation.                                                  |
| 10  | `SCIENT/abbrev.` | Scientific name (taxa) or abbreviation expansion.                             |
| 11  | `DOM`            | Domain / subject-field label.                                                 |
| 12  | `CLASSIF`        | Thai classifier associated with the entry.                                    |
| 13  | `SYLLAB`         | Syllabification of the romanized/phonetic form.                               |
| 14  | `NOTE`           | Free-text note.                                                               |
| 15  | `SYN`            | Synonym(s).                                                                   |

**Ambiguous / inconsistent columns flagged:**

- **Three overlapping pronunciation columns** (`THAIROM`, `EASYTHAI`,
  `THAIPHON`). Their division of labour is not self-describing from the data:
  `THAIROM` and `THAIPHON` both carry diacritics and overlap heavily in shape,
  while `EASYTHAI` is a diacritic-stripped simplification. Choosing which is the
  authoritative `romanized` value is a judgement call, not a given (see §2, §6).
- **`TYPE` conflates several axes** — true part-of-speech tags, multi-word
  "expression" markers, proper-noun/organisation/trademark markers, and an
  explicit unknown marker — in a single field (see §6). It is not a clean POS
  enum.
- **`ENG` is multi-valued** — a single cell frequently packs several senses
  separated by `;` (see §5). It is a gloss _list_, not a single gloss.
- `SCIENT/abbrev.` overloads two unrelated meanings (scientific taxon name vs.
  abbreviation expansion) in one column.

---

## 2. Romanization: is tone present natively, or would it have to be generated?

**Conclusion: vowel _length_ is encoded natively; lexical _tone_ is not. A
tone-marked romanization would have to be generated by a transcriber
(e.g. Paiboon / PyThaiNLP), not lifted from the source.**

Basis (aggregate evidence over all 114,177 rows, measured by NFD-decomposing
each cell and classifying combining marks; no cell text inspected by hand):

- **No IPA.** Zero cells in any romanization column contain characters from the
  IPA Extensions / spacing-modifier blocks. There is no IPA column.
- **Vowel length is marked natively.** The combining **macron** (U+0304, the
  conventional long-vowel marker) appears in **~81.6%** of `THAIROM` cells and
  **~80.8%** of `THAIPHON` cells. This is systematic length marking.
- **Tone is not marked systematically.** Combining **tone** diacritics
  (grave / acute / circumflex / caron / breve — the conventional Thai tone set:
  grave = low, circumflex = falling, acute = high, caron = rising) appear in only
  **~3.4%** of `THAIROM` cells and **~3.3%** of `THAIPHON` cells. Critically, of
  those, **only the acute accent ever occurs** — grave, circumflex, caron, and
  breve are entirely absent from the corpus. Thai is a five-tone language in
  which essentially every syllable bears a tone; a romanization that encoded tone
  would show tone diacritics on close to 100% of cells and would use the full set
  of tone marks. Their near-total absence (and the complete absence of four of
  the five conventional tone marks) is decisive evidence that these columns do
  **not** carry tone.
- No tone-number convention is used either: no cell uses superscript tone digits,
  and ordinary digits appear in a negligible number of romanization cells.
- `EASYTHAI` carries effectively no diacritics (<0.3% with any combining mark) —
  it is an intentionally simplified ASCII-leaning form, neither tone- nor
  length-bearing.

So the source supports length-aware romanization out of the box, but any
tone-marked pronunciation surface (the obvious learner-facing value) would be a
**generated, derived artifact** requiring a transcriber and carrying its own
provenance/verification burden — it is not a property of the Volubilis data.

---

## 3. Field population counts

Counts are non-empty cells per column over 114,177 data rows.

| Column           | Populated rows | Proportion |
| ---------------- | -------------- | ---------- |
| `THAIROM`        | 114,177        | 100.0%     |
| `EASYTHAI`       | 114,175        | 100.0%     |
| `THAIPHON`       | 101,644        | 89.0%      |
| `ETYMO`          | 9,055          | 7.9%       |
| `THA` (headword) | 114,176        | 100.0%     |
| `ENG` (gloss)    | 106,140        | 93.0%      |
| `FRA` (French)   | 68,546         | 60.0%      |
| `TYPE` (POS)     | 114,169        | 100.0%     |
| `USAGE`          | 1,438          | 1.3%       |
| `SCIENT/abbrev.` | 7,979          | 7.0%       |
| `DOM` (domain)   | 66,110         | 57.9%      |
| `CLASSIF`        | 247            | 0.2%       |
| `SYLLAB`         | 74,409         | 65.2%      |
| `NOTE`           | 1,444          | 1.3%       |
| `SYN` (synonyms) | 2,415          | 2.1%       |

Mapping to the question's requested fields: Thai headword **114,176 (100%)**;
English gloss **106,140 (93.0%)**; POS/type **114,169 (100%)**; romanization
**114,177 (100%, `THAIROM`)**; classifier **247 (0.2%)**; notes **1,444 (1.3%)**;
usage/register **1,438 (1.3%)**; synonyms **2,415 (2.1%)**. There is no "level"
column in the full database (a learner-level field exists only in the smaller
BASIC/CLASSIC/JUMBO variants, which were not the inspected file).

Notable: the headword, romanization, and POS columns are essentially complete,
but every _enrichment_ column (`USAGE`, `CLASSIF`, `NOTE`, `SYN`, `SCIENT`,
`ETYMO`) is sparse (≤8%). English gloss is present for 93% of rows; the other 7%
are Thai-only / French-only entries with no English side.

---

## 4. Thai-headword duplication (merge burden)

Computed on the `THA` column. There is no distinct-key collapse from
normalization (see §5): NFC composition changes 0 headwords and there are no Thai
digits to fold, so the raw-string distinct count and the
normalization-policy-key distinct count are identical.

- **Distinct Thai headwords: 102,813** (out of 114,176 populated rows).
- **Headwords appearing in more than one row: 8,591.** These account for
  **19,954 rows**.
- Maximum rows sharing a single Thai headword: **10**.

Sense-count distribution (rows per headword → number of headwords):

| Rows sharing the headword | Number of headwords |
| ------------------------- | ------------------- |
| 1 (unique)                | 94,222              |
| 2                         | 6,722               |
| 3                         | 1,303               |
| 4                         | 366                 |
| 5                         | 121                 |
| 6–10                      | 79                  |

**Merge-burden implication.** A one-entry-per-key Thai index
(`thaiToEnglish: Record<string, LexicalEntry>`, which the current
`composeLexicalIndex` builds as last-write-wins per key) would silently collapse
**~11,360 rows** (114,176 − 102,813) belonging to the 8,591 multi-row headwords —
unless those rows are first merged into a single `LexicalEntry` with multiple
`LexicalDefinition`s. The merge is concentrated and tractable (92% of headwords
are already unique; the deepest collision is only 10 rows), but it is a real
pre-index transformation step, not a no-op.

---

## 5. Key-policy conflicts (grounded in the actual normalization source)

The actual Thai-side key policy (`normalizeLexicalKey` →
`assertNoWhitespace` + `thai-tone-mark` NFC fold + `thai-digit` fold) **rejects
any whitespace by throwing**, applies NFC, folds Thai digits to Arabic, and does
**not** strip punctuation. `composeEntryId` additionally forbids `:` in the
canonical key. The English-side policy (`canonicalizeEnglishKey`) collapses
internal whitespace to single spaces, trims, and lower-cases — and likewise does
**not** strip punctuation.

**Thai headwords vs. the Thai key policy:**

- **Whitespace (hard conflict — would throw): 8,540 headwords (7.5%).** These
  violate `assertNoWhitespace` and would fail entry-id construction and index
  insertion outright. Shape of the conflict (described, not quoted):
  - ~6,402 contain an **embedded space** (multi-word Thai expressions / phrases —
    consistent with the large `n. exp.` / `v. exp.` share of `TYPE`).
  - ~2,134 carry **leading or trailing whitespace** only (a trim would resolve
    these; the current policy rejects rather than trims).
  - 4 contain other whitespace (e.g. non-space whitespace).
- **Colon (hard conflict for entry-id): 3 headwords** contain `:`, which
  `composeEntryId` explicitly rejects.
- **Other punctuation (kept, not rejected): ~6,446 headwords (5.6%)** carry
  non-letter/non-mark/non-digit characters (e.g. hyphen-like marks, parentheses,
  period-like marks). The policy does **not** strip these, so they would survive
  verbatim into the Thai key. They do not throw, but they make the key carry
  punctuation, which affects exact-match lookup expectations.
- NFC composition changes **0** headwords; **0** headwords contain Thai digits.
  So the tone-mark and digit folding rules are effectively inert on this corpus —
  the whitespace rejection is the only material Thai-side interaction.

**English glosses vs. the English key policy:**

- **Punctuation that canonicalization does not strip: 46,592 glosses (40.8%).**
  The dominant contributor is the semicolon: **39,876 glosses (34.9%)** contain
  `;`, which is the source's **multi-sense separator** within a single `ENG`
  cell (sense-chunk histogram: 66,264 cells with 1 sense, 20,203 with 2, 8,667
  with 3, tailing past 12). Because `canonicalizeEnglishKey` keeps the
  semicolons and joins the whole cell into one whole-phrase key, an un-split
  `ENG` cell would become a single giant `"sense a; sense b; sense c"` key —
  almost certainly not a key any user would query. Other surviving punctuation
  (by frequency): parentheses, hyphen-like marks, apostrophes, periods, square
  brackets, commas, question/exclamation marks, slashes, ellipsis. None of these
  are stripped by the policy.
- **Multi-word glosses: 80,181 (70.2%)** contain a space. These are _not_ a
  conflict — the policy is explicitly designed to collapse/keep them as a single
  whole-phrase key (e.g. "to eat") — but they confirm that the English side is
  overwhelmingly phrase-shaped, so the whole-phrase-key design is load-bearing
  here.

**Net:** the English side needs a **sense-splitting** step (split `ENG` on `;`
into separate `LexicalDefinition`s) before keying, and the Thai side needs a
**whitespace decision** for ~7.5% of headwords (reject / trim / re-segment),
because the current policy will throw on them.

---

## 6. Contract-fit (mapping to the REAL types, no core changes)

Field-by-field mapping derived from `LexicalEntry` / `CanonicalDictionaryEntry`
and `LexicalDefinition` as they exist in source:

| Target field (core type)                       | Source                      | Fit                                                                                                                                                                                                                                      |
| ---------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headword` (`string`, required)                | `THA`                       | Clean for 92.5% of rows; **blocked for the 8,540 whitespace headwords** (policy throws) and needs a decision (see §5).                                                                                                                   |
| `romanized?` (`string`, optional)              | `THAIROM` (choice)          | One slot, three candidate columns. `THAIROM` is the natural pick; `EASYTHAI`/`THAIPHON` cannot also be carried (see §7).                                                                                                                 |
| `definitions[].definition` (`string`)          | `ENG`, **split on `;`**     | Requires the sense-split transform (§5); 7% of rows have no English gloss at all and would yield an empty `definitions` array — **invalid**, since `composeCanonicalDictionaryEntry` requires ≥1 definition.                             |
| `definitions[].partOfSpeech` (10-value enum)   | `TYPE`, **mapped**          | **Lossy.** `TYPE` has 73 distinct tag codes; the core enum has exactly 10 values (noun, verb, adjective, adverb, pronoun, conjunction, preposition, particle, classifier, interjection). Mapping is required and incomplete (see below). |
| `definitions[].definitionIndex` (`number`)     | derived ordinal             | Synthesizable (0..n over the split senses).                                                                                                                                                                                              |
| `entryId` (`LexicalEntryId`, required for CDE) | `composeEntryId("thai", …)` | Derivable, but inherits the §5 whitespace/colon failures for ~7.5% of rows.                                                                                                                                                              |
| `provenance` (`DictionarySourceProvenance`)    | constant (Volubilis record) | Clean; one shared provenance object for the whole source (see §8).                                                                                                                                                                       |
| `schemaVersion` (CDE)                          | constant literal            | Clean.                                                                                                                                                                                                                                   |

**POS mapping detail (the lossy part).** The 10-value `LexicalPartOfSpeech`
enum covers only single-token word classes. The Volubilis `TYPE` vocabulary is
dominated by tags that have **no enum value**: the single largest category is
`n. exp.` (multi-word noun _expression_, ~41k rows) and `v. exp.` (~12k), which
are phrase-type markers, not POS; plus `n. prop.` (proper noun), `num.`
(numeral), `pref.`/`suff.` (affixes), `art.` (article), `onomat.`
(onomatopoeia), `org.` / `[TM]` (organisation / trademark), `symb.`, `abv.` /
`acron.` (abbreviation / acronym), and an explicit unknown marker `X` (~3.4k).
Only `n.`, `v.`, `adj.`, `adv.`, `conj.`, `prep.`, `part.`, `interj.`, `pr.`
(pronoun), and `classif.` map onto enum values, and even those appear both bare
and in parenthesized compound forms (e.g. localized/auxiliary qualifiers) that a
mapping table must normalize. **Conclusion:** `TYPE` does not map cleanly to the
enum; ingestion would require an explicit, lossy `TYPE → LexicalPartOfSpeech`
mapping table, a fallback for the many non-mappable tags, and acceptance that the
expression/affix/numeral/article/onomatopoeia distinctions are discarded unless
the enum is extended (a core change, out of scope here).

**Overall fit:** the _spine_ of the data (Thai headword → English gloss(es) with
a POS) maps onto `LexicalEntry` / `CanonicalDictionaryEntry` with **two
mandatory transforms** (sense-split on `;`, POS-map with fallback) and **two
decisions** (whitespace handling for ~7.5% of headwords; which romanization
column is authoritative). It is a moderate, well-bounded adapter — not a
drop-in — and it stays within the current contracts only by discarding the rich
columns in §7.

---

## 7. Dropped fields (no home in current contracts)

With no core change, every column below has no destination field and would be
**dropped** on ingestion (or would require a core extension to retain):

| Source column          | Disposition under current contracts                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EASYTHAI`             | Dropped — only one `romanized?` slot exists; a second romanization has no home.                                                                         |
| `THAIPHON`             | Dropped — phonetic transcription has no field (no phonetic/IPA field on the contract).                                                                  |
| `ETYMO`                | Dropped — no etymology field.                                                                                                                           |
| `FRA` (French)         | Dropped — the platform is Thai–English initialized; no French gloss field (and 60% of rows carry French).                                               |
| `USAGE`                | Dropped — no usage/register field.                                                                                                                      |
| `SCIENT/abbrev.`       | Dropped — no scientific-name / abbreviation field.                                                                                                      |
| `DOM` (domain)         | Dropped — no domain/subject-field field (57.9% of rows carry one).                                                                                      |
| `CLASSIF` (classifier) | Dropped — there is a `classifier` POS _value_ but **no classifier-link field** on a noun entry, so the classifier→noun relationship cannot be retained. |
| `SYLLAB`               | Dropped — no syllabification field.                                                                                                                     |
| `NOTE`                 | Dropped — no note field.                                                                                                                                |
| `SYN` (synonyms)       | Dropped — no synonym/relation field.                                                                                                                    |

Also effectively dropped: the **sense-internal POS granularity** beyond the
10-value enum (§6), and any **tone information** (never present to begin with,
§2). Retaining any of `THAIPHON`, `DOM`, `CLASSIF`, `SYN`, or a second
romanization would each require a deliberate core contract extension under the
normal governance process — none is undertaken here.

---

## 8. Attribution / licensing payload

Volubilis is CC BY-SA 4.0. Expressed against the **real**
`DictionarySourceProvenance` fields (all `readonly string` / `boolean`):

| `DictionarySourceProvenance` field | Value to carry                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`                    | `lingua-core-platform:dictionary-source-provenance@phase11` (constant)                                                             |
| `sourceId`                         | `volubilis`                                                                                                                        |
| `displayName`                      | VOLUBILIS Multilingual Thai Dictionary & Database (Belisan)                                                                        |
| `sourceUrl`                        | `https://belisan-volubilis.blogspot.com/` (project) / SourceForge `belisan`                                                        |
| `licenseType`                      | `CC BY-SA 4.0`                                                                                                                     |
| `licenseUrl`                       | `https://creativecommons.org/licenses/by-sa/4.0/`                                                                                  |
| `attributionRequired`              | `true`                                                                                                                             |
| `attributionPayload`               | Attribute "Francis Bastien (Belisan), VOLUBILIS Multilingual Thai Dictionary & Database," with a link to the CC BY-SA 4.0 license. |

And against `DictionaryLicensingBoundary`:

| `DictionaryLicensingBoundary` field | Value (verdict type is `boolean` or the literal `"unknown"`)                                                                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provenance`                        | the provenance object above                                                                                                                                                                                             |
| `isCommerciallyViable`              | `"unknown"` — CC BY-SA 4.0 permits commercial use in principle, but the ShareAlike obligation and the author's informal "use freely, just mention the source" statement are unresolved (`DATA_SOURCES.md` open thread). |
| `redistributionAllowed`             | `true` (under attribution + ShareAlike per license text)                                                                                                                                                                |
| `licenseType`                       | `CC BY-SA 4.0`                                                                                                                                                                                                          |
| `licenseUrl`                        | `https://creativecommons.org/licenses/by-sa/4.0/`                                                                                                                                                                       |
| `attributionRequired`               | `true`                                                                                                                                                                                                                  |

**Representability gap (flag, not a change):** the contract can carry the
attribution string, license label, and license URL, but it has **no field for
the ShareAlike obligation** — the single most consequential term of CC BY-SA 4.0.
ShareAlike is currently representable only implicitly inside the `licenseType`
string. If derived Volubilis records are ever combined with differently-licensed
data, the SA constraint is not machine-checkable against the present contract.
This is an observation for governance, not a proposed change.

---

## 9. Reproducibility (fixed snapshot)

All counts above are pinned to this exact snapshot:

| Property        | Value                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filename        | `VOLUBILIS Database.xlsx`                                                                                                                                             |
| Version label   | v. 25.3 (Nov. 2025), stated entry count "114177 entr." (114,177 data rows)                                                                                            |
| Project site    | `https://belisan-volubilis.blogspot.com/`                                                                                                                             |
| Download source | SourceForge project `belisan` (`https://sourceforge.net/projects/belisan/files/`); resolved via the `master` download mirror                                          |
| Download date   | 2026-06-07                                                                                                                                                            |
| Size            | 10,778,108 bytes                                                                                                                                                      |
| SHA-256         | `ab71c33a8f2dd33e893013cf06d21b9b8e447ff9b49b2a1c347cb3cafa64ee85`                                                                                                    |
| Variants noted  | BASIC (2,151 entr.), CLASSIC (5,287), JUMBO (11,460) — smaller subsets carrying Thai/Romanized/English/French and a learner-level column; **not** the inspected file. |

The full database is the correct file for this analysis (it is the only variant
containing the complete column set and the full ~114k headword space). The
smaller variants add a learner-level field absent from the full database but
cover far fewer entries.

---

## Recommended next decision points

These are decisions for the operator, not a chosen course:

1. **Native-vs-generated romanization / tone.** The source gives length-marked
   romanization but **no tone**. Decide whether a tone-marked pronunciation
   surface is a product requirement. If yes, it must be **generated** by a
   separate transcriber (e.g. Paiboon/PyThaiNLP), which introduces a second
   data source, its own licensing/provenance, and a verification burden — versus
   shipping Volubilis romanization as-is (length only, no tone).

2. **Which romanization column is authoritative.** `romanized?` has one slot but
   the source has three candidates (`THAIROM`, `EASYTHAI`, `THAIPHON`). Decide
   the authoritative pick and whether the other two are dropped or motivate a
   core field extension.

3. **English sense-splitting strategy.** ~35% of `ENG` cells pack multiple senses
   with `;`. Decide the splitting rule (split into multiple `LexicalDefinition`s,
   each with its own `partOfSpeech`/`definitionIndex`) and how to handle the 7%
   of rows with **no** English gloss (which cannot form a valid
   `CanonicalDictionaryEntry`, since ≥1 definition is required) — drop, or retain
   as Thai-only entries pending a contract that allows definition-less entries.

4. **Thai whitespace handling (~7.5% of headwords).** The current policy
   **throws** on whitespace. Decide among: (a) reject/skip these multi-word
   entries, (b) trim-only the ~2,134 boundary-whitespace cases and skip the rest,
   or (c) treat multi-word Thai expressions as a first-class case — which would
   require revisiting the Thai whitespace-rejection invariant (a core policy
   decision, out of scope here).

5. **Merge strategy for duplicate Thai headwords.** 8,591 headwords span multiple
   rows (up to 10). Decide the merge rule into one `LexicalEntry` with multiple
   `LexicalDefinition`s, so the one-key-per-headword index does not silently drop
   ~11,360 rows via last-write-wins.

6. **POS mapping fidelity.** `TYPE` has 73 tags; the enum has 10. Decide the
   `TYPE → LexicalPartOfSpeech` mapping table and the fallback for non-mappable
   tags (expression/affix/numeral/article/onomatopoeia/trademark/unknown) —
   accept the loss, or propose extending the core POS enum (a core change).

7. **Drop-vs-extend per rich column.** `THAIPHON`, `ETYMO`, `FRA`, `USAGE`,
   `SCIENT/abbrev.`, `DOM`, `CLASSIF`, `SYLLAB`, `NOTE`, `SYN` have no home today.
   Decide which (if any) justify a core contract extension — most notably the
   **classifier link**, which is linguistically central to Thai and currently
   unrepresentable as a relation — versus accepting their loss on ingestion.

8. **Licensing-posture dependency.** Ingestion is gated on resolving the CC
   BY-SA 4.0 **ShareAlike** intent (`DATA_SOURCES.md` open thread) and on a
   governance decision about whether the contract should represent the SA
   obligation at all, given derived records are not currently SA-checkable
   against `DictionaryLicensingBoundary`.

_End of report. No implementation is proposed or begun._
