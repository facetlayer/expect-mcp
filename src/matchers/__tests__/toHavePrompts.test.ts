import 'expect-mcp/vitest-setup';
import { describe, expect, test } from 'vitest';
import { mcpShell } from 'expect-mcp';

const DefaultRequestTimeout = 2000;

describe('toHavePrompts matcher', () => {
  test('passes when all prompts exist', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHavePrompts(['code_review', 'summarize']);

    await app.close();
  });

  test('fails when any prompt does not exist', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(expect(app).toHavePrompts(['code_review', 'nonexistent'])).rejects.toThrow();

    await app.close();
  });

  test('passes when checking single prompt', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHavePrompts(['code_review']);

    await app.close();
  });

  test('passes when checking empty array', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHavePrompts([]);

    await app.close();
  });
});
