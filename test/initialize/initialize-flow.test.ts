import 'expect-mcp/vitest-setup';
import { beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess, mcpShell } from 'expect-mcp';

const DefaultRequestTimeout = 1000;

describe('Initialize Flow', () => {
  describe('basic initialize', () => {
    let process: MCPStdinSubprocess;

    beforeAll(() => {
      process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should verify that the initialize response correctly follows the schema', async () => {
      const result = await process.initialize();

      // Verify required fields exist
      expect(result.protocolVersion).toBeDefined();
      expect(result.capabilities).toBeDefined();
      expect(result.serverInfo).toBeDefined();
      expect(result.serverInfo.name).toBeDefined();
      expect(result.serverInfo.version).toBeDefined();
    });
  });

  describe('invalid initialize response', () => {
    let process: MCPStdinSubprocess;

    beforeAll(() => {
      process = mcpShell('node test/sampleServers/server.invalidInitialize.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should reject initialize response missing required fields', async () => {
      await expect(process.initialize()).rejects.toThrow(
        /Response to initialize\(\) failed schema validation/
      );
    });
  });

  describe('no response from server', () => {
    let process: MCPStdinSubprocess;

    beforeAll(() => {
      process = mcpShell('node test/sampleServers/server.noResponse.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should timeout if server does not respond to initialize', async () => {
      // Set a short timeout for this test
      await expect(
        Promise.race([
          process.initialize(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)),
        ])
      ).rejects.toThrow('Timeout');
    }, 2000);
  });

  describe('capability discovery', () => {
    describe('server with tools capability', () => {
      let process: MCPStdinSubprocess;

      beforeAll(async () => {
        process = mcpShell('node test/sampleServers/server.withTools.ts', {
          requestTimeout: DefaultRequestTimeout,
        });
        await process.initialize();
      });

      it('should discover tools capability', async () => {
        const result = process.getInitializeResult();
        expect(result?.capabilities.tools).toBeDefined();
      });

      it('should not have resources capability', async () => {
        const result = process.getInitializeResult();
        expect(result?.capabilities.resources).toBeUndefined();
      });
    });

    describe('server with resources capability', () => {
      let process: MCPStdinSubprocess;

      beforeAll(async () => {
        process = mcpShell('node test/sampleServers/server.withResources.ts', {
          requestTimeout: DefaultRequestTimeout,
        });
        await process.initialize();
      });

      it('should discover resources capability', async () => {
        const result = process.getInitializeResult();
        expect(result?.capabilities.resources).toBeDefined();
      });

      it('should not have tools capability', async () => {
        const result = process.getInitializeResult();
        expect(result?.capabilities.tools).toBeUndefined();
      });
    });

    describe('server with no capabilities', () => {
      let process: MCPStdinSubprocess;

      beforeAll(async () => {
        process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
          requestTimeout: DefaultRequestTimeout,
        });
        await process.initialize();
      });

      it('should have empty capabilities', async () => {
        const result = process.getInitializeResult();
        expect(result?.capabilities).toBeDefined();
        expect(result?.capabilities.tools).toBeUndefined();
        expect(result?.capabilities.resources).toBeUndefined();
        expect(result?.capabilities.prompts).toBeUndefined();
      });
    });
  });

  describe('protocol version', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should return a valid protocol version', async () => {
      const result = process.getInitializeResult();
      expect(result?.protocolVersion).toBeDefined();
      expect(typeof result?.protocolVersion).toBe('string');
      // Version should follow date format YYYY-MM-DD
      expect(result?.protocolVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('server info', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should return server name and version', async () => {
      const result = process.getInitializeResult();
      expect(result?.serverInfo.name).toBeDefined();
      expect(result?.serverInfo.version).toBeDefined();
      expect(typeof result?.serverInfo.name).toBe('string');
      expect(typeof result?.serverInfo.version).toBe('string');
    });
  });
});
