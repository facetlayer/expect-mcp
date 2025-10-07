# toHaveResource

Checks that an MCP server provides a resource with the specified name. This matcher works with `MCPStdinSubprocess` instances.

## Syntax

```ts
await expect(app).toHaveResource(resourceName);
```

## Parameters

- `resourceName`: The name of the resource to check for

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('server provides configuration resources', async () => {
  const app = mcpShell('node config-server.js');
  await app.initialize();

  await expect(app).toHaveResource('app_config');
  await expect(app).toHaveResource('user_settings');

  await app.close();
});
```

## Error Messages

If the resource doesn't exist:

```ts
await expect(app).toHaveResource('nonexistent_resource');
// Error: Expected server to have resource "nonexistent_resource", but it was not found.
// Available resources: app_config, user_settings, database_config
```

## See Also

- [toHaveTool](toHaveTool) - Check for tools
- [mcpShell](mcpShell) - Create an MCP subprocess
