import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';
import { MCPStdinSubprocess, shellCommand } from '../../dist';
import '../../dist/vitest-setup.js';

let process: MCPStdinSubprocess;

beforeAll(() => {
  process = shellCommand('node test/sampleServers/server.invalidInitialize.ts', {
    strictMode: true,
  });
});

it('should reject initialize response missing required fields', async () => {
  await expect(process.initialize()).rejects.toThrow(
    'Strict mode: Initialize response validation failed'
  );
});