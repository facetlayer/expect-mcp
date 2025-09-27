import { MCPMatchers } from './types.js';

export { MCPStdinSubprocess } from './MCPStdinSubprocess.js';
export { isMCPResponse } from './mcpUtils.js';
export { shellCommand } from './shellCommand.js';

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
  MCPResource,
  MCPResourcesListResult,
  MCPTool,
  MCPToolsListResult,
} from './MCPStdinSubprocess.js';
