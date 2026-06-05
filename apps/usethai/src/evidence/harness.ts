// Scripted evidence harness. Runs the fixed scenario list against core's public
// top-level barrels, records each reach through the pure recorder seam, and renders
// the friction-report markdown.
//
// Determinism: fixed scenarios, fixed app fixture, fixed hardcoded corpus, no
// randomness, no network, no wall-clock values in output (timestamps omitted).
//
// No-compensation rule: there is no app-side prefix, substring, fuzzy, ranking,
// autocomplete, or any other matching behavior. Each reach passes the RAW query to
// the single reachable core operation for its surface and records exactly what core
// returns. The only normalization is whatever the core barrel does internally.

import { composeLexicalLookup } from "@core/lexical";
import { executeQuery } from "@core/tokenizers";

import { index, LEXICAL_INDEX_ID } from "../lib/lexical";
import { buildEvidenceCorpus, CORPUS_STRINGS } from "./corpus";
import {
  recordFriction,
  type EvidenceClassification,
  type FrictionRecord,
  type ObservedOutcome,
  type CapabilityVerdict,
} from "./friction-record";
import { SCENARIOS, type CorpusScenario, type LexicalScenario } from "./scenarios";

// Branch and base commit this evidence pass was produced from (for the report).
export const EVIDENCE_BRANCH = "spike/usethai-barrel-reach-friction-log";
export const EVIDENCE_BASE_COMMIT = "2f2c425";

// Exact core import specifiers consumed — top-level public barrels only.
export const CORE_IMPORT_SPECIFIERS: readonly string[] = Object.freeze([
  "@core/lexical → composeLexicalLookup",
  "@core/tokenizers → buildSearchProjection, CorpusIndexer, MockTokenizerDriver, executeQuery",
]);

/** Observe a lexical reach live: pass the raw query to the exact-key barrel. */
function observeLexical(scenario: LexicalScenario): ObservedOutcome {
  try {
    const result = composeLexicalLookup(
      {
        query: scenario.query,
        direction: scenario.direction,
        lexicalIndexId: LEXICAL_INDEX_ID,
      },
      index,
    );
    const diagnosticCodes = result.diagnostics.map((d) => d.code);
    const codeNote =
      diagnosticCodes.length === 0 ? "" : ` [${diagnosticCodes.join(", ")}]`;

    return {
      outcome: result.entries.length > 0 ? "hit" : "miss",
      note: `composeLexicalLookup → ${result.entries.length} entr${result.entries.length === 1 ? "y" : "ies"}${codeNote}`,
    };
  } catch (error) {
    // A thrown core invariant (e.g. whitespace rejection) is recorded as
    // unsupported — the capability could not be executed at all.
    const message = error instanceof Error ? error.message : String(error);
    return { outcome: "unsupported", note: `composeLexicalLookup threw: ${message}` };
  }
}

/** Observe a corpus reach live: execute the parsed query against the inverted index. */
function observeCorpus(
  scenario: CorpusScenario,
  invertedIndex: Parameters<typeof executeQuery>[0],
): ObservedOutcome {
  const result = executeQuery(invertedIndex, scenario.coreQuery);
  return {
    outcome: result.matches.length > 0 ? "hit" : "miss",
    note: `executeQuery → ${result.matches.length} document match(es)`,
  };
}

/** Run the full fixed scenario list and return the classified records, in order. */
export async function runHarness(): Promise<readonly FrictionRecord[]> {
  const corpus = await buildEvidenceCorpus();
  const records: FrictionRecord[] = [];

  for (const scenario of SCENARIOS) {
    if (scenario.kind === "lexical") {
      records.push(recordFriction(scenario, observeLexical(scenario)));
    } else {
      records.push(
        recordFriction(
          {
            query: scenario.query,
            category: scenario.category,
            direction: "either",
            intendedCapability: scenario.intendedCapability,
          },
          observeCorpus(scenario, corpus.invertedIndex),
        ),
      );
    }
  }

  return records;
}

const VERDICT_ORDER: readonly CapabilityVerdict[] = [
  "EXPORTED",
  "PRESENT — NOT APP-REACHABLE",
  "NOT PRESENT",
];

const CLASSIFICATION_ORDER: readonly EvidenceClassification[] = [
  "STRUCTURAL",
  "CONTENT-CAPPED",
  "AMBIGUOUS",
  "NONE",
];

