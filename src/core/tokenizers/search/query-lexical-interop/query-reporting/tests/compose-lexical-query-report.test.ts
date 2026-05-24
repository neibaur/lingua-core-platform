import { describe, expect, it } from "vitest";

import { THAI_ENGLISH_FIXTURE_DATASET } from "../../../../../lexical/datasets/thai-english/thai-english-fixture-dataset";
import { composeLexicalIndex } from "../../../../../lexical/index/lexical-index";
import { CorpusIndexer } from "../../../index-primitives";
import type { SearchCorpus } from "../../../index-primitives";
import { executeQueryPipeline } from "../../../query-pipeline";
import { composeLexicalQueryEnrichment } from "../../pipeline/compose-lexical-query-enrichment";
import { composeLexicalEnrichmentReport } from "../../reporting/compose-lexical-enrichment-report";
import type { LexicalQueryEnrichmentReport } from "../../reporting/lexical-enrichment-report-types";
import { composeLexicalQueryReport } from "../compose-lexical-query-report";
import { LEXICAL_QUERY_REPORT_SCHEMA_VERSION } from "../lexical-query-report-types";

const GIN = "กิน"; // "to eat" — present in fixture dataset
const KHAO = "ข้าว"; // "rice" — present in fixture dataset

function buildFixtureIndex() {
  return composeLexicalIndex({
    lexicalIndexId: "query-report-test-index",
    entries: THAI_ENGLISH_FIXTURE_DATASET,
  });
}

function buildEmptyCorpus(): SearchCorpus {
  return new CorpusIndexer().build();
}

// Builds a LexicalQueryEnrichmentReport — the direct input fixture for composeLexicalQueryReport.
// Lower-layer types are used only to construct this fixture; they are not passed to the subject
// under test.
function buildEnrichmentReport(
  rawQuery: string,
  enrichmentId: string,
  reportId: string,
): LexicalQueryEnrichmentReport {
  const pipelineResult = executeQueryPipeline({
    rawQuery,
    corpus: buildEmptyCorpus(),
  });
  const enrichmentResult = composeLexicalQueryEnrichment({
    enrichmentId,
    pipelineResult,
    lexicalIndex: buildFixtureIndex(),
    direction: "th→en",
  });
  return composeLexicalEnrichmentReport({
    reportId,
    enrichmentResult,
  });
}

