import {
  composeLexicalLookup,
  composeLexicalLookupTrace,
  type LexicalLookupResult,
} from "../../../../lexical";
import { deepFreezeStructure } from "../../runtime-capabilities";
import type { QueryExecutionPlanNode } from "../../query-ir";
import {
  LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION,
  type ComposeLexicalQueryEnrichmentInput,
  type LexicalQueryEnrichmentResult,
  type LexicalTermEnrichment,
  type LexicalTermEnrichmentStatus,
} from "../shared/lexical-interop-types";

function resolveTermStatus(
  result: LexicalLookupResult,
): LexicalTermEnrichmentStatus {
  const hasEmptyIndex = result.diagnostics.some(
    (d) => d.code === "LEXICAL_INDEX_EMPTY",
  );

  if (hasEmptyIndex) {
    return "empty-index";
  }

  if (result.entries.length > 0) {
    return "found";
  }

  return "not-found";
}

function collectTerms(
  node: QueryExecutionPlanNode,
  accumulator: Set<string>,
): void {
  switch (node.type) {
    case "token":
      accumulator.add(node.normalizedTerm);
      break;
    case "phrase":
      for (const term of node.normalizedTerms) {
        accumulator.add(term);
      }
      break;
    case "boolean":
      for (const child of node.children) {
        collectTerms(child, accumulator);
      }
      break;
  }
}

function compareTerms(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function composeLexicalQueryEnrichment(
  input: ComposeLexicalQueryEnrichmentInput,
): LexicalQueryEnrichmentResult {
  if (input.enrichmentId.trim() === "") {
    throw new Error(
      "[lexical-interop invariant] enrichmentId must be a non-empty string",
    );
  }

  const executionPlan = input.pipelineResult.metadata.executionPlan;

  if (executionPlan === null) {
    return deepFreezeStructure({
      schemaVersion: LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION,
      evaluationTimestamp: null,
      enrichmentId: input.enrichmentId,
      lexicalIndexId: input.lexicalIndex.lexicalIndexId,
      direction: input.direction,
      derivedFrom: "execution-plan-ir" as const,
      termCount: 0,
      enrichedTermCount: 0,
      termEnrichments: [],
    });
  }

  const termSet = new Set<string>();
  collectTerms(executionPlan.root, termSet);

  const sortedTerms = [...termSet].sort(compareTerms);

  const termEnrichments: LexicalTermEnrichment[] = sortedTerms.map(
    (normalizedTerm, index) => {
      const lookupResult = composeLexicalLookup(
        {
          query: normalizedTerm,
          direction: input.direction,
          lexicalIndexId: input.lexicalIndex.lexicalIndexId,
        },
        input.lexicalIndex,
      );

      const lookupTrace = composeLexicalLookupTrace({
        traceId: `${input.enrichmentId}-term-${String(index)}`,
        result: lookupResult,
      });

      return {
        normalizedTerm,
        direction: input.direction,
        status: resolveTermStatus(lookupResult),
        lookupResult,
        lookupTrace,
      };
    },
  );

  const enrichedTermCount = termEnrichments.filter(
    (e) => e.status === "found",
  ).length;

  return deepFreezeStructure({
    schemaVersion: LEXICAL_QUERY_ENRICHMENT_SCHEMA_VERSION,
    evaluationTimestamp: null,
    enrichmentId: input.enrichmentId,
    lexicalIndexId: input.lexicalIndex.lexicalIndexId,
    direction: input.direction,
    derivedFrom: "execution-plan-ir" as const,
    termCount: sortedTerms.length,
    enrichedTermCount,
    termEnrichments,
  });
}
