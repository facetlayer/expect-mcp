const {  mcpShell  } = require('../../../dist/cjs/index.cjs');

const DefaultRequestTimeout = 2000;

describe('mcpShell Examples', () => {
  test('server provides expected tools', async () => {
    const app = mcpShell('node test/sampleServers/server.filesystem.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveTool('filesystem_list');
    await expect(app).toHaveResource('project_files');

    app.close();
  });

  test('with options - requestTimeout and allowDebugLogging', async () => {
    const app = mcpShell('node test/sampleServers/server.withTools.ts', {
      requestTimeout: 5000,
      allowDebugLogging: false,
    });

    await app.initialize();
    app.close();
  });

  test('getTools method', async () => {
    const app = mcpShell('node test/sampleServers/server.withTools.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const tools = await app.getTools();
    expect(tools.map(t => t.name)).toContain('echo');
    expect(tools.map(t => t.name)).toContain('add');

    app.close();
  });

  test('getResources method', async () => {
    const app = mcpShell('node test/sampleServers/server.withResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const resources = await app.getResources();
    expect(resources.map(r => r.name)).toContain('example.txt');

    app.close();
  });

  test('hasTool method', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const hasReadFile = await app.hasTool('read_file');
    expect(hasReadFile).toBe(true);

    app.close();
  });

  test('hasResource method', async () => {
    const app = mcpShell('node test/sampleServers/server.configResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const hasConfig = await app.hasResource('app_config');
    expect(hasConfig).toBe(true);

    app.close();
  });

  test('callTool method', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const result = await app.callTool('read_file', {
      path: '/path/to/file.txt',
    });

    expect(result.content).toBeDefined();

    app.close();
  });

  test('isInitialized method', async () => {
    const app = mcpShell('node test/sampleServers/server.withTools.ts', {
      requestTimeout: DefaultRequestTimeout,
    });

    expect(app.isInitialized()).toBe(false);

    await app.initialize();

    expect(app.isInitialized()).toBe(true);

    app.close();
  });
});
