import { MCPStdinSubprocess } from './MCPStdinSubprocess.js';
import { isMCPResponse } from './mcpUtils.js';
import { MCPMatcherImplementations, MCPMatcherResult } from './types.js';
import { resolveUtils } from './utils.js';

export const toBeValidMCPResponse: MCPMatcherImplementations['toBeValidMCPResponse'] = function (
  this,
  received
): MCPMatcherResult {
  const utils = resolveUtils(this);
  const pass = isMCPResponse(received);

  return {
    pass,
    message: () =>
      pass
        ? `Expected received value to not be a valid MCP response, but got ${utils.printReceived(received)}`
        : `Expected received value to be a valid MCP response, but got ${utils.printReceived(received)}`,
  };
};

export const toHaveMCPError: MCPMatcherImplementations['toHaveMCPError'] = function (
  this,
  received,
  expectedCode
): MCPMatcherResult {
  const utils = resolveUtils(this);

  if (!isMCPResponse(received)) {
    return {
      pass: false,
      message: () =>
        `Expected a valid MCP response before checking for errors, but received ${utils.printReceived(received)}`,
    };
  }

  const error = received.error;

  if (!error) {
    return {
      pass: false,
      message: () => 'Expected MCP response to include an error, but it was successful.',
    };
  }

  if (typeof expectedCode === 'number' && error.code !== expectedCode) {
    return {
      pass: false,
      message: () =>
        `Expected MCP error code ${utils.printExpected(expectedCode)}, but received ${utils.printReceived(error.code)}`,
    };
  }

  return {
    pass: true,
    message: () =>
      typeof expectedCode === 'number'
        ? `Expected MCP error code not to equal ${utils.printExpected(expectedCode)}, but it did.`
        : 'Expected MCP response not to contain an error, but it did.',
  };
};

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

export const mcpMatchers: MCPMatcherImplementations = {
  toBeValidMCPResponse,
  toHaveMCPError,
  toHaveTool,
  toHaveResource,
};
