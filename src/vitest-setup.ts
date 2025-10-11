import { expect } from 'vitest';
import { mcpMatchers } from './matchers/index.js';
import { MCPMatchers } from './types.js';

declare module 'vitest' {
  interface Assertion<T = any> extends MCPMatchers {}
  interface AsymmetricMatchersContaining extends MCPMatchers {}
}

expect.extend({ ...mcpMatchers });
