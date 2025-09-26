
import { expect } from 'vitest';
import { mcpMatchers } from './mcpMatchers.js';
import { MCPMatcherImplementations, MCPMatchers } from './types.js';



export function extendExpectWithMCP(customMatchers: Partial<MCPMatcherImplementations> = {}): typeof expect {
    expect.extend({ ...mcpMatchers, ...customMatchers });
    return expect;
  }

extendExpectWithMCP();