function tally<T extends string>(values: readonly T[], order: readonly T[]): Map<T, number> {
  const counts = new Map<T, number>(order.map((key) => [key, 0]));
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/** Render the friction-report markdown from the records. Pure: no I/O, no clock. */
export function renderReport(records: readonly FrictionRecord[]): string {
  const rows = records
    .map((r) => {
      const tier = r.reachabilityTier ?? "—";
      return `| \`${r.query}\` | ${r.category} | ${r.direction} | ${r.intendedCapability} | ${r.outcome} | ${r.verdict} | ${tier} | ${r.classification} | ${r.note ?? ""} |`;
    })
    .join("\n");

  const verdictCounts = tally(
    records.map((r) => r.verdict),
    VERDICT_ORDER,
  );
  const classificationCounts = tally(
    records.map((r) => r.classification),
    CLASSIFICATION_ORDER,
  );

  const verdictLines = VERDICT_ORDER.map(
    (v) => `| ${v} | ${verdictCounts.get(v) ?? 0} |`,
  ).join("\n");
  const classificationLines = CLASSIFICATION_ORDER.map(
    (c) => `| ${c} | ${classificationCounts.get(c) ?? 0} |`,
  ).join("\n");

  const corpusList = CORPUS_STRINGS.map((s) => `\`${s}\``).join(", ");
  const importList = CORE_IMPORT_SPECIFIERS.map((s) => `\`${s}\``).join("; ");

  return `# Barrel-Reach Friction Report

Evidence artifact produced by the scripted harness in
\`apps/usethai/src/evidence/\`. First evidence pass for the prefix/fuzzy search
scoping thread: it instruments \`apps/usethai\` with a fixed list of
dictionary-lookup scenarios run against core's public top-level barrels and
records, per scenario, what capability the app reached for and how that reach
classifies against the merged denominator inventory.

This report states verdicts and an evidence classification, and stops there. It
contains no recommendations, no promotion paths, and no barrel-exposure proposals.

## 1. Method

- **Fixture.** The app's own illustrative development fixture
  (\`apps/usethai/src/data/seed.ts\`), consumed as imported module data via the
  shared lexical index in \`apps/usethai/src/lib/lexical.ts\`. It is dev data and
  fabricates no \`DictionarySourceProvenance\` / \`CanonicalDictionaryEntry\`
  lineage. No fixture extension was required: it already carries a multi-word
  English gloss (\`to eat\`) and single-word glosses (\`rice\`, \`water\`, \`good\`, …).
- **Core import specifiers consumed.** Top-level public barrels only:
  ${importList}. Zero sub-barrel imports; zero internal-core imports; zero core
  files changed.
- **Branch + commit.** Branch \`${EVIDENCE_BRANCH}\`, produced from base commit
  \`${EVIDENCE_BASE_COMMIT}\`.
- **Determinism.** Fixed scenarios, fixed fixture, and a fixed hardcoded corpus
  (${corpusList}) built in-process. No randomness, no network, no filesystem reads
  in the corpus build, and no wall-clock values in output (timestamps omitted). Re-running
  the harness reproduces this report byte-for-byte.
- **No-compensation rule.** The app implements no prefix, substring, fuzzy,
  ranking, or autocomplete matching. For every scenario the harness passes the RAW
  query to the single reachable core operation for that surface and records exactly
  what core returns — no trimming to a prefix, no fuzzy fallback, no re-ranking. The
  only normalization is whatever the core barrel does internally.
- **Authoritative verdict source.** Verdicts (EXPORTED / PRESENT — NOT
  APP-REACHABLE / NOT PRESENT) and reachability tiers are sourced from the merged
  inventory \`docs/architecture/tokenizer-search-barrel-inventory.md\` §4. They are
  NOT recomputed by inspecting core source. The harness maps each scenario's
  intended capability to its documented inventory finding.
- **"Live-exercised."** Each \`outcome\` (hit / miss / unsupported) is observed by
  actually calling core: lexical reaches call \`composeLexicalLookup\` and read
  \`entries.length\`; corpus reaches call \`executeQuery\` over an inverted index
  built from the hardcoded corpus and read \`matches.length\`. A core call that
  throws an invariant error is recorded as \`unsupported\`. Outcomes are observed
  independently of verdicts.
- **Evidence classifications.** \`STRUCTURAL\` (capability absent regardless of
  data), \`CONTENT-CAPPED\` (capability exported and reachable, fixture lacks the
  entry), \`AMBIGUOUS\` (evidence cannot settle STRUCTURAL vs CONTENT-CAPPED), and
  \`NONE\` (the reach succeeded — capability EXPORTED and data present — so it is not
  a friction finding; a clean hit is not forced into a friction label).

## 2. Scenario results

One row per concrete query, in execution order.

| query | category | direction | intended capability | outcome | verdict | reachability tier | classification | evidence (live) |
| ----- | -------- | --------- | ------------------- | ------- | ------- | ----------------- | -------------- | --------------- |
${rows}

## 3. Summary

Factual tallies only across all ${records.length} records. No recommendations.

### Counts by verdict

| verdict | count |
| ------- | ----- |
${verdictLines}

### Counts by classification

| classification | count |
| -------------- | ----- |
${classificationLines}
`;
}
