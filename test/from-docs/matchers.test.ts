import { describe, expect, test } from 'vitest';
import { mcpShell } from '../../src/index.js';

const DefaultRequestTimeout = 2000;

describe('Matchers Examples', () => {
  test('toHaveTool example - file operations', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveTool('read_file');
    await expect(app).toHaveTool('write_file');

    app.close();
  });

  test('toHaveResource example - configuration resources', async () => {
    const app = mcpShell('node test/sampleServers/server.configResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveResource('app_config');
    await expect(app).toHaveResource('user_settings');

    app.close();
  });
});
