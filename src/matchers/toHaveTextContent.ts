import { ToolCallResult } from '../ToolCallResult.js';
import { MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

export async function toHaveTextContent(
  this: any,
  received: unknown,
  expectedText: string
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

  const matches = textContent === expectedText;

  return {
    pass: matches,
    message: () =>
      matches
        ? `Expected tool result not to have text content ${utils.printExpected(expectedText)}, but it does`
        : `Expected tool result to have text content ${utils.printExpected(expectedText)}, but got ${utils.printReceived(textContent)}`,
  };
}
