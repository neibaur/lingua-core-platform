import type { LexicalEntry } from "../contracts";

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
