import type { SourceSpan } from "../shared/source-span";

export type QueryParserDiagnosticSeverity = "error" | "warning";

export interface QueryParserDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly severity: QueryParserDiagnosticSeverity;
  readonly span: SourceSpan;
}
