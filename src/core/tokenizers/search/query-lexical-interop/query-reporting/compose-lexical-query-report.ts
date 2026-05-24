import { deepFreezeStructure } from "../../runtime-capabilities";
import {
  LEXICAL_QUERY_REPORT_SCHEMA_VERSION,
  type ComposeLexicalQueryReportInput,
  type LexicalQueryReport,
} from "./lexical-query-report-types";

const REPORT_GENERATED_FROM = "lexical-query-report" as const;

export function composeLexicalQueryReport(
  input: ComposeLexicalQueryReportInput,
): LexicalQueryReport {
  if (input.reportId.trim() === "") {
    throw new Error(
      "[lexical-interop invariant] reportId must be a non-empty string",
    );
  }

  const { enrichmentReport } = input;

  const enrichmentStatus = enrichmentReport.enrichmentStatus;
  const evaluatedTermCount = enrichmentReport.evaluatedTermCount;
  const enrichedTermCount = enrichmentReport.enrichedTermCount;
  const unenrichedTermCount = enrichmentReport.unenrichedTermCount;
  const diagnosticCount = enrichmentReport.diagnosticCount;
  const diagnosticsByCode = enrichmentReport.diagnosticsByCode;

  return deepFreezeStructure({
    schemaVersion: LEXICAL_QUERY_REPORT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    reportId: input.reportId,
    generatedFrom: REPORT_GENERATED_FROM,
    enrichmentStatus,
    evaluatedTermCount,
    enrichedTermCount,
    unenrichedTermCount,
    diagnosticCount,
    diagnosticsByCode,
    enrichmentReport,
  });
}
