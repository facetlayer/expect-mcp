# Type Definitions

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

## Configuration Types

### MCPStdinSubprocessOptions

Configuration options for creating an MCP subprocess.

```ts
interface MCPStdinSubprocessOptions extends JsonRpcSubprocessOptions \{
  requestTimeout?: number;
  allowDebugLogging?: boolean;
}
```
