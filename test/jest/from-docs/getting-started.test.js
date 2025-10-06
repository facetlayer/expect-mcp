const {  mcpShell  } = require('../../../dist/cjs/index.cjs');

const DefaultRequestTimeout = 2000;

describe('Getting Started Examples', () => {
  test('server provides expected tools', async () => {
    const app = mcpShell('node test/sampleServers/server.filesystem.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveTool('filesystem_list');
    await expect(app).toHaveResource('config.json');

    await app.close();
  });
});
