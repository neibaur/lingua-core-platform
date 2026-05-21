import {
  QUERY_SNAPSHOT_SCHEMA_VERSION,
  type QueryReplaySnapshot,
  type QuerySnapshotArtifactKind,
  type QuerySnapshotBundle,
  type QuerySnapshotId,
} from "./contracts";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
  type QuerySnapshotValidationResult,
} from "./diagnostics";
import { stableJsonParse } from "./stable-json";
import {
  validateQueryReplaySnapshot,
  validateQuerySnapshotBundle,
} from "./validate";

export interface QuerySnapshotReconstructionResult {
  readonly snapshots: readonly QueryReplaySnapshot[];
}

export function createQueryReplaySnapshot(
  artifactKind: QuerySnapshotArtifactKind,
  artifact: unknown,
  sequenceId: number,
): QuerySnapshotValidationResult<QueryReplaySnapshot> {
  if (!Number.isInteger(sequenceId) || sequenceId < 0) {
    return createQuerySnapshotFailure([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_INVALID_SNAPSHOT_ID",
        "$.snapshotId",
        "Snapshot snapshotId must use the query-snapshot-{number} format.",
      ),
    ]);
  }

  const snapshot = deepFreeze({
    schemaVersion: QUERY_SNAPSHOT_SCHEMA_VERSION,
    artifactKind,
    snapshotId: createSnapshotId(sequenceId),
    artifact,
  });

  return validateQueryReplaySnapshot(snapshot);
}

export function createQuerySnapshotBundle(
  snapshots: readonly QueryReplaySnapshot[],
): QuerySnapshotValidationResult<QuerySnapshotBundle> {
  const bundle = deepFreeze({
    schemaVersion: QUERY_SNAPSHOT_SCHEMA_VERSION,
    snapshots,
  });

  return validateQuerySnapshotBundle(bundle);
}

export function deserializeQueryReplaySnapshot(
  serializedSnapshot: string,
): QuerySnapshotValidationResult<QueryReplaySnapshot> {
  const parsedSnapshot = parseStableJson(serializedSnapshot);

  if (!parsedSnapshot.success) {
    return createQuerySnapshotFailure(parsedSnapshot.diagnostics);
  }

  return reconstructQueryReplaySnapshot(parsedSnapshot.data);
}

export function deserializeQuerySnapshotBundle(
  serializedBundle: string,
): QuerySnapshotValidationResult<QuerySnapshotBundle> {
  const parsedBundle = parseStableJson(serializedBundle);

  if (!parsedBundle.success) {
    return createQuerySnapshotFailure(parsedBundle.diagnostics);
  }

  return reconstructQuerySnapshotBundle(parsedBundle.data);
}

export function reconstructQueryReplaySnapshot(
  value: unknown,
): QuerySnapshotValidationResult<QueryReplaySnapshot> {
  const validationResult = validateQueryReplaySnapshot(value);

  if (!validationResult.success) {
    return validationResult;
  }

  return createQuerySnapshotSuccess(deepFreeze(validationResult.data));
}

export function reconstructQuerySnapshotBundle(
  value: unknown,
): QuerySnapshotValidationResult<QuerySnapshotBundle> {
  const validationResult = validateQuerySnapshotBundle(value);

  if (!validationResult.success) {
    return validationResult;
  }

  return createQuerySnapshotSuccess(deepFreeze(validationResult.data));
}

export function replayQuerySnapshotBundle(
  bundle: QuerySnapshotBundle,
): QuerySnapshotValidationResult<QuerySnapshotReconstructionResult> {
  const validationResult = validateQuerySnapshotBundle(bundle);

  if (!validationResult.success) {
    return createQuerySnapshotFailure(validationResult.diagnostics);
  }

  return createQuerySnapshotSuccess(
    deepFreeze({
      snapshots: validationResult.data.snapshots,
    }),
  );
}

function parseStableJson(
  serializedValue: string,
): QuerySnapshotValidationResult<unknown> {
  try {
    return createQuerySnapshotSuccess(stableJsonParse(serializedValue));
  } catch {
    return createQuerySnapshotFailure([
      createQuerySnapshotDiagnostic(
        "SNAPSHOT_INVALID_SERIALIZATION",
        "$",
        "Serialized snapshot input must be valid canonical JSON-safe data.",
      ),
    ]);
  }
}

function createSnapshotId(sequenceId: number): QuerySnapshotId {
  if (Number.isInteger(sequenceId) && sequenceId >= 0) {
    const deterministicId = String(sequenceId) as `${number}`;

    return `query-snapshot-${deterministicId}`;
  }

  return "query-snapshot-0";
}

function deepFreeze<T>(value: T): T {
  return freezeValue(value) as T;
}

function freezeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => freezeValue(item)));
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).map(([key, entryValue]) => {
      return [key, freezeValue(entryValue)] as const;
    });

    return Object.freeze(Object.fromEntries(entries));
  }

  return value;
}
