import type { PostingRecord } from "../../index-primitives";
import type { MatchedSpan } from "../shared/query-types";

export function reconstructQuerySpan(
  postings: readonly PostingRecord[],
): MatchedSpan {
  if (postings.length === 0) {
    throw new Error(
      "Cannot reconstruct a query span from an empty posting set.",
    );
  }

  const sortedPostings = [...postings].sort(
    (left, right) =>
      left.position - right.position ||
      left.normalizedStart - right.normalizedStart ||
      left.originalStart - right.originalStart,
  );
  const firstPosting = sortedPostings[0];
  const lastPosting = sortedPostings[sortedPostings.length - 1];

  return {
    normalizedStart: firstPosting.normalizedStart,
    normalizedEnd: lastPosting.normalizedEnd,
    originalStart: firstPosting.originalStart,
    originalEnd: lastPosting.originalEnd,
  };
}
