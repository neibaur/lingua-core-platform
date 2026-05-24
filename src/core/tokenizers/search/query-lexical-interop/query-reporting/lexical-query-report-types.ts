import type {
  LexicalEnrichmentDiagnosticsByCode,
  LexicalQueryEnrichmentReport,
  LexicalQueryEnrichmentStatus,
} from "../reporting/lexical-enrichment-report-types";

// ── Schema version ────────────────────────────────────────────────────────────

export const LEXICAL_QUERY_REPORT_SCHEMA_VERSION =
  "lingua-core-platform:lexical-query-report@phase10" as const;

export type LexicalQueryReportSchemaVersion =
  typeof LEXICAL_QUERY_REPORT_SCHEMA_VERSION;

// ── Report artifact ───────────────────────────────────────────────────────────

export interface LexicalQueryReport {
  readonly schemaVersion: LexicalQueryReportSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly reportId: string;
  readonly generatedFrom: "lexical-query-report";
  readonly enrichmentStatus: LexicalQueryEnrichmentStatus;
  readonly evaluatedTermCount: number;
  readonly enrichedTermCount: number;
  readonly unenrichedTermCount: number;
  readonly diagnosticCount: number;
  readonly diagnosticsByCode: LexicalEnrichmentDiagnosticsByCode;
  readonly enrichmentReport: LexicalQueryEnrichmentReport;
}

// ── Composition input ─────────────────────────────────────────────────────────

export interface ComposeLexicalQueryReportInput {
  readonly reportId: string;
  readonly enrichmentReport: LexicalQueryEnrichmentReport;
}
