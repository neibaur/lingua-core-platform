import type { JsonObject } from "../query-snapshots";

export const RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION =
  "runtime-capability-manifest-v1";

export type RuntimeCapabilityManifestSchemaVersion =
  typeof RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION;

export type RuntimeCapabilityId = `${string}:${string}:${string}`;

export type RuntimeCapabilityKind =
  | "engine"
  | "query"
  | "snapshot"
  | "governance";

export type RuntimeCapabilityStability = "stable" | "experimental";

export interface RuntimeCapabilityDeclaration {
  readonly capabilityId: RuntimeCapabilityId;
  readonly kind: RuntimeCapabilityKind;
  readonly version: string;
  readonly stability: RuntimeCapabilityStability;
  readonly metadata?: JsonObject;
}

export interface RuntimeCapabilityManifestMetadata {
  readonly manifestId: string;
  readonly runtimeName: string;
  readonly runtimeVersion: string;
  readonly manifestVersion: string;
}

export interface RuntimeCapabilityManifest {
  readonly schemaVersion: RuntimeCapabilityManifestSchemaVersion;
  readonly metadata: RuntimeCapabilityManifestMetadata;
  readonly capabilities: readonly RuntimeCapabilityDeclaration[];
}

export type RuntimeCapabilityDiagnosticCode =
  | "RUNTIME_CAPABILITY_MANIFEST_MALFORMED"
  | "RUNTIME_CAPABILITY_METADATA_INVALID"
  | "RUNTIME_CAPABILITY_ID_INVALID"
  | "RUNTIME_CAPABILITY_KIND_INVALID"
  | "RUNTIME_CAPABILITY_VERSION_INVALID"
  | "RUNTIME_CAPABILITY_STABILITY_INVALID"
  | "RUNTIME_CAPABILITY_METADATA_NON_JSON_SAFE"
  | "RUNTIME_CAPABILITY_DUPLICATE"
  | "RUNTIME_CAPABILITY_MISSING"
  | "RUNTIME_CAPABILITY_INCOMPATIBLE_KIND"
  | "RUNTIME_CAPABILITY_INCOMPATIBLE_VERSION"
  | "RUNTIME_CAPABILITY_INCOMPATIBLE_STABILITY";

export type RuntimeCapabilityDiagnosticSeverity = "error";

export interface RuntimeCapabilityDiagnostic {
  readonly stageTrackingIndex: number;
  readonly code: RuntimeCapabilityDiagnosticCode;
  readonly severity: RuntimeCapabilityDiagnosticSeverity;
  readonly path: readonly string[];
  readonly message: string;
}

export type RuntimeCapabilityValidationResult<TData> =
  | {
      readonly success: true;
      readonly data: TData;
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly RuntimeCapabilityDiagnostic[];
    };

export interface RuntimeCapabilityCompatibilityResult {
  readonly compatible: boolean;
  readonly requiredManifestId: string;
  readonly providedManifestId: string;
  readonly diagnostics: readonly RuntimeCapabilityDiagnostic[];
}

export type RuntimeCapabilityCertificationStatus = "certified" | "rejected";

export type RuntimeCapabilityCertificationDiagnosticCode =
  | "CAPABILITY_MISMATCH"
  | "CERTIFICATION_FAILURE";

export interface RuntimeCapabilityCertificationMismatch {
  readonly stageIndex: number;
  readonly objectPath: string;
  readonly diagnosticCode: RuntimeCapabilityCertificationDiagnosticCode;
  readonly message: string;
}

export interface RuntimeCapabilityCertificationResult {
  readonly status: RuntimeCapabilityCertificationStatus;
  readonly platformBaseline: "lingua-core-platform@phase9";
  readonly structuralMismatches: ReadonlyArray<RuntimeCapabilityCertificationMismatch>;
}

export interface RuntimeCapabilityCertificationInput {
  readonly expectedManifest: unknown;
  readonly providedManifest: unknown;
}

export type RuntimeCapabilityCertificationArtifact =
  RuntimeCapabilityCertificationResult;

export interface RuntimeCapabilityCertificationSummaryMismatch {
  readonly stageIndex: number;
  readonly objectPath: string;
  readonly diagnosticCode: "CAPABILITY_MISMATCH" | "CERTIFICATION_FAILURE";
  readonly message: string;
}

export interface RuntimeCapabilityCertificationSummary {
  readonly trackingId: "lingua-core-platform:runtime-certification-summary";
  readonly totalCapabilitiesEvaluated: number;
  readonly globalStatus: "certified" | "rejected";
  readonly aggregatedMismatches: ReadonlyArray<RuntimeCapabilityCertificationSummaryMismatch>;
}
