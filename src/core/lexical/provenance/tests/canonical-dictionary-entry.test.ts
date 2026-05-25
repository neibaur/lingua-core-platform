import { describe, expect, it } from "vitest";

import type { LexicalEntryId } from "../../identity/lexical-entry-id";
import { composeDictionarySourceProvenance } from "../dictionary-source-provenance";
import {
  CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION,
  composeCanonicalDictionaryEntry,
  type CanonicalDictionaryEntry,
  type ComposeCanonicalDictionaryEntryInput,
} from "../canonical-dictionary-entry";

function makeProvenance() {
  return composeDictionarySourceProvenance({
    sourceId: "nectec:lexitron:v1",
    displayName: "NECTEC LEXiTRON",
    sourceUrl: "https://lexitron.nectec.or.th",
    licenseType: "Academic",
    licenseUrl: "https://lexitron.nectec.or.th/license",
    attributionRequired: true,
    attributionPayload: "NECTEC LEXiTRON Thai-English Dictionary",
  });
}

function makeInput(
  overrides?: Partial<ComposeCanonicalDictionaryEntryInput>,
): ComposeCanonicalDictionaryEntryInput {
  return {
    entryId: "thai:กิน:v1",
    provenance: makeProvenance(),
    headword: "กิน",
    romanized: "kin",
    definitions: [
      { definitionIndex: 0, definition: "to eat", partOfSpeech: "verb" },
    ],
    ...overrides,
  };
}

function makeInputWithoutRomanized(): ComposeCanonicalDictionaryEntryInput {
  return {
    entryId: "thai:ข้าว:v1",
    provenance: makeProvenance(),
    headword: "ข้าว",
    definitions: [
      { definitionIndex: 0, definition: "rice", partOfSpeech: "noun" },
    ],
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeCanonicalDictionaryEntry — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.schemaVersion).toBe(CANONICAL_DICTIONARY_ENTRY_SCHEMA_VERSION);
  });

  it("schemaVersion carries the @phase11 lineage identifier", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.schemaVersion).toBe(
      "lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeCanonicalDictionaryEntry — field passthrough", () => {
  it("preserves entryId", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.entryId).toBe("thai:กิน:v1");
  });

  it("preserves provenance by value equality", () => {
    const provenance = makeProvenance();
    const entry = composeCanonicalDictionaryEntry(makeInput({ provenance }));

    expect(entry.provenance).toEqual(provenance);
  });

  it("preserves provenance sourceId", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.provenance.sourceId).toBe("nectec:lexitron:v1");
  });

  it("preserves headword", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.headword).toBe("กิน");
  });

  it("preserves romanized when provided", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.romanized).toBe("kin");
  });

  it("romanized is absent when not provided", () => {
    const entry = composeCanonicalDictionaryEntry(makeInputWithoutRomanized());

    expect("romanized" in entry).toBe(false);
  });

  it("preserves definitions array length", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.definitions).toHaveLength(1);
  });

  it("preserves definition content", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(entry.definitions[0]).toEqual({
      definitionIndex: 0,
      definition: "to eat",
      partOfSpeech: "verb",
    });
  });

  it("preserves multiple definitions", () => {
    const entry = composeCanonicalDictionaryEntry(
      makeInput({
        definitions: [
          { definitionIndex: 0, definition: "to eat", partOfSpeech: "verb" },
          {
            definitionIndex: 1,
            definition: "to consume",
            partOfSpeech: "verb",
          },
        ],
      }),
    );

    expect(entry.definitions).toHaveLength(2);
    expect(entry.definitions[1]).toEqual({
      definitionIndex: 1,
      definition: "to consume",
      partOfSpeech: "verb",
    });
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeCanonicalDictionaryEntry — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect("evaluationTimestamp" in entry).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect("generatedFrom" in entry).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeCanonicalDictionaryEntry — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(Object.isFrozen(entry)).toBe(true);
  });

  it("is JSON round-trip safe with romanized", () => {
    const entry = composeCanonicalDictionaryEntry(makeInput());

    expect(() => {
      JSON.stringify(entry);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(entry),
    ) as CanonicalDictionaryEntry;

    expect(roundTripped.schemaVersion).toBe(entry.schemaVersion);
    expect(roundTripped.entryId).toBe(entry.entryId);
    expect(roundTripped.headword).toBe(entry.headword);
    expect(roundTripped.romanized).toBe(entry.romanized);
    expect(roundTripped.definitions).toHaveLength(entry.definitions.length);
  });

  it("is JSON round-trip safe without romanized", () => {
    const entry = composeCanonicalDictionaryEntry(makeInputWithoutRomanized());

    expect(() => {
      JSON.stringify(entry);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(entry),
    ) as CanonicalDictionaryEntry;

    expect(roundTripped.schemaVersion).toBe(entry.schemaVersion);
    expect(roundTripped.entryId).toBe(entry.entryId);
    expect(roundTripped.headword).toBe(entry.headword);
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeCanonicalDictionaryEntry — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeCanonicalDictionaryEntry(input)).toEqual(
      composeCanonicalDictionaryEntry(input),
    );
  });

  it("identical inputs without romanized produce identical outputs", () => {
    const input = makeInputWithoutRomanized();

    expect(composeCanonicalDictionaryEntry(input)).toEqual(
      composeCanonicalDictionaryEntry(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeCanonicalDictionaryEntry — invariant guards", () => {
  it("throws on empty entryId", () => {
    expect(() => {
      composeCanonicalDictionaryEntry(
        makeInput({ entryId: "" as LexicalEntryId }),
      );
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only entryId", () => {
    expect(() => {
      composeCanonicalDictionaryEntry(
        makeInput({ entryId: "   " as LexicalEntryId }),
      );
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty headword", () => {
    expect(() => {
      composeCanonicalDictionaryEntry(makeInput({ headword: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only headword", () => {
    expect(() => {
      composeCanonicalDictionaryEntry(makeInput({ headword: "   " }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty definitions array", () => {
    expect(() => {
      composeCanonicalDictionaryEntry(makeInput({ definitions: [] }));
    }).toThrow("[lexical invariant]");
  });

  it("accepts entry without romanized", () => {
    expect(() => {
      composeCanonicalDictionaryEntry(makeInputWithoutRomanized());
    }).not.toThrow();
  });

  it("accepts a noun partOfSpeech in definitions", () => {
    expect(() => {
      composeCanonicalDictionaryEntry(makeInputWithoutRomanized());
    }).not.toThrow();
  });
});
