import { describe, expect, it } from "vitest";

import { THAI_ENGLISH_FIXTURE_DATASET } from "../../../../../lexical/datasets/thai-english/thai-english-fixture-dataset";
import { composeLexicalIndex } from "../../../../../lexical/index/lexical-index";
import { CorpusIndexer } from "../../../index-primitives";
import type { SearchCorpus } from "../../../index-primitives";
import { executeQueryPipeline } from "../../../query-pipeline";
import { composeLexicalQueryEnrichment } from "../../pipeline/compose-lexical-query-enrichment";
import { composeLexicalEnrichmentReport } from "../compose-lexical-enrichment-report";
import { LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION } from "../lexical-enrichment-report-types";

const GIN = "กิน"; // "to eat" — present in fixture dataset
const KHAO = "ข้าว"; // "rice" — present in fixture dataset

function buildFixtureIndex() {
  return composeLexicalIndex({
    lexicalIndexId: "report-test-index",
    entries: THAI_ENGLISH_FIXTURE_DATASET,
  });
}

function buildEmptyLexicalIndex() {
  return composeLexicalIndex({
    lexicalIndexId: "report-empty-index",
    entries: [],
  });
}

function buildEmptyCorpus(): SearchCorpus {
  return new CorpusIndexer().build();
}

function buildEnrichment(
  rawQuery: string,
  enrichmentId: string,
  indexBuilder: () => ReturnType<
    typeof composeLexicalIndex
  > = buildFixtureIndex,
) {
  const pipelineResult = executeQueryPipeline({
    rawQuery,
    corpus: buildEmptyCorpus(),
  });
  return composeLexicalQueryEnrichment({
    enrichmentId,
    pipelineResult,
    lexicalIndex: indexBuilder(),
    direction: "th→en",
  });
}

