import { beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess, mcpShell } from '../../src';
import '../../src/vitest-setup.js';

const DefaultRequestTimeout = 1000;

describe('Tool Usage', () => {
  describe('server with tools capability', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withTools.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should verify that the server capabilities section has enabled tools', async () => {
      const supportsTools = await process.supportsTools();
      expect(supportsTools).toBe(true);
    });

    it('should verify that tools/list returns available tools', async () => {
      const tools = await process.getTools();
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should verify that tools/list response contains the echo tool', async () => {
      const hasTool = await process.hasTool('echo');
      expect(hasTool).toBe(true);
    });

    it('should verify that tools/list response contains the add tool', async () => {
      const hasTool = await process.hasTool('add');
      expect(hasTool).toBe(true);
    });

    it('should successfully call the echo tool', async () => {
      const result = await process.callTool('echo', { message: 'Hello, MCP!' });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toBe('Hello, MCP!');
    });

    it('should successfully call the add tool', async () => {
      const result = await process.callTool('add', { a: 5, b: 3 });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toBe('8');
    });

    it('should have tool schema with required fields', async () => {
      const tools = await process.getTools();
      const echoTool = tools.find(t => t.name === 'echo');

      expect(echoTool).toBeDefined();
      expect(echoTool?.name).toBe('echo');
      expect(echoTool?.description).toBeDefined();
      expect(echoTool?.inputSchema).toBeDefined();
    });
  });

  describe('server without tools capability', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should verify that tools are not supported', async () => {
      const supportsTools = await process.supportsTools();
      expect(supportsTools).toBe(false);
    });

    it('should fail when trying to call a tool on server without tools capability', async () => {
      await expect(process.callTool('anyTool', {})).rejects.toThrow(
        'Tools anyTool are not supported by the server'
      );
    });
  });

  describe('tool not in list', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.toolsNotListed.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should reject calling a tool that is not declared in tools/list', async () => {
      await expect(process.callTool('undeclaredTool', {})).rejects.toThrow(
        'Tool undeclaredTool not declared in tools/list'
      );
    });
  });

  describe('tool validation', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withTools.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should verify tool has name field', async () => {
      const tools = await process.getTools();
      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe('string');
      });
    });

    it('should verify tool has inputSchema field', async () => {
      const tools = await process.getTools();
      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(typeof tool.inputSchema).toBe('object');
      });
    });
  });
});
