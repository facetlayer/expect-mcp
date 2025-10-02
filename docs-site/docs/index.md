# expect-mcp

Custom [Vitest](https://vitest.dev/) matchers to write test assertions for Model Context Protocol (MCP) tools.

## Features

- **Custom Matchers**: Adds `expect()` matchers to assert on MCP interactions.
- **TypeScript Support**: Complete type definitions for all MCP types and matchers.
- **MCP client**: Implements a special MCP client that includes strict protocol validation to catch any errors.

## Latest support:

Currently the library supports:

- Testing **tools** and **resources**. Other MCP capabilities are not supported yet.
- Testing **stdin** protocol servers. HTTP-based servers are not supported yet.
- Integration with **Vitest**. Other libraries like Jest have not been tested yet.

## Quick Start

```bash
npm install -D expect-mcp
```

Import vitest-setup to add the custom matchers to `expect()`:

```ts
import 'expect-mcp/vitest-setup';
```

Start testing your MCP integrations:

```ts
import { mcpShell } from 'expect-mcp';

// ...

// Perform a test:
const app = mcpShell('path/to/mcp-server');
await expect(app).toHaveTool('toolName');
await expect(app).toHaveResource('config.json');

const toolResult = await app.callTool('toolName', {});

await app.close();
```
