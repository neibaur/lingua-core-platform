import type {
  LexicalLanguageDirection,
  LexicalLookupDiagnostic,
  LexicalLookupDiagnosticCode,
} from "../../../../lexical/contracts";
import type { LexicalQueryEnrichmentResult } from "../shared/lexical-interop-types";

// ── Schema version ────────────────────────────────────────────────────────────

export const LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION =
  "lingua-core-platform:lexical-interop-report@phase10" as const;

export type LexicalQueryEnrichmentReportSchemaVersion =
  typeof LEXICAL_QUERY_ENRICHMENT_REPORT_SCHEMA_VERSION;

// ── Diagnostic code registry ──────────────────────────────────────────────────

export const LEXICAL_ENRICHMENT_LOOKUP_DIAGNOSTIC_CODES: readonly LexicalLookupDiagnosticCode[] =
  [
    "LEXICAL_INDEX_EMPTY",
    "LEXICAL_KEY_NOT_FOUND",
    "LEXICAL_KEY_WHITESPACE_REJECTED",
  ];

// ── Diagnostics-by-code projection ───────────────────────────────────────────

export type LexicalEnrichmentDiagnosticsByCode = {
  readonly [K in LexicalLookupDiagnosticCode]: readonly LexicalLookupDiagnostic[];
};

// ── Enrichment status ─────────────────────────────────────────────────────────

export type LexicalQueryEnrichmentStatus =
  | "fully-enriched"
  | "partially-enriched"
  | "unenriched"
  | "vacuous";

// ── Report artifact ───────────────────────────────────────────────────────────

export interface LexicalQueryEnrichmentReport {
  readonly schemaVersion: LexicalQueryEnrichmentReportSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly reportId: string;
  readonly generatedFrom: "lexical-query-enrichment-report";
  readonly enrichmentId: string;
  readonly lexicalIndexId: string;
  readonly direction: LexicalLanguageDirection;
  readonly enrichmentStatus: LexicalQueryEnrichmentStatus;
  readonly evaluatedTermCount: number;
  readonly enrichedTermCount: number;
  readonly unenrichedTermCount: number;
  readonly diagnosticCount: number;
  readonly diagnosticsByCode: LexicalEnrichmentDiagnosticsByCode;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
}

// ── Composition input ─────────────────────────────────────────────────────────

export interface ComposeLexicalQueryEnrichmentReportInput {
  readonly reportId: string;
  readonly enrichmentResult: LexicalQueryEnrichmentResult;
}
