# Matchers

The expect-mcp library provides custom Vitest matchers specifically designed for testing Model Context Protocol (MCP) integrations.

## Tool Result Matchers

These matchers work with `ToolCallResult` instances returned by `app.callTool()`.

### toBeSuccessful()

Checks that a tool call result is successful (does not have `isError` set to `true`).

```ts
const result = await app.callTool('write_file', {
  path: '/tmp/test.txt',
  content: 'Hello'
});
await expect(result).toBeSuccessful();
```

### toHaveTextContent(expectedText: string)

Checks that a tool call result contains text content matching the expected string exactly.

```ts
const result = await app.callTool('read_file', {
  path: '/tmp/test.txt'
});
await expect(result).toHaveTextContent('Hello world');
```

**Parameters:**
- `expectedText`: The exact text content to match

### toMatchTextContent(pattern: RegExp)

Checks that a tool call result contains text content matching the given regular expression pattern.

```ts
const result = await app.callTool('get_status', {});
await expect(result).toMatchTextContent(/Status: \w+/);
```

**Parameters:**
- `pattern`: A regular expression to match against the text content

**Example:**

```ts
import { mcpShell } from 'expect-mcp';

test('validate tool result content', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  const result = await app.callTool('read_file', {
    path: '/tmp/log.txt'
  });

  // Check that the tool call succeeded
  await expect(result).toBeSuccessful();

  // Check exact text match
  await expect(result).toHaveTextContent('Log entry 1\nLog entry 2');

  // Check pattern match
  await expect(result).toMatchTextContent(/Log entry \d+/);

  await app.close();
});
```

## MCP Server Matchers

These matchers work with `MCPStdinSubprocess` instances.

## toHaveTool(toolName: string)

Checks that an MCP server provides a tool with the specified name. This matcher works with `MCPStdinSubprocess` instances.

```ts
const app = mcpShell('node path/to/mcp-server.js');
await app.initialize();
await expect(app).toHaveTool('filesystem_list');
```

### Parameters

- `toolName`: The name of the tool to check for

### Example

```ts
import { mcpShell } from 'expect-mcp';

test('server provides file operations', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  await expect(app).toHaveTool('read_file');
  await expect(app).toHaveTool('write_file');

  await app.close();
});
```

## toHaveResource(resourceName: string)

Checks that an MCP server provides a resource with the specified name. This matcher works with `MCPStdinSubprocess` instances.

```ts
const app = mcpShell('node path/to/mcp-server.js');
await app.initialize();
await expect(app).toHaveResource('config.json');
```

### Parameters

- `resourceName`: The name of the resource to check for

### Example

```ts
import { mcpShell } from 'expect-mcp';

test('server provides configuration resources', async () => {
  const app = mcpShell('node config-server.js');
  await app.initialize();

  await expect(app).toHaveResource('app_config');
  await expect(app).toHaveResource('user_settings');

  await app.close();
});
```
