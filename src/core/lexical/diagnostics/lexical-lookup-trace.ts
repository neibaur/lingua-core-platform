import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import type {
  LexicalLanguageDirection,
  LexicalLookupDiagnostic,
  LexicalLookupResult,
} from "../contracts";

export const LEXICAL_LOOKUP_TRACE_SCHEMA_VERSION =
  "lingua-core-platform:lexical-lookup-trace@phase10";

export type LexicalLookupTraceSchemaVersion =
  typeof LEXICAL_LOOKUP_TRACE_SCHEMA_VERSION;

export type LexicalLookupResultStatus = "found" | "not-found" | "empty-index";

export interface LexicalLookupTrace {
  readonly schemaVersion: LexicalLookupTraceSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly generatedFrom: "lexical-lookup-trace";
  readonly traceId: string;
  readonly query: string;
  readonly direction: LexicalLanguageDirection;
  readonly resultStatus: LexicalLookupResultStatus;
  readonly entryCount: number;
  readonly diagnosticCount: number;
  readonly diagnostics: readonly LexicalLookupDiagnostic[];
}

const TRACE_GENERATED_FROM = "lexical-lookup-trace" as const;

export interface ComposeLexicalLookupTraceInput {
  readonly traceId: string;
  readonly result: LexicalLookupResult;
}

function resolveResultStatus(
  result: LexicalLookupResult,
): LexicalLookupResultStatus {
  const hasEmptyIndex = result.diagnostics.some(
    (d) => d.code === "LEXICAL_INDEX_EMPTY",
  );

  if (hasEmptyIndex) {
    return "empty-index";
  }

  if (result.entries.length > 0) {
    return "found";
  }

  return "not-found";
}

export function composeLexicalLookupTrace(
  input: ComposeLexicalLookupTraceInput,
): LexicalLookupTrace {
  if (input.traceId.trim() === "") {
    throw new Error("[lexical invariant] traceId must be a non-empty string");
  }

  return deepFreezeStructure({
    schemaVersion: LEXICAL_LOOKUP_TRACE_SCHEMA_VERSION,
    evaluationTimestamp: null,
    generatedFrom: TRACE_GENERATED_FROM,
    traceId: input.traceId,
    query: input.result.query,
    direction: input.result.direction,
    resultStatus: resolveResultStatus(input.result),
    entryCount: input.result.entries.length,
    diagnosticCount: input.result.diagnostics.length,
    diagnostics: [...input.result.diagnostics],
  });
}
