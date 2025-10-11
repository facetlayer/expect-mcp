# expect-mcp Setup Guide

## Overview

expect-mcp is a testing library designed for testing MCP (Model Context Protocol) integrations. This guide will walk you through setting up a test suite and writing tests for your MCP implementations.

## Setting Up a New Test Suite

### Project Compatibility

Before getting started, check if this project is compatible with expect-mcp. This
library is Node.js based and is installed using a package.json file. If the project
doesn't have a package.json file yet, one will need to be created.

### Project Setup

When figuring out how to integrate expect-mcp, check if the project already uses a test framework:

1. **Check for existing test framework**: Look for `vitest` or `jest` in `package.json` dependencies
2. **Use existing framework if possible**: expect MCP has been tested with both Vitest and Jest
3. **If no framework exists**: Prefer setting up **Vitest** as it's more modern and has better support for ESM

#### Determine Test Directory Location

The test directory varies by project setup. Common locations include:
- `test/`
- `__test__/`
- `__tests__/`

Check the test framework configuration file (`vitest.config.js`, `jest.config.js`, etc.) to determine where test files should be located.

#### Project Structure

Example project structure:

```
your-project/
├── test/              # or __test__/ or __tests__/
│   ├── setup.ts
│   └── your-tests.test.ts
├── vitest.config.ts
├── package.json
└── ...
```

#### Package.json scripts

The test script should also have a "test" command in the "scripts" section of package.json.

If you are adding a test framework to the project, then make sure to add this script.

#### Adding expect-mcp as a dependency

The `expect-mcp` library should be added to package.json as a devDependency.

Find out which package manager is being used by the project and use this
to install the library.

Example using NPM:

```bash
npm install -D expect-mcp
```

#### Vitest config

A typical vitest.config.ts file looks like this:

```
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['test/setup.ts'],
  },
});

```

In the above example, the config uses the default test include rules, and it uses a setup file called `test/setup.ts`.
Your exact config might vary based on the project.

#### Setup file

A typical setup.ts file looks like:

```
import 'expect-mcp/vitest-setup';
```

or:

```
require('expect-mcp/cjs/jest-setup.cjs');
```

Alternative: Instead of having a setup file, you can alternatively import the 'vitest-setup' or 'jest-setup'
module inside each test file.

#### Setup Antipatterns

 - If possible, try NOT to add the test files to the 'exclude' section of tsconfig.json. Ideally they should typecheck.

## Writing Tests

Once the setup is done, this section covers how to write test files.

### Imports

In each test file, you'll need to import the `mcpShell` function from expect-mcp. The import syntax depends on your module system:

**ESM (ECMAScript Modules)**
```javascript
import { mcpShell } from 'expect-mcp';
import 'expect-mcp/vitest-setup'; // Registers custom matchers
```

**CommonJS**
```javascript
const { mcpShell } = require('expect-mcp/cjs');
require('expect-mcp/cjs/vitest-setup'); // Registers custom matchers
```

> **Note**: You may need to use the CommonJS import with Jest, as Jest doesn't support ESM without additional configuration.

### Basic Test Structure

The basic outline of each test is:

 1. Launch the MCP app
 2. Run assertions on it
 3. Close down the app

## API Reference

### Functions

- **`mcpShell(shellCommand, options?): MCPStdinSubprocess`** - Creates and spawns an MCP subprocess over stdin/stdout

#### MCPStdinSubprocess

The MCPStdinSubprocess stores a running stdin process. This is usually named `app`

Methods:

- **`app.initialize(params?)`** - Perform MCP handshake and capability negotiation
- **`app.callTool(name, arguments?): Promise<ToolCallResult>`** - Call a tool on the MCP server
- **`app.readResource(uri): Promise<ReadResourceResult>`** - Read a resource from the MCP server
- **`app.getPrompt(name, arguments?): Promise<GetPromptResult>`** - Get a prompt from the MCP server
- **`app.getTools()`** - Get list of available tools from the server
- **`app.getResources()`** - Get list of available resources from the server
- **`app.getPrompts()`** - Get list of available prompts from the server
- **`app.hasTool(name)`** - Check if a specific tool is available
- **`app.hasResource(name)`** - Check if a specific resource is available
- **`app.hasPrompt(name)`** - Check if a specific prompt is available
- **`app.supportsTools()`** - Check if the server supports tools
- **`app.supportsResources()`** - Check if the server supports resources
- **`app.supportsPrompts()`** - Check if the server supports prompts
- **`app.isInitialized()`** - Check if the MCP server has been initialized
- **`app.close(timeoutMs?)`** - Close the MCP server gracefully
- **`app.waitForExit()`** - Wait for the process to exit and return the exit code

#### ToolCallResult

Returned by `app.callTool()`

