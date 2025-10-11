
# About this project #

`expect-mcp` is a helper library for writing unit tests that test MCP servers. The library
supports Vitest and Jest.

# Development flow #

For all changes:

- Make sure that `pnpm test` has no errors.
- Make sure that `pnpm typecheck` has no errors.
- If you change the public API then make sure to update the corresponding docs, including:
  - src/docs/Agent-How-To-Use-Expect-MCP.md - Single file that describes the entire library.
  - ./docs-site/docs/* - Various files for all the public functions and classes.

# Project outline #

  `src/` - Project source code.
  `specs/` - Spec file documentation for agents.
  `test/` - Functional tests (using Vitest)
  `test/jest/` - Functional tests (using Jest)
  `docs-site/` - The documentation site.
  `docs-site/docs/` - Markdown files covering all public API functions.
  `samples/` - Usage examples of `expect-mcp` with various MCP projects.
  `bin/` - Tools used for project dev work.
