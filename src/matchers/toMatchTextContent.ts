import { ToolCallResult } from '../results/ToolCallResult.js';
import { MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

export async function toMatchTextContent(
  this: any,
  received: unknown,
  pattern: RegExp
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  if (!(received instanceof ToolCallResult)) {
    return {
      pass: false,
      message: () =>
        `Expected ${utils.printReceived(received)} to be a ToolCallResult instance`,
    };
  }

  const textContent = received.getTextContent();

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
