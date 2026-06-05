// The fixed scenario list. Exactly the eight categories named in the brief, each
// instantiated as concrete, labeled queries. No extra categories, edge cases, or
// negative-test matrices. Category-level items ("misspellings", "multi-word
// English", "autocomplete typing") get a small fixed set of concrete queries
// consistent with the app fixture.
//
// Every query is labeled with category, direction, and intended capability. The
// `missClassification` hint is set only where an EXPORTED capability is expected to
// miss and the nature of that miss (clean data gap vs. genuinely ambiguous) is a
// property of the scenario design — see friction-record.ts.

import type { Query } from "@core/tokenizers";

import type { IntendedCapability, MissClassification, ReachDirection } from "./friction-record";

/** A reach resolved through the exact-key lexical barrel (composeLexicalLookup). */
export interface LexicalScenario {
  readonly kind: "lexical";
  readonly query: string;
  readonly category: string;
  readonly direction: Exclude<ReachDirection, "either">;
  readonly intendedCapability: IntendedCapability;
  readonly missClassification?: MissClassification;
}

/** A reach resolved through the token/phrase corpus barrel (executeQuery). */
export interface CorpusScenario {
  readonly kind: "corpus";
  /** Human-readable query label for the report. */
  readonly query: string;
  readonly category: string;
  readonly intendedCapability: IntendedCapability;
  /** The parsed core Query shape executed against the corpus inverted index. */
  readonly coreQuery: Query;
}

export type Scenario = LexicalScenario | CorpusScenario;

export const SCENARIOS: readonly Scenario[] = Object.freeze([
  // 1. กิน · th→en · exact-key
  {
    kind: "lexical",
    query: "กิน",
    category: "exact-key (th→en)",
    direction: "th→en",
    intendedCapability: "exact-key",
  },

  // 2. to eat · en→th · exact-key whole-phrase
  {
    kind: "lexical",
    query: "to eat",
    category: "whole-phrase exact (en→th)",
    direction: "en→th",
    intendedCapability: "exact-key whole-phrase",
  },

  // 3. eat · en→th · exact-key single word
  {
    kind: "lexical",
    query: "eat",
    category: "single-word exact (en→th)",
    direction: "en→th",
    intendedCapability: "exact-key single word",
    // Fixture has "to eat" but not "eat"; the miss could be correct exact-key
    // behavior, fixture incompleteness, or a user-expectation mismatch.
    missClassification: "AMBIGUOUS",
  },

  // 4. ea · en→th · prefix
  {
    kind: "lexical",
    query: "ea",
    category: "prefix (en→th)",
    direction: "en→th",
    intendedCapability: "prefix",
  },

  // 5. กิ · th→en · prefix
  {
    kind: "lexical",
    query: "กิ",
    category: "prefix (th→en)",
    direction: "th→en",
    intendedCapability: "prefix",
  },

  // 6. misspellings · either · fuzzy (exercised concretely en→th against English keys)
  {
    kind: "lexical",
    query: "watter",
    category: "misspellings",
    direction: "en→th",
    intendedCapability: "fuzzy",
  },
  {
    kind: "lexical",
    query: "gud",
    category: "misspellings",
    direction: "en→th",
    intendedCapability: "fuzzy",
  },
  {
    kind: "lexical",
    query: "hows",
    category: "misspellings",
    direction: "en→th",
    intendedCapability: "fuzzy",
  },

  // 7. multi-word English · en→th · whole-phrase exact + token/phrase
  //    7a/7b exercise the whole-phrase exact lexical path; 7c/7d exercise the
  //    distinct, already-reachable token/phrase corpus surface.
  {
    kind: "lexical",
    query: "to eat",
    category: "multi-word English",
    direction: "en→th",
    intendedCapability: "exact-key whole-phrase",
  },
  {
    kind: "lexical",
    query: "to drink",
    category: "multi-word English",
    direction: "en→th",
    intendedCapability: "exact-key whole-phrase",
    // The full whole-phrase is simply absent from the fixture; exact-key whole-phrase
    // is exported and reachable, so this is a clean data gap, not ambiguity.
    missClassification: "CONTENT-CAPPED",
  },
  {
    kind: "corpus",
    query: "eat",
    category: "multi-word English",
    intendedCapability: "tokenization-driven matching",
    coreQuery: { kind: "token", token: "eat" },
  },
  {
    kind: "corpus",
    query: '"to eat"',
    category: "multi-word English",
    intendedCapability: "phrase matching",
    coreQuery: { kind: "phrase", tokens: ["to", "eat"] },
  },

  // 8. autocomplete typing · en→th · incremental prefix (progressive prefixes of "water")
  {
    kind: "lexical",
    query: "w",
    category: "autocomplete typing",
    direction: "en→th",
    intendedCapability: "incremental prefix",
  },
  {
    kind: "lexical",
    query: "wa",
    category: "autocomplete typing",
    direction: "en→th",
    intendedCapability: "incremental prefix",
  },
  {
    kind: "lexical",
    query: "wat",
    category: "autocomplete typing",
    direction: "en→th",
    intendedCapability: "incremental prefix",
  },
]);
