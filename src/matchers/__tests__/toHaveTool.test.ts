import { describe, expect, it, vi } from 'vitest';
import '../../vitest-setup.js';
import { MCPStdinSubprocess } from '../../MCPStdinSubprocess.js';
import { resolveUtils } from '../../utils.js';
import { toHaveTool } from '../toHaveTool.js';

// Mock the resolveUtils function
vi.mock('../../utils.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../../utils.js')>();
  return {
    ...actual,
    resolveUtils: vi.fn(() => ({
      printReceived: vi.fn(value => `received: ${JSON.stringify(value)}`),
      printExpected: vi.fn(value => `expected: ${JSON.stringify(value)}`),
    })),
  };
});

describe('toHaveTool', () => {
  const mockContext = {};

  it('should pass when MCP server has the tool', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasTool = vi.fn().mockResolvedValue(true);

    const result = await toHaveTool.call(mockContext, mockMCPServer, 'testTool');

    expect(result.pass).toBe(true);
    expect(result.message()).toContain('Expected MCP server not to have tool');
    expect(result.message()).toContain('testTool');
    expect(mockMCPServer.hasTool).toHaveBeenCalledWith('testTool');
  });

  it('should fail when MCP server does not have the tool', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasTool = vi.fn().mockResolvedValue(false);

    const result = await toHaveTool.call(mockContext, mockMCPServer, 'nonExistentTool');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected MCP server to have tool');
    expect(result.message()).toContain('nonExistentTool');
    expect(mockMCPServer.hasTool).toHaveBeenCalledWith('nonExistentTool');
  });

  it('should fail when received is not an MCPStdinSubprocess instance', async () => {
    const notMCPServer = { someProperty: 'value' };

    const result = await toHaveTool.call(mockContext, notMCPServer, 'testTool');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected an MCPStdinSubprocess instance');
    expect(result.message()).toContain('received:');
  });

  it('should fail when received is null', async () => {
    const result = await toHaveTool.call(mockContext, null, 'testTool');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected an MCPStdinSubprocess instance');
  });

  it('should fail when received is undefined', async () => {
    const result = await toHaveTool.call(mockContext, undefined, 'testTool');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected an MCPStdinSubprocess instance');
  });

  it('should handle errors from hasTool method', async () => {
    const errorMessage = 'Connection failed';
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasTool = vi.fn().mockRejectedValue(new Error(errorMessage));

    const result = await toHaveTool.call(mockContext, mockMCPServer, 'testTool');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Error checking for tool');
    expect(result.message()).toContain('testTool');
    expect(result.message()).toContain(errorMessage);
  });

  it('should handle non-Error exceptions from hasTool method', async () => {
    const errorValue = 'String error';
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasTool = vi.fn().mockRejectedValue(errorValue);

    const result = await toHaveTool.call(mockContext, mockMCPServer, 'testTool');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Error checking for tool');
    expect(result.message()).toContain('testTool');
    expect(result.message()).toContain(errorValue);
  });

  it('should call resolveUtils with the correct context', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasTool = vi.fn().mockResolvedValue(true);

    await toHaveTool.call(mockContext, mockMCPServer, 'testTool');

    expect(resolveUtils).toHaveBeenCalledWith(mockContext);
  });
});
