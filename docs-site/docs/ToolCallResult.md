# ToolCallResult

The `ToolCallResult` class wraps the result of a tool call with helper methods for accessing content and validating success.

When you call `app.callTool()`, it returns a `ToolCallResult` instance instead of a raw response object.

## Properties

### `raw`

Get the raw result object.

```ts
const result = await app.callTool('read_file', { path: '/app/test.txt' });
const rawResult = result.raw;
// rawResult is the CallToolResult object
```

### `content`

Get the content array containing all content blocks returned by the tool.

```ts
const result = await app.callTool('read_file', { path: '/app/test.txt' });
const contentBlocks = result.content;
// contentBlocks is an array of ContentBlock objects
```

### `structuredContent`

Get the structured content if present. This is an optional field that may be returned by tools that support structured output.

```ts
const result = await app.callTool('get_weather', { location: 'New York' });
const data = result.structuredContent;
// data might be { temperature: 72, conditions: 'sunny' }
```

### `isError`

Check if the result represents an error.

```ts
const result = await app.callTool('write_file', { path: '/app/test.txt', content: 'Hello' });
if (result.isError) {
  console.log('Tool call failed');
}
```

## Methods

### `getTextContent()`

Get the text content from the first text content block.

Returns `string | undefined` - The text content, or `undefined` if no text content blocks exist.

```ts
const result = await app.callTool('read_file', { path: '/app/test.txt' });
const text = result.getTextContent();
// Returns the file contents as a string
```

### `expectSuccess()`

Assert that the result is not an error. Throws a `ToolCallError` if the result has `isError` set to `true`.

Returns the `ToolCallResult` instance for chaining.

```ts
const result = await app.callTool('write_file', {
  path: '/app/test.txt',
  content: 'Hello world'
});
result.expectSuccess(); // Throws if isError is true
```

Example with chaining:

```ts
const text = await app.callTool('read_file', { path: '/app/test.txt' })
  .then(result => result.expectSuccess())
  .then(result => result.getTextContent());
```

### `getContentByType(type)`

Get all content blocks of a specific type.

**Parameters:**
- `type`: The type of content blocks to retrieve (`'text'`, `'image'`, `'audio'`, `'resource_link'`, or `'resource'`)

**Returns:** An array of content blocks matching the specified type.

```ts
const result = await app.callTool('generate_images', { prompt: 'cat' });
const imageBlocks = result.getContentByType('image');
// Returns all image content blocks
```

### `findContentByType(type)`

Find the first content block of a specific type.

**Parameters:**
- `type`: The type of content block to find (`'text'`, `'image'`, `'audio'`, `'resource_link'`, or `'resource'`)

**Returns:** The first content block of the specified type, or `undefined` if not found.

```ts
const result = await app.callTool('analyze_file', { path: '/app/image.png' });
const imageBlock = result.findContentByType('image');
if (imageBlock) {
  console.log('Image MIME type:', imageBlock.mimeType);
}
```

## Complete Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('read and write file with ToolCallResult', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  // Write a file and ensure it succeeded
  const writeResult = await app.callTool('write_file', {
    path: '/tmp/test.txt',
    content: 'Hello world'
  });
  writeResult.expectSuccess();

  // Read the file back
  const readResult = await app.callTool('read_file', {
    path: '/tmp/test.txt'
  });

  // Use the helper method to get text content
  const content = readResult.getTextContent();
  expect(content).toBe('Hello world');

  // Or use the new matchers
  await expect(readResult).toBeSuccessful();
  await expect(readResult).toHaveTextContent('Hello world');

  await app.close();
});
```

## See Also

- [callTool](callTool) - Call a tool on an MCP server
- [Matchers](matchers) - Custom matchers for testing tool results
