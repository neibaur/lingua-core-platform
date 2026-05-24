import type { LexicalLookupDiagnostic } from "../../../../lexical/contracts";
import { deepFreezeStructure } from "../../runtime-capabilities";
import {
  LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION,
  type ComposeLexicalQueryEnrichmentReportInput,
  type LexicalEnrichmentDiagnosticsByCode,
  type LexicalQueryEnrichmentReport,
  type LexicalQueryEnrichmentStatus,
} from "./lexical-enrichment-report-types";

const REPORT_GENERATED_FROM = "lexical-query-enrichment-report" as const;

function resolveEnrichmentStatus(
  evaluatedTermCount: number,
  enrichedTermCount: number,
): LexicalQueryEnrichmentStatus {
  if (evaluatedTermCount === 0) {
    return "vacuous";
  }
  if (enrichedTermCount === evaluatedTermCount) {
    return "fully-enriched";
  }
  if (enrichedTermCount > 0) {
    return "partially-enriched";
  }
  return "unenriched";
}

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function compareLookupDiagnostics(
  a: LexicalLookupDiagnostic,
  b: LexicalLookupDiagnostic,
): number {
  const pathA = a.path[0] ?? "";
  const pathB = b.path[0] ?? "";
  const pathComparison = compareStrings(pathA, pathB);
  if (pathComparison !== 0) return pathComparison;
  return compareStrings(a.message, b.message);
}

function buildEnrichmentDiagnosticsByCode(
  flatDiagnostics: readonly LexicalLookupDiagnostic[],
): LexicalEnrichmentDiagnosticsByCode {
  return {
    LEXICAL_INDEX_EMPTY: [...flatDiagnostics]
      .filter((d) => d.code === "LEXICAL_INDEX_EMPTY")
      .sort(compareLookupDiagnostics),
    LEXICAL_KEY_NOT_FOUND: [...flatDiagnostics]
      .filter((d) => d.code === "LEXICAL_KEY_NOT_FOUND")
      .sort(compareLookupDiagnostics),
    LEXICAL_KEY_WHITESPACE_REJECTED: [...flatDiagnostics]
      .filter((d) => d.code === "LEXICAL_KEY_WHITESPACE_REJECTED")
      .sort(compareLookupDiagnostics),
  };
}

export function composeLexicalEnrichmentReport(
  input: ComposeLexicalQueryEnrichmentReportInput,
): LexicalQueryEnrichmentReport {
  if (input.reportId.trim() === "") {
    throw new Error(
      "[lexical-interop invariant] reportId must be a non-empty string",
    );
  }

  const { enrichmentResult } = input;

  const evaluatedTermCount = enrichmentResult.termCount;
  const enrichedTermCount = enrichmentResult.enrichedTermCount;
  const unenrichedTermCount = evaluatedTermCount - enrichedTermCount;

  const enrichmentStatus = resolveEnrichmentStatus(
    evaluatedTermCount,
    enrichedTermCount,
  );

  const flatDiagnostics: readonly LexicalLookupDiagnostic[] = [
    ...enrichmentResult.termEnrichments,
  ].flatMap((e) => [...e.lookupResult.diagnostics]);

  const diagnosticCount = flatDiagnostics.length;
  const diagnosticsByCode = buildEnrichmentDiagnosticsByCode(flatDiagnostics);

  return deepFreezeStructure({
    schemaVersion: LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    reportId: input.reportId,
    generatedFrom: REPORT_GENERATED_FROM,
    enrichmentId: enrichmentResult.enrichmentId,
    lexicalIndexId: enrichmentResult.lexicalIndexId,
    direction: enrichmentResult.direction,
    enrichmentStatus,
    evaluatedTermCount,
    enrichedTermCount,
    unenrichedTermCount,
    diagnosticCount,
    diagnosticsByCode,
    enrichmentResult,
  });
}
