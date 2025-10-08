import 'expect-mcp/vitest-setup';
import { describe, expect, test } from 'vitest';
import { mcpShell } from 'expect-mcp';

const DefaultRequestTimeout = 2000;

describe('toHaveTool Examples', () => {
  test('server provides file operations', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveTool('read_file');
    await expect(app).toHaveTool('write_file');

    app.close();
  });

  test('error messages when tool does not exist', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // This should fail because the tool doesn't exist
    await expect(expect(app).toHaveTool('nonexistent_tool')).rejects.toThrow();

    app.close();
  });
});
