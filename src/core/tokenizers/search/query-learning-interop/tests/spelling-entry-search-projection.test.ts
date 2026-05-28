import { describe, expect, it } from "vitest";

import {
  composeCanonicalDictionaryEntry,
  composeDictionarySourceProvenance,
  composeLexicalIndex,
  composeSpellingEntry,
  type CanonicalDictionaryEntry,
  type SpellingEntry,
} from "../../../../lexical";
import { THAI_ENGLISH_FIXTURE_DATASET } from "../../../../lexical/datasets/thai-english/thai-english-fixture-dataset";
import { CorpusIndexer } from "../../index-primitives";
import type { SearchCorpus } from "../../index-primitives";
import {
  composeLexicalQueryEnrichment,
  type LexicalQueryEnrichmentResult,
} from "../../query-lexical-interop";
import { executeQueryPipeline } from "../../query-pipeline";
import {
  SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION,
  composeSpellingEntrySearchProjection,
  type ComposeSpellingEntrySearchProjectionInput,
  type SpellingEntrySearchProjection,
} from "../spelling-entry-search-projection";

const GIN = "กิน";

function buildEmptyCorpus(): SearchCorpus {
  return new CorpusIndexer().build();
}

function buildEnrichmentResult(): LexicalQueryEnrichmentResult {
  const pipelineResult = executeQueryPipeline({
    rawQuery: GIN,
    corpus: buildEmptyCorpus(),
  });

  return composeLexicalQueryEnrichment({
    enrichmentId: "enrich-projection-fixture",
    pipelineResult,
    lexicalIndex: composeLexicalIndex({
      lexicalIndexId: "projection-test-index",
      entries: THAI_ENGLISH_FIXTURE_DATASET,
    }),
    direction: "th→en",
  });
}

function buildSpellingEntry(): SpellingEntry {
  const entry: CanonicalDictionaryEntry = composeCanonicalDictionaryEntry({
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

  return composeSpellingEntry({
    entry,
    phoneticNotation: "kin˧",
    toneClassification: "mid",
  });
}

function makeInput(
  overrides?: Partial<ComposeSpellingEntrySearchProjectionInput>,
): ComposeSpellingEntrySearchProjectionInput {
  return {
    projectionId: "projection:spelling:กิน:v1",
    enrichmentResult: buildEnrichmentResult(),
    spellingEntry: buildSpellingEntry(),
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjection — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(projection.schemaVersion).toBe(
      SPELLING_ENTRY_SEARCH_PROJECTION_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase13 lineage identifier", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(projection.schemaVersion).toBe(
      "lingua-core-platform:spelling-entry-search-projection@phase13",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjection — field passthrough", () => {
  it("preserves projectionId", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(projection.projectionId).toBe("projection:spelling:กิน:v1");
  });

  it("preserves enrichmentResult by value equality", () => {
    const enrichmentResult = buildEnrichmentResult();
    const projection = composeSpellingEntrySearchProjection(
      makeInput({ enrichmentResult }),
    );

    expect(projection.enrichmentResult).toEqual(enrichmentResult);
  });

  it("preserves enrichmentResult.schemaVersion", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(projection.enrichmentResult.schemaVersion).toBe(
      "lingua-core-platform:lexical-interop-enrichment@phase10",
    );
  });

  it("preserves spellingEntry by value equality", () => {
    const spellingEntry = buildSpellingEntry();
    const projection = composeSpellingEntrySearchProjection(
      makeInput({ spellingEntry }),
    );

    expect(projection.spellingEntry).toEqual(spellingEntry);
  });

  it("preserves spellingEntry.schemaVersion", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(projection.spellingEntry.schemaVersion).toBe(
      "lingua-core-platform:spelling-entry@phase12",
    );
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjection — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect("evaluationTimestamp" in projection).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect("generatedFrom" in projection).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjection — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(Object.isFrozen(projection)).toBe(true);
  });

  it("nested enrichmentResult remains frozen", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(Object.isFrozen(projection.enrichmentResult)).toBe(true);
  });

  it("nested spellingEntry remains frozen", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(Object.isFrozen(projection.spellingEntry)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const projection = composeSpellingEntrySearchProjection(makeInput());

    expect(() => {
      JSON.stringify(projection);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(projection),
    ) as SpellingEntrySearchProjection;

    expect(roundTripped.schemaVersion).toBe(projection.schemaVersion);
    expect(roundTripped.projectionId).toBe(projection.projectionId);
    expect(roundTripped.enrichmentResult.schemaVersion).toBe(
      projection.enrichmentResult.schemaVersion,
    );
    expect(roundTripped.spellingEntry.schemaVersion).toBe(
      projection.spellingEntry.schemaVersion,
    );
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjection — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeSpellingEntrySearchProjection(input)).toEqual(
      composeSpellingEntrySearchProjection(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjection — invariant guards", () => {
  it("throws when enrichmentResult schemaVersion does not match lexical-interop-enrichment@phase10", () => {
    const tamperedEnrichment = {
      ...buildEnrichmentResult(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as LexicalQueryEnrichmentResult;

    expect(() => {
      composeSpellingEntrySearchProjection(
        makeInput({ enrichmentResult: tamperedEnrichment }),
      );
    }).toThrow("[search-learning invariant]");
  });

  it("throws when spellingEntry schemaVersion does not match spelling-entry@phase12", () => {
    const tamperedSpelling = {
      ...buildSpellingEntry(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as SpellingEntry;

    expect(() => {
      composeSpellingEntrySearchProjection(
        makeInput({ spellingEntry: tamperedSpelling }),
      );
    }).toThrow("[search-learning invariant]");
  });

  it("throws on empty projectionId", () => {
    expect(() => {
      composeSpellingEntrySearchProjection(makeInput({ projectionId: "" }));
    }).toThrow("[search-learning invariant]");
  });

  it("throws on whitespace-only projectionId", () => {
    expect(() => {
      composeSpellingEntrySearchProjection(makeInput({ projectionId: "   " }));
    }).toThrow("[search-learning invariant]");
  });
});
