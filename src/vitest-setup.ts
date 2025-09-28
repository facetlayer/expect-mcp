import { expect } from 'vitest';
import { mcpMatchers } from './matchers/index.js';
import { MCPMatcherImplementations, MCPMatchers } from './types.js';

declare module 'vitest' {
  interface Assertion extends MCPMatchers {}
  interface AsymmetricMatchersContaining extends MCPMatchers {}
}

export function extendExpectWithMCP(
  customMatchers: Partial<MCPMatcherImplementations> = {}
): typeof expect {
  expect.extend({ ...mcpMatchers, ...customMatchers });
  return expect;
}

extendExpectWithMCP();
