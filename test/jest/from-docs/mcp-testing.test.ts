import { mcpShell } from '../../../dist/index.js';

const DefaultRequestTimeout = 2000;

describe('MCP Testing Examples', () => {
  test('mcpShell basic usage', async () => {
    const app = mcpShell('node test/sampleServers/server.filesystem.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // Test that the server provides expected tools and resources
    await expect(app).toHaveTool('filesystem_list');
    await expect(app).toHaveResource('project_files');

    // Clean up
    app.close();
  });

  test('File Server MCP provides file operations', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });

    try {
      await app.initialize();

      // Test capabilities
      await expect(app).toHaveTool('read_file');
      await expect(app).toHaveTool('write_file');

      // Test tool execution
      const result = await app.callTool('read_file', {
        path: 'package.json',
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    } finally {
      app.close();
    }
  });
});
