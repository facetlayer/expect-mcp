# Type Definitions

The expect-mcp library includes comprehensive TypeScript definitions for MCP types and matcher contracts.

## Response Types

### MCPResponse

JSON-RPC response returned by an MCP tool invocation.

```ts
interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: MCPResult;
  error?: MCPError;
}
```

### MCPResult

Successful MCP tool response payload.

```ts
interface MCPResult {
  content?: MCPContentMessage[];
  data?: unknown;
  [key: string]: unknown;
}
```

### MCPError

Shape of an MCP error, following the JSON-RPC structure used by MCP servers.

```ts
interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}
```

### MCPContentMessage

Individual response message chunk returned by an MCP tool.

```ts
interface MCPContentMessage {
  role: string;
  type: string;
  content: unknown;
}
```

## Server Types

### MCPCapabilities

Defines the capabilities that an MCP server or client supports.

```ts
interface MCPCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: {
    level?: string;
  };
}
```

### MCPInitializeParams

Parameters sent during MCP initialization.

```ts
interface MCPInitializeParams {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  clientInfo: {
    name: string;
    version: string;
  };
}
```

### MCPInitializeResult

Result returned from MCP initialization.

```ts
interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
  instructions?: string;
}
```

### MCPTool

Represents a tool provided by an MCP server.

```ts
interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record\<string, any\>;
    required?: string[];
  };
}
```

### MCPResource

Represents a resource provided by an MCP server.

```ts
interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}
```

### MCPToolsListResult

Result from listing tools on an MCP server.

```ts
interface MCPToolsListResult {
  tools: MCPTool[];
}
```

### MCPResourcesListResult

Result from listing resources on an MCP server.

```ts
interface MCPResourcesListResult {
  resources: MCPResource[];
}
```

## Matcher Types

### MCPMatchers

Interface defining the matchers available on Vitest assertions.

```ts
interface MCPMatchers {
  toBeValidMCPResponse(): void;
  toHaveMCPError(expectedCode?: number): void;
  toHaveTool(toolName: string): Promise<void>;
  toHaveResource(resourceName: string): Promise<void>;
}
```

### MCPMatcherResult

Structure of a single matcher result returned to Vitest.

```ts
interface MCPMatcherResult {
  pass: boolean;
  message(): string;
}
```

### MCPMatcherImplementations

Runtime implementations that are provided to Vitest via expect.extend.

```ts
interface MCPMatcherImplementations {
  toBeValidMCPResponse(this: unknown, received: unknown): MCPMatcherResult;
  toHaveMCPError(this: unknown, received: unknown, expectedCode?: number): MCPMatcherResult;
  toHaveTool(this: unknown, received: unknown, toolName: string): Promise<MCPMatcherResult>;
  toHaveResource(this: unknown, received: unknown, resourceName: string): Promise<MCPMatcherResult>;
}
```

## Configuration Types

### MCPStdinSubprocessOptions

Configuration options for creating an MCP subprocess.

```ts
interface MCPStdinSubprocessOptions extends JsonRpcSubprocessOptions \{
  requestTimeout?: number;
  allowDebugLogging?: boolean;
}
```

## Usage Examples

### Type-Safe Testing

```ts
import { MCPResponse, MCPTool, MCPResource } from 'expect-mcp';

// Type-safe response validation
const response: MCPResponse = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    content: [
      {
        role: 'assistant',
        type: 'text',
        content: 'Hello',
      },
    ],
  },
};

expect(response).toBeValidMCPResponse();

// Type-safe server testing
const tools: MCPTool[] = await app.getTools();
const resources: MCPResource[] = await app.getResources();
```

### Module Declaration

When using TypeScript, the library extends the Vitest assertion interface:

```ts
declare module 'vitest' {
  interface Assertion\<T = any\> extends MCPMatchers \{\}
  interface AsymmetricMatchersContaining extends MCPMatchers \{\}
}
```

This allows TypeScript to recognize the custom matchers on `expect()` calls.

### Import Patterns

```ts
// Import specific types
import type { MCPResponse, MCPTool, MCPResource } from 'expect-mcp';

// Import all types
import type * as MCP from 'expect-mcp';

// Import utilities with types
import { shellCommand, type MCPStdinSubprocess } from 'expect-mcp';
```
