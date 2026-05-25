import { describe, expect, it } from "vitest";

import { THAI_ENGLISH_FIXTURE_DATASET } from "../datasets/thai-english/thai-english-fixture-dataset";
import { composeLexicalIndex } from "./lexical-index";

describe("composeLexicalIndex", () => {
  it("returns the correct schema version", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:schema-version",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });

    expect(index.schemaVersion).toBe(
      "lingua-core-platform:lexical-index@phase10",
    );
  });

  it("preserves caller-supplied lexicalIndexId", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:caller-id",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });

    expect(index.lexicalIndexId).toBe("test:index:caller-id");
  });

  it("sets entryCount to the number of supplied entries", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:count",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });

    expect(index.entryCount).toBe(THAI_ENGLISH_FIXTURE_DATASET.length);
  });

  it("sorts entries in binary-lexicographic order by canonical headword", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:ordering",
      entries: [...THAI_ENGLISH_FIXTURE_DATASET].reverse(),
    });

    const headwords = index.entries.map((e) => e.headword);
    const sorted = [...headwords].sort();

    expect(headwords).toEqual(sorted);
  });

  it("produces identical entry ordering regardless of input order", () => {
    const forward = composeLexicalIndex({
      lexicalIndexId: "test:index:order-a",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });
    const reversed = composeLexicalIndex({
      lexicalIndexId: "test:index:order-a",
      entries: [...THAI_ENGLISH_FIXTURE_DATASET].reverse(),
    });

    expect(forward.entries.map((e) => e.headword)).toEqual(
      reversed.entries.map((e) => e.headword),
    );
  });

  it("builds thaiToEnglish keyed by normalized Thai headword", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:thai-key",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });

    expect(index.thaiToEnglish["กิน"]).toBeDefined();
    expect(index.thaiToEnglish["กิน"].headword).toBe("กิน");
    expect(index.thaiToEnglish["ข้าว"].headword).toBe("ข้าว");
  });

  it("builds englishToThai keyed by lowercase English definition", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:english-key",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });

    expect(index.englishToThai["rice"]).toBeDefined();
    expect(index.englishToThai["rice"][0].headword).toBe("ข้าว");
    expect(index.englishToThai["to eat"][0].headword).toBe("กิน");
  });

  it("returns a deeply frozen structure", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:immutability",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });

    expect(Object.isFrozen(index)).toBe(true);
    expect(Object.isFrozen(index.entries)).toBe(true);
    expect(Object.isFrozen(index.thaiToEnglish)).toBe(true);
    expect(Object.isFrozen(index.englishToThai)).toBe(true);
    expect(Object.isFrozen(index.entries[0])).toBe(true);
  });

  it("is JSON round-trip safe (serializes to plain primitives only)", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:json-safe",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    });

    const roundTripped = JSON.parse(JSON.stringify(index)) as typeof index;
    expect(roundTripped).toEqual(index);
  });

  it("produces structurally equivalent output for repeated calls with identical input", () => {
    const input = {
      lexicalIndexId: "test:index:determinism",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    };

    expect(composeLexicalIndex(input)).toEqual(composeLexicalIndex(input));
  });

  it("normalizes NFC-vs-NFD Thai headwords to the same canonical index key", () => {
    const entryNfc = {
      headword: "กิน".normalize("NFC"),
      definitions: [
        {
          definitionIndex: 0,
          definition: "to eat",
          partOfSpeech: "verb" as const,
        },
      ],
    };
    const entryNfd = {
      headword: "กิน".normalize("NFD"),
      definitions: [
        {
          definitionIndex: 0,
          definition: "to eat nfd",
          partOfSpeech: "verb" as const,
        },
      ],
    };

    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:nfc-nfd",
      entries: [entryNfc, entryNfd],
    });

    // Both NFC and NFD headwords normalize to the same canonical key,
    // so only one entry survives in thaiToEnglish (last write wins).
    const keys = Object.keys(index.thaiToEnglish);
    expect(keys.length).toBe(1);
  });

  it("throws on empty lexicalIndexId", () => {
    expect(() => {
      composeLexicalIndex({ lexicalIndexId: "", entries: [] });
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only lexicalIndexId", () => {
    expect(() => {
      composeLexicalIndex({ lexicalIndexId: "   ", entries: [] });
    }).toThrow("[lexical invariant]");
  });

  it("accepts an empty entries array", () => {
    const index = composeLexicalIndex({
      lexicalIndexId: "test:index:empty",
      entries: [],
    });

    expect(index.entryCount).toBe(0);
    expect(index.entries).toHaveLength(0);
    expect(Object.keys(index.thaiToEnglish)).toHaveLength(0);
    expect(Object.keys(index.englishToThai)).toHaveLength(0);
  });
});
