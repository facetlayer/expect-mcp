import { MCPMatcherImplementations } from '../types.js';
import { toHaveTool } from './toHaveTool.js';
import { toHaveResource } from './toHaveResource.js';

export { toHaveTool } from './toHaveTool.js';
export { toHaveResource } from './toHaveResource.js';

export const mcpMatchers: MCPMatcherImplementations = {
  toHaveTool,
  toHaveResource,
};