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
  composeReadingPrimitiveSearchProjection,
  type ReadingPrimitiveSearchProjection,
} from "../reading-primitive-search-projection";
import {
  READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
  composeReadingPrimitiveSearchProjectionRouteDeliveryContract,
  type ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput,
  type ReadingPrimitiveSearchProjectionRouteDeliveryContract,
} from "../reading-primitive-search-projection-route-delivery-contract";

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
    enrichmentId: "enrich-delivery-fixture",
    pipelineResult,
    lexicalIndex: composeLexicalIndex({
      lexicalIndexId: "delivery-test-index",
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

function buildSearchProjection(): ReadingPrimitiveSearchProjection {
  return composeReadingPrimitiveSearchProjection({
    projectionId: "projection:reading:กิน:v1",
    enrichmentResult: buildEnrichmentResult(),
    readingPrimitive: buildReadingPrimitive(),
  });
}

function makeInput(
  overrides?: Partial<ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput>,
): ComposeReadingPrimitiveSearchProjectionRouteDeliveryContractInput {
  return {
    deliveryId: "delivery:reading:กิน:v1",
    searchProjection: buildSearchProjection(),
    staticContentAddress: "/th/reading/กิน",
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjectionRouteDeliveryContract — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.schemaVersion).toBe(
      READING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase14 lineage identifier", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.schemaVersion).toBe(
      "lingua-core-platform:reading-primitive-search-projection-route-delivery-contract@phase14",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjectionRouteDeliveryContract — field passthrough", () => {
  it("preserves deliveryId", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.deliveryId).toBe("delivery:reading:กิน:v1");
  });

  it("preserves staticContentAddress", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.staticContentAddress).toBe("/th/reading/กิน");
  });

  it("preserves searchProjection by value equality", () => {
    const searchProjection = buildSearchProjection();
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ searchProjection }),
      );

    expect(contract.searchProjection).toEqual(searchProjection);
  });

  it("preserves searchProjection.schemaVersion", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.searchProjection.schemaVersion).toBe(
      "lingua-core-platform:reading-primitive-search-projection@phase13",
    );
  });

  it("carries its own deliveryId distinct from the embedded projectionId", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.deliveryId).not.toBe(
      contract.searchProjection.projectionId,
    );
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjectionRouteDeliveryContract — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect("evaluationTimestamp" in contract).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect("generatedFrom" in contract).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjectionRouteDeliveryContract — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(Object.isFrozen(contract)).toBe(true);
  });

  it("nested searchProjection remains frozen", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(Object.isFrozen(contract.searchProjection)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const contract =
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(() => {
      JSON.stringify(contract);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(contract),
    ) as ReadingPrimitiveSearchProjectionRouteDeliveryContract;

    expect(roundTripped.schemaVersion).toBe(contract.schemaVersion);
    expect(roundTripped.deliveryId).toBe(contract.deliveryId);
    expect(roundTripped.staticContentAddress).toBe(
      contract.staticContentAddress,
    );
    expect(roundTripped.searchProjection.schemaVersion).toBe(
      contract.searchProjection.schemaVersion,
    );
  });
});

// ─── replay-safety ────────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjectionRouteDeliveryContract — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(input),
    ).toEqual(
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeReadingPrimitiveSearchProjectionRouteDeliveryContract — invariant guards", () => {
  it("throws when searchProjection schemaVersion does not match reading-primitive-search-projection@phase13", () => {
    const tamperedProjection = {
      ...buildSearchProjection(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as ReadingPrimitiveSearchProjection;

    expect(() => {
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ searchProjection: tamperedProjection }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on empty deliveryId", () => {
    expect(() => {
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ deliveryId: "" }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on whitespace-only deliveryId", () => {
    expect(() => {
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ deliveryId: "   " }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on empty staticContentAddress", () => {
    expect(() => {
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ staticContentAddress: "" }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on whitespace-only staticContentAddress", () => {
    expect(() => {
      composeReadingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ staticContentAddress: "   " }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });
});
