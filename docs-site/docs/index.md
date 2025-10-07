# expect-mcp

Custom test matchers for [Vitest](https://vitest.dev/) and [Jest](https://jestjs.io/) to write test assertions for Model Context Protocol (MCP) tools.

## Features

- **Custom Matchers**: Adds `expect()` matchers to assert on MCP interactions.
- **TypeScript Support**: Complete type definitions for all MCP types and matchers.
- **MCP client**: Implements a special MCP client that includes strict protocol validation to catch any errors.

## Latest support

Currently the library supports:

- Testing **tools** and **resources**. Other MCP capabilities are not supported yet.
- Testing **stdin** protocol servers. HTTP-based servers are not supported yet.
- Integration with **Vitest** and **Jest**.

## Quick Start

Installation:

```bash
npm install -D expect-mcp
```

Using the library in your test suite:

```ts
import { mcpShell } from 'expect-mcp';
import 'expect-mcp/vitest-setup'; // Install matchers onto expect()

it("the test", async () => {
  const app = mcpShell('path/to/mcp-server');
  await expect(app).toHaveTool('toolName');
  await expect(app).toHaveResource('config.json');

  const toolResult = await app.callTool('toolName', {});
  expect(toolResult); // ... check the result

  await app.close();
});
```
