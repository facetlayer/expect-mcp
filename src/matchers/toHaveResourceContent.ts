import { ReadResourceResult } from '../ReadResourceResult.js';
import { MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

export async function toHaveResourceContent(
  this: any,
  received: unknown,
  uri: string
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  if (!(received instanceof ReadResourceResult)) {
    return {
      pass: false,
      message: () =>
        `Expected ${utils.printReceived(received)} to be a ReadResourceResult instance`,
    };
  }

  const resource = received.findByUri(uri);
  const hasResource = resource !== undefined;

  return {
    pass: hasResource,
    message: () =>
      hasResource
        ? `Expected resource result not to have content for URI ${utils.printExpected(uri)}, but it does`
        : `Expected resource result to have content for URI ${utils.printExpected(uri)}, but it doesn't`,
  };
}
