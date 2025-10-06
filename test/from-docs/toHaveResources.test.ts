import '../../src/vitest-setup.js';
import { describe, expect, test } from 'vitest';
import { mcpShell } from '../../src/index.js';

const DefaultRequestTimeout = 2000;

describe('toHaveResources Examples', () => {
  test('server provides configuration resources', async () => {
    const app = mcpShell('node test/sampleServers/server.configResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHaveResources(['app_config', 'user_settings']);

    app.close();
  });

  test('error messages when any resource does not exist', async () => {
    const app = mcpShell('node test/sampleServers/server.configResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    // This should fail because the resource doesn't exist
    await expect(expect(app).toHaveResources(['app_config', 'nonexistent_resource'])).rejects.toThrow();

    app.close();
  });
});
