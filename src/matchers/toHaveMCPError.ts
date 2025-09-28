import { isMCPResponse } from '../mcpUtils.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

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