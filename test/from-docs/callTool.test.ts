import { describe, expect, test } from 'vitest';
import { mcpShell } from '../../src/index.js';

const DefaultRequestTimeout = 2000;

describe('callTool Examples', () => {
  test('call a tool on the server', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // Call the read_file tool
    const result = await app.callTool('read_file', {
      path: '/path/to/file.txt',
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();

    app.close();
  });

  test('error handling - tool call fails', async () => {
    const app = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // Trying to call a tool on a server without tools capability
    await expect(app.callTool('nonexistent_tool', {})).rejects.toThrow();

    app.close();
  });

  test('timeout configuration', async () => {
    const app = mcpShell('node test/sampleServers/server.withTools.ts', {
      requestTimeout: 30000, // 30 seconds
    });

    await app.initialize();

    const result = await app.callTool('echo', { message: 'test' });
    expect(result.content).toBeDefined();

    app.close();
  });

  test('debug logging enabled', async () => {
    const app = mcpShell('node test/sampleServers/server.withTools.ts', {
      allowDebugLogging: true,
      requestTimeout: DefaultRequestTimeout,
    });

    await app.initialize();
    const result = await app.callTool('echo', { message: 'test' });
    expect(result.content).toBeDefined();

    app.close();
  });
});
