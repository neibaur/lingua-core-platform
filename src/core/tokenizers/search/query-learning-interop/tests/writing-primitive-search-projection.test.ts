import { describe, expect, it } from "vitest";

import {
  composeCanonicalDictionaryEntry,
  composeDictionarySourceProvenance,
  composeLexicalIndex,
  composeWritingPrimitive,
  type CanonicalDictionaryEntry,
  type WritingPrimitive,
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
  WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
  composeWritingPrimitiveSearchProjection,
  type ComposeWritingPrimitiveSearchProjectionInput,
  type WritingPrimitiveSearchProjection,
} from "../writing-primitive-search-projection";

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

function buildWritingPrimitive(): WritingPrimitive {
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

  return composeWritingPrimitive({
    writingPrimitiveId: "writing:กิน:v1",
    entry,
    referenceCharacterForm: "กิน",
    exerciseMode: "free-fill",
  });
}

function makeInput(
  overrides?: Partial<ComposeWritingPrimitiveSearchProjectionInput>,
): ComposeWritingPrimitiveSearchProjectionInput {
  return {
    projectionId: "projection:writing:กิน:v1",
    enrichmentResult: buildEnrichmentResult(),
    writingPrimitive: buildWritingPrimitive(),
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjection — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(projection.schemaVersion).toBe(
      WRITING_PRIMITIVE_SEARCH_PROJECTION_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase13 lineage identifier", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(projection.schemaVersion).toBe(
      "lingua-core-platform:writing-primitive-search-projection@phase13",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjection — field passthrough", () => {
  it("preserves projectionId", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(projection.projectionId).toBe("projection:writing:กิน:v1");
  });

  it("preserves enrichmentResult by value equality", () => {
    const enrichmentResult = buildEnrichmentResult();
    const projection = composeWritingPrimitiveSearchProjection(
      makeInput({ enrichmentResult }),
    );

    expect(projection.enrichmentResult).toEqual(enrichmentResult);
  });

  it("preserves enrichmentResult.schemaVersion", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(projection.enrichmentResult.schemaVersion).toBe(
      "lingua-core-platform:lexical-interop-enrichment@phase10",
    );
  });

  it("preserves writingPrimitive by value equality", () => {
    const writingPrimitive = buildWritingPrimitive();
    const projection = composeWritingPrimitiveSearchProjection(
      makeInput({ writingPrimitive }),
    );

    expect(projection.writingPrimitive).toEqual(writingPrimitive);
  });

  it("preserves writingPrimitive.schemaVersion", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(projection.writingPrimitive.schemaVersion).toBe(
      "lingua-core-platform:writing-primitive@phase12",
    );
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjection — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect("evaluationTimestamp" in projection).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect("generatedFrom" in projection).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjection — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(Object.isFrozen(projection)).toBe(true);
  });

  it("nested enrichmentResult remains frozen", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(Object.isFrozen(projection.enrichmentResult)).toBe(true);
  });

  it("nested writingPrimitive remains frozen", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(Object.isFrozen(projection.writingPrimitive)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const projection = composeWritingPrimitiveSearchProjection(makeInput());

    expect(() => {
      JSON.stringify(projection);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(projection),
    ) as WritingPrimitiveSearchProjection;

    expect(roundTripped.schemaVersion).toBe(projection.schemaVersion);
    expect(roundTripped.projectionId).toBe(projection.projectionId);
    expect(roundTripped.enrichmentResult.schemaVersion).toBe(
      projection.enrichmentResult.schemaVersion,
    );
    expect(roundTripped.writingPrimitive.schemaVersion).toBe(
      projection.writingPrimitive.schemaVersion,
    );
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjection — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(composeWritingPrimitiveSearchProjection(input)).toEqual(
      composeWritingPrimitiveSearchProjection(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjection — invariant guards", () => {
  it("throws when enrichmentResult schemaVersion does not match lexical-interop-enrichment@phase10", () => {
    const tamperedEnrichment = {
      ...buildEnrichmentResult(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as LexicalQueryEnrichmentResult;

    expect(() => {
      composeWritingPrimitiveSearchProjection(
        makeInput({ enrichmentResult: tamperedEnrichment }),
      );
    }).toThrow("[search-learning invariant]");
  });

  it("throws when writingPrimitive schemaVersion does not match writing-primitive@phase12", () => {
    const tamperedWriting = {
      ...buildWritingPrimitive(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as WritingPrimitive;

    expect(() => {
      composeWritingPrimitiveSearchProjection(
        makeInput({ writingPrimitive: tamperedWriting }),
      );
    }).toThrow("[search-learning invariant]");
  });

  it("throws on empty projectionId", () => {
    expect(() => {
      composeWritingPrimitiveSearchProjection(makeInput({ projectionId: "" }));
    }).toThrow("[search-learning invariant]");
  });

  it("throws on whitespace-only projectionId", () => {
    expect(() => {
      composeWritingPrimitiveSearchProjection(
        makeInput({ projectionId: "   " }),
      );
    }).toThrow("[search-learning invariant]");
  });
});
