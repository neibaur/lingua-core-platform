import type {
  LexicalIndex,
  LexicalLanguageDirection,
  LexicalLookupResult,
} from "../../../../lexical/contracts";
import type { LexicalLookupTrace } from "../../../../lexical/diagnostics/lexical-lookup-trace";
import type { ExecuteQueryPipelineResult } from "../../query-pipeline";

// ── Schema version ────────────────────────────────────────────────────────────

export const LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION =
  "lingua-core-platform:lexical-interop-enrichment@phase10" as const;

export type LexicalQueryEnrichmentSchemaVersion =
  typeof LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION;

// ── Per-term enrichment ───────────────────────────────────────────────────────

export type LexicalTermEnrichmentStatus = "found" | "not-found" | "empty-index";

export interface LexicalTermEnrichment {
  readonly normalizedTerm: string;
  readonly direction: LexicalLanguageDirection;
  readonly status: LexicalTermEnrichmentStatus;
  readonly lookupResult: LexicalLookupResult;
  readonly lookupTrace: LexicalLookupTrace;
}

// ── Enrichment envelope ───────────────────────────────────────────────────────

export type LexicalQueryEnrichmentOrigin = "execution-plan-ir";

export interface LexicalQueryEnrichmentResult {
  readonly schemaVersion: LexicalQueryEnrichmentSchemaVersion;
  readonly generatedFrom: "lexical-query-enrichment-result";
  readonly evaluationTimestamp: null;
  readonly enrichmentId: string;
  readonly lexicalIndexId: string;
  readonly direction: LexicalLanguageDirection;
  readonly derivedFrom: LexicalQueryEnrichmentOrigin;
  readonly termCount: number;
  readonly enrichedTermCount: number;
  readonly termEnrichments: readonly LexicalTermEnrichment[];
}

// ── Composition input ─────────────────────────────────────────────────────────

export interface ComposeLexicalQueryEnrichmentInput {
  readonly enrichmentId: string;
  readonly pipelineResult: ExecuteQueryPipelineResult;
  readonly lexicalIndex: LexicalIndex;
  readonly direction: LexicalLanguageDirection;
}
