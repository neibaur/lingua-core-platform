import type { ProjectionSourceRange } from "./projection-source-range";

export type SearchProjectionTokenType = "term";

export interface SearchProjectionRecord extends ProjectionSourceRange {
  token: string;
  tokenType: SearchProjectionTokenType;
  position: number;
}
