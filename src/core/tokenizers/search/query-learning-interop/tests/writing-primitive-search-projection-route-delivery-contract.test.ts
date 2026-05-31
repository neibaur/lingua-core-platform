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
  composeWritingPrimitiveSearchProjection,
  type WritingPrimitiveSearchProjection,
} from "../writing-primitive-search-projection";
import {
  WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
  composeWritingPrimitiveSearchProjectionRouteDeliveryContract,
  type ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput,
  type WritingPrimitiveSearchProjectionRouteDeliveryContract,
} from "../writing-primitive-search-projection-route-delivery-contract";

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

function buildSearchProjection(): WritingPrimitiveSearchProjection {
  return composeWritingPrimitiveSearchProjection({
    projectionId: "projection:writing:กิน:v1",
    enrichmentResult: buildEnrichmentResult(),
    writingPrimitive: buildWritingPrimitive(),
  });
}

function makeInput(
  overrides?: Partial<ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput>,
): ComposeWritingPrimitiveSearchProjectionRouteDeliveryContractInput {
  return {
    deliveryId: "delivery:writing:กิน:v1",
    searchProjection: buildSearchProjection(),
    staticContentAddress: "/th/writing/กิน",
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjectionRouteDeliveryContract — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.schemaVersion).toBe(
      WRITING_PRIMITIVE_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase14 lineage identifier", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.schemaVersion).toBe(
      "lingua-core-platform:writing-primitive-search-projection-route-delivery-contract@phase14",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjectionRouteDeliveryContract — field passthrough", () => {
  it("preserves deliveryId", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.deliveryId).toBe("delivery:writing:กิน:v1");
  });

  it("preserves staticContentAddress", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.staticContentAddress).toBe("/th/writing/กิน");
  });

  it("preserves searchProjection by value equality", () => {
    const searchProjection = buildSearchProjection();
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ searchProjection }),
      );

    expect(contract.searchProjection).toEqual(searchProjection);
  });

  it("preserves searchProjection.schemaVersion", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.searchProjection.schemaVersion).toBe(
      "lingua-core-platform:writing-primitive-search-projection@phase13",
    );
  });

  it("carries its own deliveryId distinct from the embedded projectionId", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.deliveryId).not.toBe(
      contract.searchProjection.projectionId,
    );
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjectionRouteDeliveryContract — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect("evaluationTimestamp" in contract).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect("generatedFrom" in contract).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjectionRouteDeliveryContract — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(Object.isFrozen(contract)).toBe(true);
  });

  it("nested searchProjection remains frozen", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(Object.isFrozen(contract.searchProjection)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const contract =
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(makeInput());

    expect(() => {
      JSON.stringify(contract);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(contract),
    ) as WritingPrimitiveSearchProjectionRouteDeliveryContract;

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

describe("composeWritingPrimitiveSearchProjectionRouteDeliveryContract — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(input),
    ).toEqual(
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(input),
    );
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeWritingPrimitiveSearchProjectionRouteDeliveryContract — invariant guards", () => {
  it("throws when searchProjection schemaVersion does not match writing-primitive-search-projection@phase13", () => {
    const tamperedProjection = {
      ...buildSearchProjection(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as WritingPrimitiveSearchProjection;

    expect(() => {
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ searchProjection: tamperedProjection }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on empty deliveryId", () => {
    expect(() => {
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ deliveryId: "" }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on whitespace-only deliveryId", () => {
    expect(() => {
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ deliveryId: "   " }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on empty staticContentAddress", () => {
    expect(() => {
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ staticContentAddress: "" }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on whitespace-only staticContentAddress", () => {
    expect(() => {
      composeWritingPrimitiveSearchProjectionRouteDeliveryContract(
        makeInput({ staticContentAddress: "   " }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });
});