Properties:
- **`result.content`** - Array of content blocks returned by the tool
- **`result.structuredContent`** - Structured content if present (optional)
- **`result.isError`** - Boolean indicating if the result represents an error

Methods:
- **`result.getTextContent()`** - Returns the first .text block from the content array
- **`result.expectSuccess()`** - Assert that the result is not an error (throws ToolCallError if isError is true)
- **`result.getContentByType(type)`** - Get all content blocks of a specific type
- **`result.findContentByType(type)`** - Find the first content block of a specific type

#### ReadResourceResult

Returned by `app.readResource()`

Properties:
- **`result.contents`** - Array of resources returned

Methods:
- **`result.getTextContent()`** - Get the text content from the first text resource
- **`result.getBlobContent()`** - Get the blob content from the first blob resource
- **`result.findByUri(uri)`** - Find a resource by its URI
- **`result.getAllTextResources()`** - Get all text resources from the contents array
- **`result.getAllBlobResources()`** - Get all blob resources from the contents array
- **`result.hasTextContent()`** - Check if the result contains any text resources
- **`result.hasBlobContent()`** - Check if the result contains any blob resources

#### GetPromptResult

Returned by `app.getPrompt()`

Properties:
- **`result.messages`** - Array of prompt messages
- **`result.description`** - Description of the prompt (optional)

### Matchers

#### MCP Server Matchers

- **`await expect(app).toHaveTool(toolName)`** - Assert that a tool with the specified name exists
- **`await expect(app).toHaveTools(toolNames[])`** - Assert that all specified tools exist
- **`await expect(app).toHaveResource(resourceName)`** - Assert that a resource with the specified name exists
- **`await expect(app).toHaveResources(resourceNames[])`** - Assert that all specified resources exist
- **`await expect(app).toHavePrompts(promptNames[])`** - Assert that all specified prompts exist

#### Tool Result Matchers

- **`await expect(result).toBeSuccessful()`** - Check that a tool call succeeded (works with ToolCallResult)
- **`await expect(result).toHaveTextContent(text)`** - Check tool result contains exact text
- **`await expect(result).toMatchTextContent(pattern)`** - Check tool result matches a regex pattern

#### Resource Result Matchers

- **`await expect(result).toHaveResourceContent(uri)`** - Check resource has content for a URI
- **`await expect(result).toHaveTextResource(text)`** - Check resource contains exact text

## Debugging Strategies

### Using Console Logging

Console logging typically doesn't work well with MCP servers because it interferes with the JSON messages sent over standard output. However, expect-mcp provides a special debug mode to help with troubleshooting.

#### Enable Debug Logging

When creating your MCP process, set the `allowDebugLogging` flag:

```javascript
test('debugging a failing test', async () => {
  const app = mcpShell('node path/to/your/mcp-server.js', {
    allowDebugLogging: true
  });

  // Your test logic here
  const result = await app.callTool('problematicTool', { args });

  await app.close();
});
```

With this flag enabled:
- Any line your app prints that **isn't valid JSON-RPC** will be printed to the test output
- You can use `console.log()` statements in your MCP server code for debugging
- The debug output will appear when you run the test

Note that debug logging should only be used temporarily for troubleshooting.

Once the debug session is done, you should remove the logs and turn off 'allowDebugLogging'.
This will help ensure that the app does not have any leftover log spam.

## More Details

### How 'initialize' is handled

As part of the MCP protocol, one of the first steps is that the client must send an `initialize` call
to the server.

This call can be handled automatically by expect-mcp if you want.
The library automatically will automaticall call `initialize` if it hasn't been called yet, once you 
call one of the MCP usage functions including:

- Use any matcher (e.g., `toHaveTool`, `toHaveResource`)
- Call methods like `getTools()`, `getResources()`, `callTool()`, or `readResource()`

The initialization happens only once per process, as required by the MCP protocol.

#### Calling `initialize` manually

In your test you can call `await app.initialize()` explicitly if you want.

Some reasons to do this are:

- When you need to inspect the initialization result (server info, capabilities)
- When you want to ensure initialization happens at a specific point in your test
- When you need to pass custom initialization parameters

Example outline:

```javascript
import { beforeAll, test, afterAll } from 'vitest';
import { mcpShell, MCPStdinSubprocess } from 'expect-mcp';
import 'expect-mcp/vitest-setup';

let app: MCPStdinSubprocess;

beforeAll(() => {
    app = mcpShell('path/to/your/server');
});

afterAll(async () => {
    await app.close();
});

describe('MCP Integration Tests', async () => {
  test('should include the expected tools', async () => {
      await expect(app).toHaveTools([ ... ]);
  });

  test('should handle tool calls', async () => {
    const result = await app.callTool(...);

    expect(result).toEqual(...);
  });
});
```
