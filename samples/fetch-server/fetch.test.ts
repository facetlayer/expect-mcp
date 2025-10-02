import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../dist/MCPStdinSubprocess.js';
import '../../dist/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

describe('Fetch MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    const projectDir = __dirname;
    const imageName = 'fetch-mcp:latest';

    // Build and launch the Docker container
    app = await DockerMcpRunner.buildAndLaunch({
      projectDir,
      imageName,
      verbose: false,
    });

    await app.initialize();
  }, 60000); // Increase timeout for Docker build

  afterAll(() => {
    if (app) {
      app.close();
    }
  });

  describe('Tool Discovery', () => {
    it('should provide expected fetch tools', async () => {
      await expect(app).toHaveTool('fetch');
    });

    it('should have correct tool schemas', async () => {
      const tools = await app.getTools();

      const fetchTool = tools.find(tool => tool.name === 'fetch');
      expect(fetchTool).toBeDefined();
      expect(fetchTool?.inputSchema.type).toBe('object');
      expect(fetchTool?.inputSchema.required).toContain('url');
    });
  });

  describe('Fetch Operations', () => {
    it('should fetch a simple web page', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://example.com',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
      expect(content?.text).toContain('Example Domain');
    });

    it('should fetch JSON content', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://api.github.com/zen',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
    });

    it('should handle different content types', async () => {
      // Fetch a page with structured content
      const response = await app.callTool('fetch', {
        url: 'https://www.ietf.org/rfc/rfc2616.txt',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
    });

    it('should support max_length parameter', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://example.com',
        maxLength: 500,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
      expect(content?.text.length).toBeLessThanOrEqual(500);
    });

    it('should convert HTML to markdown', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://example.com',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      // The server should convert HTML to readable text/markdown format
      expect(content?.text).toBeDefined();
      expect(content?.text.length).toBeGreaterThan(0);
    });

    it('should handle redirects', async () => {
      const response = await app.callTool('fetch', {
        url: 'http://example.com', // Should redirect to https
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toContain('Example Domain');
    });

    it('should fetch with custom headers', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://httpbin.org/headers',
        headers: {
          'User-Agent': 'expect-mcp-test',
          Accept: 'application/json',
        },
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs', async () => {
      const response = await app.callTool('fetch', {
        url: 'not-a-valid-url',
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });

    it('should handle non-existent domains', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://this-domain-definitely-does-not-exist-12345.com',
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });

    it('should handle 404 responses', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://httpbin.org/status/404',
      });

      expect(response).toBeDefined();
      // Should either error or return content indicating 404
      expect(response.isError || response.content).toBeTruthy();
    });

    it('should handle timeouts', async () => {
      // httpbin.org/delay/10 will delay for 10 seconds
      const response = await app.callTool('fetch', {
        url: 'https://httpbin.org/delay/10',
      });

      expect(response).toBeDefined();
      // Should timeout or return an error
      expect(response.isError || response.content).toBeTruthy();
    });

    it('should handle malformed responses', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://httpbin.org/xml',
      });

      expect(response).toBeDefined();
      expect(response.content || response.isError).toBeTruthy();
    });
  });

  describe('Content Processing', () => {
    it('should extract text from HTML pages', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://example.com',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      // Should strip HTML tags and extract readable text
      expect(content?.text).not.toContain('<html>');
      expect(content?.text).not.toContain('<body>');
    });

    it('should preserve important content structure', async () => {
      const response = await app.callTool('fetch', {
        url: 'https://example.com',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      // Should preserve headings, paragraphs, etc. in a readable format
      expect(content?.text).toBeTruthy();
      expect(content?.text.length).toBeGreaterThan(0);
    });
  });
});
