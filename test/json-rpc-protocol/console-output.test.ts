import { describe, expect, it, beforeAll } from 'vitest';
import { MCPStdinSubprocess, shellCommand } from '../../src';
import '../../src/vitest-setup.js';

  it('should reject servers that output non-JSON-RPC debug logs to stdout', async () => {
    let process = shellCommand('node test/sampleServers/server.debugLogging.ts', { });

    // Server outputs debug logs to stdout which violates the spec
    await expect(process.initialize()).rejects.toThrow();
  });

  it('allows non-JSON-RPC debug logs to stdout if allowDebugLogging is true', async () => {
    let process = shellCommand('node test/sampleServers/server.debugLogging.ts', { allowDebugLogging: true });
    await process.initialize();
  });

    it('should accept servers that only output valid JSON-RPC to stdout', async () => {
      const process = shellCommand('node test/sampleServers/server.noCapabilities.ts', {});
      const result = await process.initialize();
      expect(result).toBeDefined();
    });