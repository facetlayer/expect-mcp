# mcpShell

Creates and spawns an MCP subprocess that communicates over stdin/stdout using JSON-RPC 2.0.

## Syntax

```ts
mcpShell(shellCommand: string, processOptions?: MCPStdinSubprocessOptions): MCPStdinSubprocess
```

## Parameters

- `shellCommand`: The shell command to execute (can include arguments)
- `processOptions`: Optional configuration options:
  - `requestTimeout`: Timeout in milliseconds for MCP requests (default: 5000)
  - `allowDebugLogging`: Allow console logging from the MCP process.

The `processOptions` can also include any of the options from [`child_process.spawn`](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options), including:

 - `cwd`: Current working directory of the child process.
 - `env`: Environment key-value pairs. Default: process.env.

## Returns

An `MCPStdinSubprocess` instance with MCP-specific functionality.

### Shell parsing

When creating the subprocess, this command calls [`child_process.spawn`](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options),
and automatically enables `{ shell: true }` in the options. This way, the command is passed as a single string instead of `args: string[]`.

### allowDebugLogging

By default, the expect-mcp will report an error any time the subprocess prints anything to stdout
which isn't a valid JSON-RPC message (such as debug logging).

Since console logging is often used during development, the `allowDebugLogging` option can be turned on
so that this doesn't cause an error. If enabled, any console logs will be printed in the test run output,
and they won't trigger a test failure.

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('server provides expected tools', async () => {
  const app = mcpShell('node path/to/mcp-server.js');
  await app.initialize();

  await expect(app).toHaveTool('read_file');
  await expect(app).toHaveResource('project_files');

  await app.close();
});
```

## With Options

```ts
const app = mcpShell('node slow-server.js', {
  requestTimeout: 30000,
  allowDebugLogging: true,
});

await app.initialize();
```

## MCPStdinSubprocess Methods

The returned `MCPStdinSubprocess` instance provides these methods:

### initialize(params?)

Perform MCP handshake and capability negotiation.

You can call this in your test explicitly, or you can let expect-mcp call it automatically.
All of the usage calls (such as `.getTools`) will automatically call initialize() if needed.

`initialize()` can only be called once per process (per the MCP spec).

```ts
const result = await app.initialize();
console.log('Server info:', result.serverInfo);
```

### getTools()

Get list of available tools from the server.

```ts
const tools = await app.getTools();
console.log('Available tools:', tools.map(t => t.name));
```

### getResources()

Get list of available resources from the server.

```ts
const resources = await app.getResources();
console.log('Available resources:', resources.map(r => r.name));
```

### hasTool(name)

Check if a specific tool is available.

```ts
const hasReadFile = await app.hasTool('read_file');
```

### hasResource(name)

Check if a specific resource is available.

```ts
const hasConfig = await app.hasResource('config.json');
```

### callTool(name, arguments?)

Call a tool on the MCP server.

```ts
const result = await app.callTool('read_file', {
  path: '/path/to/file.txt',
});
```

### close()

Close the stdin pipe and wait for the process to cleanly exit. Throws an error on timeout or if the
process has a non-zero exit code.

```ts
await app.close();
```

## See Also

- [callTool](callTool) - Call an MCP tool
- [toHaveTool](toHaveTool) - Assert that a tool exists
- [toHaveResource](toHaveResource) - Assert that a resource exists
