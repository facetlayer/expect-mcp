import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { checkCastMCPStdinSubprocess, MatcherContext, resolveUtils } from '../utils.js';

export const toHaveTools: MCPMatcherImplementations['toHaveTools'] = async function (
  this,
  received,
  toolNames
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);
  const isNot = (this as MatcherContext).isNot || false;

  const check = checkCastMCPStdinSubprocess<MCPStdinSubprocess>(received, utils);
  if (!check.ok) {
    return check.result;
  }

  const subprocess = check.subprocess;

  try {
    const tools = await subprocess.getTools();
    const actualToolNames = new Set(tools.map(tool => tool.name));
    const missingTools = toolNames.filter(name => !actualToolNames.has(name));
    const existingTools = toolNames.filter(name => actualToolNames.has(name));

    // Check if ALL of the tools exist
    // Vitest will automatically invert this for .not. usage
    const pass = missingTools.length === 0;

    return {
      pass,
      message: () => {
        if (isNot) {
          // When used with .not., we're checking that none of the tools should exist
          return existingTools.length > 0
            ? `Expected MCP server not to have ${utils.printExpected(toolNames)}, but found: ${utils.printReceived(existingTools)}`
            : `Expected MCP server to have some of ${utils.printExpected(toolNames)}, but it has none`;
        } else {
          return missingTools.length === 0
            ? `Expected MCP server not to have tools ${utils.printExpected(toolNames)}, but it does`
            : `Expected MCP server to have tools ${utils.printExpected(toolNames)}, but missing: ${utils.printReceived(missingTools)}`;
        }
      },
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for tools ${utils.printExpected(toolNames)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
