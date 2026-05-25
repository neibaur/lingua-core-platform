import { describe, expect, it } from "vitest";

import { THAI_ENGLISH_FIXTURE_DATASET } from "../../../../lexical/datasets/thai-english/thai-english-fixture-dataset";
import { composeLexicalIndex } from "../../../../lexical/index/lexical-index";
import { CorpusIndexer } from "../../index-primitives";
import type { SearchCorpus } from "../../index-primitives";
import { executeQueryPipeline } from "../../query-pipeline";
import { composeLexicalQueryEnrichment } from "../pipeline/compose-lexical-query-enrichment";
import { LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION } from "../shared/lexical-interop-types";

const GIN = "กิน"; // "to eat" — present in fixture dataset
const KHAO = "ข้าว"; // "rice" — present in fixture dataset

function buildFixtureIndex() {
  return composeLexicalIndex({
    lexicalIndexId: "interop-test-index",
    entries: THAI_ENGLISH_FIXTURE_DATASET,
  });
}

function buildEmptyCorpus(): SearchCorpus {
  return new CorpusIndexer().build();
}

describe("composeLexicalQueryEnrichment", () => {
  it("returns the correct schemaVersion constant", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-001",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(result.schemaVersion).toBe(LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION);
    expect(result.generatedFrom).toBe("lexical-query-enrichment-result");
  });

  it("evaluationTimestamp is null", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-001",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(result.evaluationTimestamp).toBeNull();
  });

  it("derivedFrom is execution-plan-ir", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-001",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(result.derivedFrom).toBe("execution-plan-ir");
  });

  it("returns termEnrichments sorted in binary-lexicographic order by normalizedTerm", () => {
    // กิน starts with ก (U+0E01); ข้าว starts with ข (U+0E02) → กิน < ข้าว
    // Query submits them in reverse order to confirm sorting is applied
    const pipelineResult = executeQueryPipeline({
      rawQuery: `${KHAO} AND ${GIN}`,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-order",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(result.termCount).toBe(2);
    expect(result.termEnrichments[0].normalizedTerm).toBe(GIN);
    expect(result.termEnrichments[1].normalizedTerm).toBe(KHAO);
  });

  it("marks found terms as status 'found' and missing terms as 'not-found'", () => {
    const UNKNOWN = "zzunknown";

    const pipelineResult = executeQueryPipeline({
      rawQuery: `${GIN} AND ${UNKNOWN}`,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-status",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    const ginEntry = result.termEnrichments.find(
      (e) => e.normalizedTerm === GIN,
    );
    const unknownEntry = result.termEnrichments.find(
      (e) => e.normalizedTerm === UNKNOWN,
    );

    expect(ginEntry?.status).toBe("found");
    expect(unknownEntry?.status).toBe("not-found");
    expect(result.enrichedTermCount).toBe(1);
  });

  it("returns zero-term result without throwing when executionPlan is null", () => {
    // Two TEXT tokens without an operator triggers parse failure → executionPlan is null
    const pipelineResult = executeQueryPipeline({
      rawQuery: `${GIN} ${KHAO}`,
      corpus: buildEmptyCorpus(),
    });

    expect(pipelineResult.metadata.executionPlan).toBeNull();

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-null-plan",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(result.termCount).toBe(0);
    expect(result.enrichedTermCount).toBe(0);
    expect(result.termEnrichments).toHaveLength(0);
  });

  it("phrase plan node expands all constituent terms as separate enrichment entries", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: `"${GIN} ${KHAO}"`,
      corpus: buildEmptyCorpus(),
    });

    expect(pipelineResult.metadata.executionPlan?.root.type).toBe("phrase");

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-phrase",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(result.termCount).toBe(2);
    const terms = result.termEnrichments.map((e) => e.normalizedTerm);
    expect(terms).toContain(GIN);
    expect(terms).toContain(KHAO);
  });

  it("duplicate terms across boolean children are deduplicated to a single enrichment entry", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: `${GIN} AND ${GIN}`,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-dedup",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(result.termCount).toBe(1);
    expect(result.termEnrichments).toHaveLength(1);
    expect(result.termEnrichments[0].normalizedTerm).toBe(GIN);
  });

  it("throws on empty enrichmentId", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    expect(() => {
      composeLexicalQueryEnrichment({
        enrichmentId: "",
        pipelineResult,
        lexicalIndex: buildFixtureIndex(),
        direction: "th→en",
      });
    }).toThrow("[lexical-interop invariant]");
  });

  it("throws on whitespace-only enrichmentId", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    expect(() => {
      composeLexicalQueryEnrichment({
        enrichmentId: "   ",
        pipelineResult,
        lexicalIndex: buildFixtureIndex(),
        direction: "th→en",
      });
    }).toThrow("[lexical-interop invariant]");
  });

  it("applies deepFreezeStructure — top-level result is frozen", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-freeze",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(Object.isFrozen(result)).toBe(true);
  });

  it("applies deepFreezeStructure — termEnrichments array is frozen", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: `${GIN} AND ${KHAO}`,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-freeze-arr",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(Object.isFrozen(result.termEnrichments)).toBe(true);
  });

  it("applies deepFreezeStructure — each termEnrichment entry and its nested artifacts are frozen", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-freeze-deep",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    for (const entry of result.termEnrichments) {
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.lookupResult)).toBe(true);
      expect(Object.isFrozen(entry.lookupTrace)).toBe(true);
    }
  });

  it("produces identical results for identical inputs (replay-safe)", () => {
    const pipelineResultA = executeQueryPipeline({
      rawQuery: `${GIN} AND ${KHAO}`,
      corpus: buildEmptyCorpus(),
    });
    const pipelineResultB = executeQueryPipeline({
      rawQuery: `${GIN} AND ${KHAO}`,
      corpus: buildEmptyCorpus(),
    });

    const a = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-replay",
      pipelineResult: pipelineResultA,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });
    const b = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-replay",
      pipelineResult: pipelineResultB,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(a).toEqual(b);
  });

  it("is JSON round-trip safe", () => {
    const pipelineResult = executeQueryPipeline({
      rawQuery: GIN,
      corpus: buildEmptyCorpus(),
    });

    const result = composeLexicalQueryEnrichment({
      enrichmentId: "enrich-json",
      pipelineResult,
      lexicalIndex: buildFixtureIndex(),
      direction: "th→en",
    });

    expect(() => {
      JSON.stringify(result);
    }).not.toThrow();

    const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;

    expect(roundTripped.schemaVersion).toBe(result.schemaVersion);
    expect(roundTripped.enrichmentId).toBe(result.enrichmentId);
    expect(roundTripped.evaluationTimestamp).toBeNull();
    expect(roundTripped.derivedFrom).toBe(result.derivedFrom);
    expect(roundTripped.termCount).toBe(result.termCount);
  });
});
