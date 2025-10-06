import { mcpShell } from '../../../dist/index.js';

const DefaultRequestTimeout = 2000;

describe('toHaveTools Examples', () => {
  test('server provides file operations', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveTools(['read_file', 'write_file']);

    app.close();
  });

  test('error messages when any tool does not exist', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // This should fail because the tool doesn't exist
    await expect(expect(app).toHaveTools(['read_file', 'nonexistent_tool'])).rejects.toThrow();

    app.close();
  });
});
