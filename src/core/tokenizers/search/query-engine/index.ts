export {
  executeBooleanQuery,
  executeQuery,
} from "./pipeline/execute-boolean-query";
export { executePhraseQuery } from "./pipeline/execute-phrase-query";
export { executeTokenQuery } from "./pipeline/execute-token-query";
export {
  intersectMatchedDocuments,
  mergeDocumentMatches,
  unionMatchedDocuments,
} from "./utils/intersect-postings";
export { groupPostingsByDocument } from "./utils/group-postings-by-document";
export { reconstructQuerySpan } from "./utils/reconstruct-query-span";
export type {
  BooleanQuery,
  MatchedDocument,
  MatchedSpan,
  PhraseQuery,
  Query,
  QueryExecutionResult,
  QueryPostingMatch,
  TokenQuery,
} from "./shared/query-types";
