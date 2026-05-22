import type {
  RuntimeCapabilityCertificationArtifact,
  RuntimeCapabilityCertificationSummary,
  RuntimeCapabilityIntrospectionEnvelope,
  RuntimeCapabilityManifest,
} from "./contracts";
import { deepFreezeStructure, orderCapabilityDeclarations } from "./manifest";
import { orderCertificationMismatches } from "./certification";
import { orderCertificationSummaryMismatches } from "./aggregation";

export interface BuildRuntimeCapabilityIntrospectionEnvelopeInput {
  readonly trackingId: string;
  readonly manifests: ReadonlyArray<RuntimeCapabilityManifest>;
  readonly certifications: ReadonlyArray<RuntimeCapabilityCertificationArtifact>;
  readonly certificationSummary: RuntimeCapabilityCertificationSummary;
}

const RUNTIME_INTROSPECTION_ENVELOPE_SCHEMA_VERSION =
  "lingua-core-platform:runtime-introspection-envelope@phase9";
const RUNTIME_INTROSPECTION_GENERATED_FROM = "runtime-capability-introspection";

export const buildRuntimeCapabilityIntrospectionEnvelope = (
  input: BuildRuntimeCapabilityIntrospectionEnvelopeInput,
): RuntimeCapabilityIntrospectionEnvelope => {
  const manifests = orderRuntimeCapabilityManifests(input.manifests);
  const certifications = orderRuntimeCapabilityCertifications(
    input.certifications,
  );

  return deepFreezeStructure({
    trackingId: input.trackingId,
    schemaVersion: RUNTIME_INTROSPECTION_ENVELOPE_SCHEMA_VERSION,
    generatedFrom: RUNTIME_INTROSPECTION_GENERATED_FROM,
    manifestCount: manifests.length,
    certificationCount: certifications.length,
    globalStatus: input.certificationSummary.globalStatus,
    manifests,
    certifications,
    certificationSummary: normalizeCertificationSummary(
      input.certificationSummary,
    ),
  });
};

export function orderRuntimeCapabilityManifests(
  manifests: ReadonlyArray<RuntimeCapabilityManifest>,
): ReadonlyArray<RuntimeCapabilityManifest> {
  return Object.freeze(
    manifests
      .map((manifest) => ({
        schemaVersion: manifest.schemaVersion,
        metadata: {
          manifestId: manifest.metadata.manifestId,
          runtimeName: manifest.metadata.runtimeName,
          runtimeVersion: manifest.metadata.runtimeVersion,
          manifestVersion: manifest.metadata.manifestVersion,
        },
        capabilities: orderCapabilityDeclarations(manifest.capabilities),
      }))
      .sort(compareRuntimeCapabilityManifests),
  );
}

export function orderRuntimeCapabilityCertifications(
  certifications: ReadonlyArray<RuntimeCapabilityCertificationArtifact>,
): ReadonlyArray<RuntimeCapabilityCertificationArtifact> {
  return Object.freeze(
    certifications
      .map((certification) => ({
        status: certification.status,
        platformBaseline: certification.platformBaseline,
        structuralMismatches: orderCertificationMismatches(
          certification.structuralMismatches,
        ),
      }))
      .sort(compareRuntimeCapabilityCertifications),
  );
}

function normalizeCertificationSummary(
  certificationSummary: RuntimeCapabilityCertificationSummary,
): RuntimeCapabilityCertificationSummary {
  return {
    trackingId: certificationSummary.trackingId,
    totalCapabilitiesEvaluated: certificationSummary.totalCapabilitiesEvaluated,
    globalStatus: certificationSummary.globalStatus,
    aggregatedMismatches: orderCertificationSummaryMismatches(
      certificationSummary.aggregatedMismatches,
    ),
  };
}

function compareRuntimeCapabilityManifests(
  left: RuntimeCapabilityManifest,
  right: RuntimeCapabilityManifest,
): number {
  return compareStrings(left.metadata.manifestId, right.metadata.manifestId);
}

function compareRuntimeCapabilityCertifications(
  left: RuntimeCapabilityCertificationArtifact,
  right: RuntimeCapabilityCertificationArtifact,
): number {
  return compareStrings(
    createCertificationTrackingIdentifier(left),
    createCertificationTrackingIdentifier(right),
  );
}

function createCertificationTrackingIdentifier(
  certification: RuntimeCapabilityCertificationArtifact,
): string {
  return [
    certification.platformBaseline,
    certification.status,
    ...certification.structuralMismatches.map((mismatch) =>
      [
        String(mismatch.stageIndex),
        mismatch.objectPath,
        mismatch.diagnosticCode,
        mismatch.message,
      ].join("|"),
    ),
  ].join("::");
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
