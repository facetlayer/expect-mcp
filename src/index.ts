import { MCPMatchers } from './types.js';

export { mcpShell } from './mcpShellCommand.js';
export { MCPStdinSubprocess } from './MCPStdinSubprocess.js';
export { ToolCallResult } from './ToolCallResult.js';
export { ReadResourceResult } from './ReadResourceResult.js';

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

export type {
  AudioContent,
  CallToolRequest,
  CallToolResult,
  ContentBlock,
  EmbeddedResourceContent,
  ImageContent,
  ResourceLinkContent,
  TextContent,
  Tool,
  ToolAnnotations,
  ToolCallResult as ToolCallResultType,
} from './schemas/tools.js';

export type {
  Annotations,
  BlobResourceContents,
  ReadResourceResult as ReadResourceResultType,
  Resource,
  ResourceContents,
  TextResourceContents,
} from './schemas/resources.js';
