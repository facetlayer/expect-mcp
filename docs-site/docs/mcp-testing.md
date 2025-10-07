# MCP Server Testing

The expect-mcp library provides utilities for testing MCP servers that communicate over stdin/stdout using JSON-RPC 2.0.

## mcpShell(shellCommand: string, processOptions?: MCPStdinSubprocessOptions)

Creates and spawns an MCP subprocess that communicates over stdin/stdout using JSON-RPC 2.0.

```ts
import { mcpShell } from 'expect-mcp';

const app = mcpShell('node path/to/mcp-server.js');
await app.initialize();

// Test that the server provides expected tools and resources
await expect(app).toHaveTool('read_file');
await expect(app).toHaveResource('project_files');

// Clean up
await app.close();
```

### Parameters

- `shellCommand`: The shell command to execute (can include arguments)
- `processOptions`: Optional configuration options:
  - `requestTimeout`: Timeout in milliseconds for MCP requests (default: 5000)
  - `allowDebugLogging`: Enable debug logging for MCP communications (default: false)

### Returns

An `MCPStdinSubprocess` instance with MCP-specific functionality.

## MCPStdinSubprocess

The `mcpShell` function returns an `MCPStdinSubprocess` instance which extends the JSON-RPC subprocess with MCP-specific functionality.

### Constructor Options

```ts
interface MCPStdinSubprocessOptions {
  requestTimeout?: number;
  allowDebugLogging?: boolean;
  // ... other JsonRpcSubprocessOptions
}

const app = new MCPStdinSubprocess({
  requestTimeout: 10000,
  allowDebugLogging: true,
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

#### readResource(uri: string): Promise\<MCPReadResourceResult\>

Read a resource from the MCP server.

```ts
const result = await app.readResource('file:///example.txt');
console.log('Resource contents:', result.contents[0].text);
```

#### isInitialized(): boolean

Check if the MCP server has been initialized.

```ts
if (!app.isInitialized()) {
  await app.initialize();
}
```

#### getInitializeResult(): MCPInitializeResult | undefined

Get the result from the MCP initialization, including server info and capabilities.

```ts
const result = app.getInitializeResult();
if (result) {
  console.log('Server name:', result.serverInfo.name);
  console.log('Capabilities:', result.capabilities);
}
```

#### supportsTools(): Promise\<boolean\>

Check if the server supports tools based on its declared capabilities.

```ts
const canCallTools = await app.supportsTools();
if (canCallTools) {
  await app.callTool('some_tool', {});
}
```

#### supportsResources(): Promise\<boolean\>

Check if the server supports resources based on its declared capabilities.

```ts
const canReadResources = await app.supportsResources();
if (canReadResources) {
  await app.readResource('file:///example.txt');
}
```

#### waitForExit(): Promise\<number\>

Wait for the process to exit and return the exit code.

```ts
const exitCode = await app.waitForExit();
console.log('Process exited with code:', exitCode);
```

#### close(timeoutMs?: number): Promise\<void\>

Close the MCP server gracefully by closing stdin and waiting for the process to exit.

Throws an error if the process doesn't exit within the timeout (default: 5000ms) or if the process exits with a non-zero code.

```ts
// Use default 5 second timeout
await app.close();

// Use custom timeout
await app.close(10000); // 10 seconds
```


### Example Test

```ts
import { mcpShell } from 'expect-mcp';
import { describe, test, expect } from 'vitest';

describe('File Server MCP', () => {
  test('provides file operations', async () => {
    const app = mcpShell('node file-server.js');

    try {
      await app.initialize();

      // Test capabilities
      await expect(app).toHaveTool('read_file');
      await expect(app).toHaveTool('write_file');
      await expect(app).toHaveResource('project_files');

      // Test tool execution
      const toolResult = await app.callTool('read_file', {
        path: 'package.json',
      });

      expect(toolResult).toBeDefined();
      expect(toolResult.content).toBeDefined();

      // Test resource reading
      const resourceResult = await app.readResource('project://files');

      expect(resourceResult.contents).toBeDefined();
      expect(resourceResult.contents[0]).toBeDefined();
    } finally {
      await app.close();
    }
  });
});
```

### Example Test with beforeAll/afterAll

For test suites with multiple tests, you can set up the MCP server once and reuse it:

```ts
import { mcpShell, MCPStdinSubprocess } from 'expect-mcp';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

describe('File Server MCP', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    app = mcpShell('node file-server.js');
    await app.initialize();
  });

  afterAll(async () => {
    await app.close();
  });

  test('provides expected tools', async () => {
    await expect(app).toHaveTool('read_file');
    await expect(app).toHaveTool('write_file');
  });

  test('can read files', async () => {
    const result = await app.callTool('read_file', {
      path: 'package.json',
    });
    expect(result).toBeDefined();
  });

  test('provides expected resources', async () => {
    await expect(app).toHaveResource('project_files');
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

### MCPReadResourceResult

```ts
interface MCPReadResourceResult {
  contents: MCPResourceContents[];
}

interface MCPTextResourceContents {
  uri: string;
  mimeType?: string;
  text: string;
}

interface MCPBlobResourceContents {
  uri: string;
  mimeType?: string;
  blob: string;
}

type MCPResourceContents = MCPTextResourceContents | MCPBlobResourceContents;
```
