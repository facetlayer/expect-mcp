const {  mcpShell  } = require('../../../dist/cjs/index.cjs');

const DefaultRequestTimeout = 2000;

describe('readResource Examples', () => {
  test('read a resource from the server', async () => {
    const app = mcpShell('node test/sampleServers/server.withResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // Read a text resource
    const result = await app.readResource('file:///example.txt');

    expect(result.contents).toBeDefined();
    expect(result.contents[0].text).toBeDefined();
    expect(result.contents[0].mimeType).toBe('text/plain');

    await app.close();
  });

  test('error handling', async () => {
    const app = mcpShell('node test/sampleServers/server.withResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    try {
      await app.readResource('file:///nonexistent.txt');
    } catch (error) {
      expect(error.name).toBe('ResourceCallError');
    }

    await app.close();
  });
});
