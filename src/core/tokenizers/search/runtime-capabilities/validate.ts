import {
  RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION,
  type RuntimeCapabilityDeclaration,
  type RuntimeCapabilityDiagnostic,
  type RuntimeCapabilityDiagnosticCode,
  type RuntimeCapabilityKind,
  type RuntimeCapabilityManifest,
  type RuntimeCapabilityManifestMetadata,
  type RuntimeCapabilityStability,
  type RuntimeCapabilityValidationResult,
  type RuntimeCapabilityCompatibilityResult,
} from "./contracts";
import {
  composeRuntimeCapabilityManifest,
  compareRuntimeCapabilityDiagnostics,
} from "./manifest";
import { validateJsonSafeStructure } from "../query-snapshots";

const CAPABILITY_ID_PATTERN =
  /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/u;
const SEMANTIC_VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;

export function validateRuntimeCapabilityManifest(
  value: unknown,
): RuntimeCapabilityValidationResult<RuntimeCapabilityManifest> {
  const diagnostics: RuntimeCapabilityDiagnostic[] = [];

  if (!isJsonObject(value)) {
    return createRuntimeCapabilityFailure([
      createRuntimeCapabilityDiagnostic(
        0,
        "RUNTIME_CAPABILITY_MANIFEST_MALFORMED",
        ["$"],
        "Runtime capability manifest must be a plain object.",
      ),
    ]);
  }

  if (value.schemaVersion !== RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION) {
    diagnostics.push(
      createRuntimeCapabilityDiagnostic(
        0,
        "RUNTIME_CAPABILITY_MANIFEST_MALFORMED",
        ["$", "schemaVersion"],
        `Runtime capability manifest schemaVersion must be ${RUNTIME_CAPABILITY_MANIFEST_SCHEMA_VERSION}.`,
      ),
    );
  }

  diagnostics.push(
    ...validateManifestMetadata(value.metadata, ["$", "metadata"]),
  );

  if (!Array.isArray(value.capabilities)) {
    diagnostics.push(
      createRuntimeCapabilityDiagnostic(
        1,
        "RUNTIME_CAPABILITY_MANIFEST_MALFORMED",
        ["$", "capabilities"],
        "Runtime capability manifest capabilities must be an array.",
      ),
    );
  } else {
    value.capabilities.forEach((capability, index) => {
      diagnostics.push(
        ...validateCapabilityDeclaration(capability, [
          "$",
          "capabilities",
          `[${String(index)}]`,
        ]),
      );
    });
    diagnostics.push(...validateDuplicateCapabilities(value.capabilities));
  }

  if (diagnostics.length > 0) {
    return createRuntimeCapabilityFailure(diagnostics);
  }

  return createRuntimeCapabilitySuccess(
    composeRuntimeCapabilityManifest({
      metadata: value.metadata as RuntimeCapabilityManifestMetadata,
      capabilities:
        value.capabilities as readonly RuntimeCapabilityDeclaration[],
    }),
  );
}

export function evaluateRuntimeCapabilityCompatibility(
  requiredManifest: RuntimeCapabilityManifest,
  providedManifest: RuntimeCapabilityManifest,
): RuntimeCapabilityCompatibilityResult {
  const diagnostics: RuntimeCapabilityDiagnostic[] = [];

  requiredManifest.capabilities.forEach((requiredCapability, index) => {
    const providedCapability = findCapabilityById(
      providedManifest.capabilities,
      requiredCapability.capabilityId,
    );
    const stageTrackingIndex = index + 2;

    if (providedCapability === undefined) {
      diagnostics.push(
        createRuntimeCapabilityDiagnostic(
          stageTrackingIndex,
          "RUNTIME_CAPABILITY_MISSING",
          ["$", "capabilities", requiredCapability.capabilityId],
          `Required runtime capability ${requiredCapability.capabilityId} is missing.`,
        ),
      );
      return;
    }

    diagnostics.push(
      ...compareCapabilityCompatibility(
        requiredCapability,
        providedCapability,
        stageTrackingIndex,
      ),
    );
  });

  const orderedDiagnostics = orderRuntimeCapabilityDiagnostics(diagnostics);

  return Object.freeze({
    compatible: orderedDiagnostics.length === 0,
    requiredManifestId: requiredManifest.metadata.manifestId,
    providedManifestId: providedManifest.metadata.manifestId,
    diagnostics: orderedDiagnostics,
  });
}

export function orderRuntimeCapabilityDiagnostics(
  diagnostics: readonly RuntimeCapabilityDiagnostic[],
): readonly RuntimeCapabilityDiagnostic[] {
  return Object.freeze(
    [...diagnostics].sort(compareRuntimeCapabilityDiagnostics),
  );
}

