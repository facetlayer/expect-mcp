import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { checkCastMCPStdinSubprocess, resolveUtils } from '../utils.js';

export const toHaveResources: MCPMatcherImplementations['toHaveResources'] = async function (
  this,
  received,
  resourceNames
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  const check = checkCastMCPStdinSubprocess<MCPStdinSubprocess>(received, utils);
  if (!check.ok) {
    return check.result;
  }

  const subprocess = check.subprocess;

  try {
    const resources = await subprocess.getResources();
    const actualResourceNames = new Set(resources.map(resource => resource.name));
    const missingResources = resourceNames.filter(name => !actualResourceNames.has(name));

    const pass = missingResources.length === 0;

    return {
      pass,
      message: () =>
        pass
          ? `Expected MCP server not to have resources ${utils.printExpected(resourceNames)}, but it does`
          : `Expected MCP server to have resources ${utils.printExpected(resourceNames)}, but missing: ${utils.printReceived(missingResources)}`,
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for resources ${utils.printExpected(resourceNames)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
