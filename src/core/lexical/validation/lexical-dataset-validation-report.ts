import { deepFreezeStructure } from "../../tokenizers/search/runtime-capabilities/index";
import type {
  LexicalDatasetValidationDiagnostic,
  LexicalDatasetValidationDiagnosticCode,
  LexicalDatasetValidationResult,
  LexicalDatasetValidationStatus,
} from "./lexical-dataset-validation";

export const LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION =
  "lingua-core-platform:lexical-dataset-validation-report@phase10";

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
  readonly [
    K in LexicalDatasetValidationDiagnosticCode
  ]: readonly LexicalDatasetValidationDiagnostic[];
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

const REPORT_GENERATED_FROM = "lexical-dataset-validation-report" as const;

function buildDiagnosticsByCode(
  diagnostics: readonly LexicalDatasetValidationDiagnostic[],
): LexicalDatasetDiagnosticsByCode {
  return {
    LEXICAL_DATASET_DUPLICATE_ENTRY_ID: diagnostics.filter(
      (d) => d.code === "LEXICAL_DATASET_DUPLICATE_ENTRY_ID",
    ),
    LEXICAL_DATASET_DUPLICATE_HEADWORD: diagnostics.filter(
      (d) => d.code === "LEXICAL_DATASET_DUPLICATE_HEADWORD",
    ),
    LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY: diagnostics.filter(
      (d) => d.code === "LEXICAL_DATASET_DUPLICATE_NORMALIZED_KEY",
    ),
    LEXICAL_DATASET_EMPTY_DEFINITIONS: diagnostics.filter(
      (d) => d.code === "LEXICAL_DATASET_EMPTY_DEFINITIONS",
    ),
    LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH: diagnostics.filter(
      (d) => d.code === "LEXICAL_DATASET_ENTRY_ID_NORMALIZATION_MISMATCH",
    ),
  };
}

export function composeLexicalDatasetValidationReport(
  input: ComposeLexicalDatasetValidationReportInput,
): LexicalDatasetValidationReport {
  if (input.reportId.trim() === "") {
    throw new Error("[lexical invariant] reportId must be a non-empty string");
  }

  const diagnosticsByCode = buildDiagnosticsByCode(
    input.validationResult.diagnostics,
  );

  return deepFreezeStructure({
    schemaVersion: LEXICAL_DATASET_VALIDATION_REPORT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    reportId: input.reportId,
    generatedFrom: REPORT_GENERATED_FROM,
    datasetId: input.validationResult.datasetId,
    validationStatus: input.validationResult.validationStatus,
    entryCount: input.validationResult.entryCount,
    diagnosticCount: input.validationResult.diagnosticCount,
    evaluatedRuleCount: LEXICAL_DATASET_VALIDATION_RULE_CODES.length,
    diagnosticsByCode,
    diagnostics: [...input.validationResult.diagnostics],
    validationResult: input.validationResult,
  });
}
