
import { expect } from 'vitest';
import { mcpMatchers } from './mcpMatchers.js';
import { MCPMatcherImplementations, MCPMatchers } from './types.js';

// Ensure the module augmentation is available when this file is imported
declare module 'vitest' {
  interface Assertion extends MCPMatchers {}
  interface AsymmetricMatchersContaining extends MCPMatchers {}
}

export function extendExpectWithMCP(customMatchers: Partial<MCPMatcherImplementations> = {}): typeof expect {
    expect.extend({ ...mcpMatchers, ...customMatchers });
    return expect;
  }

extendExpectWithMCP();