# Matchers

The expect-mcp library provides custom Vitest matchers specifically designed for testing Model Context Protocol (MCP) integrations.

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
