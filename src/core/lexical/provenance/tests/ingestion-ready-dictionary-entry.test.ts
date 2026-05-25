import { describe, expect, it } from "vitest";

import { composeDictionaryLicensingBoundary } from "../dictionary-licensing-boundary";
import { composeDictionarySourceProvenance } from "../dictionary-source-provenance";
import { composeCanonicalDictionaryEntry } from "../canonical-dictionary-entry";
import {
  INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION,
  composeIngestionReadyDictionaryEntry,
  type ComposeIngestionReadyDictionaryEntryInput,
  type IngestionReadyDictionaryEntry,
} from "../ingestion-ready-dictionary-entry";

function makeEntry() {
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

function makeLicensingBoundary() {
  return composeDictionaryLicensingBoundary({
    sourceId: "nectec:lexitron:v1",
    isCommerciallyViable: "unknown",
    redistributionAllowed: "unknown",
    licenseType: "Academic",
    licenseUrl: "https://lexitron.nectec.or.th/license",
    attributionRequired: "unknown",
  });
}

function makeInput(
  overrides?: Partial<ComposeIngestionReadyDictionaryEntryInput>,
): ComposeIngestionReadyDictionaryEntryInput {
  return {
    entry: makeEntry(),
    licensingBoundary: makeLicensingBoundary(),
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeIngestionReadyDictionaryEntry — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(record.schemaVersion).toBe(
      INGESTION_READY_DICTIONARY_ENTRY_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase11 lineage identifier", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(record.schemaVersion).toBe(
      "lingua-core-platform:ingestion-ready-dictionary-entry@phase11",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeIngestionReadyDictionaryEntry — field passthrough", () => {
  it("preserves entry by value equality", () => {
    const entry = makeEntry();
    const record = composeIngestionReadyDictionaryEntry(makeInput({ entry }));

    expect(record.entry).toEqual(entry);
  });

  it("preserves entry.schemaVersion", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(record.entry.schemaVersion).toBe(
      "lingua-core-platform:canonical-dictionary-entry@phase11",
    );
  });

  it("preserves entry.entryId", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(record.entry.entryId).toBe("thai:กิน:v1");
  });

  it("preserves licensingBoundary by value equality", () => {
    const licensingBoundary = makeLicensingBoundary();
    const record = composeIngestionReadyDictionaryEntry(
      makeInput({ licensingBoundary }),
    );

    expect(record.licensingBoundary).toEqual(licensingBoundary);
  });

  it("preserves licensingBoundary.schemaVersion", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(record.licensingBoundary.schemaVersion).toBe(
      "lingua-core-platform:dictionary-licensing-boundary@phase11",
    );
  });

  it("preserves licensingBoundary.sourceId", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(record.licensingBoundary.sourceId).toBe("nectec:lexitron:v1");
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeIngestionReadyDictionaryEntry — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect("evaluationTimestamp" in record).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect("generatedFrom" in record).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeIngestionReadyDictionaryEntry — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(Object.isFrozen(record)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const record = composeIngestionReadyDictionaryEntry(makeInput());

    expect(() => {
      JSON.stringify(record);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(record),
    ) as IngestionReadyDictionaryEntry;

    expect(roundTripped.schemaVersion).toBe(record.schemaVersion);
    expect(roundTripped.entry.entryId).toBe(record.entry.entryId);
    expect(roundTripped.licensingBoundary.sourceId).toBe(
      record.licensingBoundary.sourceId,
    );
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeIngestionReadyDictionaryEntry — replay-safety", () => {
  it("identical inputs produce identical frozen output", () => {
    const input = makeInput();

    expect(composeIngestionReadyDictionaryEntry(input)).toEqual(
      composeIngestionReadyDictionaryEntry(input),
    );
  });
});
