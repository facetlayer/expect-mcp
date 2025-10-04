# toHaveResources

Checks that an MCP server provides all of the specified resources. This matcher works with `MCPStdinSubprocess` instances.

## Syntax

```ts
await expect(app).toHaveResources(resourceNames);
```

## Parameters

- `resourceNames`: An array of resource names to check for

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('server provides configuration resources', async () => {
  const app = mcpShell('node config-server.js');
  await app.initialize();

  await expect(app).toHaveResources(['app_config', 'user_settings']);

  app.close();
});
```

## Error Messages

If any of the resources don't exist:

```ts
await expect(app).toHaveResources(['app_config', 'nonexistent_resource']);
// Error: Expected server to have all resources ["app_config", "nonexistent_resource"], but "nonexistent_resource" was not found.
// Available resources: app_config, user_settings
```

## See Also

- [toHaveResource](toHaveResource) - Check for a single resource
- [toHaveTool](toHaveTool) - Check for tools
- [mcpShell](mcpShell) - Create an MCP subprocess
