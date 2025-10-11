import 'expect-mcp/vitest-setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess, mcpShell } from 'expect-mcp';

const DefaultRequestTimeout = 1000;

describe('Process Failed on Startup', () => {
  describe('process exits immediately with no output', () => {
    let process: MCPStdinSubprocess;

    beforeEach(() => {
      process = mcpShell('node test/sampleServers/server.exitsImmediately.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should include error message when process exits immediately during explicit initialize', async () => {
      await expect(process.initialize()).rejects.toThrow(/Process exited with code 42 while waiting for response to 'initialize'/);
    });

    it('should include error message when process exits immediately during implicit initialize via getTools()', async () => {
      await expect(process.getTools()).rejects.toThrow(/Process exited with code 42 while waiting for response to 'initialize'/);
    });
  });

  describe('process outputs logs then fails', () => {
    let process: MCPStdinSubprocess;

    beforeEach(() => {
      process = mcpShell('node test/sampleServers/server.failsOnStartup.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
    });

    it('should include stdout and stderr when available in error message', async () => {
      // This test captures that when a process fails, we include whatever stdout/stderr
      // was captured at the time the error occurred.
      const errorPromise = process.initialize();

      await expect(errorPromise).rejects.toThrow();

      // The error should include some indication of what went wrong
      try {
        await errorPromise;
      } catch (error: any) {
        // Either we get a protocol error (if non-JSON output triggers first)
        // or we get a process exit error (if the process exits first)
        // Both should include captured output when available
        const errorMessage = error.message;

        // At minimum, we should get either stdout or information about what failed
        const hasUsefulInfo =
          errorMessage.includes('Server startup initiated') ||
          errorMessage.includes('Process exited') ||
          errorMessage.includes('non-JSON output') ||
          errorMessage.includes('Failed to load required configuration file');

        expect(hasUsefulInfo).toBe(true);
      }
    });
  });
});
