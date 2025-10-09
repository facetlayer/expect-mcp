import { MCPMatcherImplementations } from '../types.js';
import { toBeSuccessful } from './toBeSuccessful.js';
import { toHaveResource } from './toHaveResource.js';
import { toHaveResourceContent } from './toHaveResourceContent.js';
import { toHaveResources } from './toHaveResources.js';
import { toHavePrompts } from './toHavePrompts.js';
import { toHaveTextContent } from './toHaveTextContent.js';
import { toHaveTextResource } from './toHaveTextResource.js';
import { toHaveTool } from './toHaveTool.js';
import { toHaveTools } from './toHaveTools.js';
import { toMatchTextContent } from './toMatchTextContent.js';

export const mcpMatchers: MCPMatcherImplementations = {
  toHaveTool,
  toHaveTools,
  toHaveResource,
  toHaveResources,
  toHavePrompts,
  toBeSuccessful,
  toHaveTextContent,
  toMatchTextContent,
  toHaveResourceContent,
  toHaveTextResource,
};
