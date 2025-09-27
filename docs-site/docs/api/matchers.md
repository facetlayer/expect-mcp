# Matchers

The expect-mcp library provides custom Vitest matchers specifically designed for testing Model Context Protocol (MCP) integrations.

## toBeValidMCPResponse()

Asserts that the value under test is a JSON-RPC 2.0 response produced by an MCP tool.

```ts
expect(response).toBeValidMCPResponse();
```

### Validation Rules

The matcher verifies:
- `jsonrpc` equals `'2.0'`
- `id` is a string, number, or `null`
- Either `result` or `error` is present
- `result.content` (when provided) contains well-formed messages
- `error` (when provided) exposes the expected `code` and `message` fields

### Example

```ts
const response = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    content: [
      {
        type: 'text',
        text: 'Hello, world!'
      }
    ]
  }
};

expect(response).toBeValidMCPResponse();
```

## toHaveMCPError(expectedCode?: number)

Checks that an MCP response represents an error. Optionally ensures the error code matches an expected value.

```ts
expect(response).toHaveMCPError();
expect(response).toHaveMCPError(-32602);
```

### Parameters

- `expectedCode` (optional): The expected error code to match

### Example

```ts
const errorResponse = {
  jsonrpc: '2.0',
  id: 1,
  error: {
    code: -32602,
    message: 'Invalid params'
  }
};

expect(errorResponse).toHaveMCPError();
expect(errorResponse).toHaveMCPError(-32602);
```

If the value is not a valid MCP response, the matcher fails with a helpful message so you can pinpoint malformed payloads quickly.

## toHaveTool(toolName: string)

Checks that an MCP server provides a tool with the specified name. This matcher works with `MCPStdinSubprocess` instances.

```ts
const app = shellCommand('node', ['path/to/mcp-server.js']);
await app.initialize();
await expect(app).toHaveTool('filesystem_list');
```

### Parameters

- `toolName`: The name of the tool to check for

### Example

```ts
import { shellCommand } from 'expect-mcp';

test('server provides file operations', async () => {
  const app = shellCommand('node', ['file-server.js']);
  await app.initialize();

  await expect(app).toHaveTool('read_file');
  await expect(app).toHaveTool('write_file');

  app.kill();
});
```

## toHaveResource(resourceName: string)

Checks that an MCP server provides a resource with the specified name. This matcher works with `MCPStdinSubprocess` instances.

```ts
const app = shellCommand('node', ['path/to/mcp-server.js']);
await app.initialize();
await expect(app).toHaveResource('config.json');
```

### Parameters

- `resourceName`: The name of the resource to check for

### Example

```ts
import { shellCommand } from 'expect-mcp';

test('server provides configuration resources', async () => {
  const app = shellCommand('node', ['config-server.js']);
  await app.initialize();

  await expect(app).toHaveResource('app_config');
  await expect(app).toHaveResource('user_settings');

  app.kill();
});
```