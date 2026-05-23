import { describe, expect, it } from "vitest";

import { assertValidLexicalEntryId, composeEntryId } from "./lexical-entry-id";

describe("composeEntryId", () => {
  it("produces a well-formed 3-segment LexicalEntryId", () => {
    const id = composeEntryId({
      languageCode: "thai",
      headword: "กิน",
      version: 1,
    });

    expect(id).toBe("thai:กิน:v1");
    expect(id.split(":")).toHaveLength(3);
  });

  it("stable round-trip: composeEntryId output passes assertValidLexicalEntryId", () => {
    const id = composeEntryId({
      languageCode: "thai",
      headword: "ข้าว",
      version: 1,
    });

    expect(() => {
      assertValidLexicalEntryId(id);
    }).not.toThrow();
  });

  it("round-trip is stable across multiple calls with the same input", () => {
    const input = {
      languageCode: "thai" as const,
      headword: "น้ำ",
      version: 1,
    };

    expect(composeEntryId(input)).toBe(composeEntryId(input));
  });

  it("NFC and NFD forms of the same Thai headword produce identical IDs", () => {
    const nfc = composeEntryId({
      languageCode: "thai",
      headword: "กิน".normalize("NFC"),
      version: 1,
    });
    const nfd = composeEntryId({
      languageCode: "thai",
      headword: "กิน".normalize("NFD"),
      version: 1,
    });

    expect(nfc).toBe(nfd);
  });

  it("normalizes Thai digits in the headword before constructing the ID", () => {
    const id = composeEntryId({
      languageCode: "thai",
      headword: "ปี๒๕",
      version: 1,
    });

    expect(id).toBe("thai:ปี25:v1");
  });

  it("supports version numbers greater than 1", () => {
    const id = composeEntryId({
      languageCode: "thai",
      headword: "กิน",
      version: 2,
    });

    expect(id).toBe("thai:กิน:v2");
  });

  it("supports English language code", () => {
    const id = composeEntryId({
      languageCode: "en",
      headword: "eat",
      version: 1,
    });

    expect(id).toBe("en:eat:v1");
  });

  it("throws on leading whitespace in headword", () => {
    expect(() => {
      composeEntryId({ languageCode: "thai", headword: " กิน", version: 1 });
    }).toThrow("[lexical invariant]");
  });

  it("throws on trailing whitespace in headword", () => {
    expect(() => {
      composeEntryId({ languageCode: "thai", headword: "กิน ", version: 1 });
    }).toThrow("[lexical invariant]");
  });

  it("throws on interior whitespace in headword", () => {
    expect(() => {
      composeEntryId({
        languageCode: "thai",
        headword: "กิน ข้าว",
        version: 1,
      });
    }).toThrow("[lexical invariant]");
  });

  it("throws when headword canonical key contains a raw colon", () => {
    // Colons are the segment delimiter — they cannot appear in the key segment.
    expect(() => {
      composeEntryId({ languageCode: "thai", headword: "a:b", version: 1 });
    }).toThrow("[lexical invariant]");
  });

  it("throws on version 0", () => {
    expect(() => {
      composeEntryId({ languageCode: "thai", headword: "กิน", version: 0 });
    }).toThrow("[lexical invariant]");
  });

  it("throws on negative version", () => {
    expect(() => {
      composeEntryId({ languageCode: "thai", headword: "กิน", version: -1 });
    }).toThrow("[lexical invariant]");
  });

  it("throws on non-integer version", () => {
    expect(() => {
      composeEntryId({ languageCode: "thai", headword: "กิน", version: 1.5 });
    }).toThrow("[lexical invariant]");
  });
});

describe("assertValidLexicalEntryId", () => {
  it("accepts a well-formed thai ID", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน:v1");
    }).not.toThrow();
  });

  it("accepts a well-formed en ID", () => {
    expect(() => {
      assertValidLexicalEntryId("en:eat:v1");
    }).not.toThrow();
  });

  it("accepts version numbers greater than 1", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน:v42");
    }).not.toThrow();
  });

  it("rejects an ID with only 2 segments", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน");
    }).toThrow("[lexical invariant]");
  });

  it("rejects an ID with 4 segments", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:greeting:sawasdee:v1");
    }).toThrow("[lexical invariant]");
  });

  it("rejects an unknown language code", () => {
    expect(() => {
      assertValidLexicalEntryId("zh:水:v1");
    }).toThrow("[lexical invariant]");
  });

  it("rejects an empty canonical key segment", () => {
    expect(() => {
      assertValidLexicalEntryId("thai::v1");
    }).toThrow("[lexical invariant]");
  });

  it("rejects whitespace in the canonical key segment", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน ข้าว:v1");
    }).toThrow("[lexical invariant]");
  });

  it("rejects a version segment without the v prefix", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน:1");
    }).toThrow("[lexical invariant]");
  });

  it("rejects version v0", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน:v0");
    }).toThrow("[lexical invariant]");
  });

  it("rejects a negative version", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน:v-1");
    }).toThrow("[lexical invariant]");
  });

  it("rejects a non-integer version suffix", () => {
    expect(() => {
      assertValidLexicalEntryId("thai:กิน:v1.5");
    }).toThrow("[lexical invariant]");
  });

  it("rejects an empty string", () => {
    expect(() => {
      assertValidLexicalEntryId("");
    }).toThrow("[lexical invariant]");
  });
});
