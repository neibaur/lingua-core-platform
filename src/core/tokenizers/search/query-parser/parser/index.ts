import type {
  BooleanQueryNode,
  GroupedQueryNode,
  PhraseQueryNode,
  QueryAstNode,
  TokenQueryNode,
} from "../ast";
import type { QueryParserDiagnostic } from "../diagnostics";
import { lexQuery } from "../lexer";
import type { QueryLexeme } from "../lexer";
import type { SourceSpan } from "../shared";

export interface ParseQueryResult {
  readonly ast: QueryAstNode | null;
  readonly diagnostics: readonly QueryParserDiagnostic[];
}

export function parseQuery(query: string): ParseQueryResult {
  const lexemes = lexQuery(query);

  if (lexemes.length === 0) {
    return {
      ast: null,
      diagnostics: [
        createDiagnostic("QUERY_EMPTY", "Query must contain an expression.", {
          start: 0,
          end: query.length,
        }),
      ],
    };
  }

  const parser = new QueryParser(lexemes, query.length);
  const result = parser.parseExpression();

  if (result.ast === null) {
    return result;
  }

  const nextLexeme = parser.peek();

  if (nextLexeme?.type === "RPAREN") {
    return {
      ast: null,
      diagnostics: [
        createDiagnostic(
          "UNMATCHED_RIGHT_PAREN",
          "Closing parenthesis has no matching opening parenthesis.",
          nextLexeme.rawSpan,
        ),
      ],
    };
  }

  if (nextLexeme !== undefined) {
    return {
      ast: null,
      diagnostics: [
        createDiagnostic(
          "ADJACENT_TERMS",
          "Adjacent terms must be connected by AND or OR.",
          nextLexeme.rawSpan,
        ),
      ],
    };
  }

  return result;
}

class QueryParser {
  private cursor = 0;

  constructor(
    private readonly lexemes: readonly QueryLexeme[],
    private readonly queryLength: number,
  ) {}

  parseExpression(): ParseQueryResult {
    const leftResult = this.parsePrimary();

    if (leftResult.ast === null) {
      return leftResult;
    }

    let currentAst = leftResult.ast;

    while (this.peek()?.type === "AND" || this.peek()?.type === "OR") {
      const operatorLexeme = this.advance();
      const rightLexeme = this.peek();

      if (rightLexeme === undefined || rightLexeme.type === "RPAREN") {
        return {
          ast: null,
          diagnostics: [
            createDiagnostic(
              "DANGLING_OPERATOR",
              "Operator must be followed by an expression.",
              operatorLexeme.rawSpan,
            ),
          ],
        };
      }

      if (rightLexeme.type === "AND" || rightLexeme.type === "OR") {
        return {
          ast: null,
          diagnostics: [
            createDiagnostic(
              "CONSECUTIVE_OPERATORS",
              "Consecutive operators are not valid.",
              rightLexeme.rawSpan,
            ),
          ],
        };
      }

      const rightResult = this.parsePrimary();

      if (rightResult.ast === null) {
        return rightResult;
      }

      currentAst = createBooleanNode(operatorLexeme.value as "AND" | "OR", [
        currentAst,
        rightResult.ast,
      ]);
    }

    return {
      ast: currentAst,
      diagnostics: [],
    };
  }

  parsePrimary(): ParseQueryResult {
    const lexeme = this.peek();

    if (lexeme === undefined) {
      return {
        ast: null,
        diagnostics: [
          createDiagnostic("QUERY_EMPTY", "Query must contain an expression.", {
            start: this.queryLength,
            end: this.queryLength,
          }),
        ],
      };
    }

    if (lexeme.type === "TEXT") {
      this.advance();

      return {
        ast: createTokenNode(lexeme),
        diagnostics: [],
      };
    }

    if (lexeme.type === "PHRASE") {
      this.advance();

      return {
        ast: createPhraseNode(lexeme),
        diagnostics: [],
      };
    }

    if (lexeme.type === "LPAREN") {
      return this.parseGroup();
    }

    if (lexeme.type === "RPAREN") {
      return {
        ast: null,
        diagnostics: [
          createDiagnostic(
            "UNMATCHED_RIGHT_PAREN",
            "Closing parenthesis has no matching opening parenthesis.",
            lexeme.rawSpan,
          ),
        ],
      };
    }

    return {
      ast: null,
      diagnostics: [
        createDiagnostic(
          "CONSECUTIVE_OPERATORS",
          "Operator must follow an expression.",
          lexeme.rawSpan,
        ),
      ],
    };
  }

  parseGroup(): ParseQueryResult {
    const openParen = this.advance();

    if (this.peek()?.type === "RPAREN") {
      const closeParen = this.advance();

      return {
        ast: null,
        diagnostics: [
          createDiagnostic(
            "MISSING_GROUP_EXPRESSION",
            "Parentheses must contain an expression.",
            {
              start: openParen.rawSpan.start,
              end: closeParen.rawSpan.end,
            },
          ),
        ],
      };
    }

    const expressionResult = this.parseExpression();

    if (expressionResult.ast === null) {
      return expressionResult;
    }

    const closeParen = this.peek();

    if (closeParen?.type !== "RPAREN") {
      return {
        ast: null,
        diagnostics: [
          createDiagnostic(
            "UNMATCHED_LEFT_PAREN",
            "Opening parenthesis has no matching closing parenthesis.",
            openParen.rawSpan,
          ),
        ],
      };
    }

    this.advance();

    return {
      ast: createGroupNode(openParen, expressionResult.ast, closeParen),
      diagnostics: [],
    };
  }

  peek(): QueryLexeme | undefined {
    return this.lexemes[this.cursor];
  }

  private advance(): QueryLexeme {
    const lexeme = this.lexemes.at(this.cursor);

    if (lexeme === undefined) {
      throw new Error("Cannot advance parser beyond the end of the query.");
    }

    this.cursor += 1;

    return lexeme;
  }
}

function createTokenNode(lexeme: QueryLexeme): TokenQueryNode {
  return Object.freeze({
    type: "TOKEN",
    token: lexeme.value,
    sourceSpan: Object.freeze({ ...lexeme.rawSpan }),
  });
}

function createPhraseNode(lexeme: QueryLexeme): PhraseQueryNode {
  return Object.freeze({
    type: "PHRASE",
    phrase: lexeme.value,
    sourceSpan: Object.freeze({ ...lexeme.rawSpan }),
  });
}

function createBooleanNode(
  operator: "AND" | "OR",
  clauses: readonly QueryAstNode[],
): BooleanQueryNode {
  const firstClause = clauses[0];
  const lastClause = clauses[clauses.length - 1];

  return Object.freeze({
    type: "BOOLEAN",
    operator,
    clauses: Object.freeze([...clauses]),
    sourceSpan: Object.freeze({
      start: firstClause.sourceSpan.start,
      end: lastClause.sourceSpan.end,
    }),
  });
}

function createGroupNode(
  openParen: QueryLexeme,
  expression: QueryAstNode,
  closeParen: QueryLexeme,
): GroupedQueryNode {
  return Object.freeze({
    type: "GROUP",
    expression,
    sourceSpan: Object.freeze({
      start: openParen.rawSpan.start,
      end: closeParen.rawSpan.end,
    }),
  });
}

function createDiagnostic(
  code: string,
  message: string,
  span: SourceSpan,
): QueryParserDiagnostic {
  return Object.freeze({
    code,
    message,
    severity: "error",
    span: Object.freeze({ ...span }),
  });
}
