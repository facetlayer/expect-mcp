# expect-mcp

Custom [Vitest](https://vitest.dev/) matchers to write test assertions for Model Context Protocol (MCP) tools.

## Features

- **Custom Matchers**: Purpose-built Vitest matchers for MCP response validation
- **MCP Server Testing**: Tools for testing MCP servers via stdin/stdout communication
- **Strict Mode**: Enhanced validation and error checking for MCP communications
- **TypeScript Support**: Complete type definitions for all MCP types and matchers

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
// Test MCP responses
expect(response).toBeValidMCPResponse();
expect(response).toHaveMCPError(-32602);

// Test MCP servers
const app = shellCommand('node', ['path/to/mcp-server.js']);
await app.initialize();
await expect(app).toHaveTool('filesystem_list');
```