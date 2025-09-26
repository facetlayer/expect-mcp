import { expect } from 'vitest';
import { MCPStdinSubprocess } from './MCPStdinSubprocess.js';

import type {
  MCPContentMessage,
  MCPError,
  MCPMatcherImplementations,
  MCPMatcherResult,
  MCPMatchers,
  MCPResponse,
  MCPResult,
} from './types.js';

const fallbackPrinter = {
  printReceived: (value: unknown) => safeToString(value),
  printExpected: (value: unknown) => safeToString(value),
};

type MatcherUtils = typeof fallbackPrinter;

type MatcherContext = {
  utils?: MatcherUtils;
};

function resolveUtils(ctx: unknown): MatcherUtils {
  const utils = (ctx as MatcherContext | undefined)?.utils;
  if (!utils) {
    return fallbackPrinter;
  }

  const hasPrinter =
    typeof utils.printReceived === 'function' && typeof utils.printExpected === 'function';

  return hasPrinter ? utils : fallbackPrinter;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeToString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function isMCPError(value: unknown): value is MCPError {
  return (
    isPlainObject(value) &&
    typeof value.code === 'number' &&
    typeof value.message === 'string'
  );
}

function isMCPContentMessage(value: unknown): value is MCPContentMessage {
  return (
    isPlainObject(value) &&
    typeof value.role === 'string' &&
    typeof value.type === 'string' &&
    'content' in value
  );
}

function isMCPResult(value: unknown): value is MCPResult {
  if (!isPlainObject(value)) {
    return false;
  }

  if ('content' in value && value.content !== undefined) {
    if (!Array.isArray(value.content)) {
      return false;
    }

    return value.content.every(isMCPContentMessage);
  }

  return true;
}

export function isMCPResponse(value: unknown): value is MCPResponse {
  if (!isPlainObject(value)) {
    return false;
  }

  if (value.jsonrpc !== '2.0') {
    return false;
  }

  const { id, result, error } = value;

  const hasValidId = typeof id === 'string' || typeof id === 'number' || id === null;

  const hasResult = result !== undefined;
  const hasError = error !== undefined;

  if (!hasResult && !hasError) {
    return false;
  }

  const resultIsValid = !hasResult || isMCPResult(result);
  const errorIsValid = !hasError || isMCPError(error);

  return hasValidId && resultIsValid && errorIsValid;
}

const toBeValidMCPResponse: MCPMatcherImplementations['toBeValidMCPResponse'] = function (
  this,
  received,
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

const toHaveMCPError: MCPMatcherImplementations['toHaveMCPError'] = function (
  this,
  received,
  expectedCode,
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

const toHaveTool: MCPMatcherImplementations['toHaveTool'] = async function (
  this,
  received,
  toolName,
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

const toHaveResource: MCPMatcherImplementations['toHaveResource'] = async function (
  this,
  received,
  resourceName,
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

const mcpMatchers: MCPMatcherImplementations = {
  toBeValidMCPResponse,
  toHaveMCPError,
  toHaveTool,
  toHaveResource,
};

export function extendExpectWithMCP(customMatchers: Partial<MCPMatcherImplementations> = {}): typeof expect {
  expect.extend({ ...mcpMatchers, ...customMatchers });
  return expect;
}

export function shellCommand(command: string, args: string[] = []): MCPStdinSubprocess {
  const subprocess = new MCPStdinSubprocess();
  subprocess.spawn(command, args);
  return subprocess;
}

export { MCPStdinSubprocess };

export type {
  MCPContentMessage,
  MCPError,
  MCPMatcherImplementations,
  MCPMatcherResult,
  MCPMatchers,
  MCPResponse,
  MCPResult,
} from './types.js';

export type {
  MCPCapabilities,
  MCPInitializeParams,
  MCPInitializeResult,
  MCPTool,
  MCPResource,
  MCPToolsListResult,
  MCPResourcesListResult,
} from './MCPStdinSubprocess.js';
