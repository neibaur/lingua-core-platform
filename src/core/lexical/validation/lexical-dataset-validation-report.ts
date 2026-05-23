import type {
  LexicalDatasetValidationDiagnostic,
  LexicalDatasetValidationDiagnosticCode,
  LexicalDatasetValidationResult,
  LexicalDatasetValidationStatus,
} from "./lexical-dataset-validation";

export const LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION =
  "lingua-core-platform:lexical-validation-report@phase10";

export type LexicalDatasetValidationReportSchemaVersion =
  typeof LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION;

export const LEXICAL_DATASET_VALIDATION_RULE_CODES: readonly LexicalDatasetValidationDiagnosticCode[] =
  [
    "LEXICAL_DATASET_DUPLICATE_ENTRY_ID",
    "LEXICAL_DATASET_DUPLICATE_HEADWORD",
    "LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY",
    "LEXICAL_DATASET_EMPTY_DEFINITIONS",
    "LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH",
  ];

export type LexicalDatasetDiagnosticsByCode = {
  readonly [K in LexicalDatasetValidationDiagnosticCode]: readonly LexicalDatasetValidationDiagnostic[];
};

export interface LexicalDatasetValidationReport {
  readonly schemaVersion: LexicalDatasetValidationReportSchemaVersion;
  readonly evaluationTimestamp: null;
  readonly reportId: string;
  readonly generatedFrom: "lexical-dataset-validation-report";
  readonly datasetId: string;
  readonly validationStatus: LexicalDatasetValidationStatus;
  readonly entryCount: number;
  readonly diagnosticCount: number;
  readonly evaluatedRuleCount: number;
  readonly diagnosticsByCode: LexicalDatasetDiagnosticsByCode;
  readonly diagnostics: readonly LexicalDatasetValidationDiagnostic[];
  readonly validationResult: LexicalDatasetValidationResult;
}

export interface ComposeLexicalDatasetValidationReportInput {
  readonly reportId: string;
  readonly validationResult: LexicalDatasetValidationResult;
}
