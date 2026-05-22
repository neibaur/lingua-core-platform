import {
  RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
  type RuntimeCapabilityDeclaration,
  type RuntimeCapabilityManifest,
  type RuntimeCapabilityManifestMetadata,
} from "./contracts";

export interface ComposeRuntimeCapabilityManifestInput {
  readonly metadata: RuntimeCapabilityManifestMetadata;
  readonly capabilities: readonly RuntimeCapabilityDeclaration[];
}

export function composeRuntimeCapabilityManifest(
  input: ComposeRuntimeCapabilityManifestInput,
): RuntimeCapabilityManifest {
  return deepFreezeStructure({
    schemaVersion: RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
    metadata: normalizeManifestMetadata(input.metadata),
    capabilities: orderCapabilityDeclarations(
      input.capabilities.map((capability) =>
        normalizeCapabilityDeclaration(capability),
      ),
    ),
  });
}

export function orderCapabilityDeclarations(
  capabilities: readonly RuntimeCapabilityDeclaration[],
): readonly RuntimeCapabilityDeclaration[] {
  return Object.freeze([...capabilities].sort(compareCapabilityDeclarations));
}

export function compareCapabilityDeclarations(
  left: RuntimeCapabilityDeclaration,
  right: RuntimeCapabilityDeclaration,
): number {
  const capabilityIdComparison = compareStrings(
    left.capabilityId,
    right.capabilityId,
  );

  if (capabilityIdComparison !== 0) {
    return capabilityIdComparison;
  }

  const kindComparison = compareStrings(left.kind, right.kind);

  if (kindComparison !== 0) {
    return kindComparison;
  }

  return compareStrings(left.version, right.version);
}

export function compareRuntimeCapabilityDiagnostics(
  left: {
    readonly stageTrackingIndex: number;
    readonly path: readonly string[];
    readonly code: string;
  },
  right: {
    readonly stageTrackingIndex: number;
    readonly path: readonly string[];
    readonly code: string;
  },
): number {
  const stageComparison = left.stageTrackingIndex - right.stageTrackingIndex;

  if (stageComparison !== 0) {
    return stageComparison;
  }

  const pathComparison = compareStrings(
    left.path.join("."),
    right.path.join("."),
  );

  if (pathComparison !== 0) {
    return pathComparison;
  }

  return compareStrings(left.code, right.code);
}

function normalizeManifestMetadata(
  metadata: RuntimeCapabilityManifestMetadata,
): RuntimeCapabilityManifestMetadata {
  return {
    manifestId: metadata.manifestId,
    runtimeName: metadata.runtimeName,
    runtimeVersion: metadata.runtimeVersion,
    manifestVersion: metadata.manifestVersion,
  };
}

function normalizeCapabilityDeclaration(
  capability: RuntimeCapabilityDeclaration,
): RuntimeCapabilityDeclaration {
  return {
    capabilityId: capability.capabilityId,
    kind: capability.kind,
    version: capability.version,
    stability: capability.stability,
    ...(capability.metadata === undefined
      ? {}
      : { metadata: capability.metadata }),
  };
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

export function deepFreezeStructure<T>(value: T): T {
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
