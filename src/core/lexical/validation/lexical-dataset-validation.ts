import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import type { LexicalEntry } from "../contracts";
import { normalizeLexicalKey } from "../normalization/normalize-lexical-key";

export const LEXICAL_DATASET_VALIDATION_RESULT_SCHEMA_VERSION =
  "lingua-core-platform:lexical-dataset-validation-result@phase10";

export type LexicalDatasetValidationResultSchemaVersion =
  typeof LEXICAL_DATASET_VALIDATION_RESULT_SCHEMA_VERSION;

export type LexicalDatasetValidationDiagnosticCode =
  | "LEXICAL_DATASET_DUPLICATE_ENTRY_ID"
  | "LEXICAL_DATASET_DUPLICATE_HEADWORD"
  | "LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY"
  | "LEXICAL_DATASET_EMPTY_DEFINITIONS"
  | "LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH";

export type LexicalDatasetValidationDiagnosticSeverity = "error" | "warning";

export interface LexicalDatasetValidationDiagnostic {
  readonly code: LexicalDatasetValidationDiagnosticCode;
  readonly severity: LexicalDatasetValidationDiagnosticSeverity;
  readonly path: readonly string[];
  readonly message: string;
}

export type LexicalDatasetValidationStatus =
  | "invalid"
  | "valid"
  | "valid-with-warnings";

export interface LexicalDatasetValidationResult {
  readonly schemaVersion: LexicalDatasetValidationResultSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly datasetId: string;
  readonly entryCount: number;
  readonly validationStatus: LexicalDatasetValidationStatus;
  readonly diagnosticCount: number;
  readonly diagnostics: readonly LexicalDatasetValidationDiagnostic[];
}

export interface ValidateLexicalDatasetInput {
  readonly datasetId: string;
  readonly entries: readonly LexicalEntry[];
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
  a: LexicalDatasetValidationDiagnostic,
  b: LexicalDatasetValidationDiagnostic,
): number {
  const pathA = a.path[0] ?? "";
  const pathB = b.path[0] ?? "";
  const pathComparison = compareStrings(pathA, pathB);
  if (pathComparison !== 0) {
    return pathComparison;
  }
  return compareStrings(a.code, b.code);
}

function orderDiagnostics(
  diagnostics: LexicalDatasetValidationDiagnostic[],
): readonly LexicalDatasetValidationDiagnostic[] {
  return Object.freeze([...diagnostics].sort(compareDiagnostics));
}

function resolveValidationStatus(
  diagnostics: readonly LexicalDatasetValidationDiagnostic[],
): LexicalDatasetValidationStatus {
  if (diagnostics.length === 0) {
    return "valid";
  }
  const hasError = diagnostics.some((d) => d.severity === "error");
  return hasError ? "invalid" : "valid-with-warnings";
}

function diag(
  code: LexicalDatasetValidationDiagnosticCode,
  severity: LexicalDatasetValidationDiagnosticSeverity,
  headword: string,
  message: string,
): LexicalDatasetValidationDiagnostic {
  return deepFreezeStructure({ code, severity, path: [headword], message });
}

export function validateLexicalDataset(
  input: ValidateLexicalDatasetInput,
): LexicalDatasetValidationResult {
  if (input.datasetId.trim() === "") {
    throw new Error("[lexical invariant] datasetId must be a non-empty string");
  }

  const diagnostics: LexicalDatasetValidationDiagnostic[] = [];

  const seenHeadwords = new Set<string>();
  const seenNormalizedKeys = new Map<string, string>();
  const seenEntryIds = new Map<string, string>();

  for (const entry of input.entries) {
    const normalizedKey = normalizeLexicalKey(entry.headword);

    if (seenHeadwords.has(entry.headword)) {
      diagnostics.push(
        diag(
          "LEXICAL_DATASET_DUPLICATE_HEADWORD",
          "error",
          entry.headword,
          `Duplicate headword: ${JSON.stringify(entry.headword)} appears more than once in the dataset.`,
        ),
      );
    } else {
      seenHeadwords.add(entry.headword);
    }

    const existingNormKeyOwner = seenNormalizedKeys.get(normalizedKey);
    if (existingNormKeyOwner === undefined) {
      seenNormalizedKeys.set(normalizedKey, entry.headword);
    } else if (existingNormKeyOwner !== entry.headword) {
      diagnostics.push(
        diag(
          "LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY",
          "error",
          entry.headword,
          `Headword ${JSON.stringify(entry.headword)} normalizes to key ${JSON.stringify(normalizedKey)}, which is already used by ${JSON.stringify(existingNormKeyOwner)}.`,
        ),
      );
    }

    if (entry.definitions.length === 0) {
      diagnostics.push(
        diag(
          "LEXICAL_DATASET_EMPTY_DEFINITIONS",
          "error",
          entry.headword,
          `Entry ${JSON.stringify(entry.headword)} has no definitions.`,
        ),
      );
    }

    if (entry.entryId !== undefined) {
      const existingEntryIdOwner = seenEntryIds.get(entry.entryId);
      if (existingEntryIdOwner === undefined) {
        seenEntryIds.set(entry.entryId, entry.headword);
      } else {
        diagnostics.push(
          diag(
            "LEXICAL_DATASET_DUPLICATE_ENTRY_ID",
            "error",
            entry.headword,
            `Entry ID ${JSON.stringify(entry.entryId)} is already used by headword ${JSON.stringify(existingEntryIdOwner)}.`,
          ),
        );
      }

      const idCanonicalKey = entry.entryId.split(":")[1];
      if (idCanonicalKey !== normalizedKey) {
        diagnostics.push(
          diag(
            "LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH",
            "error",
            entry.headword,
            `Entry ${JSON.stringify(entry.headword)} has entryId ${JSON.stringify(entry.entryId)} whose canonical key segment ${JSON.stringify(idCanonicalKey)} does not match the normalized headword key ${JSON.stringify(normalizedKey)}.`,
          ),
        );
      }
    }
  }

  const orderedDiagnostics = orderDiagnostics(diagnostics);
  const validationStatus = resolveValidationStatus(orderedDiagnostics);

  return deepFreezeStructure({
    schemaVersion: LEXICAL_DATASET_VALIDATION_RESULT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    datasetId: input.datasetId,
    entryCount: input.entries.length,
    validationStatus,
    diagnosticCount: orderedDiagnostics.length,
    diagnostics: orderedDiagnostics,
  });
}
