# callTool

Calls a tool on the MCP server.

Will throw an error if:
 - The server did not declare 'tools' in the capabilities section.
 - The server did not name this tool in the tools list.
 - The tool call fails.

## Syntax

```ts
app.callTool(name: string, arguments?: any): Promise<any>
```

## Parameters

- `name`: The name of the tool to call
- `arguments`: Optional arguments to pass to the tool

## Returns

A Promise that resolves to the tool's response.

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('call a tool on the server', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  // Call the read_file tool
  const result = await app.callTool('read_file', {
    path: '/path/to/file.txt',
  });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();

  await app.close();
});
```

## Timeout Configuration

You can configure the timeout for tool calls using the `requestTimeout` option:

```ts
const app = mcpShell('node slow-server.js', {
  requestTimeout: 30000, // 30 seconds
});

const result = await app.callTool('slow_operation', {});
```

## See Also

- [mcpShell](mcpShell) - Create an MCP subprocess
- [toHaveTool](toHaveTool) - Assert that a tool exists
