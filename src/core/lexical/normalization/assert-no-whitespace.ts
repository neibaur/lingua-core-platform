const WHITESPACE_PATTERN = /\s/;

export function assertNoWhitespace(key: string, field: string = "key"): void {
  if (WHITESPACE_PATTERN.test(key)) {
    throw new Error(
      `[lexical invariant] ${field} must not contain whitespace: ${JSON.stringify(key)}`,
    );
  }
}
