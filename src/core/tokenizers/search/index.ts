export { buildSearchProjection } from "./pipeline/build-search-projection";
export { CorpusIndexer } from "./index-primitives";
export {
  canonicalizeSearchCorpus,
  deserializeSearchCorpus,
  serializeSearchCorpus,
} from "./index-primitives";
export {
  executeBooleanQuery,
  executePhraseQuery,
  executeQuery,
  executeTokenQuery,
} from "./query-engine";
export {
  groupPostingsByDocument,
  intersectMatchedDocuments,
  mergeDocumentMatches,
  reconstructQuerySpan,
  unionMatchedDocuments,
} from "./query-engine";
export { buildQueryExecutionPlan } from "./query-ir";
export { QUERY_EXECUTION_PLAN_FORMAT_VERSION } from "./query-ir";
export { executeQueryPipeline } from "./query-pipeline";
export {
  aggregateReplayDiagnostics,
  canonicalizeForEquivalence,
  createQueryReplaySnapshot,
  createQuerySnapshotBundle,
  deserializeQueryReplaySnapshot,
  deserializeQuerySnapshotBundle,
  diffJsonValues,
  diffQueryReplaySnapshots,
  evaluateQueryReplayCompatibility,
  reconstructQueryReplaySnapshot,
  reconstructQuerySnapshotBundle,
  replayQuerySnapshotBundle,
  stableJsonStringify,
  summarizeReplayCompatibility,
  summarizeReplayDiff,
  validateExecutionPlanArtifact,
  validateQueryExplanationArtifact,
  validateQueryExecutionTraceArtifact,
  validateQueryPipelineArtifact,
  validateQueryReplaySnapshot,
  validateQueryReplaySnapshotWithArtifacts,
  validateQuerySnapshotBundle,
  validateReplayArtifactByKind,
  validateSnapshotEnvelopeArtifact,
  verifyCanonicalStructuralEquivalence,
} from "./query-snapshots";
export {
  buildQueryExecutionTrace,
  buildQueryExplanation,
} from "./query-tracing";
export { compileQueryAst, lexQuery, parseQuery } from "./query-parser";
export { matchSearchTerm } from "./matching";
export { buildPhraseWindow } from "./matching";
export { extractMatchSpan } from "./matching";
export { isContiguousMatch } from "./matching";
export { extractOriginalSpan } from "./utils/extract-original-span";
export {
  mapNormalizedRangeToOriginalRange,
  validateProjectionOffsets,
} from "./utils/validate-projection-offsets";
export type { ProjectionSourceRange } from "./shared/projection-source-range";
export {
  SEARCH_CORPUS_FORMAT_VERSION,
  type CorpusDocument,
  type CorpusIndexDocumentInput,
  type CorpusStatistics,
  type InvertedIndex,
  type PostingRecord,
  type SearchCorpus,
  type SearchCorpusFormatVersion,
} from "./index-primitives";
export type {
  PhraseMatchResult,
  SearchMatch,
  SearchMatchRange,
} from "./matching";
export type {
  BooleanQuery,
  MatchedDocument,
  MatchedSpan,
  PhraseQuery,
  Query,
  QueryExecutionResult,
  QueryPostingMatch,
  TokenQuery,
} from "./query-engine";
export type {
  BooleanExecutionPlanNode,
  PhraseExecutionPlanNode,
  QueryExecutionPlan,
  QueryExecutionPlanDiagnostic,
  QueryExecutionPlanMetadata,
  QueryExecutionPlanNode,
  QueryExecutionPlanNodeType,
  TokenExecutionPlanNode,
} from "./query-ir";
export type {
  CompileQueryPipelineDiagnostic,
  ExecuteQueryPipelineInput,
  ExecuteQueryPipelineOptions,
  ExecuteQueryPipelineResult,
  ExecuteQueryPipelineDiagnostic,
  LexQueryPipelineDiagnostic,
  ParseQueryPipelineDiagnostic,
  PlanQueryPipelineDiagnostic,
  QueryPipelineDiagnostic,
  QueryPipelineDiagnosticBase,
  QueryPipelineMetadata,
  QueryPipelineStage,
  QueryPipelineStageResult,
} from "./query-pipeline";
export type {
  ExecutionPlanSnapshot,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  QueryReplayCompatibilityClassification,
  QueryReplayCompatibilityResult,
  QueryReplayDiffClassification,
  QueryReplayDiffEntry,
  QueryReplayDiffKind,
  QueryReplayDiffResult,
  QueryReplayDiffValue,
  ReplayAggregationArtifact,
  ReplayAggregationStage,
  ReplayAggregationSummary,
  ReplayArtifactValidationTarget,
  ReplayArtifactValidatorDispatch,
  ReplayCompatibilitySummary,
  ReplayDiagnosticAggregate,
  ReplayDiagnosticGroup,
  ReplayDiffSeverity,
  ReplayDiffStageSummary,
  ReplayDiffStatistics,
  ReplayDiffSummary,
  ReplayDiffSummaryStage,
  ReplayValidatorCompiledExecutionPlanShape,
  ReplayValidatorQueryAstNodeShape,
  ReplayValidatorQueryExecutionTraceShape,
  ReplayValidatorQueryExplanationShape,
  ReplayValidatorQueryPipelineResultShape,
  QueryExecutionTraceSnapshot,
  QueryExplanationSnapshot,
  QueryPipelineSnapshot,
  QueryReplaySnapshot,
  QuerySnapshotArtifactKind,
  QuerySnapshotBundle,
  QuerySnapshotDiagnostic,
  QuerySnapshotDiagnosticCode,
  QuerySnapshotDiagnosticSeverity,
  QuerySnapshotEnvelope,
  QuerySnapshotEquivalenceResult,
  QuerySnapshotId,
  QuerySnapshotReconstructionResult,
  QuerySnapshotSchemaVersion,
  QuerySnapshotValidationResult,
} from "./query-snapshots";
export type {
  QueryExecutionTrace,
  QueryExecutionTraceMetadata,
  QueryExecutionTraceStage,
  QueryExecutionTraceStatus,
  QueryExecutionTraceStep,
  QueryExplanation,
  QueryExplanationArtifact,
  QueryExplanationArtifactType,
  QueryExplanationStage,
  QueryTraceMetadataPrimitive,
} from "./query-tracing";
export type {
  QueryLexeme,
  QueryLexemeType,
  ParseQueryResult,
  BooleanQueryNode,
  GroupedQueryNode,
  PhraseQueryNode,
  QueryAstBaseNode,
  QueryAstNode,
  QueryNodeType,
  CompiledQueryPlan,
  CompileQueryResult,
  QueryCompileDiagnostic,
  QueryParserDiagnostic,
  QueryParserDiagnosticSeverity,
  TokenQueryNode,
  SourceSpan,
} from "./query-parser";
export type { SearchProjectionPipelineResult } from "./shared/search-projection-pipeline-result";
export type {
  SearchProjectionRecord,
  SearchProjectionTokenType,
} from "./shared/search-projection-record";
export type { ProjectionOffsetValidationResult } from "./utils/validate-projection-offsets";
