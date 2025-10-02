import { MCPMatcherImplementations } from '../types.js';
import { toHaveResource } from './toHaveResource.js';
import { toHaveResources } from './toHaveResources.js';
import { toHaveTool } from './toHaveTool.js';
import { toHaveTools } from './toHaveTools.js';

export const mcpMatchers: MCPMatcherImplementations = {
  toHaveTool,
  toHaveTools,
  toHaveResource,
  toHaveResources,
};
