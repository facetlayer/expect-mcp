import { describe, expect, test } from 'vitest';
import { mcpShell } from '../../src/index.js';

const DefaultRequestTimeout = 2000;

describe('toHaveResource Examples', () => {
  test('server provides configuration resources', async () => {
    const app = mcpShell('node test/sampleServers/server.configResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveResource('app_config');
    await expect(app).toHaveResource('user_settings');

    app.close();
  });

  test('error messages when resource does not exist', async () => {
    const app = mcpShell('node test/sampleServers/server.configResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // This should fail because the resource doesn't exist
    await expect(expect(app).toHaveResource('nonexistent_resource')).rejects.toThrow();

    app.close();
  });
});
