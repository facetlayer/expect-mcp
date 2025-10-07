# expect MCP Setup Guide

## Overview

expect-mcp is a testing library designed for testing MCP (Model Context Protocol) integrations. This guide will walk you through setting up a test suite and writing tests for your MCP implementations.

## Installation

```bash
# Add installation instructions here
npm install expect-mcp
```

## Setting Up a New Test Suite

### Initial Setup

Before setting up expect MCP, check if the project already uses a test framework:

1. **Check for existing test framework**: Look for `vitest` or `jest` in `package.json` dependencies
2. **Use existing framework if possible**: expect MCP has been tested with both Vitest and Jest
3. **If no framework exists**: Prefer setting up **Vitest** as it's more modern and has better support for ESM

### Determine Test Directory Location

The test directory varies by project setup. Common locations include:
- `test/`
- `__test__/`
- `__tests__/`

Check the test framework configuration file (`vitest.config.js`, `jest.config.js`, etc.) to determine where test files should be located.

### Project Structure

```
your-project/
├── test/              # or __test__/ or __tests__/
│   ├── setup.js
│   └── your-tests.test.js
├── vitest.config.js   # or jest.config.js
├── package.json
└── ...
```

### Importing expect MCP

In each test file, you'll need to import expect MCP. The import syntax depends on your module system:

**ESM (ECMAScript Modules)**
```javascript
import { expectMCP } from 'expect-mcp';
```

**CommonJS**
```javascript
const { expectMCP } = require('expect-mcp/cjs');
```

> **Note**: You may need to use the CommonJS import with Jest, as Jest doesn't support ESM without a plugin.

## Writing Tests

### Basic Test Structure

Each test needs to create an MCP app and run tests against it. For standard Node-based MCP servers, use `MCPShell` to launch the process.

#### Launching the MCP Server

```javascript
import { MCPShell } from 'expect-mcp';

describe('MCP Integration Tests', () => {
  test('should handle basic MCP operation', async () => {
    // Launch the subprocess with a shell string
    const app = await MCPShell('node path/to/your/mcp-server.js');
    
    // Optional: Wait for MCP initialize handshake
    // (Not required - initialize is called automatically when you start working with the process)
    await app.initialize();
    
    // Run your tests here
    // await app.callTool(...);
    // await app.readResource(...);
    
    // IMPORTANT: Always close the process when finished
    await app.close();
  });
});
```

### Test Setup Patterns

#### Pattern 1: Single Process, Multiple Test Cases (Recommended)

Load the process once and interact with it multiple times across test cases:

```javascript
describe('MCP Server Tests', () => {
  let app;
  
  beforeAll(async () => {
    app = await MCPShell('node path/to/your/mcp-server.js');
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  test('test case 1', async () => {
    const result = await app.callTool('toolName', { args });
    // assertions...
  });
  
  test('test case 2', async () => {
    const resource = await app.readResource('resourceUri');
    // assertions...
  });
});
```

#### Pattern 2: Multiple Process Launches

If your tests require isolated process states, you can launch the process multiple times:

```javascript
describe('MCP Server Tests', () => {
  test('isolated test 1', async () => {
    const app = await MCPShell('node path/to/your/mcp-server.js');
    
    // Test logic...
    
    await app.close();
  });
  
  test('isolated test 2', async () => {
    const app = await MCPShell('node path/to/your/mcp-server.js');
    
    // Test logic...
    
    await app.close();
  });
});
```

### Writing Test Cases

#### Recommended First Test: Verify Tools and Resources

A great starting point is to verify that your MCP server declares the expected tools and resources:

```javascript
test('should declare expected tools', async () => {
  const app = await MCPShell('node path/to/your/mcp-server.js');
  
  expect(app).toHaveTools(['toolName1', 'toolName2', 'toolName3']);
  
  await app.close();
});
```

This ensures your app is properly advertising its capabilities through the MCP protocol.

#### Testing Tool Interactions

Once you've verified the tools exist, test their actual behavior:

```javascript
test('should execute tool correctly', async () => {
  const app = await MCPShell('node path/to/your/mcp-server.js');
  
  // Call the tool using the MCP protocol
  const result = await app.callTool('toolName', {
    param1: 'value1',
    param2: 'value2'
  });
  
  // Write assertions on the result
  expect(result).toBeDefined();
  expect(result.data).toMatchObject({
    // expected structure
  });
  
  await app.close();
});
```

#### Testing Side Effects

If your tool has side effects on external systems or the file system, verify those effects:

```javascript
import { existsSync, readFileSync } from 'fs';

test('should create file with correct content', async () => {
  const app = await MCPShell('node path/to/your/mcp-server.js');
  
  const result = await app.callTool('createFile', {
    path: '/tmp/test-file.txt',
    content: 'Hello, World!'
  });
  
  // Verify the tool call succeeded
  expect(result.success).toBe(true);
  
  // Verify the side effect occurred
  expect(existsSync('/tmp/test-file.txt')).toBe(true);
  expect(readFileSync('/tmp/test-file.txt', 'utf-8')).toBe('Hello, World!');
  
  await app.close();
});
```

#### Testing Data Retrieval

For tools that return data without side effects, focus on validating the result:

```javascript
test('should return correct data', async () => {
  const app = await MCPShell('node path/to/your/mcp-server.js');
  
  const result = await app.callTool('getData', { id: 123 });
  
  // Verify the structure and content of returned data
  expect(result).toHaveProperty('data');
  expect(result.data.id).toBe(123);
  expect(result.data.name).toBe('Expected Name');
  expect(result.data.status).toBe('active');
  
  await app.close();
});
```

## Debugging Strategies

### Using Console Logging

Console logging typically doesn't work well with MCP servers because it interferes with the JSON messages sent over standard output. However, expect MCP provides a special debug mode to help with troubleshooting.

#### Enable Debug Logging

When creating your MCP process, set the `enableDebugLogging` flag:

```javascript
test('debugging a failing test', async () => {
  const app = await MCPShell('node path/to/your/mcp-server.js', {
    enableDebugLogging: true
  });
  
  // Your test logic here
  const result = await app.callTool('problematicTool', { args });
  
  await app.close();
});
```

With this flag enabled:
- Any line your app prints that **isn't JSON** will be printed to the test output
- You can use `console.log()` statements in your MCP server code for debugging
- The debug output will appear when you run the test

#### Important: Temporary Use Only

> **⚠️ Warning**: Debug logging should only be used temporarily for troubleshooting.
>
> - **Do not commit** tests with `enableDebugLogging: true` enabled
> - **Do not leave** this flag in production test suites
> - Keeping it disabled enforces that your app doesn't produce extra line output
> - Helps prevent spammy debug logs in your codebase

Use debug logging to understand runtime behavior when a test fails, then remove the flag once you've identified and fixed the issue.

## Core Concepts

- **MCP Integration Testing**: Testing the interaction between your code and MCP services
- **Test Setup**: Configuring the environment for testing
- **Assertions**: Validating expected behavior

## Next Steps

- Add specific test examples
- Configure advanced options
- Set up CI/CD integration

---

*This documentation is a work in progress. Additional details will be added as the library develops.*
