import type {
  RuntimeCapabilityCertificationDiagnosticCode,
  RuntimeCapabilityCertificationInput,
  RuntimeCapabilityCertificationMismatch,
  RuntimeCapabilityCertificationResult,
  RuntimeCapabilityDiagnostic,
} from "./contracts";
import { deepFreezeStructure } from "./manifest";
import {
  evaluateRuntimeCapabilityCompatibility,
  validateRuntimeCapabilityManifest,
} from "./validate";

const RUNTIME_CAPABILITY_CERTIFICATION_PLATFORM_BASELINE =
  "lingua-core-platform@phase9";

export function certifyRuntimeCapabilityManifest(
  input: RuntimeCapabilityCertificationInput,
): RuntimeCapabilityCertificationResult {
  const expectedValidation = validateRuntimeCapabilityManifest(
    input.expectedManifest,
  );
  const providedValidation = validateRuntimeCapabilityManifest(
    input.providedManifest,
  );
  const structuralMismatches: RuntimeCapabilityCertificationMismatch[] = [];

  if (!expectedValidation.success) {
    structuralMismatches.push(
      ...createCertificationMismatches(
        expectedValidation.diagnostics,
        "expectedManifest",
        "CERTIFICATION_FAILURE",
      ),
    );
  }

  if (!providedValidation.success) {
    structuralMismatches.push(
      ...createCertificationMismatches(
        providedValidation.diagnostics,
        "providedManifest",
        "CERTIFICATION_FAILURE",
      ),
    );
  }

  if (expectedValidation.success && providedValidation.success) {
    const compatibility = evaluateRuntimeCapabilityCompatibility(
      expectedValidation.data,
      providedValidation.data,
    );

    structuralMismatches.push(
      ...createCertificationMismatches(
        compatibility.diagnostics,
        "compatibility",
        "CAPABILITY_MISMATCH",
      ),
    );
  }

  const orderedMismatches = orderCertificationMismatches(structuralMismatches);

  return deepFreezeStructure({
    status: orderedMismatches.length === 0 ? "certified" : "rejected",
    platformBaseline: RUNTIME_CAPABILITY_CERTIFICATION_PLATFORM_BASELINE,
    structuralMismatches: orderedMismatches,
  });
}

export function orderCertificationMismatches(
  structuralMismatches: readonly RuntimeCapabilityCertificationMismatch[],
): readonly RuntimeCapabilityCertificationMismatch[] {
  return Object.freeze(
    [...structuralMismatches].sort(compareCertificationMismatches),
  );
}

function createCertificationMismatches(
  diagnostics: readonly RuntimeCapabilityDiagnostic[],
  rootPath: "expectedManifest" | "providedManifest" | "compatibility",
  diagnosticCode: RuntimeCapabilityCertificationDiagnosticCode,
): readonly RuntimeCapabilityCertificationMismatch[] {
  return Object.freeze(
    diagnostics.map((diagnostic) =>
      deepFreezeStructure({
        stageIndex: diagnostic.stageTrackingIndex,
        objectPath: createCertificationObjectPath(rootPath, diagnostic.path),
        diagnosticCode,
        message: diagnostic.message,
      }),
    ),
  );
}

function createCertificationObjectPath(
  rootPath: string,
  diagnosticPath: readonly string[],
): string {
  if (diagnosticPath[0] === "$") {
    return ["$", rootPath, ...diagnosticPath.slice(1)].join(".");
  }

  return ["$", rootPath, ...diagnosticPath].join(".");
}

function compareCertificationMismatches(
  left: RuntimeCapabilityCertificationMismatch,
  right: RuntimeCapabilityCertificationMismatch,
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
