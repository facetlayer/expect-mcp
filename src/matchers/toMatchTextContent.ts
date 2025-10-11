import { ToolCallResult } from '../results/ToolCallResult.js';
import { MCPMatcherResult } from '../types.js';
import { checkCastToolCallResult, resolveUtils } from '../utils.js';

export async function toMatchTextContent(
  this: any,
  received: unknown,
  pattern: RegExp
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  // Check and cast the received value to ToolCallResult
  const castResult = checkCastToolCallResult(received, utils);

  if (!castResult.ok) {
    return castResult.result;
  }

  const result = castResult.value as ToolCallResult;
  const textContent = result.getTextContent();

  if (textContent === undefined) {
    return {
      pass: false,
      message: () => `Expected tool result to have text content, but it has none`,
    };
  }

  const matches = pattern.test(textContent);

  return {
    pass: matches,
    message: () =>
      matches
        ? `Expected tool result not to match pattern ${utils.printExpected(pattern)}, but it does`
        : `Expected tool result to match pattern ${utils.printExpected(pattern)}, but got ${utils.printReceived(textContent)}`,
  };
}
