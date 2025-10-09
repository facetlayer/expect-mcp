import 'expect-mcp/vitest-setup';
import { describe, expect, test } from 'vitest';
import { mcpShell } from 'expect-mcp';

const DefaultRequestTimeout = 2000;

describe('readResource', () => {
  test('can read a text resource', async () => {
    const app = mcpShell('node test/sampleServers/server.withResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const result = await app.readResource('file:///example.txt');

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(1);
    expect(result.content[0].uri).toBe('file:///example.txt');
    expect(result.content[0].mimeType).toBe('text/plain');
    expect('text' in result.content[0]).toBe(true);
    if ('text' in result.content[0]) {
      expect(result.content[0].text).toBe('Hello, world!');
    }

    app.close();
  });

  test('can read a JSON resource', async () => {
    const app = mcpShell('node test/sampleServers/server.withResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    const result = await app.readResource('file:///data.json');

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(1);
    expect(result.content[0].uri).toBe('file:///data.json');
    expect(result.content[0].mimeType).toBe('application/json');
    expect('text' in result.content[0]).toBe(true);
    if ('text' in result.content[0]) {
      const data = JSON.parse(result.content[0].text);
      expect(data).toEqual({ key: 'value' });
    }

    app.close();
  });

  test('throws error when resource does not exist', async () => {
    const app = mcpShell('node test/sampleServers/server.withResources.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app.readResource('file:///nonexistent.txt')).rejects.toThrow(
      'Resource with URI file:///nonexistent.txt not declared in resources/list'
    );

    app.close();
  });

  test('throws error when server does not support resources', async () => {
    const app = mcpShell('node test/sampleServers/server.fileOperations.ts', {
      requestTimeout: DefaultRequestTimeout,
    });
    await app.initialize();

    await expect(app.readResource('file:///example.txt')).rejects.toThrow(
      'Resources are not supported by the server'
    );

    app.close();
  });
});
