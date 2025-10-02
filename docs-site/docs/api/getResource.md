# getResource

Reads a resource from the MCP server.

Will throw an error if:
 - The server did not declare 'resources' in the capabilities section.
 - The server did not list this resource URI in the resources list.
 - The resource read fails.

## Syntax

```ts
app.getResource(uri: string): Promise<MCPReadResourceResult>
```

## Parameters

- `uri`: The URI of the resource to read

## Returns

A Promise that resolves to an object containing:
- `contents`: An array of resource contents (text or blob)

Each content item has:
- `uri`: The URI of the resource
- `mimeType`: Optional MIME type of the content
- `text`: The text content (for text resources)
- `blob`: The base64-encoded blob content (for binary resources)

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('read a resource from the server', async () => {
  const app = mcpShell('node resource-server.js');
  await app.initialize();

  // Read a text resource
  const result = await app.getResource('file:///example.txt');

  expect(result.contents).toBeDefined();
  expect(result.contents[0].text).toBeDefined();
  expect(result.contents[0].mimeType).toBe('text/plain');

  app.close();
});
```

## Error Handling

If the resource read fails, an error will be thrown:

```ts
try {
  await app.getResource('file:///nonexistent.txt');
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

const result = await app.getResource('file:///large-file.txt');
```

## See Also

- [mcpShell](mcpShell) - Create an MCP subprocess
- [toHaveResource](toHaveResource) - Assert that a resource exists
- [toHaveResources](toHaveResources) - Assert that multiple resources exist
