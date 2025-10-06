import '../../src/vitest-setup.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess, mcpShell } from '../../dist';

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

  describe('custom matchers - positive cases', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withTools.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should pass when checking for existing tool with toHaveTool', async () => {
      await expect(process).toHaveTool('echo');
    });

    it('should pass when checking for another existing tool with toHaveTool', async () => {
      await expect(process).toHaveTool('add');
    });

    it('should pass when checking for multiple existing tools with toHaveTools', async () => {
      await expect(process).toHaveTools(['echo', 'add']);
    });

    it('should pass when checking for single tool with toHaveTools', async () => {
      await expect(process).toHaveTools(['echo']);
    });
  });

  describe('custom matchers - negative cases', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withTools.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should fail when checking for nonexistent tool with toHaveTool', async () => {
      await expect(
        expect(process).toHaveTool('nonexistent')
      ).rejects.toThrow();
    });

    it('should fail when checking for nonexistent tool in toHaveTools', async () => {
      await expect(
        expect(process).toHaveTools(['nonexistent'])
      ).rejects.toThrow();
    });

    it('should fail when one of multiple tools is missing in toHaveTools', async () => {
      await expect(
        expect(process).toHaveTools(['echo', 'nonexistent'])
      ).rejects.toThrow();
    });

    it('should fail when all tools are missing in toHaveTools', async () => {
      await expect(
        expect(process).toHaveTools(['missing1', 'missing2'])
      ).rejects.toThrow();
    });
  });

  describe('custom matchers - .not. modifier', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withTools.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should pass when tool does not exist with .not.toHaveTool', async () => {
      await expect(process).not.toHaveTool('nonexistent');
    });

    it('should fail when existing tool is checked with .not.toHaveTool', async () => {
      await expect(
        expect(process).not.toHaveTool('echo')
      ).rejects.toThrow();
    });

    it('should pass when tools do not exist with .not.toHaveTools', async () => {
      await expect(process).not.toHaveTools(['nonexistent1', 'nonexistent2']);
    });

    it('should fail when all tools exist with .not.toHaveTools', async () => {
      await expect(
        expect(process).not.toHaveTools(['echo', 'add'])
      ).rejects.toThrow();
    });

    it('should pass when at least one tool is missing with .not.toHaveTools', async () => {
      // .not.toHaveTools means "NOT all tools exist", so passes when at least one is missing
      await expect(process).not.toHaveTools(['echo', 'nonexistent']);
    });

    it('should fail when single existing tool is checked with .not.toHaveTools', async () => {
      await expect(
        expect(process).not.toHaveTools(['add'])
      ).rejects.toThrow();
    });
  });

  describe('custom matchers - empty list server', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.toolsNotListed.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should fail when checking for any tool on empty server', async () => {
      await expect(
        expect(process).toHaveTool('undeclaredTool')
      ).rejects.toThrow();
    });

    it('should pass when using .not.toHaveTool on empty server', async () => {
      await expect(process).not.toHaveTool('undeclaredTool');
    });

    it('should fail when checking for any tools on empty server', async () => {
      await expect(
        expect(process).toHaveTools(['undeclaredTool'])
      ).rejects.toThrow();
    });

    it('should pass when using .not.toHaveTools on empty server', async () => {
      await expect(process).not.toHaveTools(['undeclaredTool']);
    });
  });

  describe('custom matchers - server without capability', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should fail when checking for tool on server without tools capability', async () => {
      await expect(
        expect(process).toHaveTool('anyTool')
      ).rejects.toThrow();
    });

    it('should pass when using .not.toHaveTool on server without tools capability', async () => {
      await expect(process).not.toHaveTool('anyTool');
    });

    it('should fail when checking for tools on server without tools capability', async () => {
      await expect(
        expect(process).toHaveTools(['anyTool'])
      ).rejects.toThrow();
    });

    it('should pass when using .not.toHaveTools on server without tools capability', async () => {
      await expect(process).not.toHaveTools(['anyTool']);
    });
  });
});
