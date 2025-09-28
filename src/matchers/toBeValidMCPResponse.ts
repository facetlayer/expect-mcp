import { isMCPResponse } from '../mcpUtils.js';
import { MCPMatcherImplementations, MCPMatcherResult } from '../types.js';
import { resolveUtils } from '../utils.js';

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