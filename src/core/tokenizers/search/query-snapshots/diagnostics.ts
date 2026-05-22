export type QuerySnapshotDiagnosticCode =
  | "SNAPSHOT_MALFORMED_ENVELOPE"
  | "SNAPSHOT_INVALID_SCHEMA_VERSION"
  | "SNAPSHOT_INVALID_ARTIFACT_KIND"
  | "SNAPSHOT_INVALID_SNAPSHOT_ID"
  | "SNAPSHOT_INVALID_ARTIFACT"
  | "SNAPSHOT_NON_JSON_SAFE"
  | "SNAPSHOT_INVALID_SERIALIZATION"
  | "SNAPSHOT_MALFORMED_BUNDLE"
  | "SNAPSHOT_INVALID_RECONSTRUCTION_BOUNDARY"
  | "SNAPSHOT_INVALID_ARTIFACT_SHAPE"
  | "SNAPSHOT_NOT_EQUIVALENT";

export type QuerySnapshotDiagnosticSeverity = "error";

export interface QuerySnapshotDiagnostic {
  readonly code: QuerySnapshotDiagnosticCode;
  readonly severity: QuerySnapshotDiagnosticSeverity;
  readonly path: string;
  readonly message: string;
}

export type QuerySnapshotValidationResult<TData> =
  | {
      readonly success: true;
      readonly data: TData;
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly QuerySnapshotDiagnostic[];
    };

export function createQuerySnapshotDiagnostic(
  code: QuerySnapshotDiagnosticCode,
  path: string,
  message: string,
): QuerySnapshotDiagnostic {
  return Object.freeze({
    code,
    severity: "error" as const,
    path,
    message,
  });
}

export function createQuerySnapshotSuccess<TData>(
  data: TData,
): QuerySnapshotValidationResult<TData> {
  return Object.freeze({
    success: true as const,
    data,
  });
}

export function createQuerySnapshotFailure<TData>(
  diagnostics: readonly QuerySnapshotDiagnostic[],
): QuerySnapshotValidationResult<TData> {
  return Object.freeze({
    success: false as const,
    diagnostics: Object.freeze([...diagnostics]),
  });
}

export function mergeQuerySnapshotDiagnostics(
  diagnostics: readonly QuerySnapshotDiagnostic[],
): readonly QuerySnapshotDiagnostic[] {
  return Object.freeze([...diagnostics]);
}
