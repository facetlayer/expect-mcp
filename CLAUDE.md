
# About this project #

`expect-mcp` is a helper library for writing unit tests that test MCP servers. The library
supports Vitest and Jest.

# Development flow #

For all changes:

- Make sure that `pnpm test` has no errors.
- Make sure that `pnpm typecheck` has no errors.

# Project outline #

  `src/` - Project source code
  `test/` - Functional tests (using Vitest)
  `test/jest/` - Functional tests (using Jest)
  `docs-site/` - The documentation site
  `docs-site/docs/` - Markdown files covering all public API functions
  `samples/` - Usage examples of `expect-mcp` with various MCP projects.
