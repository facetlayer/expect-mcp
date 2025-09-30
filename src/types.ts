/**
 * Shape of an MCP error, following the JSON-RPC structure used by MCP servers.
 */
export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

/** Individual response message chunk returned by an MCP tool. */
export interface MCPContentMessage {
  role: string;
  type: string;
  content: unknown;
}

/** Successful MCP tool response payload. */
export interface MCPResult {
  content?: MCPContentMessage[];
  data?: unknown;
  [key: string]: unknown;
}

/** JSON-RPC response returned by an MCP tool invocation. */
export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: MCPResult;
  error?: MCPError;
}

/** Structure of a single matcher result returned to Vitest. */
export interface MCPMatcherResult {
  pass: boolean;
  message(): string;
}

/** Runtime implementations that are provided to Vitest via expect.extend. */
export interface MCPMatcherImplementations {
  toHaveTool(this: unknown, received: unknown, toolName: string): Promise<MCPMatcherResult>;
  toHaveResource(this: unknown, received: unknown, resourceName: string): Promise<MCPMatcherResult>;
}

/** Matchers surfaced on the Assertion API once installed. */
export interface MCPMatchers {
  toHaveTool(toolName: string): Promise<void>;
  toHaveResource(resourceName: string): Promise<void>;
}
