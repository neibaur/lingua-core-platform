import { describe, expect, it } from "vitest";

import {
  composeCanonicalDictionaryEntry,
  type CanonicalDictionaryEntry,
} from "../../provenance/canonical-dictionary-entry";
import { composeDictionarySourceProvenance } from "../../provenance/dictionary-source-provenance";
import {
  WRITING_PRIMITIVE_SCHEMA_VERSION,
  composeWritingPrimitive,
  type ComposeWritingPrimitiveInput,
  type WritingPrimitive,
  type WritingPrimitiveExerciseMode,
} from "../writing-primitive";

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
  overrides?: Partial<ComposeWritingPrimitiveInput>,
): ComposeWritingPrimitiveInput {
  return {
    writingPrimitiveId: "writing:กิน:v1",
    entry: makeEntry(),
    referenceCharacterForm: "กิน",
    exerciseMode: "free-fill",
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeWritingPrimitive — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(writingPrimitive.schemaVersion).toBe(
      WRITING_PRIMITIVE_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase12 lineage identifier", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(writingPrimitive.schemaVersion).toBe(
      "lingua-core-platform:writing-primitive@phase12",
    );
  });
});

// ─── exercise mode construction ───────────────────────────────────────────────

describe("composeWritingPrimitive — exercise mode construction", () => {
  it('constructs successfully with exerciseMode "free-fill"', () => {
    const writingPrimitive = composeWritingPrimitive(
      makeInput({ exerciseMode: "free-fill" }),
    );

    expect(writingPrimitive.exerciseMode).toBe("free-fill");
  });

  it('constructs successfully with exerciseMode "template-overlay"', () => {
    const writingPrimitive = composeWritingPrimitive(
      makeInput({ exerciseMode: "template-overlay" }),
    );

    expect(writingPrimitive.exerciseMode).toBe("template-overlay");
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeWritingPrimitive — field passthrough", () => {
  it("preserves entry by value equality", () => {
    const entry = makeEntry();
    const writingPrimitive = composeWritingPrimitive(makeInput({ entry }));

    expect(writingPrimitive.entry).toEqual(entry);
  });

  it("preserves entry.schemaVersion", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(writingPrimitive.entry.schemaVersion).toBe(
      "lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  });

  it("preserves entry.headword", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(writingPrimitive.entry.headword).toBe("กิน");
  });

  it("preserves entry.entryId", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(writingPrimitive.entry.entryId).toBe("thai:กิน:v1");
  });

  it("preserves writingPrimitiveId", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(writingPrimitive.writingPrimitiveId).toBe("writing:กิน:v1");
  });

  it("preserves referenceCharacterForm", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(writingPrimitive.referenceCharacterForm).toBe("กิน");
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeWritingPrimitive — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect("evaluationTimestamp" in writingPrimitive).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect("generatedFrom" in writingPrimitive).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeWritingPrimitive — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(Object.isFrozen(writingPrimitive)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const writingPrimitive = composeWritingPrimitive(makeInput());

    expect(() => {
      JSON.stringify(writingPrimitive);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(writingPrimitive),
    ) as WritingPrimitive;

    expect(roundTripped.schemaVersion).toBe(writingPrimitive.schemaVersion);
    expect(roundTripped.writingPrimitiveId).toBe(
      writingPrimitive.writingPrimitiveId,
    );
    expect(roundTripped.entry.entryId).toBe(writingPrimitive.entry.entryId);
    expect(roundTripped.entry.headword).toBe(writingPrimitive.entry.headword);
    expect(roundTripped.referenceCharacterForm).toBe(
      writingPrimitive.referenceCharacterForm,
    );
    expect(roundTripped.exerciseMode).toBe(writingPrimitive.exerciseMode);
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeWritingPrimitive — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeWritingPrimitive(input)).toEqual(
      composeWritingPrimitive(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeWritingPrimitive — invariant guards", () => {
  it("throws when entry schemaVersion does not match canonical-dictionary-entry@phase11", () => {
    const tamperedEntry = {
      ...makeEntry(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as CanonicalDictionaryEntry;

    expect(() => {
      composeWritingPrimitive(makeInput({ entry: tamperedEntry }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty writingPrimitiveId", () => {
    expect(() => {
      composeWritingPrimitive(makeInput({ writingPrimitiveId: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only writingPrimitiveId", () => {
    expect(() => {
      composeWritingPrimitive(makeInput({ writingPrimitiveId: "   " }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on empty referenceCharacterForm", () => {
    expect(() => {
      composeWritingPrimitive(makeInput({ referenceCharacterForm: "" }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on whitespace-only referenceCharacterForm", () => {
    expect(() => {
      composeWritingPrimitive(makeInput({ referenceCharacterForm: "   " }));
    }).toThrow("[lexical invariant]");
  });

  it("throws on invalid exerciseMode value", () => {
    expect(() => {
      composeWritingPrimitive(
        makeInput({
          exerciseMode:
            "invalid-mode" as unknown as WritingPrimitiveExerciseMode,
        }),
      );
    }).toThrow("[lexical invariant]");
  });
});
