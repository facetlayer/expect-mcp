# expect-mcp

[![CI](https://github.com/facetlayer/expect-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/facetlayer/expect-mcp/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/expect-mcp.svg)](https://badge.fury.io/js/expect-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Custom test matchers for [Vitest](https://vitest.dev/) and [Jest](https://jestjs.io/) to write automated test assertions for Model Context Protocol (MCP) tools.

[Documemtation](https://facetlayer.github.io/expect-mcp/)

## Features

- **Custom Matchers**: Adds `expect()` matchers to assert on MCP interactions.
- **TypeScript Support**: Complete type definitions for all MCP types and matchers.
- **MCP client**: Implements a special MCP client that includes strict protocol validation to catch any errors.

## Latest support:

Currently the library supports:

- Testing **tools** and **resources**. Other MCP capabilities are not supported yet.
- Testing **stdin** protocol servers. HTTP-based servers are not supported yet.
- Integration with **Vitest** and **Jest**.

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

The main import is ESM-based. If you need CommonJS support, use:

```javascript
const { mcpShell } = require('expect-mcp/cjs');
require('expect-mcp/cjs/vitest-setup');
```

See the [Documentation](https://facetlayer.github.io/expect-mcp/) for the full API and more examples.

## Requirements

- Node.js >= 18
- Vitest ^1.5.0 or Jest ^29.0.0

## Feedback

For bugs or feature requests, please use [GitHub Issues](https://github.com/facetlayer/expect-mcp/issues)!

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

[andyfischer](https://github.com/andyfischer)

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - Learn more about MCP
- [Vitest](https://vitest.dev/) - Testing framework supported by this library
- [Jest](https://jestjs.io/) - Testing framework supported by this library
