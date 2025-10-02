import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { checkCastMCPStdinSubprocess, resolveUtils } from '../utils.js';

export const toHaveResource: MCPMatcherImplementations['toHaveResource'] = async function (
  this,
  received,
  resourceName
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  const check = checkCastMCPStdinSubprocess<MCPStdinSubprocess>(received, utils);
  if (!check.ok) {
    return check.result;
  }

  const subprocess = check.subprocess;

  try {
    const hasResource = await subprocess.hasResource(resourceName);

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
