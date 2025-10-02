# MCP Server Samples

This directory contains sample test suites for various MCP servers using Docker containers.

## DockerMcpRunner

The `DockerMcpRunner` utility helps build and launch Docker-based MCP servers for testing.

### Basic Usage

```typescript
import { DockerMcpRunner } from './dockerMcpRunner.js';

const app = await DockerMcpRunner.buildAndLaunch({
  projectDir: __dirname,
  imageName: 'my-mcp-server:latest',
});

await app.initialize();
```

### Environment Variables

Pass environment variables to the Docker container using the `env` option:

```typescript
const app = await DockerMcpRunner.buildAndLaunch({
  projectDir: __dirname,
  imageName: 'github-mcp:latest',
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
    DEBUG: 'true',
  },
});
```

The environment variables will be passed to the Docker container using `-e` flags.

### Options

- `projectDir` - Directory containing the Dockerfile
- `imageName` - Name for the Docker image
- `verbose` - Enable verbose build output (optional)
- `allowDebugLogging` - Allow debug logging from the MCP server (optional)
- `env` - Environment variables to pass to the container (optional)

## Sample Servers

### ✅ Working Samples

- **filesystem-server** - Tests filesystem operations (read, write, list, etc.)
- **memory-server** - Tests knowledge graph operations (entities, relations, observations)

### ⚠️ Samples with Known Issues

- **git-server** - Python-based, has protocol compatibility issues
- **everything-server** - Has initialization issues with `roots` capability
- **fetch-server** - Python-based, not yet tested
- **github-server** - Requires `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable

## Running Tests

To run sample tests:

```bash
# Run all samples (from project root, excluding samples by default)
pnpm test

# Run specific sample
pnpm vitest run --config samples/vitest.config.ts samples/filesystem-server/filesystem.test.ts

# Run with GitHub token
GITHUB_PERSONAL_ACCESS_TOKEN=your_token pnpm vitest run --config samples/vitest.config.ts samples/github-server/github.test.ts
```

## Adding New Samples

1. Create a new directory in `samples/`
2. Add a `Dockerfile` that installs and runs the MCP server
3. Create a test file (e.g., `server-name.test.ts`)
4. Use `DockerMcpRunner.buildAndLaunch()` to start the server
5. Write tests using the expect-mcp matchers

Example structure:

```
samples/
  your-server/
    Dockerfile
    your-server.test.ts
```
