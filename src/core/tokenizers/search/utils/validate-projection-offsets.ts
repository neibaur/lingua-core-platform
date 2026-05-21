import type { IndexMap } from "../../normalization";
import type { ProjectionSourceRange } from "../shared/projection-source-range";
import type { SearchProjectionRecord } from "../shared/search-projection-record";

export interface ProjectionOffsetValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateProjectionOffsets(
  records: readonly SearchProjectionRecord[],
  normalizedText: string,
  indexMap: IndexMap,
): ProjectionOffsetValidationResult {
  const errors: string[] = [];

  records.forEach((record, index) => {
    if (record.position !== index) {
      errors.push(
        `Record ${index.toString()} has unstable position ${record.position.toString()}.`,
      );
    }

    if (
      record.normalizedStart < 0 ||
      record.normalizedEnd < record.normalizedStart ||
      record.normalizedEnd > normalizedText.length
    ) {
      errors.push(`Record ${index.toString()} has invalid normalized offsets.`);
    }

    if (record.originalStart < 0 || record.originalEnd < record.originalStart) {
      errors.push(`Record ${index.toString()} has invalid original offsets.`);
    }

    if (
      record.token !==
      normalizedText.slice(record.normalizedStart, record.normalizedEnd)
    ) {
      errors.push(
        `Record ${index.toString()} token does not match normalized text.`,
      );
    }

    const mappedRange = mapNormalizedRangeToOriginalRange(
      record.normalizedStart,
      record.normalizedEnd,
      indexMap,
    );

    if (
      mappedRange.originalStart !== record.originalStart ||
      mappedRange.originalEnd !== record.originalEnd
    ) {
      errors.push(
        `Record ${index.toString()} original offsets do not match index map.`,
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function mapNormalizedRangeToOriginalRange(
  normalizedStart: number,
  normalizedEnd: number,
  indexMap: IndexMap,
): ProjectionSourceRange {
  if (normalizedStart === normalizedEnd) {
    const originalOffset =
      normalizedStart < indexMap.length
        ? indexMap[normalizedStart]
        : (indexMap.at(-1) ?? 0);

    return {
      normalizedStart,
      normalizedEnd,
      originalStart: originalOffset,
      originalEnd: originalOffset,
    };
  }

  const sourceIndices = indexMap.slice(normalizedStart, normalizedEnd);
  const originalStart = Math.min(...sourceIndices);
  const originalEnd = Math.max(...sourceIndices) + 1;

  return {
    normalizedStart,
    normalizedEnd,
    originalStart,
    originalEnd,
  };
}
