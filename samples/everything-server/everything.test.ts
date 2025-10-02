import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../dist/MCPStdinSubprocess.js';
import '../../dist/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

describe('Everything MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    const projectDir = __dirname;
    const imageName = 'everything-mcp:latest';

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
    it('should provide expected tools', async () => {
      await expect(app).toHaveTool('echo');
      await expect(app).toHaveTool('add');
      await expect(app).toHaveTool('longRunningOperation');
      await expect(app).toHaveTool('sampleLLM');
      await expect(app).toHaveTool('getTinyImage');
    });

    it('should have correct tool schemas', async () => {
      const tools = await app.getTools();

      const echoTool = tools.find(tool => tool.name === 'echo');
      expect(echoTool).toBeDefined();
      expect(echoTool?.inputSchema.type).toBe('object');
      expect(echoTool?.inputSchema.required).toContain('message');

      const addTool = tools.find(tool => tool.name === 'add');
      expect(addTool).toBeDefined();
      expect(addTool?.inputSchema.required).toContain('a');
      expect(addTool?.inputSchema.required).toContain('b');

      const longRunningTool = tools.find(tool => tool.name === 'longRunningOperation');
      expect(longRunningTool).toBeDefined();
      expect(longRunningTool?.inputSchema.required).toContain('duration');
      expect(longRunningTool?.inputSchema.required).toContain('steps');
    });
  });

  describe('Tool Operations', () => {
    it('should echo messages', async () => {
      const testMessage = 'Hello from expect-mcp!';
      const response = await app.callTool('echo', {
        message: testMessage,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toContain(testMessage);
    });

    it('should add two numbers', async () => {
      const response = await app.callTool('add', {
        a: 5,
        b: 3,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toContain('8');
    });

    it('should perform long running operation with progress', async () => {
      const response = await app.callTool('longRunningOperation', {
        duration: 100,
        steps: 2,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
    });

    it('should get a tiny image', async () => {
      const response = await app.callTool('getTinyImage', {});

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      // Should return an image content type
      const imageContent = response.content.find(c => c.type === 'image');
      expect(imageContent).toBeDefined();
    });

    it('should call sample LLM tool', async () => {
      const response = await app.callTool('sampleLLM', {
        prompt: 'What is 2+2?',
        maxTokens: 100,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('Resource Discovery', () => {
    it('should provide expected resources', async () => {
      const resources = await app.getResources();

      expect(resources).toBeDefined();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);

      // Check for some expected resources
      const greeting = resources.find(r => r.uri === 'test://static/greeting');
      expect(greeting).toBeDefined();
    });

    it('should read static resources', async () => {
      const response = await app.readResource('test://static/greeting');

      expect(response).toBeDefined();
      expect(response.contents).toBeDefined();
      expect(Array.isArray(response.contents)).toBe(true);

      const textContent = response.contents.find(c => c.mimeType === 'text/plain');
      expect(textContent).toBeDefined();
    });

    it('should read dynamic resources', async () => {
      const response = await app.readResource('test://dynamic/time');

      expect(response).toBeDefined();
      expect(response.contents).toBeDefined();
      expect(Array.isArray(response.contents)).toBe(true);
    });
  });

  describe('Prompt Discovery', () => {
    it('should provide expected prompts', async () => {
      const prompts = await app.getPrompts();

      expect(prompts).toBeDefined();
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);

      // Check for some expected prompts
      const simplePrompt = prompts.find(p => p.name === 'simple_prompt');
      expect(simplePrompt).toBeDefined();
    });

    it('should get a prompt', async () => {
      const response = await app.getPrompt('simple_prompt', {});

      expect(response).toBeDefined();
      expect(response.messages).toBeDefined();
      expect(Array.isArray(response.messages)).toBe(true);
      expect(response.messages.length).toBeGreaterThan(0);
    });

    it('should get a prompt with arguments', async () => {
      const prompts = await app.getPrompts();
      const complexPrompt = prompts.find(p => p.arguments && p.arguments.length > 0);

      if (complexPrompt) {
        // Create arguments object with required values
        const args: Record<string, string> = {};
        complexPrompt.arguments?.forEach(arg => {
          args[arg.name] = 'test-value';
        });

        const response = await app.getPrompt(complexPrompt.name, args);

        expect(response).toBeDefined();
        expect(response.messages).toBeDefined();
        expect(Array.isArray(response.messages)).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool calls', async () => {
      const response = await app.callTool('add', {
        a: 'not-a-number',
        b: 5,
      });

      expect(response).toBeDefined();
      // Should either error or handle gracefully
      expect(response.isError || response.content).toBeTruthy();
    });

    it('should handle non-existent resources', async () => {
      try {
        await app.readResource('test://nonexistent/resource');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle non-existent prompts', async () => {
      try {
        await app.getPrompt('nonexistent_prompt', {});
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
