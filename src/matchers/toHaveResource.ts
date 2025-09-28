import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

export const toHaveResource: MCPMatcherImplementations['toHaveResource'] = async function (
  this,
  received,
  resourceName
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  if (!(received instanceof MCPStdinSubprocess)) {
    return {
      pass: false,
      message: () =>
        `Expected an MCPStdinSubprocess instance, but received ${utils.printReceived(received)}`,
    };
  }

  try {
    const hasResource = await received.hasResource(resourceName);

    return {
      pass: hasResource,
      message: () =>
        hasResource
          ? `Expected MCP server not to have resource ${utils.printExpected(resourceName)}, but it does`
          : `Expected MCP server to have resource ${utils.printExpected(resourceName)}, but it doesn't`,
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for resource ${utils.printExpected(resourceName)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};