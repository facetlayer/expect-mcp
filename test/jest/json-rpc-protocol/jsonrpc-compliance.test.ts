import { MCPStdinSubprocess, mcpShell } from '../../../dist/index.js';

const DefaultRequestTimeout = 1000;

describe('JSON-RPC 2.0 Compliance', () => {
  describe('jsonrpc field validation', () => {
    let process: MCPStdinSubprocess;

    beforeAll(() => {
      process = mcpShell('node test/sampleServers/server.missingJsonRpcField.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should reject messages missing "jsonrpc" field', async () => {
      await expect(process.initialize()).rejects.toThrow(
        /Response that does not match the JSON-RPC schema/
      );
    });
  });

  describe('request ID validation', () => {
    let process: MCPStdinSubprocess;

    beforeAll(() => {
      process = mcpShell('node test/sampleServers/server.nullRequestId.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should reject requests with null ID', async () => {
      // The server will send a request with null ID after initialization
      // In strict mode, this should be detected and flagged
      await expect(process.initialize()).rejects.toThrow();
    });
  });

  describe('response validation', () => {
    describe('result XOR error', () => {
      let process: MCPStdinSubprocess;

      beforeAll(() => {
        process = mcpShell('node test/sampleServers/server.bothResultAndError.ts', {
          requestTimeout: DefaultRequestTimeout,
        });
      });

      it('should reject response with both result and error', async () => {
        await expect(process.initialize()).rejects.toThrow();
      });
    });

    describe('response ID matching', () => {
      let process: MCPStdinSubprocess;

      beforeAll(() => {
        process = mcpShell('node test/sampleServers/server.mismatchedResponseId.ts', {
          requestTimeout: DefaultRequestTimeout,
        });
      });

      it('should reject response with mismatched ID', async () => {
        await expect(process.initialize()).rejects.toThrow();
      });
    });
  });

  describe('valid JSON-RPC server', () => {
    let process: MCPStdinSubprocess;

    beforeAll(() => {
      process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should accept properly formatted JSON-RPC messages', async () => {
      const result = await process.initialize();
      expect(result).toBeDefined();
      expect(result.serverInfo).toBeDefined();
    });
  });
});
