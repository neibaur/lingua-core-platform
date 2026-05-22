import type { JsonValue } from "./contracts";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
  type QuerySnapshotValidationResult,
} from "./diagnostics";
import { stableJsonParse, stableJsonStringify } from "./stable-json";
import { validateJsonSafeStructure } from "./validate";

export interface QuerySnapshotEquivalenceResult {
  readonly equivalent: boolean;
  readonly serializedLeft: string;
  readonly serializedRight: string;
}

export function verifyCanonicalStructuralEquivalence(
  left: unknown,
  right: unknown,
): QuerySnapshotValidationResult<QuerySnapshotEquivalenceResult> {
  const leftDiagnostics = validateJsonSafeStructure(left, "$.left");
  const rightDiagnostics = validateJsonSafeStructure(right, "$.right");
  const diagnostics = Object.freeze([...leftDiagnostics, ...rightDiagnostics]);

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  const serializedLeft = stableJsonStringify(left);
  const serializedRight = stableJsonStringify(right);
  const equivalent = serializedLeft === serializedRight;

  if (!equivalent) {
    return createQuerySnapshotFailure([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_NOT_EQUIVALENT",
        "$",
        "Canonical snapshot serialization outputs differ.",
      ),
    ]);
  }

  return createQuerySnapshotSuccess(
    Object.freeze({
      equivalent,
      serializedLeft,
      serializedRight,
    }),
  );
}

export function canonicalizeForEquivalence(
  value: unknown,
): QuerySnapshotValidationResult<JsonValue> {
  const diagnostics = validateJsonSafeStructure(value, "$");

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(
    stableJsonParse(stableJsonStringify(value)),
  );
}
