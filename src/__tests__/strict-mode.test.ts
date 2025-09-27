import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MCPStdinSubprocess } from '../MCPStdinSubprocess.js';
import '../vitest-setup.js';

describe('MCPStdinSubprocess Strict Mode', () => {
  let mcpSubprocess: MCPStdinSubprocess;

  beforeEach(() => {
    mcpSubprocess = new MCPStdinSubprocess({
      strictMode: true,
      command: 'echo',
      args: ['test'],
    });
  });

  describe('Construction and Configuration', () => {
    it('should enable strict mode when configured', () => {
      const strictMcp = new MCPStdinSubprocess({ strictMode: true });
      expect(strictMcp.isStrictModeEnabled()).toBe(true);
    });

    it('should disable strict mode by default', () => {
      const defaultMcp = new MCPStdinSubprocess();
      expect(defaultMcp.isStrictModeEnabled()).toBe(false);
    });

    it('should explicitly disable strict mode when set to false', () => {
      const nonStrictMcp = new MCPStdinSubprocess({ strictMode: false });
      expect(nonStrictMcp.isStrictModeEnabled()).toBe(false);
    });
  });

  describe('JSON-RPC Validation', () => {
    it('should validate valid JSON-RPC responses in strict mode', () => {
      const validResponse = {
        jsonrpc: '2.0',
        id: 'test-123',
        result: {
          protocolVersion: '2025-06-18',
          capabilities: {},
          serverInfo: {
            name: 'test-server',
            version: '1.0.0',
          },
        },
      };

      expect(() => {
        (mcpSubprocess as any).validateStrictModeResponse(validResponse);
      }).not.toThrow();
    });

    it('should reject invalid JSON-RPC responses in strict mode', () => {
      const invalidResponse = {
        // Missing required jsonrpc field
        id: 'test-123',
        result: {},
      };

      expect(() => {
        (mcpSubprocess as any).validateStrictModeResponse(invalidResponse);
      }).toThrow('Strict mode: Invalid JSON-RPC response');
    });

    it('should reject non-JSON strings in strict mode', () => {
      const nonJsonString = 'this is not json';

      expect(() => {
        (mcpSubprocess as any).validateStrictModeResponse(nonJsonString);
      }).toThrow('Strict mode: Response is not valid JSON');
    });

    it('should validate valid JSON-RPC notifications in strict mode', () => {
      const validNotification = {
        jsonrpc: '2.0',
        method: 'notifications/message',
        params: {
          level: 'info',
          data: 'Test message',
        },
      };

      expect(() => {
        (mcpSubprocess as any).validateStrictModeNotification(validNotification);
      }).not.toThrow();
    });

    it('should reject invalid JSON-RPC notifications in strict mode', () => {
      const invalidNotification = {
        // Missing required method field
        jsonrpc: '2.0',
        params: {},
      };

      expect(() => {
        (mcpSubprocess as any).validateStrictModeNotification(invalidNotification);
      }).toThrow('Strict mode: Invalid JSON-RPC notification');
    });
  });

  describe('Initialize Response Validation', () => {
    it('should validate correct initialize response structure', async () => {
      const mockSendRequest = vi.fn().mockResolvedValue({
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        serverInfo: {
          name: 'test-server',
          version: '1.0.0',
        },
      });

      mcpSubprocess.sendRequest = mockSendRequest;
      mcpSubprocess.waitForStart = vi.fn().mockResolvedValue(undefined);

      await expect(mcpSubprocess.initialize()).resolves.not.toThrow();
    });

    it('should reject initialize response missing required fields', async () => {
      const mockSendRequest = vi.fn().mockResolvedValue({
        // Missing required protocolVersion field
        capabilities: {},
        serverInfo: {
          name: 'test-server',
          version: '1.0.0',
        },
      });

      mcpSubprocess.sendRequest = mockSendRequest;
      mcpSubprocess.waitForStart = vi.fn().mockResolvedValue(undefined);

      await expect(mcpSubprocess.initialize()).rejects.toThrow(
        'Strict mode: Initialize response validation failed'
      );
    });

    it('should reject initialize response with wrong field types', async () => {
      const mockSendRequest = vi.fn().mockResolvedValue({
        protocolVersion: 123, // Should be string
        capabilities: {},
        serverInfo: {
          name: 'test-server',
          version: '1.0.0',
        },
      });

      mcpSubprocess.sendRequest = mockSendRequest;
      mcpSubprocess.waitForStart = vi.fn().mockResolvedValue(undefined);

      await expect(mcpSubprocess.initialize()).rejects.toThrow(
        'Strict mode: Initialize response validation failed'
      );
    });

    it('should accept valid optional fields in initialize response', async () => {
      const mockSendRequest = vi.fn().mockResolvedValue({
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: true, listChanged: false },
          prompts: { listChanged: true },
          logging: {},
        },
        serverInfo: {
          name: 'test-server',
          version: '1.0.0',
          title: 'Test Server Title',
        },
        instructions: 'This is a test server for MCP protocol validation.',
      });

      mcpSubprocess.sendRequest = mockSendRequest;
      mcpSubprocess.waitForStart = vi.fn().mockResolvedValue(undefined);

      await expect(mcpSubprocess.initialize()).resolves.not.toThrow();
    });
  });

  describe('Protocol Version Handling', () => {
    it('should use latest protocol version by default', async () => {
      const mockSendRequest = vi.fn().mockResolvedValue({
        protocolVersion: '2025-06-18',
        capabilities: {},
        serverInfo: { name: 'test', version: '1.0' },
      });

      mcpSubprocess.sendRequest = mockSendRequest;
      mcpSubprocess.waitForStart = vi.fn().mockResolvedValue(undefined);

      await mcpSubprocess.initialize();

      expect(mockSendRequest).toHaveBeenCalledWith('initialize',
        expect.objectContaining({
          protocolVersion: '2025-06-18',
        })
      );
    });
  });

  describe('Error Handling in Strict Mode', () => {
    it('should provide detailed error messages for validation failures', () => {
      const invalidData = {
        jsonrpc: '1.0', // Wrong version
        id: 'test',
        result: {},
      };

      expect(() => {
        (mcpSubprocess as any).validateStrictModeResponse(invalidData);
      }).toThrow(/Strict mode.*Invalid JSON-RPC response/);
    });

    it('should not validate when strict mode is disabled', () => {
      const nonStrictMcp = new MCPStdinSubprocess({ strictMode: false });
      const invalidData = { invalid: 'data' };

      // Should not throw even with invalid data
      expect(() => {
        (nonStrictMcp as any).validateStrictModeResponse(invalidData);
      }).not.toThrow();
    });
  });
});