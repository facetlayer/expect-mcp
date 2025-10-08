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

    if (hasTool) {
      return {
        pass: true,
        message: () =>
          `Expected MCP server not to have tool ${utils.printExpected(toolName)}, but it does`,
      };
    }

    // When the tool is not found, get the list of available tools for better error message
    const tools = await subprocess.getTools();
    const availableToolNames = tools.map(tool => tool.name).sort();

    const availableToolsMessage = availableToolNames.length > 0
      ? `\n\nAvailable tools: ${availableToolNames.map(name => utils.printReceived(name)).join(', ')}`
      : '\n\nNo tools are available from this server';

    return {
      pass: false,
      message: () =>
        `Expected MCP server to have tool ${utils.printExpected(toolName)}, but it doesn't${availableToolsMessage}`,
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for tool ${utils.printExpected(toolName)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
