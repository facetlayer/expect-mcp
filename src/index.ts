import { MCPMatchers } from './types.js';

export { shellCommand } from './shellCommand.js';
export { MCPStdinSubprocess } from './MCPStdinSubprocess.js';
export { isMCPResponse } from './mcpUtils.js';

declare module 'vitest' {
  interface Assertion<T = any> extends MCPMatchers {}
  interface AsymmetricMatchersContaining extends MCPMatchers {}
}

export type {
  MCPContentMessage,
  MCPError,
  MCPMatcherImplementations,
  MCPMatcherResult,
  MCPMatchers,
  MCPResponse,
  MCPResult,
} from './types.js';

export type {
  MCPCapabilities,
  MCPInitializeParams,
  MCPInitializeResult,
  MCPTool,
  MCPResource,
  MCPToolsListResult,
  MCPResourcesListResult,
} from './MCPStdinSubprocess.js';