function validateManifestMetadata(
  value: unknown,
  path: readonly string[],
): readonly RuntimeCapabilityDiagnostic[] {
  const diagnostics: RuntimeCapabilityDiagnostic[] = [];

  if (!isJsonObject(value)) {
    return Object.freeze([
      createRuntimeCapabilityDiagnostic(
        0,
        "RUNTIME_CAPABILITY_METADATA_INVALID",
        path,
        "Runtime capability manifest metadata must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateNonEmptyString(value.manifestId, [...path, "manifestId"]),
  );
  diagnostics.push(
    ...validateNonEmptyString(value.runtimeName, [...path, "runtimeName"]),
  );
  diagnostics.push(
    ...validateSemanticVersion(
      value.runtimeVersion,
      [...path, "runtimeVersion"],
      0,
    ),
  );
  diagnostics.push(
    ...validateSemanticVersion(
      value.manifestVersion,
      [...path, "manifestVersion"],
      0,
    ),
  );

  return Object.freeze(diagnostics);
}

function validateCapabilityDeclaration(
  value: unknown,
  path: readonly string[],
): readonly RuntimeCapabilityDiagnostic[] {
  const diagnostics: RuntimeCapabilityDiagnostic[] = [];

  if (!isJsonObject(value)) {
    return Object.freeze([
      createRuntimeCapabilityDiagnostic(
        1,
        "RUNTIME_CAPABILITY_MANIFEST_MALFORMED",
        path,
        "Runtime capability declaration must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateCapabilityId(value.capabilityId, [...path, "capabilityId"]),
  );
  diagnostics.push(...validateCapabilityKind(value.kind, [...path, "kind"]));
  diagnostics.push(
    ...validateSemanticVersion(value.version, [...path, "version"], 1),
  );
  diagnostics.push(
    ...validateCapabilityStability(value.stability, [...path, "stability"]),
  );

  if ("metadata" in value) {
    diagnostics.push(
      ...validateCapabilityMetadata(value.metadata, [...path, "metadata"]),
    );
  }

  return Object.freeze(diagnostics);
}

function validateDuplicateCapabilities(
  capabilities: readonly unknown[],
): readonly RuntimeCapabilityDiagnostic[] {
  const diagnostics: RuntimeCapabilityDiagnostic[] = [];

  capabilities.forEach((capability, index) => {
    if (
      !isJsonObject(capability) ||
      typeof capability.capabilityId !== "string"
    ) {
      return;
    }

    const firstIndex = capabilities.findIndex(
      (candidate) =>
        isJsonObject(candidate) &&
        candidate.capabilityId === capability.capabilityId,
    );

    if (firstIndex !== index) {
      diagnostics.push(
        createRuntimeCapabilityDiagnostic(
          1,
          "RUNTIME_CAPABILITY_DUPLICATE",
          ["$", "capabilities", `[${String(index)}]`, "capabilityId"],
          `Runtime capability ${capability.capabilityId} must be declared once.`,
        ),
      );
    }
  });

  return Object.freeze(diagnostics);
}

function validateNonEmptyString(
  value: unknown,
  path: readonly string[],
): readonly RuntimeCapabilityDiagnostic[] {
  if (typeof value === "string" && value.trim() !== "") {
    return Object.freeze([]);
  }

  return Object.freeze([
    createRuntimeCapabilityDiagnostic(
      0,
      "RUNTIME_CAPABILITY_METADATA_INVALID",
      path,
      "Runtime capability metadata field must be a non-empty string.",
    ),
  ]);
}

function validateCapabilityId(
  value: unknown,
  path: readonly string[],
): readonly RuntimeCapabilityDiagnostic[] {
  if (typeof value === "string" && CAPABILITY_ID_PATTERN.test(value)) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createRuntimeCapabilityDiagnostic(
      1,
      "RUNTIME_CAPABILITY_ID_INVALID",
      path,
      "Runtime capabilityId must use domain:action:target token syntax.",
    ),
  ]);
}

function validateSemanticVersion(
  value: unknown,
  path: readonly string[],
  stageTrackingIndex: number,
): readonly RuntimeCapabilityDiagnostic[] {
  if (typeof value === "string" && SEMANTIC_VERSION_PATTERN.test(value)) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createRuntimeCapabilityDiagnostic(
      stageTrackingIndex,
      "RUNTIME_CAPABILITY_VERSION_INVALID",
      path,
      "Runtime capability version fields must use semantic major.minor.patch form.",
    ),
  ]);
}

function validateCapabilityKind(
  value: unknown,
  path: readonly string[],
): readonly RuntimeCapabilityDiagnostic[] {
  if (isRuntimeCapabilityKind(value)) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createRuntimeCapabilityDiagnostic(
      1,
      "RUNTIME_CAPABILITY_KIND_INVALID",
      path,
      "Runtime capability kind is not supported.",
    ),
  ]);
}

