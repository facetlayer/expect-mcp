const {  mcpShell  } = require('../../../dist/cjs/index.cjs');

const DefaultRequestTimeout = 2000;

describe('Matchers Examples', () => {
  test('toHaveTool example - file operations', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveTool('read_file');
    await expect(app).toHaveTool('write_file');

    await app.close();
  });

  test('toHaveResource example - configuration resources', async () => {
    const app = mcpShell('node test/sampleServers/server.configResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveResource('app_config');
    await expect(app).toHaveResource('user_settings');

    await app.close();
  });
});
