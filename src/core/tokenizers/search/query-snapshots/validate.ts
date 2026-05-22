import {
  QUERY_SNAPSHOT_SCHEMA_VERSION,
  type JsonObject,
  type QueryReplaySnapshot,
  type QuerySnapshotArtifactKind,
  type QuerySnapshotBundle,
} from "./contracts";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
  type QuerySnapshotDiagnostic,
  type QuerySnapshotValidationResult,
} from "./diagnostics";

const VALID_ARTIFACT_KINDS: readonly QuerySnapshotArtifactKind[] = [
  "query-pipeline-result",
  "execution-plan",
  "query-explanation",
  "query-execution-trace",
];

export function validateQueryReplaySnapshot(
  value: unknown,
): QuerySnapshotValidationResult<QueryReplaySnapshot> {
  const diagnostics = validateSnapshotEnvelope(value, "$");

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(value as QueryReplaySnapshot);
}

export function validateQueryReplaySnapshotWithArtifacts(
  value: unknown,
): QuerySnapshotValidationResult<QueryReplaySnapshot> {
  const envelopeResult = validateQueryReplaySnapshot(value);

  if (!envelopeResult.success) {
    return envelopeResult;
  }

  const artifactDiagnostics = validateArtifactShape(
    envelopeResult.data.artifactKind,
    envelopeResult.data.artifact,
    "$.artifact",
  );

  if (artifactDiagnostics.length > 0) {
    return createQuerySnapshotFailure(artifactDiagnostics);
  }

  return envelopeResult;
}

export function validateQuerySnapshotBundle(
  value: unknown,
): QuerySnapshotValidationResult<QuerySnapshotBundle> {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(value)) {
    return createQuerySnapshotFailure([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_MALFORMED_BUNDLE",
        "$",
        "Snapshot bundle must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateSchemaVersion(value.schemaVersion, "$.schemaVersion"),
  );

  if (!Array.isArray(value.snapshots)) {
    diagnostics.push(
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_MALFORMED_BUNDLE",
        "$.snapshots",
        "Snapshot bundle must contain a snapshots array.",
      ),
    );
  } else {
    value.snapshots.forEach((snapshot, index) => {
      diagnostics.push(
        ...validateSnapshotEnvelope(snapshot, `$.snapshots[${String(index)}]`),
      );
    });
  }

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(value as unknown as QuerySnapshotBundle);
}

export function validateSnapshotEnvelope(
  value: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(value)) {
    return Object.freeze([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_MALFORMED_ENVELOPE",
        path,
        "Snapshot envelope must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateSchemaVersion(value.schemaVersion, `${path}.schemaVersion`),
  );
  diagnostics.push(
    ...validateArtifactKind(value.artifactKind, `${path}.artifactKind`),
  );
  diagnostics.push(
    ...validateSnapshotId(value.snapshotId, `${path}.snapshotId`),
  );
  diagnostics.push(
    ...validateArtifactBoundary(value.artifact, `${path}.artifact`),
  );
  diagnostics.push(...validateJsonSafeStructure(value, path));

  return Object.freeze(diagnostics);
}

export function validateJsonSafeStructure(
  value: unknown,
  path: string,
  seenObjects: readonly object[] = [],
): readonly QuerySnapshotDiagnostic[] {
  if (value === null) {
    return Object.freeze([]);
  }

  switch (typeof value) {
    case "string":
    case "boolean":
      return Object.freeze([]);
    case "number":
      if (Number.isFinite(value)) {
        return Object.freeze([]);
      }

      return Object.freeze([
        createQuerySnapshotDiagnostic(
          "SNAPSHOT_NON_JSON_SAFE",
          path,
          "Snapshot value must be a finite JSON number.",
        ),
      ]);
    case "object":
      return validateJsonObjectOrArray(value, path, seenObjects);
    default:
      return Object.freeze([
        createQuerySnapshotDiagnostic(
          "SNAPSHOT_NON_JSON_SAFE",
          path,
          "Snapshot value must be JSON-safe data.",
        ),
      ]);
  }
}

function validateJsonObjectOrArray(
  value: object,
  path: string,
  seenObjects: readonly object[],
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (seenObjects.includes(value)) {
    return Object.freeze([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_NON_JSON_SAFE",
        path,
        "Snapshot value must not contain circular references.",
      ),
    ]);
  }

  const nextSeenObjects = Object.freeze([...seenObjects, value]);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      diagnostics.push(
        ...validateJsonSafeStructure(
          item,
          `${path}[${String(index)}]`,
          nextSeenObjects,
        ),
      );
    });

    return Object.freeze(diagnostics);
  }

  if (!isJsonObject(value)) {
    return Object.freeze([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_NON_JSON_SAFE",
        path,
        "Snapshot object must be a plain JSON object.",
      ),
    ]);
  }

  Object.entries(value).forEach(([key, entryValue]) => {
    diagnostics.push(
      ...validateJsonSafeStructure(
        entryValue,
        `${path}.${key}`,
        nextSeenObjects,
      ),
    );
  });

  return Object.freeze(diagnostics);
}

