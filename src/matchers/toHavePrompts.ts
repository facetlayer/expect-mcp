import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { checkCastMCPStdinSubprocess, MatcherContext, resolveUtils } from '../utils.js';

export const toHavePrompts: MCPMatcherImplementations['toHavePrompts'] = async function (
  this,
  received,
  promptNames
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);
  const isNot = (this as MatcherContext).isNot || false;

  const check = checkCastMCPStdinSubprocess<MCPStdinSubprocess>(received, utils);
  if (!check.ok) {
    return check.result;
  }

  const subprocess = check.subprocess;

  try {
    const prompts = await subprocess.getPrompts();
    const actualPromptNames = new Set(prompts.map(prompt => prompt.name));
    const missingPrompts = promptNames.filter(name => !actualPromptNames.has(name));
    const existingPrompts = promptNames.filter(name => actualPromptNames.has(name));

    // Check if ALL of the prompts exist
    // Vitest will automatically invert this for .not. usage
    const pass = missingPrompts.length === 0;

    return {
      pass,
      message: () => {
        if (isNot) {
          // When used with .not., we're checking that none of the prompts should exist
          return existingPrompts.length > 0
            ? `Expected MCP server not to have ${utils.printExpected(promptNames)}, but found: ${utils.printReceived(existingPrompts)}`
            : `Expected MCP server to have some of ${utils.printExpected(promptNames)}, but it has none`;
        } else {
          return missingPrompts.length === 0
            ? `Expected MCP server not to have prompts ${utils.printExpected(promptNames)}, but it does`
            : `Expected MCP server to have prompts ${utils.printExpected(promptNames)}, but missing: ${utils.printReceived(missingPrompts)}`;
        }
      },
    };
  } catch (error) {
    return {
      pass: false,
      message: () =>
        `Error checking for prompts ${utils.printExpected(promptNames)}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
