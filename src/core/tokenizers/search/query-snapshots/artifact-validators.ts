import type { JsonObject, ReplayArtifactValidatorDispatch } from "./contracts";
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
      return validateQueryExplanationArtifact(dispatch.artifact);
    case "query-pipeline-result":
      return validateQueryPipelineArtifact(dispatch.artifact);
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

export function validateQueryExplanationArtifact(
  artifact: unknown,
): QuerySnapshotValidationResult<unknown> {
  const diagnostics = [
    ...validateJsonSafeStructure(artifact, "$"),
    ...validateExplanationShape(artifact, "$"),
  ];

  if (diagnostics.length > 0) {
    return createQuerySnapshotFailure(diagnostics);
  }

  return createQuerySnapshotSuccess(artifact);
}

export function validateQueryPipelineArtifact(
  artifact: unknown,
): QuerySnapshotValidationResult<unknown> {
  const diagnostics = [
    ...validateJsonSafeStructure(artifact, "$"),
    ...validatePipelineResultShape(artifact, "$"),
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

function validateExplanationShape(
  artifact: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(artifact)) {
    return Object.freeze([
      createShapeDiagnostic(path, "Query explanation must be a plain object."),
    ]);
  }

  diagnostics.push(
    ...validateLiteralField(
      artifact,
      "formatVersion",
      "query-explanation-v1",
      `${path}.formatVersion`,
    ),
  );

  if (typeof artifact.success !== "boolean") {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.success`,
        "Query explanation success must be a boolean.",
      ),
    );
  }

  if (!Array.isArray(artifact.stages)) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.stages`,
        "Query explanation stages must be an array.",
      ),
    );
  } else {
    artifact.stages.forEach((stage, index) => {
      diagnostics.push(
        ...validateExplanationStage(stage, `${path}.stages[${String(index)}]`),
      );
    });
  }

  if (!Array.isArray(artifact.artifacts)) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.artifacts`,
        "Query explanation artifacts must be an array.",
      ),
    );
  } else {
    artifact.artifacts.forEach((explanationArtifact, index) => {
      diagnostics.push(
        ...validateExplanationArtifact(
          explanationArtifact,
          `${path}.artifacts[${String(index)}]`,
          index,
        ),
      );
    });
  }

  if (!Array.isArray(artifact.diagnostics)) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.diagnostics`,
        "Query explanation diagnostics must be an array.",
      ),
    );
  }

  return Object.freeze(diagnostics);
}

function validateExplanationStage(
  stage: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(stage)) {
    return Object.freeze([
      createShapeDiagnostic(
        path,
        "Query explanation stage must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(...validateStringField(stage, "stage", `${path}.stage`));
  diagnostics.push(...validateStringField(stage, "status", `${path}.status`));

  const diagnosticCount = stage.diagnosticCount;

  if (
    typeof diagnosticCount !== "number" ||
    !Number.isInteger(diagnosticCount) ||
    diagnosticCount < 0
  ) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.diagnosticCount`,
        "Query explanation stage diagnosticCount must be a non-negative integer.",
      ),
    );
  }

  if (!Array.isArray(stage.artifactTypes)) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.artifactTypes`,
        "Query explanation stage artifactTypes must be an array.",
      ),
    );
  } else {
    stage.artifactTypes.forEach((artifactType, index) => {
      if (typeof artifactType !== "string") {
        diagnostics.push(
          createShapeDiagnostic(
            `${path}.artifactTypes[${String(index)}]`,
            "Query explanation stage artifactTypes entries must be strings.",
          ),
        );
      }
    });
  }

  if (stage.sourceSpan !== null) {
    diagnostics.push(
      ...validateSourceSpan(stage.sourceSpan, `${path}.sourceSpan`),
    );
  }

  return Object.freeze(diagnostics);
}

function validateExplanationArtifact(
  artifact: unknown,
  path: string,
  index: number,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(artifact)) {
    return Object.freeze([
      createShapeDiagnostic(
        path,
        "Query explanation artifact must be a plain object.",
      ),
    ]);
  }

  if (artifact.artifactId !== `query-explanation-artifact-${String(index)}`) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.artifactId`,
        "Query explanation artifactId must match deterministic artifact order.",
      ),
    );
  }

  diagnostics.push(...validateStringField(artifact, "type", `${path}.type`));
  diagnostics.push(...validateStringField(artifact, "stage", `${path}.stage`));

  if (artifact.sourceSpan !== null) {
    diagnostics.push(
      ...validateSourceSpan(artifact.sourceSpan, `${path}.sourceSpan`),
    );
  }

  if (!("data" in artifact)) {
    diagnostics.push(
      createShapeDiagnostic(
        `${path}.data`,
        "Query explanation artifact must include data.",
      ),
    );
  }

  return Object.freeze(diagnostics);
}

function validatePipelineResultShape(
  artifact: unknown,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];

  if (!isJsonObject(artifact)) {
    return Object.freeze([
      createShapeDiagnostic(
        path,
        "Query pipeline result must be a plain object.",
      ),
    ]);
  }

  diagnostics.push(
    ...validateLiteralField(
      artifact,
      "artifactKind",
      "QUERY_PIPELINE_RESULT",
      `${path}.artifactKind`,
    ),
  );
  diagnostics.push(...validateStringField(artifact, "query", `${path}.query`));
  diagnostics.push(
    ...validateStringArrayField(artifact, "lexemes", `${path}.lexemes`),
  );
  diagnostics.push(
    ...validateJsonStringField(artifact, "astJson", `${path}.astJson`),
  );
  diagnostics.push(
    ...validateNonEmptyStringField(
      artifact,
      "executionPlanId",
      `${path}.executionPlanId`,
    ),
  );
  diagnostics.push(
    ...validateNonEmptyStringField(artifact, "traceId", `${path}.traceId`),
  );
  diagnostics.push(
    ...validateNonEmptyStringField(
      artifact,
      "explanationId",
      `${path}.explanationId`,
    ),
  );

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

function validateNonEmptyStringField(
  artifact: JsonObject,
  field: string,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  if (typeof artifact[field] === "string" && artifact[field] !== "") {
    return Object.freeze([]);
  }

  return Object.freeze([
    createShapeDiagnostic(path, `${field} must be a non-empty string.`),
  ]);
}

function validateStringArrayField(
  artifact: JsonObject,
  field: string,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const diagnostics: QuerySnapshotDiagnostic[] = [];
  const value = artifact[field];

  if (!Array.isArray(value)) {
    return Object.freeze([
      createShapeDiagnostic(path, `${field} must be an array of strings.`),
    ]);
  }

  value.forEach((entry, index) => {
    if (typeof entry !== "string") {
      diagnostics.push(
        createShapeDiagnostic(
          `${path}[${String(index)}]`,
          `${field} entries must be strings.`,
        ),
      );
    }
  });

  return Object.freeze(diagnostics);
}

function validateJsonStringField(
  artifact: JsonObject,
  field: string,
  path: string,
): readonly QuerySnapshotDiagnostic[] {
  const value = artifact[field];

  if (typeof value !== "string") {
    return Object.freeze([
      createShapeDiagnostic(path, `${field} must be a JSON string.`),
    ]);
  }

  try {
    JSON.parse(value);
    return Object.freeze([]);
  } catch {
    return Object.freeze([
      createShapeDiagnostic(path, `${field} must contain valid JSON.`),
    ]);
  }
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
