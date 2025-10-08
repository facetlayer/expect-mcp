# toHaveTextContent()

Checks that a tool call result contains text content matching the expected string exactly.

This matcher works with `ToolCallResult` instances returned by `app.callTool()`.

## Usage

```ts
const result = await app.callTool('read_file', {
  path: '/tmp/test.txt'
});
await expect(result).toHaveTextContent('Hello world');
```

## Parameters

- `expectedText` (string): The exact text content to match

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('validate exact text content', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  const result = await app.callTool('read_file', {
    path: '/tmp/test.txt'
  });

  // Check exact text match
  await expect(result).toHaveTextContent('Hello world');

  await app.close();
});
```

## See Also

- [toMatchTextContent](toMatchTextContent) - Match text content with a regex pattern
- [ToolCallResult](ToolCallResult) - The result class for tool calls
- [callTool](callTool) - Call a tool on an MCP server
- [Matchers](matchers) - Overview of all matchers
