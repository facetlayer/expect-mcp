# Documentation Setup

This project now includes a Docusaurus documentation site that provides comprehensive API documentation for the expect-mcp library.

## Local Development

To run the documentation site locally:

```bash
pnpm --dir docs-site install
pnpm --dir docs-site start
```

This will start the development server at `http://localhost:3000/`

## Building for Production

To build the static documentation site:

```bash
pnpm --dir docs-site build
```

The built site will be in the `docs-site/build/` directory.

## Documentation Structure

- `/` - Introduction and overview (from intro.md)
- `/getting-started` - Setup and basic usage guide
- `/api/matchers` - Custom Vitest matchers documentation
- `/api/mcp-testing` - MCP server testing utilities
- `/api/strict-mode` - Strict mode validation features
- `/api/types` - TypeScript type definitions

## GitHub Pages Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by the GitHub Actions workflow at `.github/workflows/docs.yml`.

## Features

- **Complete API Documentation**: Every public function and type is documented
- **Interactive Examples**: Code examples for all matchers and utilities
- **Search**: Built-in search functionality
- **Mobile-Friendly**: Responsive design that works on all devices
- **Dark Mode**: Automatic dark/light theme switching

## Content Sources

The documentation content is derived from:
- README.md (project overview)
- Source code TypeScript interfaces and exports
- Inline JSDoc comments (when available)
- Custom written explanations and examples

## Updating Documentation

To update the documentation:

1. Edit the markdown files in the `docs-site/docs/` directory
2. For API changes, update both the source code and corresponding documentation
3. Test locally with `pnpm --dir docs-site start`
4. Commit and push to automatically deploy via GitHub Actions
