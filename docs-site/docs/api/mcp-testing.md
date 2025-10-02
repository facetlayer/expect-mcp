# MCP Server Testing

The expect-mcp library provides utilities for testing MCP servers that communicate over stdin/stdout using JSON-RPC 2.0.

## shellCommand(command: string, args?: string[])

Creates and spawns an MCP subprocess that communicates over stdin/stdout using JSON-RPC 2.0.

```ts
import { shellCommand } from 'expect-mcp';

const app = shellCommand('node', ['path/to/mcp-server.js']);
await app.initialize();

// Test that the server provides expected tools and resources
await expect(app).toHaveTool('read_file');
await expect(app).toHaveResource('project_files');

// Clean up
app.kill();
```

### Parameters

- `command`: The shell command to execute
- `args`: Optional array of command arguments

### Returns

An `MCPStdinSubprocess` instance with MCP-specific functionality.

## MCPStdinSubprocess

The `shellCommand` function returns an `MCPStdinSubprocess` instance which extends the JSON-RPC subprocess with MCP-specific functionality.

### Constructor Options

```ts
interface MCPStdinSubprocessOptions {
  strictMode?: boolean;
  // ... other JsonRpcSubprocessOptions
}

const app = new MCPStdinSubprocess({
  strictMode: true,
  command: 'node',
  args: ['path/to/mcp-server.js'],
});
```

### Methods

#### initialize(params?: Partial\<MCPInitializeParams\>): Promise\<MCPInitializeResult\>

Perform MCP handshake and capability negotiation.

```ts
const result = await app.initialize();
console.log('Server info:', result.serverInfo);
```

#### getTools(): Promise\<MCPTool[]\>

Get list of available tools from the server.

```ts
const tools = await app.getTools();
console.log(
  'Available tools:',
  tools.map(t => t.name)
);
```

#### getResources(): Promise\<MCPResource[]\>

Get list of available resources from the server.

```ts
const resources = await app.getResources();
console.log(
  'Available resources:',
  resources.map(r => r.name)
);
```

#### hasTool(name: string): Promise\<boolean\>

Check if a specific tool is available.

```ts
const hasReadFile = await app.hasTool('read_file');
```

#### hasResource(name: string): Promise\<boolean\>

Check if a specific resource is available.

```ts
const hasConfig = await app.hasResource('config.json');
```

#### callTool(name: string, arguments?: any): Promise\<any\>

Call a tool on the MCP server.

```ts
const result = await app.callTool('read_file', {
  path: '/path/to/file.txt',
});
```

#### isInitialized(): boolean

Check if the MCP server has been initialized.

```ts
if (!app.isInitialized()) {
  await app.initialize();
}
```

#### isStrictModeEnabled(): boolean

Check if strict mode validation is enabled.

```ts
console.log('Strict mode:', app.isStrictModeEnabled());
```

### Example Test

```ts
import { shellCommand } from 'expect-mcp';
import { describe, test, expect } from 'vitest';

describe('File Server MCP', () => {
  test('provides file operations', async () => {
    const app = shellCommand('node', ['file-server.js']);

    try {
      await app.initialize();

      // Test capabilities
      await expect(app).toHaveTool('read_file');
      await expect(app).toHaveTool('write_file');
      await expect(app).toHaveResource('project_files');

      // Test tool execution
      const result = await app.callTool('read_file', {
        path: 'package.json',
      });

      expect(result).toBeValidMCPResponse();
      expect(result.result.content).toBeDefined();
    } finally {
      app.kill();
    }
  });
});
```

## Types

### MCPTool

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

```ts
interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}
```

### MCPInitializeResult

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
