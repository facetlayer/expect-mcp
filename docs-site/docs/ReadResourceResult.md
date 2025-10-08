# ReadResourceResult

The `ReadResourceResult` class wraps the result of a resource read with helper methods for accessing content.

When you call `app.readResource()`, it returns a `ReadResourceResult` instance instead of a raw response object.

## Properties

### `raw`

Get the raw result object.

```ts
const result = await app.readResource('file:///app/config.json');
const rawResult = result.raw;
// rawResult is the ReadResourceResult object
```

### `contents`

Get the contents array containing all resources returned.

```ts
const result = await app.readResource('file:///app/test.txt');
const contents = result.contents;
// contents is an array of TextResourceContents or BlobResourceContents objects
```

## Methods

### `getTextContent()`

Get the text content from the first text resource in the contents array.

Returns `string | undefined` - The text content, or `undefined` if no text resources exist.

```ts
const result = await app.readResource('file:///app/test.txt');
const text = result.getTextContent();
// Returns the file contents as a string
```

### `getBlobContent()`

Get the blob content (base64-encoded) from the first blob resource in the contents array.

Returns `string | undefined` - The blob content, or `undefined` if no blob resources exist.

```ts
const result = await app.readResource('file:///app/image.png');
const blob = result.getBlobContent();
// Returns the base64-encoded image data
```

### `findByUri(uri)`

Find a resource by its URI.

**Parameters:**
- `uri`: The URI of the resource to find

**Returns:** The resource with the matching URI, or `undefined`.

```ts
const result = await app.readResource('file:///app/test.txt');
const resource = result.findByUri('file:///app/test.txt');
if (resource && 'text' in resource) {
  console.log('Text:', resource.text);
}
```

### `getAllTextResources()`

Get all text resources from the contents array.

**Returns:** An array of text resources.

```ts
const result = await app.readResource('file:///app/data');
const textResources = result.getAllTextResources();
textResources.forEach(resource => {
  console.log(`${resource.uri}: ${resource.text}`);
});
```

### `getAllBlobResources()`

Get all blob resources from the contents array.

**Returns:** An array of blob resources.

```ts
const result = await app.readResource('file:///app/images');
const blobResources = result.getAllBlobResources();
blobResources.forEach(resource => {
  console.log(`${resource.uri}: ${resource.mimeType}`);
});
```

### `hasTextContent()`

Check if the result contains any text resources.

**Returns:** `true` if at least one text resource exists.

```ts
const result = await app.readResource('file:///app/test.txt');
if (result.hasTextContent()) {
  console.log('Has text:', result.getTextContent());
}
```

### `hasBlobContent()`

Check if the result contains any blob resources.

**Returns:** `true` if at least one blob resource exists.

```ts
const result = await app.readResource('file:///app/image.png');
if (result.hasBlobContent()) {
  console.log('Has blob data');
}
```

## Complete Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('read resource with ReadResourceResult', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  // Read a text file
  const textResult = await app.readResource('file:///tmp/test.txt');

  // Use helper methods
  const text = textResult.getTextContent();
  expect(text).toBeDefined();

  // Or use matchers
  await expect(textResult).toHaveResourceContent('file:///tmp/test.txt');
  await expect(textResult).toHaveTextResource('Hello world');

  // Read an image file
  const imageResult = await app.readResource('file:///tmp/image.png');
  const blob = imageResult.getBlobContent();
  expect(blob).toBeDefined();
  expect(imageResult.hasBlobContent()).toBe(true);

  // Find by URI
  const resource = textResult.findByUri('file:///tmp/test.txt');
  expect(resource).toBeDefined();
  expect(resource?.uri).toBe('file:///tmp/test.txt');

  await app.close();
});
```

## Resource Metadata

Resources may include additional metadata fields:

```ts
const result = await app.readResource('file:///app/config.json');
const resource = result.contents[0];

console.log('URI:', resource.uri);
console.log('Name:', resource.name);  // Optional
console.log('Title:', resource.title);  // Optional
console.log('MIME Type:', resource.mimeType);  // Optional

// Annotations (optional)
if (resource.annotations) {
  console.log('Audience:', resource.annotations.audience);  // ['user', 'assistant']
  console.log('Priority:', resource.annotations.priority);  // 0.0 to 1.0
  console.log('Last Modified:', resource.annotations.lastModified);  // ISO 8601 timestamp
}
```

## See Also

- [readResource](readResource) - Read a resource from an MCP server
- [Matchers](matchers) - Custom matchers for testing resource results
