# expect-mcp

Custom [Vitest](https://vitest.dev/) matchers to write test assertions for Model Context Protocol (MCP) tools.

## Installation

```bash
pnpm add -D expect-mcp
```

This package expects Vitest to be available in the consumer project. Make sure you have it installed as either a dependency or devDependency.

## Getting started

Add a single import to your Vitest setup file (or the top of an individual test) to register the matchers automatically:

```ts
import 'expect-mcp/vitest-setup';
```

If you keep the import in a dedicated setup file, reference that file from your Vitest configuration:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

## Matchers

### `toBeValidMCPResponse()`

Asserts that the value under test is a JSON-RPC 2.0 response produced by an MCP tool. The matcher verifies:

- `jsonrpc` equals `'2.0'`.
- `id` is a string, number, or `null`.
- Either `result` or `error` is present.
- `result.content` (when provided) contains well-formed messages.
- `error` (when provided) exposes the expected `code` and `message` fields.

```ts
expect(response).toBeValidMCPResponse();
```

### `toHaveMCPError(expectedCode?: number)`

Checks that an MCP response represents an error. Optionally ensure the error code matches an expected value.

```ts
expect(response).toHaveMCPError();
expect(response).toHaveMCPError(-32602);
```

If the value is not a valid MCP response, the matcher fails with a helpful message so you can pinpoint malformed payloads quickly.

### `toHaveTool(toolName: string)`

Checks that an MCP server provides a tool with the specified name. This matcher works with `MCPStdinSubprocess` instances.

```ts
const app = shellCommand('node', ['path/to/mcp-server.js']);
await app.initialize();
await expect(app).toHaveTool('filesystem_list');
```

### `toHaveResource(resourceName: string)`

Checks that an MCP server provides a resource with the specified name. This matcher works with `MCPStdinSubprocess` instances.

```ts
const app = shellCommand('node', ['path/to/mcp-server.js']);
await app.initialize();
await expect(app).toHaveResource('config.json');
```

## MCP Server Testing

### `shellCommand(command: string, args?: string[])`

Creates and spawns an MCP subprocess that communicates over stdin/stdout using JSON-RPC 2.0.

```ts
import { shellCommand } from 'expect-mcp';

const app = shellCommand('node', ['path/to/mcp-server.js']);
await app.initialize();

// Test that the server provides expected tools and resources
await expect(app).toHaveTool('read_file');
await expect(app).toHaveResource('project_files');

// Clean up
app.kill();
```

The `shellCommand` function returns an `MCPStdinSubprocess` instance which extends the JSON-RPC subprocess with MCP-specific functionality:

- `initialize()` - Perform MCP handshake and capability negotiation
- `getTools()` - Get list of available tools from the server
- `getResources()` - Get list of available resources from the server
- `hasTool(name)` - Check if a specific tool is available
- `hasResource(name)` - Check if a specific resource is available

## TypeScript support

The package includes TypeScript definitions for `MCPResponse`, `MCPResult`, `MCPContentMessage`, `MCPError`, and the matcher contracts. Import them directly from `expect-mcp` when you need shared utilities or to build additional matchers on top of the defaults.

## Scripts

- `pnpm run build` — emit compiled JavaScript and declaration files to `dist/`.
- `pnpm run test` — execute Vitest with the custom matchers pre-installed.
- `pnpm run clean` — remove the build output.

## Contributing

1. Clone the repository and install dependencies.
2. Run `pnpm test` to execute the existing matcher tests.
3. Open a PR describing the matcher or enhancement you are proposing.

Issues and feature requests are welcome—if you need additional matchers for your MCP integration, feel free to open a discussion!
