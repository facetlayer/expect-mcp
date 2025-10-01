import { MCPMatcherImplementations } from '../types.js';
import { toHaveTool } from './toHaveTool.js';
import { toHaveTools } from './toHaveTools.js';
import { toHaveResource } from './toHaveResource.js';
import { toHaveResources } from './toHaveResources.js';

export const mcpMatchers: MCPMatcherImplementations = {
  toHaveTool,
  toHaveTools,
  toHaveResource,
  toHaveResources,
};