describe("composeLexicalEnrichmentReport", () => {
  // ── Status derivation ───────────────────────────────────────────────────────

  it("enrichmentStatus is vacuous when termCount is 0 (null execution plan)", () => {
    // Two TEXT tokens without operator → parse failure → executionPlan is null
    const enrichment = buildEnrichment(`${GIN} ${KHAO}`, "enrich-vacuous");

    expect(enrichment.termCount).toBe(0);

    const report = composeLexicalEnrichmentReport({
      reportId: "report-vacuous",
      enrichmentResult: enrichment,
    });

    expect(report.enrichmentStatus).toBe("vacuous");
  });

  it("enrichmentStatus is fully-enriched when all evaluated terms are found", () => {
    const enrichment = buildEnrichment(
      `${GIN} AND ${KHAO}`,
      "enrich-fully-enriched",
    );

    expect(enrichment.termCount).toBe(2);
    expect(enrichment.enrichedTermCount).toBe(2);

    const report = composeLexicalEnrichmentReport({
      reportId: "report-fully-enriched",
      enrichmentResult: enrichment,
    });

    expect(report.enrichmentStatus).toBe("fully-enriched");
  });

  it("enrichmentStatus is partially-enriched when some but not all terms are found", () => {
    const enrichment = buildEnrichment(
      `${GIN} AND zz_unknown`,
      "enrich-partial",
    );

    expect(enrichment.termCount).toBe(2);
    expect(enrichment.enrichedTermCount).toBe(1);

    const report = composeLexicalEnrichmentReport({
      reportId: "report-partial",
      enrichmentResult: enrichment,
    });

    expect(report.enrichmentStatus).toBe("partially-enriched");
  });

  it("enrichmentStatus is unenriched when terms are evaluated but none are found", () => {
    const enrichment = buildEnrichment("zz_unknown", "enrich-unenriched");

    expect(enrichment.termCount).toBe(1);
    expect(enrichment.enrichedTermCount).toBe(0);

    const report = composeLexicalEnrichmentReport({
      reportId: "report-unenriched",
      enrichmentResult: enrichment,
    });

    expect(report.enrichmentStatus).toBe("unenriched");
  });

  // ── Count derivation ────────────────────────────────────────────────────────

  it("unenrichedTermCount equals evaluatedTermCount minus enrichedTermCount", () => {
    const enrichment = buildEnrichment(
      `${GIN} AND zz_unknown`,
      "enrich-count-arith",
    );

    const report = composeLexicalEnrichmentReport({
      reportId: "report-count-arith",
      enrichmentResult: enrichment,
    });

    expect(report.evaluatedTermCount).toBe(enrichment.termCount);
    expect(report.enrichedTermCount).toBe(enrichment.enrichedTermCount);
    expect(report.unenrichedTermCount).toBe(
      report.evaluatedTermCount - report.enrichedTermCount,
    );
    expect(report.unenrichedTermCount).toBe(1);
  });

  it("diagnosticCount is the total of all lookup diagnostics across term enrichments", () => {
    // Two not-found terms → each produces one LEXICAL_KEY_NOT_FOUND diagnostic
    const enrichment = buildEnrichment(
      "zz_alpha AND zz_zeta",
      "enrich-diag-count",
    );

    const report = composeLexicalEnrichmentReport({
      reportId: "report-diag-count",
      enrichmentResult: enrichment,
    });

    expect(report.diagnosticCount).toBe(2);
  });

  it("diagnosticCount includes LEXICAL_INDEX_EMPTY diagnostics from empty-index enrichments", () => {
    // Empty index → each evaluated term produces LEXICAL_INDEX_EMPTY
    const enrichment = buildEnrichment(
      `${GIN} AND ${KHAO}`,
      "enrich-empty-idx",
      buildEmptyLexicalIndex,
    );

    expect(enrichment.termCount).toBe(2);

    const report = composeLexicalEnrichmentReport({
      reportId: "report-empty-idx",
      enrichmentResult: enrichment,
    });

    expect(report.diagnosticCount).toBe(2);
    expect(report.diagnosticsByCode.LEXICAL_INDEX_EMPTY).toHaveLength(2);
  });

  // ── diagnosticsByCode ordering invariant ────────────────────────────────────

  it("diagnosticsByCode LEXICAL_KEY_NOT_FOUND bucket is in ascending binary message order", () => {
    // zz_alpha < zz_zeta in binary ordering; query presents zeta first
    // to confirm sorting is applied, not insertion order
    const enrichment = buildEnrichment(
      "zz_zeta AND zz_alpha",
      "enrich-order-a",
    );

    const report = composeLexicalEnrichmentReport({
      reportId: "report-order-a",
      enrichmentResult: enrichment,
    });

    const bucket = report.diagnosticsByCode.LEXICAL_KEY_NOT_FOUND;
    expect(bucket).toHaveLength(2);
    // Both have path[0] = "query"; tiebreaker is message — "zz_alpha" message < "zz_zeta" message
    expect(bucket[0]?.message).toContain("zz_alpha");
    expect(bucket[1]?.message).toContain("zz_zeta");
  });

  it("diagnosticsByCode bucket ordering is stable across both insertion orderings of identical terms", () => {
    // Query A: zeta before alpha in query string
    const enrichmentA = buildEnrichment(
      "zz_zeta AND zz_alpha",
      "enrich-stable-a",
    );
    // Query B: alpha before zeta in query string
    const enrichmentB = buildEnrichment(
      "zz_alpha AND zz_zeta",
      "enrich-stable-b",
    );

    const reportA = composeLexicalEnrichmentReport({
      reportId: "report-stable",
      enrichmentResult: { ...enrichmentA, enrichmentId: "enrich-stable-b" },
    });
    const reportB = composeLexicalEnrichmentReport({
      reportId: "report-stable",
      enrichmentResult: enrichmentB,
    });

    expect(reportA.diagnosticsByCode.LEXICAL_KEY_NOT_FOUND).toEqual(
      reportB.diagnosticsByCode.LEXICAL_KEY_NOT_FOUND,
    );
  });

  // ── diagnosticsByCode completeness ──────────────────────────────────────────

  it("all three LexicalLookupDiagnosticCode keys are present in diagnosticsByCode even when buckets are empty", () => {
    // Fully enriched result — no diagnostics — all buckets must still be present
    const enrichment = buildEnrichment(
      `${GIN} AND ${KHAO}`,
      "enrich-key-presence",
    );

    const report = composeLexicalEnrichmentReport({
      reportId: "report-key-presence",
      enrichmentResult: enrichment,
    });

    expect(report.diagnosticsByCode).toHaveProperty("LEXICAL_INDEX_EMPTY");
    expect(report.diagnosticsByCode).toHaveProperty("LEXICAL_KEY_NOT_FOUND");
    expect(report.diagnosticsByCode).toHaveProperty(
      "LEXICAL_KEY_WHITESPACE_REJECTED",
    );
    expect(report.diagnosticsByCode.LEXICAL_INDEX_EMPTY).toHaveLength(0);
    expect(report.diagnosticsByCode.LEXICAL_KEY_NOT_FOUND).toHaveLength(0);
    expect(
      report.diagnosticsByCode.LEXICAL_KEY_WHITESPACE_REJECTED,
    ).toHaveLength(0);
  });

  // ── Deep immutability ───────────────────────────────────────────────────────

  it("applies deepFreezeStructure — top-level report is frozen", () => {
    const enrichment = buildEnrichment(GIN, "enrich-freeze");
    const report = composeLexicalEnrichmentReport({
      reportId: "report-freeze",
      enrichmentResult: enrichment,
    });

    expect(Object.isFrozen(report)).toBe(true);
  });

  it("applies deepFreezeStructure — diagnosticsByCode and its buckets are frozen", () => {
    const enrichment = buildEnrichment("zz_unknown", "enrich-freeze-diag");
    const report = composeLexicalEnrichmentReport({
      reportId: "report-freeze-diag",
      enrichmentResult: enrichment,
    });

    expect(Object.isFrozen(report.diagnosticsByCode)).toBe(true);
    expect(
      Object.isFrozen(report.diagnosticsByCode.LEXICAL_KEY_NOT_FOUND),
    ).toBe(true);
    expect(Object.isFrozen(report.diagnosticsByCode.LEXICAL_INDEX_EMPTY)).toBe(
      true,
    );
    expect(
      Object.isFrozen(report.diagnosticsByCode.LEXICAL_KEY_WHITESPACE_REJECTED),
    ).toBe(true);
  });

  it("applies deepFreezeStructure — enrichmentResult nested artifact is frozen", () => {
    const enrichment = buildEnrichment(GIN, "enrich-freeze-nested");
    const report = composeLexicalEnrichmentReport({
      reportId: "report-freeze-nested",
      enrichmentResult: enrichment,
    });

    expect(Object.isFrozen(report.enrichmentResult)).toBe(true);
    expect(Object.isFrozen(report.enrichmentResult.termEnrichments)).toBe(true);
  });

  // ── Replay-safety ───────────────────────────────────────────────────────────

  it("produces identical reports for identical inputs (replay-safe)", () => {
    const enrichmentA = buildEnrichment(
      `${GIN} AND zz_unknown`,
      "enrich-replay",
    );
    const enrichmentB = buildEnrichment(
      `${GIN} AND zz_unknown`,
      "enrich-replay",
    );

    const reportA = composeLexicalEnrichmentReport({
      reportId: "report-replay",
      enrichmentResult: enrichmentA,
    });
    const reportB = composeLexicalEnrichmentReport({
      reportId: "report-replay",
      enrichmentResult: enrichmentB,
    });

    expect(reportA).toEqual(reportB);
  });

  // ── Schema and provenance fields ────────────────────────────────────────────

  it("schemaVersion matches the schema version constant", () => {
    const enrichment = buildEnrichment(GIN, "enrich-schema");
    const report = composeLexicalEnrichmentReport({
      reportId: "report-schema",
      enrichmentResult: enrichment,
    });

    expect(report.schemaVersion).toBe(
      LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION,
    );
  });

  it("evaluationTimestamp is null", () => {
    const enrichment = buildEnrichment(GIN, "enrich-ts");
    const report = composeLexicalEnrichmentReport({
      reportId: "report-ts",
      enrichmentResult: enrichment,
    });

    expect(report.evaluationTimestamp).toBeNull();
  });

  it("generatedFrom is the expected discriminant literal", () => {
    const enrichment = buildEnrichment(GIN, "enrich-from");
    const report = composeLexicalEnrichmentReport({
      reportId: "report-from",
      enrichmentResult: enrichment,
    });

    expect(report.generatedFrom).toBe("lexical-query-enrichment-report");
  });

  it("enrichmentId is passed through from the enrichment result", () => {
    const enrichment = buildEnrichment(GIN, "enrich-id-passthrough");
    const report = composeLexicalEnrichmentReport({
      reportId: "report-id-passthrough",
      enrichmentResult: enrichment,
    });

    expect(report.enrichmentId).toBe("enrich-id-passthrough");
  });

  // ── Guard ───────────────────────────────────────────────────────────────────

  it("throws on empty reportId with the exact invariant error literal", () => {
    const enrichment = buildEnrichment(GIN, "enrich-guard-empty");

    expect(() => {
      composeLexicalEnrichmentReport({
        reportId: "",
        enrichmentResult: enrichment,
      });
    }).toThrow(
      "[lexical-interop invariant] reportId must be a non-empty string",
    );
  });

  it("throws on whitespace-only reportId with the exact invariant error literal", () => {
    const enrichment = buildEnrichment(GIN, "enrich-guard-ws");

    expect(() => {
      composeLexicalEnrichmentReport({
        reportId: "   ",
        enrichmentResult: enrichment,
      });
    }).toThrow(
      "[lexical-interop invariant] reportId must be a non-empty string",
    );
  });
});
