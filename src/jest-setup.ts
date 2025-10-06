import { mcpMatchers } from './matchers/index.js';
import type { MCPMatchers } from './types.js';

declare global {
  namespace jest {
    interface Matchers<R> extends MCPMatchers {}
  }
}

// Use global expect from Jest
(global as any).expect.extend({ ...mcpMatchers });
