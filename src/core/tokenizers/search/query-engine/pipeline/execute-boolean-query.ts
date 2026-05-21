import type { InvertedIndex } from "../../index-primitives";
import { executePhraseQuery } from "./execute-phrase-query";
import { executeTokenQuery } from "./execute-token-query";
import type {
  BooleanQuery,
  Query,
  QueryExecutionResult,
} from "../shared/query-types";
import {
  intersectMatchedDocuments,
  unionMatchedDocuments,
} from "../utils/intersect-postings";

export function executeBooleanQuery(
  index: InvertedIndex,
  query: BooleanQuery,
): QueryExecutionResult {
  const resultSets = query.queries.map(
    (childQuery) => executeQuery(index, childQuery).matches,
  );

  return {
    matches:
      query.operator === "AND"
        ? intersectMatchedDocuments(resultSets)
        : unionMatchedDocuments(resultSets),
  };
}

export function executeQuery(
  index: InvertedIndex,
  query: Query,
): QueryExecutionResult {
  if (query.kind === "token") {
    return executeTokenQuery(index, query);
  }

  if (query.kind === "phrase") {
    return executePhraseQuery(index, query);
  }

  return executeBooleanQuery(index, query);
}
