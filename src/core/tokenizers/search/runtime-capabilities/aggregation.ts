import {
  RUNTIME_CERTIFICATION_SUMMARY_SCHEMA_VERSION,
  type RuntimeCapabilityCertificationArtifact,
  type RuntimeCapabilityCertificationSummary,
  type RuntimeCapabilityCertificationSummaryMismatch,
} from "./contracts";
import { deepFreezeStructure } from "./manifest";

export interface BuildRuntimeCapabilityCertificationSummaryInput {
  readonly certifications: ReadonlyArray<RuntimeCapabilityCertificationArtifact>;
}

const RUNTIME_CERTIFICATION_SUMMARY_TRACKING_ID =
  "lingua-core-platform:runtime-certification-summary";

export const buildRuntimeCapabilityCertificationSummary = (
  input: BuildRuntimeCapabilityCertificationSummaryInput,
): RuntimeCapabilityCertificationSummary => {
  const aggregatedMismatches = orderCertificationSummaryMismatches(
    input.certifications.flatMap((certification) =>
      certification.structuralMismatches.map((mismatch) => ({
        stageIndex: mismatch.stageIndex,
        objectPath: mismatch.objectPath,
        diagnosticCode: mismatch.diagnosticCode,
        message: mismatch.message,
      })),
    ),
  );
  const everyCertificationSucceeded = input.certifications.every(
    (certification) => certification.status === "certified",
  );

  return deepFreezeStructure({
    schemaVersion: RUNTIME_CERTIFICATION_SUMMARY_SCHEMA_VERSION,
    trackingId: RUNTIME_CERTIFICATION_SUMMARY_TRACKING_ID,
    totalCapabilitiesEvaluated: input.certifications.length,
    globalStatus:
      everyCertificationSucceeded && aggregatedMismatches.length === 0
        ? "certified"
        : "rejected",
    aggregatedMismatches,
  });
};

export function orderCertificationSummaryMismatches(
  mismatches: ReadonlyArray<RuntimeCapabilityCertificationSummaryMismatch>,
): ReadonlyArray<RuntimeCapabilityCertificationSummaryMismatch> {
  return Object.freeze(
    [...mismatches].sort(compareCertificationSummaryMismatches),
  );
}

function compareCertificationSummaryMismatches(
  left: RuntimeCapabilityCertificationSummaryMismatch,
  right: RuntimeCapabilityCertificationSummaryMismatch,
): number {
  const stageComparison = left.stageIndex - right.stageIndex;

  if (stageComparison !== 0) {
    return stageComparison;
  }

  const pathComparison = compareStrings(left.objectPath, right.objectPath);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  return compareStrings(left.diagnosticCode, right.diagnosticCode);
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
