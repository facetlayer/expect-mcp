# @facetlayer/expect-mcp

Custom [Vitest](https://vitest.dev/) matchers that make it easier to assert on responses returned by Model Context Protocol (MCP) tools. The helpers in this package focus on the JSON-RPC response envelope shared across MCP integrations so your tests can stay concise and expressive.

## Installation

```bash
pnpm add -D @facetlayer/expect-mcp
```

This package expects Vitest to be available in the consumer project. Make sure you have it installed as either a dependency or devDependency.

## Getting started

Add a single import to your Vitest setup file (or the top of an individual test) to register the matchers automatically:

```ts
import '@facetlayer/expect-mcp/vitest';
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

Need to layer in additional matchers of your own? You can still call `extendExpectWithMCP` to merge custom implementations after the defaults are installed.

```ts
import { extendExpectWithMCP } from '@facetlayer/expect-mcp';

extendExpectWithMCP({
  toMatchCustomShape(received) {
    const pass = isCustomShape(received); // replace with your own predicate
    return {
      pass,
      message: () =>
        pass ? 'Expected value not to match the custom shape.' : 'Expected value to match the custom shape.',
    };
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

## TypeScript support

The package includes TypeScript definitions for `MCPResponse`, `MCPResult`, `MCPContentMessage`, `MCPError`, and the matcher contracts. Import them directly from `@facetlayer/expect-mcp` when you need shared utilities or to build additional matchers on top of the defaults.

## Scripts

- `pnpm run build` — emit compiled JavaScript and declaration files to `dist/`.
- `pnpm run test` — execute Vitest with the custom matchers pre-installed.
- `pnpm run clean` — remove the build output.

## Contributing

1. Clone the repository and install dependencies.
2. Run `pnpm test` to execute the existing matcher tests.
3. Open a PR describing the matcher or enhancement you are proposing.

Issues and feature requests are welcome—if you need additional matchers for your MCP integration, feel free to open a discussion!
