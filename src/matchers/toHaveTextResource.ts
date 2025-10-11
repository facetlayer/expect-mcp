import { ReadResourceResult } from '../results/ReadResourceResult.js';
import { MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

export async function toHaveTextResource(
  this: any,
  received: unknown,
  expectedText: string
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  if (!(received instanceof ReadResourceResult)) {
    return {
      pass: false,
      message: () =>
        `Expected ${utils.printReceived(received)} to be a ReadResourceResult instance`,
    };
  }

  const textContent = received.getTextContent();

  if (textContent === undefined) {
    return {
      pass: false,
      message: () => `Expected resource result to have text content, but it has none`,
    };
  }

  const matches = textContent === expectedText;

  return {
    pass: matches,
    message: () =>
      matches
        ? `Expected resource result not to have text content ${utils.printExpected(expectedText)}, but it does`
        : `Expected resource result to have text content ${utils.printExpected(expectedText)}, but got ${utils.printReceived(textContent)}`,
  };
}
