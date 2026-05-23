import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import type {
  LexicalLookupDiagnostic,
  LexicalLookupDiagnosticCode,
  LexicalLookupDiagnosticSeverity,
} from "../contracts";

export function createLexicalDiagnostic(
  code: LexicalLookupDiagnosticCode,
  severity: LexicalLookupDiagnosticSeverity,
  path: readonly string[],
  message: string,
): LexicalLookupDiagnostic {
  return deepFreezeStructure({
    code,
    severity,
    path: [...path],
    message,
  });
}

function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function compareDiagnostics(
  a: LexicalLookupDiagnostic,
  b: LexicalLookupDiagnostic,
): number {
  const pathA = a.path[0] ?? "";
  const pathB = b.path[0] ?? "";
  const pathComparison = compareStrings(pathA, pathB);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  return compareStrings(a.code, b.code);
}

export function orderLexicalDiagnostics(
  diagnostics: readonly LexicalLookupDiagnostic[],
): readonly LexicalLookupDiagnostic[] {
  return Object.freeze([...diagnostics].sort(compareDiagnostics));
}
