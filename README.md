# expect-mcp

[![CI](https://github.com/facetlayer/expect-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/facetlayer/expect-mcp/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/expect-mcp.svg)](https://badge.fury.io/js/expect-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Custom test matchers for [Vitest](https://vitest.dev/) and [Jest](https://jestjs.io/) to write automated test assertions for Model Context Protocol (MCP) tools.

[Documentation](https://facetlayer.github.io/expect-mcp/)

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

## Optional: Agentic Setup

If you're using a coding agent like Claude Code or Codex, you can use our builtin prompt
to instruct the agent on how to use the library. Copy-paste this text as the prompt and it should do pretty well:

```
Run `npx -y expect-mcp@latest how-to-use` and follow the instructions to set up tests for this project.
```

## Installation

Steps to install the library the normal way

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

## Documentation

See the [Documentation](https://facetlayer.github.io/expect-mcp/) site for the full API and more examples.

## Requirements

- Node.js >= 20
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
