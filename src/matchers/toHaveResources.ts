import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { checkCastMCPStdinSubprocess, MatcherContext, resolveUtils } from '../utils.js';

export const toHaveResources: MCPMatcherImplementations['toHaveResources'] = async function (
  this,
  received,
  resourceNames
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);
  const isNot = (this as MatcherContext).isNot || false;

  const check = checkCastMCPStdinSubprocess<MCPStdinSubprocess>(received, utils);
  if (!check.ok) {
    return check.result;
  }

  const subprocess = check.subprocess;

  try {
    const resources = await subprocess.getResources();
    const actualResourceNames = new Set(resources.map(resource => resource.name));
    const missingResources = resourceNames.filter(name => !actualResourceNames.has(name));
    const existingResources = resourceNames.filter(name => actualResourceNames.has(name));

    // Check if ALL of the resources exist
    // Vitest will automatically invert this for .not. usage
    const pass = missingResources.length === 0;

    return {
      pass,
      message: () => {
        if (isNot) {
          // When used with .not., we're checking that none of the resources should exist
          return existingResources.length > 0
            ? `Expected MCP server not to have ${utils.printExpected(resourceNames)}, but found: ${utils.printReceived(existingResources)}`
            : `Expected MCP server to have some of ${utils.printExpected(resourceNames)}, but it has none`;
        } else {
          return missingResources.length === 0
            ? `Expected MCP server not to have resources ${utils.printExpected(resourceNames)}, but it does`
            : `Expected MCP server to have resources ${utils.printExpected(resourceNames)}, but missing: ${utils.printReceived(missingResources)}`;
        }
      },
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for resources ${utils.printExpected(resourceNames)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
