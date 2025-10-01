import { describe, expect, it, vi } from 'vitest';
import { MCPStdinSubprocess } from '../../MCPStdinSubprocess.js';
import { toHaveResource } from '../toHaveResource.js';
import { resolveUtils } from '../../utils.js';

vi.mock('../../utils.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils.js')>();
  return {
    ...actual,
    resolveUtils: vi.fn(() => ({
      printReceived: vi.fn((value) => `received: ${JSON.stringify(value)}`),
      printExpected: vi.fn((value) => `expected: ${JSON.stringify(value)}`),
    })),
  };
});

describe('toHaveResource', () => {
  const mockContext = {};

  it('should pass when MCP server has the resource', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasResource = vi.fn().mockResolvedValue(true);

    const result = await toHaveResource.call(mockContext, mockMCPServer, 'testResource');

    expect(result.pass).toBe(true);
    expect(result.message()).toContain('Expected MCP server not to have resource');
    expect(result.message()).toContain('testResource');
    expect(mockMCPServer.hasResource).toHaveBeenCalledWith('testResource');
  });

  it('should fail when MCP server does not have the resource', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasResource = vi.fn().mockResolvedValue(false);

    const result = await toHaveResource.call(mockContext, mockMCPServer, 'nonExistentResource');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected MCP server to have resource');
    expect(result.message()).toContain('nonExistentResource');
    expect(mockMCPServer.hasResource).toHaveBeenCalledWith('nonExistentResource');
  });

  it('should fail when received is not an MCPStdinSubprocess instance', async () => {
    const notMCPServer = { someProperty: 'value' };

    const result = await toHaveResource.call(mockContext, notMCPServer, 'testResource');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected an MCPStdinSubprocess instance');
    expect(result.message()).toContain('received:');
  });

  it('should fail when received is null', async () => {
    const result = await toHaveResource.call(mockContext, null, 'testResource');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected an MCPStdinSubprocess instance');
  });

  it('should fail when received is undefined', async () => {
    const result = await toHaveResource.call(mockContext, undefined, 'testResource');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Expected an MCPStdinSubprocess instance');
  });

  it('should handle errors from hasResource method', async () => {
    const errorMessage = 'Resource lookup failed';
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasResource = vi.fn().mockRejectedValue(new Error(errorMessage));

    const result = await toHaveResource.call(mockContext, mockMCPServer, 'testResource');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Error checking for resource');
    expect(result.message()).toContain('testResource');
    expect(result.message()).toContain(errorMessage);
  });

  it('should handle non-Error exceptions from hasResource method', async () => {
    const errorValue = 'String error';
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasResource = vi.fn().mockRejectedValue(errorValue);

    const result = await toHaveResource.call(mockContext, mockMCPServer, 'testResource');

    expect(result.pass).toBe(false);
    expect(result.message()).toContain('Error checking for resource');
    expect(result.message()).toContain('testResource');
    expect(result.message()).toContain(errorValue);
  });

  it('should call resolveUtils with the correct context', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasResource = vi.fn().mockResolvedValue(true);

    await toHaveResource.call(mockContext, mockMCPServer, 'testResource');

    expect(resolveUtils).toHaveBeenCalledWith(mockContext);
  });

  it('should work with URI-style resource names', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasResource = vi.fn().mockResolvedValue(true);

    const resourceURI = 'file:///path/to/resource.txt';
    const result = await toHaveResource.call(mockContext, mockMCPServer, resourceURI);

    expect(result.pass).toBe(true);
    expect(mockMCPServer.hasResource).toHaveBeenCalledWith(resourceURI);
  });

  it('should work with complex resource names', async () => {
    const mockMCPServer = Object.create(MCPStdinSubprocess.prototype);
    mockMCPServer.hasResource = vi.fn().mockResolvedValue(false);

    const complexResourceName = 'namespace/complex-resource-name@version';
    const result = await toHaveResource.call(mockContext, mockMCPServer, complexResourceName);

    expect(result.pass).toBe(false);
    expect(result.message()).toContain(complexResourceName);
    expect(mockMCPServer.hasResource).toHaveBeenCalledWith(complexResourceName);
  });
});