function validateSchemaVersion(
  value: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (value === QUERY_SNAPSHOT_SCHEMA_VERSION) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createQuerySnapshotDiagnostic(
      "SNAPSHOT_INVALID_SCHEMA_VERSION",
      path,
      `Snapshot schemaVersion must be ${QUERY_SNAPSHOT_SCHEMA_VERSION}.`,
    ),
  ]);
}

function validateArtifactKind(
  value: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (
    typeof value === "string" &&
    VALID_ARTIFACT_KINDS.includes(value as QuerySnapshotArtifactKind)
  ) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createQuerySnapshotDiagnostic(
      "SNAPSHOT_INVALID_ARTIFACT_KIND",
      path,
      "Snapshot artifactKind is not supported.",
    ),
  ]);
}

function validateSnapshotId(
  value: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (
    typeof value === "string" &&
    /^query-snapshot-(0|[1-9]\d*)$/u.test(value)
  ) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createQuerySnapshotDiagnostic(
      "SNAPSHOT_INVALID_SNAPSHOT_ID",
      path,
      "Snapshot snapshotId must use the query-snapshot-{number} format.",
    ),
  ]);
}

function validateArtifactBoundary(
  value: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (isJsonObject(value)) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createQuerySnapshotDiagnostic(
      "SNAPSHOT_INVALID_ARTIFACT",
      path,
      "Snapshot artifact must be a plain object.",
    ),
  ]);
}

function validateArtifactShape(
  artifactKind: QuerySnapshotArtifactKind,
  artifact: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (!isJsonObject(artifact)) {
    return Object.freeze([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
        path,
        "Snapshot artifact must be a plain object before artifact validation.",
      ),
    ]);
  }

  switch (artifactKind) {
    case "query-pipeline-result":
      return validateRequiredProperties(
        artifact,
        ["success", "diagnostics", "metadata"],
        path,
      );
    case "execution-plan":
      return validateRequiredProperties(
        artifact,
        ["formatVersion", "root", "metadata", "diagnostics"],
        path,
      );
    case "query-explanation":
      return validateRequiredProperties(
        artifact,
        ["formatVersion", "success", "stages", "artifacts", "diagnostics"],
        path,
      );
    case "query-execution-trace":
      return validateRequiredProperties(artifact, ["traceId", "steps"], path);
  }
}

function validateRequiredProperties(
  artifact: JsonObject,
  requiredProperties: readonly string[],
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  requiredProperties.forEach((property) => {
    if (!(property in artifact)) {
      diagnostics.push(
        createQuerySnapshotDiagnostic(
          "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
          `${path}.${property}`,
          `Snapshot artifact is missing required ${property} property.`,
        ),
      );
    }
  });

  return Object.freeze(diagnostics);
}

function isJsonObject(value: unknown): value is JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Reflect.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
