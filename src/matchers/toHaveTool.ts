import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { checkCastMCPStdinSubprocess, resolveUtils } from '../utils.js';

export const toHaveTool: MCPMatcherImplementations['toHaveTool'] = async function (
  this,
  received,
  toolName
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  const check = checkCastMCPStdinSubprocess<MCPStdinSubprocess>(received, utils);
  if (!check.ok) {
    return check.result;
  }

  const subprocess = check.subprocess;

  try {
    const hasTool = await subprocess.hasTool(toolName);

    return {
      pass: hasTool,
      message: () =>
        hasTool
          ? `Expected MCP server not to have tool ${utils.printExpected(toolName)}, but it does`
          : `Expected MCP server to have tool ${utils.printExpected(toolName)}, but it doesn't`,
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for tool ${utils.printExpected(toolName)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};