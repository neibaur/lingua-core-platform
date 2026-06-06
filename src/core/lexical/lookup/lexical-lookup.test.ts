import { describe, expect, it } from "vitest";

import { THAI_ENGLISH_FIXTURE_DATASET } from "../datasets/thai-english/thai-english-fixture-dataset";
import { composeLexicalIndex } from "../index/lexical-index";
import { composeLexicalLookup } from "./lexical-lookup";

const TEST_INDEX = composeLexicalIndex({
  lexicalIndexId: "test:lookup:fixture-index",
  entries: THAI_ENGLISH_FIXTURE_DATASET,
});

const EMPTY_INDEX = composeLexicalIndex({
  lexicalIndexId: "test:lookup:empty-index",
  entries: [],
});

describe("composeLexicalLookup", () => {
  it("returns the correct schema version", () => {
    const result = composeLexicalLookup(
      {
        query: "กิน",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.schemaVersion).toBe(
      "lingua-core-platform:lexical-lookup-result@phase10",
    );
  });

  it("preserves query and direction in the result", () => {
    const result = composeLexicalLookup(
      {
        query: "ข้าว",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.query).toBe("ข้าว");
    expect(result.direction).toBe("th→en");
  });

  it("returns a frozen result", () => {
    const result = composeLexicalLookup(
      {
        query: "กิน",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.entries)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
  });

  it("resolves a known Thai headword in th→en direction", () => {
    const result = composeLexicalLookup(
      {
        query: "กิน",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].headword).toBe("กิน");
    expect(result.diagnostics).toHaveLength(0);
  });

  it("resolves a known English definition in en→th direction", () => {
    const result = composeLexicalLookup(
      {
        query: "rice",
        direction: "en→th",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].headword).toBe("ข้าว");
    expect(result.diagnostics).toHaveLength(0);
  });

  it("emits LEXICAL_KEY_NOT_FOUND diagnostic for missing Thai key", () => {
    const result = composeLexicalLookup(
      {
        query: "ไม่มี",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("LEXICAL_KEY_NOT_FOUND");
    expect(result.diagnostics[0].severity).toBe("warning");
  });

  it("emits LEXICAL_KEY_NOT_FOUND diagnostic for missing English key", () => {
    const result = composeLexicalLookup(
      {
        query: "nonexistent",
        direction: "en→th",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("LEXICAL_KEY_NOT_FOUND");
  });

  it("emits LEXICAL_INDEX_EMPTY diagnostic when index has no entries", () => {
    const result = composeLexicalLookup(
      {
        query: "กิน",
        direction: "th→en",
        lexicalIndexId: EMPTY_INDEX.lexicalIndexId,
      },
      EMPTY_INDEX,
    );

    expect(result.entries).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("LEXICAL_INDEX_EMPTY");
  });

  it("emits LEXICAL_KEY_WHITESPACE_REJECTED for leading whitespace in th→en query", () => {
    const result = composeLexicalLookup(
      {
        query: " กิน",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("LEXICAL_KEY_WHITESPACE_REJECTED");
  });

  it("emits LEXICAL_KEY_WHITESPACE_REJECTED for trailing whitespace in th→en query", () => {
    const result = composeLexicalLookup(
      {
        query: "กิน ",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("LEXICAL_KEY_WHITESPACE_REJECTED");
  });

  it("normalizes NFD Thai query to the same result as NFC query", () => {
    const nfc = composeLexicalLookup(
      {
        query: "กิน".normalize("NFC"),
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );
    const nfd = composeLexicalLookup(
      {
        query: "กิน".normalize("NFD"),
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(nfc.entries.map((e) => e.headword)).toEqual(
      nfd.entries.map((e) => e.headword),
    );
    expect(nfc.diagnostics.length).toBe(nfd.diagnostics.length);
  });

  it("produces structurally equivalent results for identical inputs (determinism)", () => {
    const inputA = {
      query: "น้ำ",
      direction: "th→en" as const,
      lexicalIndexId: TEST_INDEX.lexicalIndexId,
    };
    const inputB = {
      query: "น้ำ",
      direction: "th→en" as const,
      lexicalIndexId: TEST_INDEX.lexicalIndexId,
    };

    expect(composeLexicalLookup(inputA, TEST_INDEX)).toEqual(
      composeLexicalLookup(inputB, TEST_INDEX),
    );
  });

  it("is JSON round-trip safe", () => {
    const result = composeLexicalLookup(
      {
        query: "ดี",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
    expect(roundTripped).toEqual(result);
  });

  it("resolves a multi-word English gloss in en→th direction", () => {
    const result = composeLexicalLookup(
      {
        query: "to eat",
        direction: "en→th",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].headword).toBe("กิน");
    expect(result.diagnostics).toHaveLength(0);
  });

  it("admits a whitespace-bearing query in en→th direction (per-direction guard)", () => {
    expect(() => {
      composeLexicalLookup(
        {
          query: "to eat",
          direction: "en→th",
          lexicalIndexId: TEST_INDEX.lexicalIndexId,
        },
        TEST_INDEX,
      );
    }).not.toThrow();
  });

  it("still rejects whitespace in th→en direction via diagnostic (per-direction guard)", () => {
    const result = composeLexicalLookup(
      {
        query: "กิน ข้าว",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("LEXICAL_KEY_WHITESPACE_REJECTED");
  });

  it("returns the full whitespace-rejection result shape for a th→en query", () => {
    const result = composeLexicalLookup(
      {
        query: "กิน ข้าว",
        direction: "th→en",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);

    const diagnostic = result.diagnostics[0];
    expect(diagnostic.code).toBe("LEXICAL_KEY_WHITESPACE_REJECTED");
    expect(diagnostic.severity).toBe("warning");
    expect(diagnostic.path).toEqual(["query"]);
    expect(diagnostic.message).toBe(
      `Thai query must not contain whitespace: ${JSON.stringify("กิน ข้าว")}`,
    );

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.entries)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
  });

  it("resolves an en→th query with irregular whitespace via collapse/trim canonicalization", () => {
    const result = composeLexicalLookup(
      {
        query: "  to   eat ",
        direction: "en→th",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].headword).toBe("กิน");
    expect(result.diagnostics).toHaveLength(0);
  });

  it("still resolves a single-word en→th query unchanged (no regression)", () => {
    const result = composeLexicalLookup(
      {
        query: "rice",
        direction: "en→th",
        lexicalIndexId: TEST_INDEX.lexicalIndexId,
      },
      TEST_INDEX,
    );

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].headword).toBe("ข้าว");
    expect(result.diagnostics).toHaveLength(0);
  });
});
