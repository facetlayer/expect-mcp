import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

export const toHaveTool: MCPMatcherImplementations['toHaveTool'] = async function (
  this,
  received,
  toolName
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
    const hasTool = await received.hasTool(toolName);

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