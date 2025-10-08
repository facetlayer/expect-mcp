# toMatchTextContent()

Checks that a tool call result contains text content matching the given regular expression pattern.

This matcher works with `ToolCallResult` instances returned by `app.callTool()`.

## Usage

```ts
const result = await app.callTool('get_status', {});
await expect(result).toMatchTextContent(/Status: \w+/);
```

## Parameters

- `pattern` (RegExp): A regular expression to match against the text content

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('validate text content with regex', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  const result = await app.callTool('read_file', {
    path: '/tmp/log.txt'
  });

  // Check pattern match
  await expect(result).toMatchTextContent(/Log entry \d+/);
  await expect(result).toMatchTextContent(/\d{4}-\d{2}-\d{2}/); // Match date format

  await app.close();
});
```

## See Also

- [toHaveTextContent](toHaveTextContent) - Match text content exactly
- [ToolCallResult](ToolCallResult) - The result class for tool calls
- [callTool](callTool) - Call a tool on an MCP server
- [Matchers](matchers) - Overview of all matchers
