import { describe, expect, it } from "vitest";

import {
  composeCanonicalDictionaryEntry,
  type CanonicalDictionaryEntry,
} from "../../provenance/canonical-dictionary-entry";
import { composeDictionarySourceProvenance } from "../../provenance/dictionary-source-provenance";
import {
  SPELLING_ENTRY_SCHEMA_VERSION,
  composeSpellingEntry,
  type ComposeSpellingEntryInput,
  type SpellingEntry,
} from "../spelling-entry";

function makeEntry(): CanonicalDictionaryEntry {
  return composeCanonicalDictionaryEntry({
    entryId: "thai:กิน:v1",
    provenance: composeDictionarySourceProvenance({
      sourceId: "nectec:lexitron:v1",
      displayName: "NECTEC LEXiTRON",
      sourceUrl: "https://lexitron.nectec.or.th",
      licenseType: "Academic",
      licenseUrl: "https://lexitron.nectec.or.th/license",
      attributionRequired: true,
      attributionPayload: "NECTEC LEXiTRON Thai-English Dictionary",
    }),
    headword: "กิน",
    romanized: "kin",
    definitions: [
      { definitionIndex: 0, definition: "to eat", partOfSpeech: "verb" },
    ],
  });
}

function makeInput(
  overrides?: Partial<ComposeSpellingEntryInput>,
): ComposeSpellingEntryInput {
  return {
    entry: makeEntry(),
    phoneticNotation: "/kin˧/",
    toneClassification: "mid",
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeSpellingEntry — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(spellingEntry.schemaVersion).toBe(SPELLING_ENTRY_SCHEMA_VERSION);
  });

  it("schemaVersion carries the @phase12 lineage identifier", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(spellingEntry.schemaVersion).toBe(
      "lingua-core-platform:spelling-entry@phase12",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeSpellingEntry — field passthrough", () => {
  it("preserves entry by value equality", () => {
    const entry = makeEntry();
    const spellingEntry = composeSpellingEntry(makeInput({ entry }));

    expect(spellingEntry.entry).toEqual(entry);
  });

  it("preserves entry.schemaVersion", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(spellingEntry.entry.schemaVersion).toBe(
      "lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  });

  it("preserves entry.headword", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(spellingEntry.entry.headword).toBe("กิน");
  });

  it("preserves entry.entryId", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(spellingEntry.entry.entryId).toBe("thai:กิน:v1");
  });

  it("preserves phoneticNotation", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(spellingEntry.phoneticNotation).toBe("/kin˧/");
  });

  it("preserves toneClassification", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(spellingEntry.toneClassification).toBe("mid");
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeSpellingEntry — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect("evaluationTimestamp" in spellingEntry).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect("generatedFrom" in spellingEntry).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeSpellingEntry — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(Object.isFrozen(spellingEntry)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const spellingEntry = composeSpellingEntry(makeInput());

    expect(() => {
      JSON.stringify(spellingEntry);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(spellingEntry),
    ) as SpellingEntry;

    expect(roundTripped.schemaVersion).toBe(spellingEntry.schemaVersion);
    expect(roundTripped.entry.entryId).toBe(spellingEntry.entry.entryId);
    expect(roundTripped.entry.headword).toBe(spellingEntry.entry.headword);
    expect(roundTripped.phoneticNotation).toBe(spellingEntry.phoneticNotation);
    expect(roundTripped.toneClassification).toBe(
      spellingEntry.toneClassification,
    );
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeSpellingEntry — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeSpellingEntry(input)).toEqual(composeSpellingEntry(input));
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeSpellingEntry — invariant guards", () => {
  it("throws when entry schemaVersion does not match canonical-dictionary-entry@phase11", () => {
    const tamperedEntry = {
      ...makeEntry(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as CanonicalDictionaryEntry;

    expect(() => {
      composeSpellingEntry(makeInput({ entry: tamperedEntry }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty phoneticNotation", () => {
    expect(() => {
      composeSpellingEntry(makeInput({ phoneticNotation: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only phoneticNotation", () => {
    expect(() => {
      composeSpellingEntry(makeInput({ phoneticNotation: "   " }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty toneClassification", () => {
    expect(() => {
      composeSpellingEntry(makeInput({ toneClassification: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only toneClassification", () => {
    expect(() => {
      composeSpellingEntry(makeInput({ toneClassification: "   " }));
    }).toThrow("[lexical invariant]");
  });
});
