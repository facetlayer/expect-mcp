# Getting Started

## Installation

This package expects Vitest to be available in the consumer project. Make sure you have it installed as either a dependency or devDependency.

```bash
pnpm add -D expect-mcp
```

## Setup

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

## Basic Usage

### Testing MCP Responses

```ts
import { expect, test } from 'vitest';

test('validates MCP response format', () => {
  const response = {
    jsonrpc: '2.0',
    id: 1,
    result: {
      content: [
        {
          type: 'text',
          text: 'Hello, world!'
        }
      ]
    }
  };

  expect(response).toBeValidMCPResponse();
});
```

### Testing MCP Servers

```ts
import { shellCommand } from 'expect-mcp';

test('server provides expected tools', async () => {
  const app = shellCommand('node', ['path/to/mcp-server.js']);
  await app.initialize();

  await expect(app).toHaveTool('filesystem_list');
  await expect(app).toHaveResource('config.json');

  app.kill();
});
```

## Next Steps

- Learn about all available [matchers](./api/matchers.md)
- Explore [MCP server testing](./api/mcp-testing.md) utilities
- Enable [strict mode](./api/strict-mode.md) for enhanced validation