function validateCapabilityStability(
  value: unknown,
  path: readonly string[],
): readonly RuntimeCapabilityDiagnostic[] {
  if (isRuntimeCapabilityStability(value)) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createRuntimeCapabilityDiagnostic(
      1,
      "RUNTIME_CAPABILITY_STABILITY_INVALID",
      path,
      "Runtime capability stability must be stable or experimental.",
    ),
  ]);
}

function validateCapabilityMetadata(
  value: unknown,
  path: readonly string[],
): readonly RuntimeCapabilityDiagnostic[] {
  if (!isJsonObject(value)) {
    return Object.freeze([
      createRuntimeCapabilityDiagnostic(
        1,
        "RUNTIME_CAPABILITY_METADATA_NON_JSON_SAFE",
        path,
        "Runtime capability metadata must be a plain JSON object.",
      ),
    ]);
  }

  const snapshotDiagnostics = validateJsonSafeStructure(value, path.join("."));

  if (snapshotDiagnostics.length === 0) {
    return Object.freeze([]);
  }

  return Object.freeze(
    snapshotDiagnostics.map((diagnostic) =>
      createRuntimeCapabilityDiagnostic(
        1,
        "RUNTIME_CAPABILITY_METADATA_NON_JSON_SAFE",
        path,
        diagnostic.message,
      ),
    ),
  );
}

function compareCapabilityCompatibility(
  requiredCapability: RuntimeCapabilityDeclaration,
  providedCapability: RuntimeCapabilityDeclaration,
  stageTrackingIndex: number,
): readonly RuntimeCapabilityDiagnostic[] {
  const diagnostics: RuntimeCapabilityDiagnostic[] = [];
  const basePath = ["$", "capabilities", requiredCapability.capabilityId];

  if (requiredCapability.kind !== providedCapability.kind) {
    diagnostics.push(
      createRuntimeCapabilityDiagnostic(
        stageTrackingIndex,
        "RUNTIME_CAPABILITY_INCOMPATIBLE_KIND",
        [...basePath, "kind"],
        `Runtime capability ${requiredCapability.capabilityId} kind must match.`,
      ),
    );
  }

  if (requiredCapability.version !== providedCapability.version) {
    diagnostics.push(
      createRuntimeCapabilityDiagnostic(
        stageTrackingIndex,
        "RUNTIME_CAPABILITY_INCOMPATIBLE_VERSION",
        [...basePath, "version"],
        `Runtime capability ${requiredCapability.capabilityId} version must match.`,
      ),
    );
  }

  if (requiredCapability.stability !== providedCapability.stability) {
    diagnostics.push(
      createRuntimeCapabilityDiagnostic(
        stageTrackingIndex,
        "RUNTIME_CAPABILITY_INCOMPATIBLE_STABILITY",
        [...basePath, "stability"],
        `Runtime capability ${requiredCapability.capabilityId} stability must match.`,
      ),
    );
  }

  return Object.freeze(diagnostics);
}

function findCapabilityById(
  capabilities: readonly RuntimeCapabilityDeclaration[],
  capabilityId: string,
): RuntimeCapabilityDeclaration | undefined {
  return capabilities.find(
    (capability) => capability.capabilityId === capabilityId,
  );
}

function createRuntimeCapabilitySuccess<TData>(
  data: TData,
): RuntimeCapabilityValidationResult<TData> {
  return Object.freeze({
    success: true as const,
    data,
  });
}

function createRuntimeCapabilityFailure<TData>(
  diagnostics: readonly RuntimeCapabilityDiagnostic[],
): RuntimeCapabilityValidationResult<TData> {
  return Object.freeze({
    success: false as const,
    diagnostics: orderRuntimeCapabilityDiagnostics(diagnostics),
  });
}

function createRuntimeCapabilityDiagnostic(
  stageTrackingIndex: number,
  code: RuntimeCapabilityDiagnosticCode,
  path: readonly string[],
  message: string,
): RuntimeCapabilityDiagnostic {
  return Object.freeze({
    stageTrackingIndex,
    code,
    severity: "error" as const,
    path: Object.freeze([...path]),
    message,
  });
}

function isRuntimeCapabilityKind(
  value: unknown,
): value is RuntimeCapabilityKind {
  switch (value) {
    case "engine":
    case "query":
    case "snapshot":
    case "governance":
      return true;
    default:
      return false;
  }
}

function isRuntimeCapabilityStability(
  value: unknown,
): value is RuntimeCapabilityStability {
  switch (value) {
    case "stable":
    case "experimental":
      return true;
    default:
      return false;
  }
}

function isJsonObject(
  value: unknown,
): value is { readonly [key: string]: unknown } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
