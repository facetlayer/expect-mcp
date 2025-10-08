# toHaveResourceContent()

Checks that a resource result contains content for a specific URI.

This matcher works with `ReadResourceResult` instances returned by `app.readResource()`.

## Usage

```ts
const result = await app.readResource('file:///app/config.json');
await expect(result).toHaveResourceContent('file:///app/config.json');
```

## Parameters

- `uri` (string): The URI to check for in the resource contents

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('validate resource has content for URI', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  const result = await app.readResource('file:///app/config.json');

  // Check that the resource has content for the URI
  await expect(result).toHaveResourceContent('file:///app/config.json');

  await app.close();
});
```

## See Also

- [toHaveTextResource](toHaveTextResource) - Check resource text content exactly
- [ReadResourceResult](ReadResourceResult) - The result class for resource reads
- [readResource](readResource) - Read a resource from an MCP server
- [Matchers](matchers) - Overview of all matchers
