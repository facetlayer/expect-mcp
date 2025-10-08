import 'expect-mcp/vitest-setup';
import { describe, expect, it } from 'vitest';
import { mcpShell } from 'expect-mcp';

const DefaultRequestTimeout = 1000;
const CloseTimeout = 2000;

describe('Close Flow', () => {
  describe('graceful close', () => {
    it('should close a server gracefully after initialization', async () => {
      const process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });

      await process.initialize();
      expect(process.isInitialized()).toBe(true);
      expect(process.hasExited()).toBe(false);

      // Close the server
      await process.close(CloseTimeout);

      // Verify the server has exited
      expect(process.hasExited()).toBe(true);
      expect(process.exitCode()).toBe(0);
    });

    it('should close a server gracefully without initialization', async () => {
      const process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });

      // Wait for spawn before closing
      await process.waitForStart();
      expect(process.hasExited()).toBe(false);

      // Close the server without initializing
      await process.close(CloseTimeout);

      // Verify the server has exited
      expect(process.hasExited()).toBe(true);
    });

    it('should handle close on already exited process', async () => {
      const process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });

      await process.initialize();
      await process.close(CloseTimeout);

      // Close again - should not throw
      await expect(process.close(CloseTimeout)).resolves.toBeUndefined();
    });
  });

  describe('server that does not respond to close', () => {
    it('should timeout and kill server that ignores stdin close', async () => {
      const process = mcpShell('node test/sampleServers/server.ignoreClose.ts', {
        requestTimeout: DefaultRequestTimeout,
      });

      await process.initialize();
      expect(process.hasExited()).toBe(false);

      // Attempt to close - should timeout
      await expect(process.close(1000)).rejects.toThrow(
        /Server did not exit gracefully within 1000ms/
      );

      // Wait for the kill to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the server was killed forcefully
      expect(process.hasExited()).toBe(true);
    }, 5000);
  });

  describe('close with tools capability', () => {
    it('should close server with tools capability gracefully', async () => {
      const process = mcpShell('node test/sampleServers/server.withTools.ts', {
        requestTimeout: DefaultRequestTimeout,
      });

      await process.initialize();

      // Verify tools capability
      const result = process.getInitializeResult();
      expect(result?.capabilities.tools).toBeDefined();

      // Close the server
      await process.close(CloseTimeout);

      // Verify the server has exited
      expect(process.hasExited()).toBe(true);
      expect(process.exitCode()).toBe(0);
    });
  });

  describe('close with resources capability', () => {
    it('should close server with resources capability gracefully', async () => {
      const process = mcpShell('node test/sampleServers/server.withResources.ts', {
        requestTimeout: DefaultRequestTimeout,
      });

      await process.initialize();

      // Verify resources capability
      const result = process.getInitializeResult();
      expect(result?.capabilities.resources).toBeDefined();

      // Close the server
      await process.close(CloseTimeout);

      // Verify the server has exited
      expect(process.hasExited()).toBe(true);
      expect(process.exitCode()).toBe(0);
    });
  });
});
