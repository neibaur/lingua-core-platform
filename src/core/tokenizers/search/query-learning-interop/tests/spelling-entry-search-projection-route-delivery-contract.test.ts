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
  composeSpellingEntrySearchProjection,
  type SpellingEntrySearchProjection,
} from "../spelling-entry-search-projection";
import {
  SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
  composeSpellingEntrySearchProjectionRouteDeliveryContract,
  type ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput,
  type SpellingEntrySearchProjectionRouteDeliveryContract,
} from "../spelling-entry-search-projection-route-delivery-contract";

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

function buildSearchProjection(): SpellingEntrySearchProjection {
  return composeSpellingEntrySearchProjection({
    projectionId: "projection:spelling:กิน:v1",
    enrichmentResult: buildEnrichmentResult(),
    spellingEntry: buildSpellingEntry(),
  });
}

function makeInput(
  overrides?: Partial<ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput>,
): ComposeSpellingEntrySearchProjectionRouteDeliveryContractInput {
  return {
    deliveryId: "delivery:spelling:กิน:v1",
    searchProjection: buildSearchProjection(),
    staticContentAddress: "/th/spelling/กิน",
    ...overrides,
  };
}

// ─── schema version ───────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjectionRouteDeliveryContract — schema version", () => {
  it("returns the correct schemaVersion constant", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.schemaVersion).toBe(
      SPELLING_ENTRY_SEARCH_PROJECTION_ROUTE_DELIVERY_CONTRACT_SCHEMA_VERSION,
    );
  });

  it("schemaVersion carries the @phase14 lineage identifier", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.schemaVersion).toBe(
      "lingua-core-platform:spelling-entry-search-projection-route-delivery-contract@phase14",
    );
  });
});

// ─── field passthrough ────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjectionRouteDeliveryContract — field passthrough", () => {
  it("preserves deliveryId", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.deliveryId).toBe("delivery:spelling:กิน:v1");
  });

  it("preserves staticContentAddress", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.staticContentAddress).toBe("/th/spelling/กิน");
  });

  it("preserves searchProjection by value equality", () => {
    const searchProjection = buildSearchProjection();
    const contract = composeSpellingEntrySearchProjectionRouteDeliveryContract(
      makeInput({ searchProjection }),
    );

    expect(contract.searchProjection).toEqual(searchProjection);
  });

  it("preserves searchProjection.schemaVersion", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.searchProjection.schemaVersion).toBe(
      "lingua-core-platform:spelling-entry-search-projection@phase13",
    );
  });

  it("carries its own deliveryId distinct from the embedded projectionId", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(contract.deliveryId).not.toBe(
      contract.searchProjection.projectionId,
    );
  });
});

// ─── artifact classification ──────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjectionRouteDeliveryContract — artifact classification", () => {
  it("does not carry evaluationTimestamp (structural artifact, not governance-reporting)", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect("evaluationTimestamp" in contract).toBe(false);
  });

  it("does not carry generatedFrom (structural artifact, not governance-reporting)", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect("generatedFrom" in contract).toBe(false);
  });
});

// ─── immutability ─────────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjectionRouteDeliveryContract — immutability", () => {
  it("returns a deeply frozen structure", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(Object.isFrozen(contract)).toBe(true);
  });

  it("nested searchProjection remains frozen", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(Object.isFrozen(contract.searchProjection)).toBe(true);
  });

  it("is JSON round-trip safe", () => {
    const contract =
      composeSpellingEntrySearchProjectionRouteDeliveryContract(makeInput());

    expect(() => {
      JSON.stringify(contract);
    }).not.toThrow();

    const roundTripped = JSON.parse(
      JSON.stringify(contract),
    ) as SpellingEntrySearchProjectionRouteDeliveryContract;

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

describe("composeSpellingEntrySearchProjectionRouteDeliveryContract — replay-safety", () => {
  it("identical inputs produce identical outputs", () => {
    const input = makeInput();

    expect(
      composeSpellingEntrySearchProjectionRouteDeliveryContract(input),
    ).toEqual(composeSpellingEntrySearchProjectionRouteDeliveryContract(input));
  });
});

// ─── invariant guards ─────────────────────────────────────────────────────────

describe("composeSpellingEntrySearchProjectionRouteDeliveryContract — invariant guards", () => {
  it("throws when searchProjection schemaVersion does not match spelling-entry-search-projection@phase13", () => {
    const tamperedProjection = {
      ...buildSearchProjection(),
      schemaVersion: "lingua-core-platform:wrong@phase10",
    } as unknown as SpellingEntrySearchProjection;

    expect(() => {
      composeSpellingEntrySearchProjectionRouteDeliveryContract(
        makeInput({ searchProjection: tamperedProjection }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on empty deliveryId", () => {
    expect(() => {
      composeSpellingEntrySearchProjectionRouteDeliveryContract(
        makeInput({ deliveryId: "" }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on whitespace-only deliveryId", () => {
    expect(() => {
      composeSpellingEntrySearchProjectionRouteDeliveryContract(
        makeInput({ deliveryId: "   " }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on empty staticContentAddress", () => {
    expect(() => {
      composeSpellingEntrySearchProjectionRouteDeliveryContract(
        makeInput({ staticContentAddress: "" }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });

  it("throws on whitespace-only staticContentAddress", () => {
    expect(() => {
      composeSpellingEntrySearchProjectionRouteDeliveryContract(
        makeInput({ staticContentAddress: "   " }),
      );
    }).toThrow("[delivery-boundary invariant]");
  });
});
