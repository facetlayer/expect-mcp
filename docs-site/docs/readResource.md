# readResource

Reads a resource from the MCP server.

Will throw an error if:
 - The server did not declare 'resources' in the capabilities section.
 - The server did not list this resource URI in the resources list.
 - The resource read fails.

## Syntax

```ts
app.readResource(uri: string): Promise<ReadResourceResult>
```

## Parameters

- `uri`: The URI of the resource to read

## Returns

A Promise that resolves to a [`ReadResourceResult`](ReadResourceResult) instance containing the resource contents.

The result provides helper methods for accessing content:
- `.getTextContent()`: Get text from the first text resource
- `.getBlobContent()`: Get blob from the first blob resource
- `.findByUri(uri)`: Find a resource by its URI
- `.contents`: Access the raw contents array

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('read a resource from the server', async () => {
  const app = mcpShell('node resource-server.js');
  await app.initialize();

  // Read a text resource
  const result = await app.readResource('file:///example.txt');

  // result is a ReadResourceResult instance
  expect(result.contents).toBeDefined();

  // Use helper methods
  const text = result.getTextContent();
  expect(text).toBeDefined();

  // Or use matchers
  await expect(result).toHaveResourceContent('file:///example.txt');
  await expect(result).toHaveTextResource('expected content');

  await app.close();
});
```

## Error Handling

If the resource read fails, an error will be thrown:

```ts
try {
  await app.readResource('file:///nonexistent.txt');
} catch (error) {
  expect(error.name).toBe('ResourceCallError');
}
```

## Timeout Configuration

You can configure the timeout for resource reads using the `requestTimeout` option:

```ts
const app = mcpShell('node slow-resource-server.js', {
  requestTimeout: 30000, // 30 seconds
});

const result = await app.readResource('file:///large-file.txt');
```

## See Also

- [ReadResourceResult](ReadResourceResult) - The class returned by readResource
- [mcpShell](mcpShell) - Create an MCP subprocess
- [toHaveResource](toHaveResource) - Assert that a resource exists
- [toHaveResources](toHaveResources) - Assert that multiple resources exist
- [Matchers](matchers) - Custom matchers for validating resource results
