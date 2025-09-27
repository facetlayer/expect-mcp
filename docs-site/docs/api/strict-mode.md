# Strict Mode

Strict mode is an optional feature that enables enhanced validation and error checking for MCP communications. When enabled, it adds comprehensive validation to ensure all MCP interactions conform to the official specification.

## Enabling Strict Mode

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

You can also enable strict mode when using `shellCommand`:

```ts
import { shellCommand } from 'expect-mcp';

const app = shellCommand('node path/to/mcp-server.js', {
  strictMode: true
});
```

## Features

When strict mode is enabled, the following validations are performed:

### JSON-RPC Compliance
All messages must conform to JSON-RPC 2.0 format with:
- Valid `jsonrpc: "2.0"` field
- Proper `id` field (string, number, or null)
- Either `result` or `error` field for responses

### Schema Validation
MCP responses are validated against official schemas using Zod:
- Initialize responses validated against `InitializeResultSchema`
- All JSON-RPC messages validated against `JSONRPCMessageSchema`

### Protocol Version Enforcement
Ensures compatibility with the latest MCP protocol version (2025-06-18).

### Error Assertions
Throws detailed errors for any non-JSON or malformed responses.

## Error Types

Strict mode can throw the following types of errors:

### JSON Parsing Errors
```ts
"Strict mode: Response is not valid JSON: <error details>"
```

Thrown when the server returns invalid JSON data.

### JSON-RPC Format Errors
```ts
"Strict mode: Invalid JSON-RPC response: <validation details>"
```

Thrown when the response doesn't conform to JSON-RPC 2.0 format.

### Schema Validation Errors
```ts
"Strict mode: Initialize response validation failed: <schema errors>"
```

Thrown when MCP-specific responses don't match expected schemas.

## Use Cases

Strict mode is particularly useful for:

### Development
Catching protocol violations early in development prevents issues from reaching production.

```ts
// Enable strict mode during development
const app = new MCPStdinSubprocess({
  strictMode: process.env.NODE_ENV === 'development'
});
```

### Testing
Ensuring test reliability with deterministic validation.

```ts
import { test, expect } from 'vitest';

test('server follows MCP protocol strictly', async () => {
  const app = new MCPStdinSubprocess({
    strictMode: true,
    command: 'node',
    args: ['my-server.js']
  });

  // Any protocol violations will throw errors
  await app.initialize();
  const tools = await app.getTools();

  expect(tools).toBeDefined();
});
```

### CI/CD
Validating MCP integrations in automated testing.

```ts
// Enable strict mode in CI environments
const app = new MCPStdinSubprocess({
  strictMode: process.env.CI === 'true',
  command: process.env.MCP_SERVER_COMMAND
});
```

### Debugging
Getting detailed error information for malformed responses.

```ts
try {
  await app.initialize();
} catch (error) {
  if (error.message.startsWith('Strict mode:')) {
    console.error('Protocol violation detected:', error.message);
    // Handle protocol error specifically
  }
}
```

## Performance Considerations

Strict mode adds validation overhead, so consider:

- **Enable in development and testing environments** for better error detection
- **Monitor performance impact in production** if enabled
- **Validation occurs on every message** when enabled

```ts
// Conditional strict mode based on environment
const app = new MCPStdinSubprocess({
  strictMode: process.env.NODE_ENV !== 'production',
  command: 'node',
  args: ['server.js']
});
```

## Example: Full Strict Mode Setup

```ts
import { MCPStdinSubprocess } from 'expect-mcp';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('MCP Server with Strict Mode', () => {
  let app: MCPStdinSubprocess;

  beforeEach(async () => {
    app = new MCPStdinSubprocess({
      strictMode: true,
      command: 'node',
      args: ['test-server.js']
    });

    await app.initialize();
  });

  afterEach(() => {
    app?.kill();
  });

  test('all responses are protocol compliant', async () => {
    // Strict mode will validate all these calls
    const tools = await app.getTools();
    const resources = await app.getResources();

    expect(tools).toBeInstanceOf(Array);
    expect(resources).toBeInstanceOf(Array);
  });

  test('tool calls return valid responses', async () => {
    await expect(app).toHaveTool('test_tool');

    const result = await app.callTool('test_tool', {
      param: 'value'
    });

    // Strict mode ensures this is a valid MCP response
    expect(result).toBeValidMCPResponse();
  });
});
```