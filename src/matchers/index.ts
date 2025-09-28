import { MCPMatcherImplementations } from '../types.js';
import { toBeValidMCPResponse } from './toBeValidMCPResponse.js';
import { toHaveMCPError } from './toHaveMCPError.js';
import { toHaveTool } from './toHaveTool.js';
import { toHaveResource } from './toHaveResource.js';

export { toBeValidMCPResponse } from './toBeValidMCPResponse.js';
export { toHaveMCPError } from './toHaveMCPError.js';
export { toHaveTool } from './toHaveTool.js';
export { toHaveResource } from './toHaveResource.js';

export const mcpMatchers: MCPMatcherImplementations = {
  toBeValidMCPResponse,
  toHaveMCPError,
  toHaveTool,
  toHaveResource,
};