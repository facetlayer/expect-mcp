import { ToolCallResult } from '../results/ToolCallResult.js';
import { MCPMatcherResult } from '../types.js';
import { checkCastToolCallResult, resolveUtils } from '../utils.js';

export async function toBeSuccessful(
  this: any,
  received: unknown
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  // Check and cast the received value to ToolCallResult
  const castResult = checkCastToolCallResult(received, utils);

  if (!castResult.ok) {
    return castResult.result;
  }

  const result = castResult.value as ToolCallResult;
  const isSuccess = !result.isError;

  return {
    pass: isSuccess,
    message: () =>
      isSuccess
        ? `Expected tool call to have failed, but it succeeded`
        : `Expected tool call to succeed, but it failed${result.getTextContent() ? `: ${result.getTextContent()}` : ''}`,
  };
}
