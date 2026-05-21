import type { Query } from "../../../query-engine";
import type { SourceSpan } from "../../shared";

export interface QueryCompileDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly severity: "error";
  readonly sourceSpan: SourceSpan;
}

export interface CompiledQueryPlan {
  readonly query: Query;
  readonly sourceSpan: SourceSpan;
  readonly children: readonly CompiledQueryPlan[];
}

export interface CompileQueryResult {
  readonly success: boolean;
  readonly plan: CompiledQueryPlan | null;
  readonly query: Query | null;
  readonly diagnostics: readonly QueryCompileDiagnostic[];
}
