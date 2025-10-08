import { ToolCallResult } from '../ToolCallResult.js';
import { MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

export async function toBeSuccessful(
  this: any,
  received: unknown
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  if (!(received instanceof ToolCallResult)) {
    return {
      pass: false,
      message: () =>
        `Expected ${utils.printReceived(received)} to be a ToolCallResult instance`,
    };
  }

  const isSuccess = !received.isError;

  return {
    pass: isSuccess,
    message: () =>
      isSuccess
        ? `Expected tool call to have failed, but it succeeded`
        : `Expected tool call to succeed, but it failed${received.getTextContent() ? `: ${received.getTextContent()}` : ''}`,
  };
}
