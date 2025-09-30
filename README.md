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

TODO: Add more here

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

### `mcpShell(command: string, options?: SubprocessOptions = {})`

Creates and spawns an MCP subprocess that communicates over stdin/stdout using JSON-RPC 2.0.

The `command

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

## Strict Mode

Strict mode is an optional feature that enables enhanced validation and error checking for MCP communications. When enabled, it adds comprehensive validation to ensure all MCP interactions conform to the official specification.

### Enabling Strict Mode

```ts
import { MCPStdinSubprocess } from 'expect-mcp';

// Enable strict mode for enhanced validation
const app = new MCPStdinSubprocess({
  strictMode: true,
  command: 'node',
  args: ['path/to/mcp-server.js']
});

await app.initialize();
console.log(app.isStrictModeEnabled()); // true
```

### Features

When strict mode is enabled, the following validations are performed:

- **JSON-RPC Compliance**: All messages must conform to JSON-RPC 2.0 format
- **Schema Validation**: MCP responses are validated against official schemas using Zod
- **Protocol Version Enforcement**: Ensures compatibility with the latest MCP protocol version (2025-06-18)
- **Error Assertions**: Throws detailed errors for any non-JSON or malformed responses

### Error Types

Strict mode can throw the following types of errors:

```ts
// JSON parsing errors
"Strict mode: Response is not valid JSON: <error details>"

// JSON-RPC format errors
"Strict mode: Invalid JSON-RPC response: <validation details>"

// Schema validation errors
"Strict mode: Initialize response validation failed: <schema errors>"
```

### Use Cases

Strict mode is particularly useful for:

- **Development**: Catching protocol violations early in development
- **Testing**: Ensuring test reliability with deterministic validation
- **CI/CD**: Validating MCP integrations in automated testing
- **Debugging**: Getting detailed error information for malformed responses

### Performance Considerations

Strict mode adds validation overhead, so consider:

- Enable in development and testing environments
- Monitor performance impact in production if enabled
- Validation occurs on every message when enabled

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
