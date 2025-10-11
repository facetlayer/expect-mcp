# expect-mcp

Custom test matchers for [Vitest](https://vitest.dev/) and [Jest](https://jestjs.io/) to write test assertions for Model Context Protocol (MCP) tools.

## Features

- **Custom Matchers**: Adds `expect()` matchers to assert on MCP interactions.
- **MCP Client**: Implements a special MCP client with extra features for testing and validation.

## Latest support

Currently the library supports:

- Testing MCP features: **tools**, **resources**, **prompts**.
- Testing **stdin** protocol servers.
- Integration with **Vitest** and **Jest**.

On the roadmap for future support:

- Planned: Testing HTTP services and Oauth.
- Planned: Testing for features: Discovery, Sampling, Roots, Elicitation.

## Installation

```bash
npm install --save-dev expect-mcp
```

Or using other package managers:

```bash
# pnpm
pnpm add -D expect-mcp

# yarn
yarn add -D expect-mcp
```

## Quick Start

Importing and using the library:

```
import { mcpShell } from 'expect-mcp';
import 'expect-mcp/vitest-setup'; // Install 'expect' matchers

it("the test", async () => {
  const app = mcpShell('path/to/mcp-server');
  await expect(app).toHaveTool('toolName');
  await expect(app).toHaveResource('config.json');

  const toolResult = await app.callTool('toolName', {});
  expect(toolResult); // ... check the result

  await app.close();
});
```

### ESM / CommonJS Support

By default the library is ESM but we also include a CJS build.
If your tests need to use CommonJS then import from `expect-mcp/cjs`. Example:

```javascript
const { mcpShell } = require('expect-mcp/cjs');
require('expect-mcp/cjs/vitest-setup');
```

## Next Steps

### Getting Started
- **[Getting Started Guide](./getting-started.md)** - Complete setup instructions and basic usage patterns
- **[MCP Server Testing](./mcp-testing.md)** - In-depth guide to testing MCP servers with `mcpShell()`

### Core API
- **[mcpShell()](./mcpShell.md)** - Create an MCP subprocess for testing
- **[callTool()](./callTool.md)** - Execute MCP tools in your tests
- **[readResource()](./readResource.md)** - Read MCP resources in your tests

### Test Matchers
- **[Matchers Overview](./matchers.md)** - Complete list of all available test matchers
- **[toHaveTool()](./toHaveTool.md)** - Assert that a server provides a specific tool
- **[toHaveResource()](./toHaveResource.md)** - Assert that a server provides a specific resource
- **[toBeSuccessful()](./toBeSuccessful.md)** - Assert that a tool call succeeded
