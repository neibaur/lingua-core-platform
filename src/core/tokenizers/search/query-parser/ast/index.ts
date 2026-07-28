import type { SourceSpan } from "../shared/source-span";

export type QueryNodeType = "TOKEN" | "PHRASE" | "BOOLEAN" | "GROUP";

export interface QueryAstBaseNode {
  readonly type: QueryNodeType;
  readonly sourceSpan: SourceSpan;
}

export type QueryAstNode =
  TokenQueryNode | PhraseQueryNode | BooleanQueryNode | GroupedQueryNode;

export interface TokenQueryNode extends QueryAstBaseNode {
  readonly type: "TOKEN";
  readonly token: string;
}

export interface PhraseQueryNode extends QueryAstBaseNode {
  readonly type: "PHRASE";
  readonly phrase: string;
}

export interface BooleanQueryNode extends QueryAstBaseNode {
  readonly type: "BOOLEAN";
  readonly operator: "AND" | "OR";
  readonly clauses: readonly QueryAstNode[];
}

export interface GroupedQueryNode extends QueryAstBaseNode {
  readonly type: "GROUP";
  readonly expression: QueryAstNode;
}