describe("composeLexicalQueryReport", () => {
  // ── Schema and meta fields ──────────────────────────────────────────────────

  it("schemaVersion matches the schema version constant", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-schema",
      "enrich-report-schema",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-schema",
      enrichmentReport,
    });

    expect(report.schemaVersion).toBe(LEXICAL_QUERY_REPORT_SCHEMA_VERSION);
    expect(report.schemaVersion).toBe(
      "lingua-core-platform:lexical-query-report@phase10",
    );
  });

  it("evaluationTimestamp is always null", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-ts",
      "enrich-report-ts",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-ts",
      enrichmentReport,
    });

    expect(report.evaluationTimestamp).toBeNull();
  });

  it("generatedFrom is always the expected discriminant literal", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-from",
      "enrich-report-from",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-from",
      enrichmentReport,
    });

    expect(report.generatedFrom).toBe("lexical-query-report");
  });

  it("reportId is passed through correctly from the composition input", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-id",
      "enrich-report-id",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-id-check",
      enrichmentReport,
    });

    expect(report.reportId).toBe("query-report-id-check");
  });

  // ── Passthrough field correctness ───────────────────────────────────────────

  it("enrichmentStatus is passed through from enrichmentReport without re-derivation", () => {
    // fully-enriched: both GIN and KHAO are in the fixture dataset
    const fullyEnrichedReport = buildEnrichmentReport(
      `${GIN} AND ${KHAO}`,
      "enrich-status-full",
      "enrich-report-status-full",
    );
    expect(fullyEnrichedReport.enrichmentStatus).toBe("fully-enriched");

    const report = composeLexicalQueryReport({
      reportId: "query-report-status-full",
      enrichmentReport: fullyEnrichedReport,
    });

    expect(report.enrichmentStatus).toBe(fullyEnrichedReport.enrichmentStatus);
    expect(report.enrichmentStatus).toBe("fully-enriched");
  });

  it("enrichmentStatus passthrough is correct for partially-enriched", () => {
    const partialReport = buildEnrichmentReport(
      `${GIN} AND zz_unknown`,
      "enrich-status-partial",
      "enrich-report-status-partial",
    );
    expect(partialReport.enrichmentStatus).toBe("partially-enriched");

    const report = composeLexicalQueryReport({
      reportId: "query-report-status-partial",
      enrichmentReport: partialReport,
    });

    expect(report.enrichmentStatus).toBe(partialReport.enrichmentStatus);
    expect(report.enrichmentStatus).toBe("partially-enriched");
  });

  it("enrichmentStatus passthrough is correct for unenriched", () => {
    const unenrichedReport = buildEnrichmentReport(
      "zz_unknown",
      "enrich-status-unenriched",
      "enrich-report-status-unenriched",
    );
    expect(unenrichedReport.enrichmentStatus).toBe("unenriched");

    const report = composeLexicalQueryReport({
      reportId: "query-report-status-unenriched",
      enrichmentReport: unenrichedReport,
    });

    expect(report.enrichmentStatus).toBe(unenrichedReport.enrichmentStatus);
    expect(report.enrichmentStatus).toBe("unenriched");
  });

  it("enrichmentStatus passthrough is correct for vacuous", () => {
    // Two tokens without operator → null execution plan → vacuous
    const vacuousReport = buildEnrichmentReport(
      `${GIN} ${KHAO}`,
      "enrich-status-vacuous",
      "enrich-report-status-vacuous",
    );
    expect(vacuousReport.enrichmentStatus).toBe("vacuous");

    const report = composeLexicalQueryReport({
      reportId: "query-report-status-vacuous",
      enrichmentReport: vacuousReport,
    });

    expect(report.enrichmentStatus).toBe(vacuousReport.enrichmentStatus);
    expect(report.enrichmentStatus).toBe("vacuous");
  });

  it("evaluatedTermCount is passed through from enrichmentReport", () => {
    const enrichmentReport = buildEnrichmentReport(
      `${GIN} AND ${KHAO}`,
      "enrich-eval-count",
      "enrich-report-eval-count",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-eval-count",
      enrichmentReport,
    });

    expect(report.evaluatedTermCount).toBe(enrichmentReport.evaluatedTermCount);
    expect(report.evaluatedTermCount).toBe(2);
  });

  it("enrichedTermCount is passed through from enrichmentReport", () => {
    const enrichmentReport = buildEnrichmentReport(
      `${GIN} AND ${KHAO}`,
      "enrich-enriched-count",
      "enrich-report-enriched-count",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-enriched-count",
      enrichmentReport,
    });

    expect(report.enrichedTermCount).toBe(enrichmentReport.enrichedTermCount);
    expect(report.enrichedTermCount).toBe(2);
  });

  it("unenrichedTermCount is passed through from enrichmentReport", () => {
    const enrichmentReport = buildEnrichmentReport(
      `${GIN} AND zz_unknown`,
      "enrich-unenriched-count",
      "enrich-report-unenriched-count",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-unenriched-count",
      enrichmentReport,
    });

    expect(report.unenrichedTermCount).toBe(
      enrichmentReport.unenrichedTermCount,
    );
    expect(report.unenrichedTermCount).toBe(1);
  });

  it("diagnosticCount is passed through from enrichmentReport", () => {
    // Two not-found terms produce two diagnostics at the enrichment report layer
    const enrichmentReport = buildEnrichmentReport(
      "zz_alpha AND zz_beta",
      "enrich-diag-count",
      "enrich-report-diag-count",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-diag-count",
      enrichmentReport,
    });

    expect(report.diagnosticCount).toBe(enrichmentReport.diagnosticCount);
    expect(report.diagnosticCount).toBe(2);
  });

  // ── diagnosticsByCode passthrough ───────────────────────────────────────────

  it("diagnosticsByCode has all three diagnostic code keys present", () => {
    // Fully enriched — all buckets empty but all keys must be present
    const enrichmentReport = buildEnrichmentReport(
      `${GIN} AND ${KHAO}`,
      "enrich-dbc-keys",
      "enrich-report-dbc-keys",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-dbc-keys",
      enrichmentReport,
    });

    expect(report.diagnosticsByCode).toHaveProperty("LEXICAL_INDEX_EMPTY");
    expect(report.diagnosticsByCode).toHaveProperty("LEXICAL_KEY_NOT_FOUND");
    expect(report.diagnosticsByCode).toHaveProperty(
      "LEXICAL_KEY_WHITESPACE_REJECTED",
    );
  });

  it("diagnosticsByCode is structurally equal to enrichmentReport.diagnosticsByCode (passthrough, not re-aggregated)", () => {
    const enrichmentReport = buildEnrichmentReport(
      "zz_alpha AND zz_beta",
      "enrich-dbc-passthrough",
      "enrich-report-dbc-passthrough",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-dbc-passthrough",
      enrichmentReport,
    });

    expect(report.diagnosticsByCode).toEqual(
      enrichmentReport.diagnosticsByCode,
    );
    expect(report.diagnosticsByCode.LEXICAL_KEY_NOT_FOUND).toHaveLength(
      enrichmentReport.diagnosticsByCode.LEXICAL_KEY_NOT_FOUND.length,
    );
    expect(report.diagnosticsByCode.LEXICAL_INDEX_EMPTY).toHaveLength(
      enrichmentReport.diagnosticsByCode.LEXICAL_INDEX_EMPTY.length,
    );
    expect(
      report.diagnosticsByCode.LEXICAL_KEY_WHITESPACE_REJECTED,
    ).toHaveLength(
      enrichmentReport.diagnosticsByCode.LEXICAL_KEY_WHITESPACE_REJECTED.length,
    );
  });

  // ── enrichmentReport embedding ──────────────────────────────────────────────

  it("enrichmentReport is embedded in full on the output artifact", () => {
    const enrichmentReport = buildEnrichmentReport(
      `${GIN} AND zz_unknown`,
      "enrich-embed",
      "enrich-report-embed",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-embed",
      enrichmentReport,
    });

    expect(report.enrichmentReport).toEqual(enrichmentReport);
    expect(report.enrichmentReport.reportId).toBe(enrichmentReport.reportId);
    expect(report.enrichmentReport.schemaVersion).toBe(
      enrichmentReport.schemaVersion,
    );
    expect(report.enrichmentReport.generatedFrom).toBe(
      "lexical-query-enrichment-report",
    );
  });

  // ── No reach-through into enrichmentReport.enrichmentResult ────────────────

  it("composition reads only from LexicalQueryEnrichmentReport surface — passthrough fields equal enrichmentReport fields exactly", () => {
    // This test documents the single-layer derivation law compliance.
    // Every governance field on the query report equals the corresponding
    // field on enrichmentReport — confirming derivation stops at that boundary.
    const enrichmentReport = buildEnrichmentReport(
      `${GIN} AND zz_unknown`,
      "enrich-no-reach",
      "enrich-report-no-reach",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-no-reach",
      enrichmentReport,
    });

    expect(report.enrichmentStatus).toBe(enrichmentReport.enrichmentStatus);
    expect(report.evaluatedTermCount).toBe(enrichmentReport.evaluatedTermCount);
    expect(report.enrichedTermCount).toBe(enrichmentReport.enrichedTermCount);
    expect(report.unenrichedTermCount).toBe(
      enrichmentReport.unenrichedTermCount,
    );
    expect(report.diagnosticCount).toBe(enrichmentReport.diagnosticCount);
    expect(report.diagnosticsByCode).toEqual(
      enrichmentReport.diagnosticsByCode,
    );
  });

  // ── Deep immutability ───────────────────────────────────────────────────────

  it("applies deepFreezeStructure — top-level report is frozen", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-freeze",
      "enrich-report-freeze",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-freeze",
      enrichmentReport,
    });

    expect(Object.isFrozen(report)).toBe(true);
  });

  it("applies deepFreezeStructure — embedded enrichmentReport is frozen", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-freeze-nested",
      "enrich-report-freeze-nested",
    );

    const report = composeLexicalQueryReport({
      reportId: "query-report-freeze-nested",
      enrichmentReport,
    });

    expect(Object.isFrozen(report.enrichmentReport)).toBe(true);
    expect(Object.isFrozen(report.diagnosticsByCode)).toBe(true);
  });

  // ── Replay-safety ───────────────────────────────────────────────────────────

  it("produces identical reports for identical inputs (replay-safe)", () => {
    const enrichmentReportA = buildEnrichmentReport(
      `${GIN} AND zz_unknown`,
      "enrich-replay",
      "enrich-report-replay",
    );
    const enrichmentReportB = buildEnrichmentReport(
      `${GIN} AND zz_unknown`,
      "enrich-replay",
      "enrich-report-replay",
    );

    const reportA = composeLexicalQueryReport({
      reportId: "query-report-replay",
      enrichmentReport: enrichmentReportA,
    });
    const reportB = composeLexicalQueryReport({
      reportId: "query-report-replay",
      enrichmentReport: enrichmentReportB,
    });

    expect(reportA).toEqual(reportB);
  });

  // ── Guard ───────────────────────────────────────────────────────────────────

  it("throws on empty reportId with the exact invariant error literal", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-guard-empty",
      "enrich-report-guard-empty",
    );

    expect(() => {
      composeLexicalQueryReport({
        reportId: "",
        enrichmentReport,
      });
    }).toThrow(
      "[lexical-interop invariant] reportId must be a non-empty string",
    );
  });

  it("throws on whitespace-only reportId with the exact invariant error literal", () => {
    const enrichmentReport = buildEnrichmentReport(
      GIN,
      "enrich-guard-ws",
      "enrich-report-guard-ws",
    );

    expect(() => {
      composeLexicalQueryReport({
        reportId: "   ",
        enrichmentReport,
      });
    }).toThrow(
      "[lexical-interop invariant] reportId must be a non-empty string",
    );
  });
});
