# toHaveTools

Checks that an MCP server provides all of the specified tools. This matcher works with `MCPStdinSubprocess` instances.

## Syntax

```ts
await expect(app).toHaveTools(toolNames);
```

## Parameters

- `toolNames`: An array of tool names to check for

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('server provides file operations', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  await expect(app).toHaveTools(['read_file', 'write_file']);

  await app.close();
});
```

## Error Messages

If any of the tools don't exist:

```ts
await expect(app).toHaveTools(['read_file', 'nonexistent_tool']);
// Error: Expected server to have all tools ["read_file", "nonexistent_tool"], but "nonexistent_tool" was not found.
// Available tools: read_file, write_file
```

## See Also

- [toHaveTool](toHaveTool) - Check for a single tool
- [toHaveResource](toHaveResource) - Check for resources
- [mcpShell](mcpShell) - Create an MCP subprocess
- [callTool](callTool) - Call an MCP tool
