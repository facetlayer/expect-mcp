import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { checkCastMCPStdinSubprocess, resolveUtils } from '../utils.js';

export const toHaveTools: MCPMatcherImplementations['toHaveTools'] = async function (
  this,
  received,
  toolNames
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  const check = checkCastMCPStdinSubprocess<MCPStdinSubprocess>(received, utils);
  if (!check.ok) {
    return check.result;
  }

  const subprocess = check.subprocess;

  try {
    const tools = await subprocess.getTools();
    const actualToolNames = new Set(tools.map(tool => tool.name));
    const missingTools = toolNames.filter(name => !actualToolNames.has(name));

    const pass = missingTools.length === 0;

    return {
      pass,
      message: () =>
        pass
          ? `Expected MCP server not to have tools ${utils.printExpected(toolNames)}, but it does`
          : `Expected MCP server to have tools ${utils.printExpected(toolNames)}, but missing: ${utils.printReceived(missingTools)}`,
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for tools ${utils.printExpected(toolNames)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
