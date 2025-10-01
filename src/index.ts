import { MCPMatchers } from './types.js';

export { MCPStdinSubprocess } from './MCPStdinSubprocess.js';
export { mcpShell } from './mcpShellCommand.js';

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
} from './types/MCP.js';
