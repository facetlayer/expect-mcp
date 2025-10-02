# toHaveTool

Checks that an MCP server provides a tool with the specified name. This matcher works with `MCPStdinSubprocess` instances.

## Syntax

```ts
await expect(app).toHaveTool(toolName);
```

## Parameters

- `toolName`: The name of the tool to check for

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('server provides file operations', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  await expect(app).toHaveTool('read_file');
  await expect(app).toHaveTool('write_file');

  app.close();
});
```

## Error Messages

If the tool doesn't exist:

```ts
await expect(app).toHaveTool('nonexistent_tool');
// Error: Expected server to have tool "nonexistent_tool", but it was not found.
// Available tools: read_file, write_file, delete_file
```

## See Also

- [toHaveResource](toHaveResource) - Check for resources
- [mcpShell](mcpShell) - Create an MCP subprocess
- [callTool](callTool) - Call an MCP tool
