import { describe, expect, it } from "vitest";

import {
  composeCanonicalDictionaryEntry,
  composeDictionarySourceProvenance,
  composeLexicalIndex,
  composeReadingPrimitive,
  type CanonicalDictionaryEntry,
  type ReadingPrimitive,
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
  READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
  composeReadingPrimitiveSearchProjection,
  type ComposeReadingPrimitiveSearchProjectionInput,
  type ReadingPrimitiveSearchProjection,
} from "../reading-primitive-search-projection";

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

function buildReadingPrimitive(): ReadingPrimitive {
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

  return composeReadingPrimitive({
    readingPrimitiveId: "reading:กิน:v1",
    entry,
  });
}

function makeInput(
  overrides?: Partial<ComposeReadingPrimitiveSearchProjectionInput>,
): ComposeReadingPrimitiveSearchProjectionInput {
  return {
    projectionId: "projection:reading:กิน:v1",
    enrichmentResult: buildEnrichmentResult(),
    readingPrimitive: buildReadingPrimitive(),
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjection — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(projection.schemaVersion).toBe(
      READING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase13 lineage identifier", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(projection.schemaVersion).toBe(
      "lingua-core-platform:reading-primitive-search-projection@phase13",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjection — field passthrough", () => {
  it("preserves projectionId", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(projection.projectionId).toBe("projection:reading:กิน:v1");
  });

  it("preserves enrichmentResult by value equality", () => {
    const enrichmentResult = buildEnrichmentResult();
    const projection = composeReadingPrimitiveSearchProjection(
      makeInput({ enrichmentResult }),
    );

    expect(projection.enrichmentResult).toEqual(enrichmentResult);
  });

  it("preserves enrichmentResult.schemaVersion", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(projection.enrichmentResult.schemaVersion).toBe(
      "lingua-core-platform:lexical-interop-enrichment@phase10",
    );
  });

  it("preserves readingPrimitive by value equality", () => {
    const readingPrimitive = buildReadingPrimitive();
    const projection = composeReadingPrimitiveSearchProjection(
      makeInput({ readingPrimitive }),
    );

    expect(projection.readingPrimitive).toEqual(readingPrimitive);
  });

  it("preserves readingPrimitive.schemaVersion", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(projection.readingPrimitive.schemaVersion).toBe(
      "lingua-core-platform:reading-primitive@phase12",
    );
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjection — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect("evaluationTimestamp" in projection).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect("generatedFrom" in projection).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjection — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(Object.isFrozen(projection)).toBe(true);
  });

  it("nested enrichmentResult remains frozen", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(Object.isFrozen(projection.enrichmentResult)).toBe(true);
  });

  it("nested readingPrimitive remains frozen", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(Object.isFrozen(projection.readingPrimitive)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const projection = composeReadingPrimitiveSearchProjection(makeInput());

    expect(() => {
      JSON.stringify(projection);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(projection),
    ) as ReadingPrimitiveSearchProjection;

    expect(roundTripped.schemaVersion).toBe(projection.schemaVersion);
    expect(roundTripped.projectionId).toBe(projection.projectionId);
    expect(roundTripped.enrichmentResult.schemaVersion).toBe(
      projection.enrichmentResult.schemaVersion,
    );
    expect(roundTripped.readingPrimitive.schemaVersion).toBe(
      projection.readingPrimitive.schemaVersion,
    );
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjection — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeReadingPrimitiveSearchProjection(input)).toEqual(
      composeReadingPrimitiveSearchProjection(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjection — invariant guards", () => {
  it("throws when enrichmentResult schemaVersion does not match lexical-interop-enrichment@phase10", () => {
    const tamperedEnrichment = {
      ...buildEnrichmentResult(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as LexicalQueryEnrichmentResult;

    expect(() => {
      composeReadingPrimitiveSearchProjection(
        makeInput({ enrichmentResult: tamperedEnrichment }),
      );
    }).toThrow("[search-learning invariant]");
  });

  it("throws when readingPrimitive schemaVersion does not match reading-primitive@phase12", () => {
    const tamperedReading = {
      ...buildReadingPrimitive(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as ReadingPrimitive;

    expect(() => {
      composeReadingPrimitiveSearchProjection(
        makeInput({ readingPrimitive: tamperedReading }),
      );
    }).toThrow("[search-learning invariant]");
  });

  it("throws on empty projectionId", () => {
    expect(() => {
      composeReadingPrimitiveSearchProjection(makeInput({ projectionId: "" }));
    }).toThrow("[search-learning invariant]");
  });

  it("throws on whitespace-only projectionId", () => {
    expect(() => {
      composeReadingPrimitiveSearchProjection(
        makeInput({ projectionId: "   " }),
      );
    }).toThrow("[search-learning invariant]");
  });
});
