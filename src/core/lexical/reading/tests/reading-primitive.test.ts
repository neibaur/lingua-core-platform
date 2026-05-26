import { describe, expect, it } from "vitest";

import {
  composeCanonicalDictionaryEntry,
  type CanonicalDictionaryEntry,
} from "../../provenance/canonical-dictionary-entry";
import { composeDictionarySourceProvenance } from "../../provenance/dictionary-source-provenance";
import {
  READING_PRIMITIVE_SCHEMA_VERSION,
  composeReadingPrimitive,
  type ComposeReadingPrimitiveInput,
  type ReadingPrimitive,
} from "../reading-primitive";

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
  overrides?: Partial<ComposeReadingPrimitiveInput>,
): ComposeReadingPrimitiveInput {
  return {
    readingPrimitiveId: "reading:กิน:v1",
    entry: makeEntry(),
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeReadingPrimitive — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(readingPrimitive.schemaVersion).toBe(
      READING_PRIMITIVE_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase12 lineage identifier", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(readingPrimitive.schemaVersion).toBe(
      "lingua-core-platform:reading-primitive@phase12",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeReadingPrimitive — field passthrough", () => {
  it("preserves entry by value equality", () => {
    const entry = makeEntry();
    const readingPrimitive = composeReadingPrimitive(makeInput({ entry }));

    expect(readingPrimitive.entry).toEqual(entry);
  });

  it("preserves entry.schemaVersion", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(readingPrimitive.entry.schemaVersion).toBe(
      "lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  });

  it("preserves entry.headword", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(readingPrimitive.entry.headword).toBe("กิน");
  });

  it("preserves entry.entryId", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(readingPrimitive.entry.entryId).toBe("thai:กิน:v1");
  });

  it("preserves readingPrimitiveId", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(readingPrimitive.readingPrimitiveId).toBe("reading:กิน:v1");
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeReadingPrimitive — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect("evaluationTimestamp" in readingPrimitive).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect("generatedFrom" in readingPrimitive).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeReadingPrimitive — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(Object.isFrozen(readingPrimitive)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const readingPrimitive = composeReadingPrimitive(makeInput());

    expect(() => {
      JSON.stringify(readingPrimitive);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(readingPrimitive),
    ) as ReadingPrimitive;

    expect(roundTripped.schemaVersion).toBe(readingPrimitive.schemaVersion);
    expect(roundTripped.readingPrimitiveId).toBe(
      readingPrimitive.readingPrimitiveId,
    );
    expect(roundTripped.entry.entryId).toBe(readingPrimitive.entry.entryId);
    expect(roundTripped.entry.headword).toBe(readingPrimitive.entry.headword);
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeReadingPrimitive — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeReadingPrimitive(input)).toEqual(
      composeReadingPrimitive(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeReadingPrimitive — invariant guards", () => {
  it("throws when entry schemaVersion does not match canonical-dictionary-entry@phase11", () => {
    const tamperedEntry = {
      ...makeEntry(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as CanonicalDictionaryEntry;

    expect(() => {
      composeReadingPrimitive(makeInput({ entry: tamperedEntry }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty readingPrimitiveId", () => {
    expect(() => {
      composeReadingPrimitive(makeInput({ readingPrimitiveId: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only readingPrimitiveId", () => {
    expect(() => {
      composeReadingPrimitive(makeInput({ readingPrimitiveId: "   " }));
    }).toThrow("[lexical invariant]");
  });
});
