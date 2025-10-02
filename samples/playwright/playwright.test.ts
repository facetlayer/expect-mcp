import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../dist/MCPStdinSubprocess.js';
import '../../dist/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

describe('Playwright MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    const projectDir = __dirname;
    const imageName = 'playwright-mcp:latest';

    // Build and launch the Docker container
    app = await DockerMcpRunner.buildAndLaunch({
      projectDir,
      imageName,
      verbose: false,
    });

    await app.initialize();
  }, 120000); // Increase timeout for Docker build (Playwright install is slow)

  afterAll(() => {
    if (app) {
      app.close();
    }
  });

  describe('Tool Discovery and Validation', () => {
    it('should provide expected browser automation tools', async () => {
      await expect(app).toHaveTool('browser_navigate');
      await expect(app).toHaveTool('browser_click');
      await expect(app).toHaveTool('browser_type');
      await expect(app).toHaveTool('browser_snapshot');
      await expect(app).toHaveTool('browser_take_screenshot');
      await expect(app).toHaveTool('browser_evaluate');
      await expect(app).toHaveTool('browser_fill_form');
      await expect(app).toHaveTool('browser_wait_for');
    });

    it('should have correct tool schemas with required parameters', async () => {
      const tools = await app.getTools();

      const navigateTool = tools.find(tool => tool.name === 'browser_navigate');
      expect(navigateTool).toBeDefined();
      expect(navigateTool?.description).toBe('Navigate to a URL');
      expect(navigateTool?.inputSchema.type).toBe('object');
      expect(navigateTool?.inputSchema.required).toContain('url');

      const clickTool = tools.find(tool => tool.name === 'browser_click');
      expect(clickTool).toBeDefined();
      expect(clickTool?.description).toBe('Perform click on a web page');
      expect(clickTool?.inputSchema.required).toContain('element');
      expect(clickTool?.inputSchema.required).toContain('ref');

      const typeTool = tools.find(tool => tool.name === 'browser_type');
      expect(typeTool).toBeDefined();
      expect(typeTool?.description).toBe('Type text into editable element');
      expect(typeTool?.inputSchema.required).toContain('text');
    });

    it('should provide comprehensive tool count', async () => {
      const tools = await app.getTools();
      // Playwright MCP should provide a comprehensive set of browser automation tools
      expect(tools.length).toBeGreaterThan(15);
    });
  });

  describe('Browser Navigation and Basic Operations', () => {
    it('should navigate to a webpage and capture snapshot', async () => {
      const navigateResponse = await app.callTool('browser_navigate', {
        url: 'https://example.com',
      });
      expect(navigateResponse).toBeDefined();

      // Check if navigation was successful (no error in content)
      if (navigateResponse.content) {
        const text = navigateResponse.content[0]?.text || '';
        expect(text).toContain('page.goto');
        expect(text).toContain('example.com');
      }

      // Wait a moment for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const snapshotResponse = await app.callTool('browser_snapshot', {});
      expect(snapshotResponse).toBeDefined();
      expect(snapshotResponse.content).toBeDefined();
      expect(Array.isArray(snapshotResponse.content)).toBe(true);

      // Check that snapshot contains page information
      const snapshotText = snapshotResponse.content[0]?.text || '';
      expect(snapshotText).toContain('Page URL');
      expect(snapshotText).toContain('example.com');
    });

    it('should take screenshots successfully', async () => {
      const screenshotResponse = await app.callTool('browser_take_screenshot', {
        type: 'png',
      });
      expect(screenshotResponse).toBeDefined();
      expect(screenshotResponse.content).toBeDefined();

      // Check that screenshot response contains expected structure
      const text = screenshotResponse.content[0]?.text || '';
      expect(text).toContain('screenshot');
    });

    it('should evaluate JavaScript on the page', async () => {
      const evaluateResponse = await app.callTool('browser_evaluate', {
        function: '() => document.title',
      });
      expect(evaluateResponse).toBeDefined();
      expect(evaluateResponse.content).toBeDefined();

      // Check that evaluation response contains result
      const text = evaluateResponse.content[0]?.text || '';
      expect(text).toContain('Result');
    });
  });

  describe('Form Interaction Capabilities', () => {
    it('should handle form interactions on a test page', async () => {
      // Navigate to a page with forms (httpbin.org has good test endpoints)
      const navigateResponse = await app.callTool('browser_navigate', {
        url: 'https://httpbin.org/forms/post',
      });
      expect(navigateResponse).toBeDefined();

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get page snapshot to find form elements
      const snapshotResponse = await app.callTool('browser_snapshot', {});
      expect(snapshotResponse).toBeDefined();

      // The form should be visible in the snapshot
      expect(snapshotResponse.content).toBeDefined();
    });

    it('should wait for elements to appear', async () => {
      const waitResponse = await app.callTool('browser_wait_for', {
        time: 1,
      });
      expect(waitResponse).toBeDefined();
      expect(waitResponse.content).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid URLs gracefully', async () => {
      const response = await app.callTool('browser_navigate', {
        url: 'invalid-url',
      });
      expect(response).toBeDefined();
      // This should either succeed (if browser handles it) or show an error in content
      expect(response.content).toBeDefined();
    });

    it('should handle missing required parameters', async () => {
      const response = await app.callTool('browser_navigate', {});
      expect(response).toBeDefined();
      // Should show validation error in content
      expect(response.content).toBeDefined();
      const text = response.content[0]?.text || '';
      expect(text).toContain('Required');
    });

    it('should handle invalid element references', async () => {
      const response = await app.callTool('browser_click', {
        element: 'Non-existent element',
        ref: 'invalid-ref-123',
      });
      expect(response).toBeDefined();
      // This should show an error for invalid element reference
      expect(response.content).toBeDefined();
    });
  });

  describe('Browser Management Features', () => {
    it('should handle browser tab operations', async () => {
      const listTabsResponse = await app.callTool('browser_tabs', {
        action: 'list',
      });
      expect(listTabsResponse).toBeDefined();
      expect(listTabsResponse.content).toBeDefined();
    });

    it('should resize browser window', async () => {
      const resizeResponse = await app.callTool('browser_resize', {
        width: 1024,
        height: 768,
      });
      expect(resizeResponse).toBeDefined();
      expect(resizeResponse.content).toBeDefined();
    });

    it('should access console messages', async () => {
      const consoleResponse = await app.callTool('browser_console_messages', {});
      expect(consoleResponse).toBeDefined();
      expect(consoleResponse.content).toBeDefined();
    });

    it('should access network requests', async () => {
      const networkResponse = await app.callTool('browser_network_requests', {});
      expect(networkResponse).toBeDefined();
      expect(networkResponse.content).toBeDefined();
    });
  });

  describe('Advanced Interaction Features', () => {
    it('should handle keyboard interactions', async () => {
      const keyResponse = await app.callTool('browser_press_key', {
        key: 'Escape',
      });
      expect(keyResponse).toBeDefined();
      expect(keyResponse.content).toBeDefined();
    });

    it('should support drag and drop operations', async () => {
      // This will likely fail without proper elements, but should return valid MCP response
      const dragResponse = await app.callTool('browser_drag', {
        startElement: 'Source element',
        startRef: 'start-ref',
        endElement: 'Target element',
        endRef: 'end-ref',
      });
      expect(dragResponse).toBeDefined();
      // Expect this to fail with invalid references
      expect(dragResponse.content).toBeDefined();
    });

    it('should handle hover operations', async () => {
      const hoverResponse = await app.callTool('browser_hover', {
        element: 'Some element',
        ref: 'hover-ref',
      });
      expect(hoverResponse).toBeDefined();
      // Expect this to fail with invalid references
      expect(hoverResponse.content).toBeDefined();
    });
  });

  describe('Resource Management', () => {
    it('should handle resource requests appropriately', async () => {
      // Playwright MCP may or may not expose resources
      // The test should handle both cases gracefully
      try {
        const resources = await app.getResources();
        expect(Array.isArray(resources)).toBe(true);
      } catch (error: any) {
        // If resources are not supported, expect a specific error
        expect(error.message).toContain('Method not found');
      }
    });
  });

  describe('Stress Testing and Reliability', () => {
    it('should handle multiple rapid tool calls', async () => {
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 5; i++) {
        promises.push(app.callTool('browser_snapshot', {}));
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(response.content).toBeDefined();
      });
    });

    it('should maintain session state across multiple operations', async () => {
      // Navigate to a test page
      const navigateResponse = await app.callTool('browser_navigate', {
        url: 'https://example.com',
      });
      expect(navigateResponse).toBeDefined();

      // Wait for page load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Evaluate JavaScript to get current URL
      const evaluateResponse = await app.callTool('browser_evaluate', {
        function: '() => window.location.href',
      });
      expect(evaluateResponse).toBeDefined();
      const text = evaluateResponse.content[0]?.text || '';
      expect(text).toContain('example.com');
    });
  });
});
