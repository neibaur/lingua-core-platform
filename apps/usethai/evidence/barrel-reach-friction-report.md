# Barrel-Reach Friction Report

Evidence artifact produced by the scripted harness in
`apps/usethai/src/evidence/`. First evidence pass for the prefix/fuzzy search
scoping thread: it instruments `apps/usethai` with a fixed list of
dictionary-lookup scenarios run against core's public top-level barrels and
records, per scenario, what capability the app reached for and how that reach
classifies against the merged denominator inventory.

This report states verdicts and an evidence classification, and stops there. It
contains no recommendations, no promotion paths, and no barrel-exposure proposals.

## 1. Method

- **Fixture.** The app's own illustrative development fixture
  (`apps/usethai/src/data/seed.ts`), consumed as imported module data via the
  shared lexical index in `apps/usethai/src/lib/lexical.ts`. It is dev data and
  fabricates no `DictionarySourceProvenance` / `CanonicalDictionaryEntry`
  lineage. No fixture extension was required: it already carries a multi-word
  English gloss (`to eat`) and single-word glosses (`rice`, `water`, `good`, …).
- **Core import specifiers consumed.** Top-level public barrels only:
  `@core/lexical → composeLexicalLookup`; `@core/tokenizers → buildSearchProjection, CorpusIndexer, MockTokenizerDriver, executeQuery`. Zero sub-barrel imports; zero internal-core imports; zero core
  files changed.
- **Branch + commit.** Branch `spike/usethai-barrel-reach-friction-log`, produced from base commit
  `2f2c425`.
- **Determinism.** Fixed scenarios, fixed fixture, and a fixed hardcoded corpus
  (`to eat rice`, `drink water`, `good house`) built in-process. No randomness, no network, no filesystem reads
  in the corpus build, and no wall-clock values in output (timestamps omitted). Re-running
  the harness reproduces this report byte-for-byte.
- **No-compensation rule.** The app implements no prefix, substring, fuzzy,
  ranking, or autocomplete matching. For every scenario the harness passes the RAW
  query to the single reachable core operation for that surface and records exactly
  what core returns — no trimming to a prefix, no fuzzy fallback, no re-ranking. The
  only normalization is whatever the core barrel does internally.
- **Authoritative verdict source.** Verdicts (EXPORTED / PRESENT — NOT
  APP-REACHABLE / NOT PRESENT) and reachability tiers are sourced from the merged
  inventory `docs/architecture/tokenizer-search-barrel-inventory.md` §4. They are
  NOT recomputed by inspecting core source. The harness maps each scenario's
  intended capability to its documented inventory finding.
- **"Live-exercised."** Each `outcome` (hit / miss / unsupported) is observed by
  actually calling core: lexical reaches call `composeLexicalLookup` and read
  `entries.length`; corpus reaches call `executeQuery` over an inverted index
  built from the hardcoded corpus and read `matches.length`. A core call that
  throws an invariant error is recorded as `unsupported`. Outcomes are observed
  independently of verdicts.
- **Evidence classifications.** `STRUCTURAL` (capability absent regardless of
  data), `CONTENT-CAPPED` (capability exported and reachable, fixture lacks the
  entry), `AMBIGUOUS` (evidence cannot settle STRUCTURAL vs CONTENT-CAPPED), and
  `NONE` (the reach succeeded — capability EXPORTED and data present — so it is not
  a friction finding; a clean hit is not forced into a friction label).

## 2. Scenario results

One row per concrete query, in execution order.

| query | category | direction | intended capability | outcome | verdict | reachability tier | classification | evidence (live) |
| ----- | -------- | --------- | ------------------- | ------- | ------- | ----------------- | -------------- | --------------- |
| `กิน` | exact-key (th→en) | th→en | exact-key | hit | EXPORTED | APP-REACHABLE | NONE | composeLexicalLookup → 1 entry |
| `to eat` | whole-phrase exact (en→th) | en→th | exact-key whole-phrase | hit | EXPORTED | APP-REACHABLE | NONE | composeLexicalLookup → 1 entry |
| `eat` | single-word exact (en→th) | en→th | exact-key single word | miss | EXPORTED | APP-REACHABLE | AMBIGUOUS | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `ea` | prefix (en→th) | en→th | prefix | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `กิ` | prefix (th→en) | th→en | prefix | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `watter` | misspellings | en→th | fuzzy | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `gud` | misspellings | en→th | fuzzy | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `hows` | misspellings | en→th | fuzzy | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `to eat` | multi-word English | en→th | exact-key whole-phrase | hit | EXPORTED | APP-REACHABLE | NONE | composeLexicalLookup → 1 entry |
| `to drink` | multi-word English | en→th | exact-key whole-phrase | miss | EXPORTED | APP-REACHABLE | CONTENT-CAPPED | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `eat` | multi-word English | either | tokenization-driven matching | hit | EXPORTED | APP-REACHABLE | NONE | executeQuery → 1 document match(es) |
| `"to eat"` | multi-word English | either | phrase matching | hit | EXPORTED | APP-REACHABLE | NONE | executeQuery → 1 document match(es) |
| `w` | autocomplete typing | en→th | incremental prefix | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `wa` | autocomplete typing | en→th | incremental prefix | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |
| `wat` | autocomplete typing | en→th | incremental prefix | miss | NOT PRESENT | — | STRUCTURAL | composeLexicalLookup → 0 entries [LEXICAL_KEY_NOT_FOUND] |

## 3. Summary

Factual tallies only across all 15 records. No recommendations.

### Counts by verdict

| verdict | count |
| ------- | ----- |
| EXPORTED | 7 |
| PRESENT — NOT APP-REACHABLE | 0 |
| NOT PRESENT | 8 |

### Counts by classification

| classification | count |
| -------------- | ----- |
| STRUCTURAL | 8 |
| CONTENT-CAPPED | 1 |
| AMBIGUOUS | 1 |
| NONE | 5 |
