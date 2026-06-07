import type { LexicalEntry } from "@core/lexical";

// App-owned, illustrative development data — NOT governed dictionary records.
// Provenance is intentionally omitted (optional on LexicalEntry); these fixtures
// must not fabricate the source-provenance lineage that canonical entries carry
// (APP_SHELL_GUIDELINES.md — Data). Real datasets remain governed by
// DATA_SOURCES.md before ingestion.
//
// Note on en→th: the core keys englishToThai on the full, lowercased definition
// string and resolves it by exact equality. Both single-token definitions (e.g.
// "rice") and whole-phrase definitions (e.g. "to eat") are reachable via en→th —
// core does not reject internal whitespace for this direction.
export const seed: LexicalEntry[] = [
  {
    headword: "กิน",
    romanized: "kin",
    definitions: [
      { definitionIndex: 0, definition: "to eat", partOfSpeech: "verb" },
    ],
  },
  {
    headword: "ข้าว",
    romanized: "khao",
    definitions: [
      { definitionIndex: 0, definition: "rice", partOfSpeech: "noun" },
    ],
  },
  {
    headword: "น้ำ",
    romanized: "nam",
    definitions: [
      { definitionIndex: 0, definition: "water", partOfSpeech: "noun" },
    ],
  },
  {
    headword: "ดี",
    romanized: "dee",
    definitions: [
      { definitionIndex: 0, definition: "good", partOfSpeech: "adjective" },
    ],
  },
  {
    headword: "มา",
    romanized: "maa",
    definitions: [
      { definitionIndex: 0, definition: "come", partOfSpeech: "verb" },
    ],
  },
  {
    headword: "ไป",
    romanized: "pai",
    definitions: [
      { definitionIndex: 0, definition: "go", partOfSpeech: "verb" },
    ],
  },
  {
    headword: "บ้าน",
    romanized: "baan",
    definitions: [
      { definitionIndex: 0, definition: "house", partOfSpeech: "noun" },
    ],
  },
  {
    headword: "รัก",
    romanized: "rak",
    definitions: [
      { definitionIndex: 0, definition: "love", partOfSpeech: "verb" },
    ],
  },
  // Multi-definition entry: exercises the definition-list render path
  // (definitions.length > 1). Definitions are presented in this core-returned
  // array order — the app adds no sort.
  {
    headword: "เอา",
    romanized: "ao",
    definitions: [
      { definitionIndex: 0, definition: "to take", partOfSpeech: "verb" },
      { definitionIndex: 1, definition: "to want", partOfSpeech: "verb" },
    ],
  },
  // Homograph pair: two distinct Thai headwords sharing one English gloss
  // ("old"). The en→th index keys on the canonical English definition and holds
  // an entry array per key (LexicalIndex.englishToThai: Record<string,
  // readonly LexicalEntry[]>), so en→th "old" resolves to BOTH entries — this is
  // the only fixture-observable multi-entry path (th→en is one-entry-per-key by
  // construction). See the homograph-feasibility finding in the slice summary.
  {
    headword: "แก่",
    romanized: "kae",
    definitions: [
      { definitionIndex: 0, definition: "old", partOfSpeech: "adjective" },
    ],
  },
  {
    headword: "เก่า",
    romanized: "kao",
    definitions: [
      { definitionIndex: 0, definition: "old", partOfSpeech: "adjective" },
    ],
  },
];
