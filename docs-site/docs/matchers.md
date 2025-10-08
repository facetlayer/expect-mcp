# Matchers

The expect-mcp library provides custom Vitest matchers specifically designed for testing Model Context Protocol (MCP) integrations.

## MCP Server Matchers

These matchers work with `MCPStdinSubprocess` instances to test server capabilities.

- **[toHaveTool](toHaveTool)** - Check if server provides a specific tool
- **[toHaveTools](toHaveTools)** - Check if server provides multiple tools
- **[toHaveResource](toHaveResource)** - Check if server provides a specific resource
- **[toHaveResources](toHaveResources)** - Check if server provides multiple resources

## Tool Result Matchers

These matchers work with `ToolCallResult` instances returned by `app.callTool()`.

- **[toBeSuccessful](toBeSuccessful)** - Check that a tool call succeeded
- **[toHaveTextContent](toHaveTextContent)** - Check tool result contains exact text
- **[toMatchTextContent](toMatchTextContent)** - Check tool result matches a regex pattern

## Resource Result Matchers

These matchers work with `ReadResourceResult` instances returned by `app.readResource()`.

- **[toHaveResourceContent](toHaveResourceContent)** - Check resource has content for a URI
- **[toHaveTextResource](toHaveTextResource)** - Check resource contains exact text

## Example

```ts
import { mcpShell } from 'expect-mcp';
import { test, expect } from 'vitest';

test('complete matcher example', async () => {
  const app = mcpShell('node file-server.js');
  await app.initialize();

  // Server matchers
  await expect(app).toHaveTool('read_file');
  await expect(app).toHaveTools(['read_file', 'write_file']);
  await expect(app).toHaveResource('config.json');

  // Tool result matchers
  const toolResult = await app.callTool('read_file', {
    path: '/tmp/test.txt'
  });
  await expect(toolResult).toBeSuccessful();
  await expect(toolResult).toHaveTextContent('Hello world');
  await expect(toolResult).toMatchTextContent(/Hello \w+/);

  // Resource result matchers
  const resourceResult = await app.readResource('file:///app/config.json');
  await expect(resourceResult).toHaveResourceContent('file:///app/config.json');
  await expect(resourceResult).toHaveTextResource('{"key": "value"}');

  await app.close();
});
```

## See Also

- [ToolCallResult](ToolCallResult) - Helper class for tool call results
- [ReadResourceResult](ReadResourceResult) - Helper class for resource read results
- [MCP Server Testing](mcp-testing) - Guide to testing MCP servers
