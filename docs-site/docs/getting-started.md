# Getting Started

## Installation

This package supports both Vitest and Jest. Make sure you have one of them installed as either a dependency or devDependency.

```bash
pnpm add -D expect-mcp
```

## Setup

Add a single import to your Vitest or Jest setup file (or the top of an individual test) to register the matchers automatically:

```ts
import 'expect-mcp/vitest-setup';
```

### ESM vs CommonJS

The main import is ESM-based. If you need CommonJS support, use:

```javascript
const { mcpShell } = require('expect-mcp/cjs');
require('expect-mcp/cjs/vitest-setup');
```

## Basic Usage

### Testing MCP Servers

```ts
import { mcpShell } from 'expect-mcp';

test('server provides expected tools', async () => {
  const app = mcpShell('node path/to/mcp-server.js');
  await app.initialize();

  await expect(app).toHaveTool('filesystem_list');
  await expect(app).toHaveResource('config.json');

  await app.close();
});
```

## Lifecycle pattern

A typical test suite can look like this:

```ts
import { expect, beforeAll, afterAll } from 'vitest';
import { mcpShell, MCPStdinSubprocess } from 'expect-mcp';

let app: MCPStdinSubprocess;

beforeAll(async () => {
    // Set up the subprocess
    app = mcpShell('<your shell command>', {});
});

afterAll(async () => {
    // Clean shutdown
    await app.close();
});

it("tests something", async () => {
    // Test assertions here
    await expect(app).toHaveTool('tool');
    const response = await app.callTool('tool', {});
    expect(response.content).toEqual(...);
});
```

## Next Steps

- Learn about all available [matchers](./matchers.md)
- Explore [MCP server testing](./mcp-testing.md) utilities
