# toHaveTextResource()

Checks that a resource result contains text content matching the expected string exactly.

This matcher works with `ReadResourceResult` instances returned by `app.readResource()`.

## Usage

```ts
const result = await app.readResource('file:///app/test.txt');
await expect(result).toHaveTextResource('Hello world');
```

## Parameters

- `expectedText` (string): The exact text content to match

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('validate resource text content', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  const result = await app.readResource('file:///app/config.json');

  // Check exact text match
  await expect(result).toHaveTextResource('{"key": "value"}');

  await app.close();
});
```

## See Also

- [toHaveResourceContent](toHaveResourceContent) - Check resource has content for a URI
- [ReadResourceResult](ReadResourceResult) - The result class for resource reads
- [readResource](readResource) - Read a resource from an MCP server
- [Matchers](matchers) - Overview of all matchers
