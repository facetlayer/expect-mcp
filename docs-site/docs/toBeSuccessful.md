# toBeSuccessful()

Checks that a tool call result is successful (does not have `isError` set to `true`).

This matcher works with `ToolCallResult` instances returned by `app.callTool()`.

## Usage

```ts
const result = await app.callTool('write_file', {
  path: '/tmp/test.txt',
  content: 'Hello'
});
await expect(result).toBeSuccessful();
```

## Parameters

None

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('validate tool call success', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  const result = await app.callTool('write_file', {
    path: '/tmp/test.txt',
    content: 'Hello world'
  });

  // Check that the tool call succeeded
  await expect(result).toBeSuccessful();

  await app.close();
});
```

## See Also

- [ToolCallResult](ToolCallResult) - The result class for tool calls
- [callTool](callTool) - Call a tool on an MCP server
- [Matchers](matchers) - Overview of all matchers
