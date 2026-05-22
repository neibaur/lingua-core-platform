import {
  QUERY_SNAPSHOT_SCHEMA_VERSION,
  type JsonObject,
  type QueryReplayCompatibilityResult,
} from "./contracts";
import { validateJsonSafeStructure } from "./validate";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
  type QuerySnapshotValidationResult,
} from "./diagnostics";

export function evaluateQueryReplayCompatibility(
  left: unknown,
  right: unknown,
): QuerySnapshotValidationResult<QueryReplayCompatibilityResult> {
  const diagnostics = Object.freeze([
    ...validateJsonSafeStructure(left, "$.left"),
    ...validateJsonSafeStructure(right, "$.right"),
  ]);

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  if (!isJsonObject(left) || !isJsonObject(right)) {
    return createQuerySnapshotFailure([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_MALFORMED_ENVELOPE",
        "$",
        "Replay compatibility requires two snapshot envelope objects.",
      ),
    ]);
  }

  const schemaVersionCompatible =
    left.schemaVersion === QUERY_SNAPSHOT_SCHEMA_VERSION &&
    right.schemaVersion === QUERY_SNAPSHOT_SCHEMA_VERSION;
  const artifactKindCompatible = left.artifactKind === right.artifactKind;
  const compatible = schemaVersionCompatible && artifactKindCompatible;

  return createQuerySnapshotSuccess(
    Object.freeze({
      classification: compatible ? "compatible" : "incompatible",
      compatible,
      schemaVersionCompatible,
      artifactKindCompatible,
      migrationRequired: false,
    }),
  );
}

function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
