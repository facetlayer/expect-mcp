import { MCPMatchers } from './types.js';

export { mcpShell } from './mcpShellCommand.js';
export { MCPStdinSubprocess } from './MCPStdinSubprocess.js';

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
  MCPBlobResourceContents,
  MCPCapabilities,
  MCPInitializeParams,
  MCPInitializeResult,
  MCPReadResourceResult,
  MCPResource,
  MCPResourceContents,
  MCPResourcesListResult,
  MCPTextResourceContents,
  MCPTool,
  MCPToolsListResult,
} from './types/MCP.js';
