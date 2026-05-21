import type { TokenizerDriver } from "../drivers/tokenizer-driver";
import type { TokenizationResult } from "../shared/token-types";

export async function tokenizeText(
  driver: TokenizerDriver,
  input: string,
): Promise<TokenizationResult> {
  return driver.tokenize(input);
}
