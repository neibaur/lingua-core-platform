import type { ProjectionSourceRange } from "../../shared/projection-source-range";

export interface SearchMatchRange extends ProjectionSourceRange {
  tokenPositions: number[];
}
