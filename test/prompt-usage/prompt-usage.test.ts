import 'expect-mcp/vitest-setup';
import { describe, expect, test } from 'vitest';
import { mcpShell } from 'expect-mcp';

const DefaultRequestTimeout = 2000;

describe('Prompt usage', () => {
  test('server provides prompts', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const prompts = await app.getPrompts();
    expect(prompts).toHaveLength(2);
    expect(prompts[0].name).toBe('code_review');
    expect(prompts[1].name).toBe('summarize');

    await app.close();
  });

  test('hasPrompt returns true for existing prompt', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const has = await app.hasPrompt('code_review');
    expect(has).toBe(true);

    await app.close();
  });

  test('hasPrompt returns false for non-existent prompt', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const has = await app.hasPrompt('nonexistent');
    expect(has).toBe(false);

    await app.close();
  });

  test('getPrompt returns prompt messages', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const result = await app.getPrompt('code_review', { code: 'function test() {}' });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].content.type).toBe('text');

    await app.close();
  });

  test('getPrompt with arguments', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const result = await app.getPrompt('summarize', {
      text: 'Long text here',
      length: '100',
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');

    await app.close();
  });

  test('getPrompt throws error for non-existent prompt', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app.getPrompt('nonexistent')).rejects.toThrow('Prompt nonexistent not declared');

    await app.close();
  });

  test('toHavePrompts matcher', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app).toHavePrompts(['code_review', 'summarize']);

    await app.close();
  });

  test('toHavePrompts fails for missing prompt', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(expect(app).toHavePrompts(['code_review', 'nonexistent'])).rejects.toThrow();

    await app.close();
  });

  test('supportsPrompts returns true', async () => {
    const app = mcpShell('node test/sampleServers/server.withPrompts.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const supports = await app.supportsPrompts();
    expect(supports).toBe(true);

    await app.close();
  });

  test('supportsPrompts returns false when not supported', async () => {
    const app = mcpShell('node test/sampleServers/server.withTools.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const supports = await app.supportsPrompts();
    expect(supports).toBe(false);

    await app.close();
  });

  test('getPrompt throws error when prompt not declared', async () => {
    const app = mcpShell('node test/sampleServers/server.promptsNotListed.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app.getPrompt('anyPrompt')).rejects.toThrow(
      'Prompt anyPrompt not declared in prompts/list'
    );

    await app.close();
  });
});
