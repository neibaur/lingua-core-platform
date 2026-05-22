import type {
  JsonObject,
  ReplayArtifactValidationTarget,
  ReplayArtifactValidatorDispatch,
} from "./contracts";
import {
  createQuerySnapshotDiagnostic,
  createQuerySnapshotFailure,
  createQuerySnapshotSuccess,
  type QuerySnapshotDiagnostic,
  type QuerySnapshotValidationResult,
} from "./diagnostics";
import {
  validateJsonSafeStructure,
  validateSnapshotEnvelope,
} from "./validate";

export function validateReplayArtifactByKind(
  dispatch: ReplayArtifactValidatorDispatch,
): QuerySnapshotValidationResult<unknown> {
  switch (dispatch.target) {
    case "snapshot-envelope":
      return validateSnapshotEnvelopeArtifact(dispatch.artifact);
    case "execution-plan":
      return validateExecutionPlanArtifact(dispatch.artifact);
    case "query-execution-trace":
      return validateQueryExecutionTraceArtifact(dispatch.artifact);
    case "query-explanation":
      return validateDeferredArtifactTarget(dispatch.target);
    case "query-pipeline-result":
      return validateDeferredArtifactTarget(dispatch.target);
  }
}

export function validateSnapshotEnvelopeArtifact(
  artifact: unknown,
): QuerySnapshotValidationResult<unknown> {
  const diagnostics = validateSnapshotEnvelope(artifact, "$");

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(artifact);
}

export function validateExecutionPlanArtifact(
  artifact: unknown,
): QuerySnapshotValidationResult<unknown> {
  const diagnostics = [
    ...validateJsonSafeStructure(artifact, "$"),
    ...validateExecutionPlanShape(artifact, "$"),
  ];

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(artifact);
}

export function validateQueryExecutionTraceArtifact(
  artifact: unknown,
): QuerySnapshotValidationResult<unknown> {
  const diagnostics = [
    ...validateJsonSafeStructure(artifact, "$"),
    ...validateTraceShape(artifact, "$"),
  ];

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(artifact);
}

function validateExecutionPlanShape(
  artifact: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(artifact)) {
    return Object.freeze([
      createShapeDiagnostic(
        path,
        "Execution plan artifact must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateStringField(artifact, "planId", `${path}.planId`),
  );
  diagnostics.push(
    ...validateLiteralField(
      artifact,
      "artifactKind",
      "EXECUTION_PLAN",
      `${path}.artifactKind`,
    ),
  );

  if (!Array.isArray(artifact.sequentialNodes)) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.sequentialNodes`,
        "Execution plan sequentialNodes must be an array.",
      ),
    );
  } else {
    artifact.sequentialNodes.forEach((node, index) => {
      diagnostics.push(
        ...validateExecutionPlanNode(
          node,
          `${path}.sequentialNodes[${String(index)}]`,
          index,
        ),
      );
    });
  }

  return Object.freeze(diagnostics);
}

function validateExecutionPlanNode(
  node: unknown,
  path: string,
  index: number,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(node)) {
    return Object.freeze([
      createShapeDiagnostic(
        path,
        "Execution plan node must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateSourceSpan(node.sourceSpan, `${path}.sourceSpan`),
  );

  if ("sequenceId" in node && node.sequenceId !== index) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.sequenceId`,
        "Execution plan node sequenceId must match its array index.",
      ),
    );
  }

  return Object.freeze(diagnostics);
}

function validateTraceShape(
  artifact: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(artifact)) {
    return Object.freeze([
      createShapeDiagnostic(
        path,
        "Query execution trace must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateStringField(artifact, "traceId", `${path}.traceId`),
  );

  if (!Array.isArray(artifact.steps)) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.steps`,
        "Query execution trace steps must be an array.",
      ),
    );
  }

  const stepCount = artifact.stepCount;

  if (
    typeof stepCount !== "number" ||
    !Number.isInteger(stepCount) ||
    stepCount < 0
  ) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.stepCount`,
        "Query execution trace stepCount must be a non-negative integer.",
      ),
    );
  } else if (
    Array.isArray(artifact.steps) &&
    stepCount !== artifact.steps.length
  ) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.stepCount`,
        "Query execution trace stepCount must match steps length.",
      ),
    );
  }

  if (Array.isArray(artifact.steps)) {
    artifact.steps.forEach((step, index) => {
      diagnostics.push(
        ...validateTraceStep(step, `${path}.steps[${String(index)}]`, index),
      );
    });
  }

  return Object.freeze(diagnostics);
}

function validateTraceStep(
  step: unknown,
  path: string,
  index: number,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(step)) {
    return Object.freeze([
      createShapeDiagnostic(
        path,
        "Query execution trace step must be a plain object.",
      ),
    ]);
  }

  if (typeof step.stepId !== "string") {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.stepId`,
        "Query execution trace stepId must be a string.",
      ),
    );
  } else if (step.stepId !== `query-trace-step-${String(index)}`) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.stepId`,
        "Query execution trace stepId must match deterministic step order.",
      ),
    );
  }

  return Object.freeze(diagnostics);
}

function validateSourceSpan(
  sourceSpan: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(sourceSpan)) {
    return Object.freeze([
      createShapeDiagnostic(path, "sourceSpan must be a plain object."),
    ]);
  }

  const start = sourceSpan.start;
  const end = sourceSpan.end;

  if (typeof start !== "number" || !Number.isInteger(start) || start < 0) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.start`,
        "sourceSpan.start must be a non-negative integer.",
      ),
    );
  }

  if (typeof end !== "number" || !Number.isInteger(end) || end < 0) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.end`,
        "sourceSpan.end must be a non-negative integer.",
      ),
    );
  }

  if (
    typeof start === "number" &&
    Number.isInteger(start) &&
    typeof end === "number" &&
    Number.isInteger(end) &&
    end < start
  ) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.end`,
        "sourceSpan.end must be greater than or equal to start.",
      ),
    );
  }

  return Object.freeze(diagnostics);
}

function validateStringField(
  artifact: JsonObject,
  field: string,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (typeof artifact[field] === "string") {
    return Object.freeze([]);
  }

  return Object.freeze([
    createShapeDiagnostic(path, `${field} must be a string.`),
  ]);
}

function validateLiteralField(
  artifact: JsonObject,
  field: string,
  expectedValue: string,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (artifact[field] === expectedValue) {
    return Object.freeze([]);
  }

  return Object.freeze([
    createShapeDiagnostic(path, `${field} must be ${expectedValue}.`),
  ]);
}

function validateDeferredArtifactTarget(
  target: ReplayArtifactValidationTarget,
): QuerySnapshotValidationResult<unknown> {
  return createQuerySnapshotFailure([
    createQuerySnapshotDiagnostic(
      "SNAPSHOT_INVALID_RECONSTRUCTION_BOUNDARY",
      "$",
      `${target} artifact validation is deferred to a subsequent governance slice.`,
    ),
  ]);
}

function createShapeDiagnostic(
  path: string,
  message: string,
): QuerySnapshotDiagnostic {
  return createQuerySnapshotDiagnostic(
    "SNAPSHOT_INVALID_ARTIFACT_SHAPE",
    path,
    message,
  );
}

function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
