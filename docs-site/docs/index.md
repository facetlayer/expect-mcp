# expect-mcp

Custom [Vitest](https://vitest.dev/) matchers to write test assertions for Model Context Protocol (MCP) tools.

## Features

- **Custom Matchers**: Adds `expect()` matchers to assert on MCP interactions.
- **TypeScript Support**: Complete type definitions for all MCP types and matchers

## Support:

Currently the library supports:

- Testing **tools** and **resources**. Other MCP capabilities are not supported yet.
- Testing **stdin** based servers. HTTP-based servers are not supported yet.

## Quick Start

```bash
pnpm add -D expect-mcp
```

Add to your Vitest setup:

```ts
import 'expect-mcp/vitest-setup';
```

Start testing your MCP integrations:

```ts
// Test MCP servers
const app = mcpShell('node path/to/mcp-server.js');
await app.initialize();
await expect(app).toHaveTool('filesystem_list');
await expect(app).toHaveResource('config.json');
```
