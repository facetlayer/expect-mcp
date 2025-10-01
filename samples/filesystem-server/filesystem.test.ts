import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../dist/MCPStdinSubprocess.js';
import '../../dist/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

describe('Filesystem MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    const projectDir = __dirname;
    const imageName = 'filesystem-mcp:latest';

    // Build and launch the Docker container
    app = await DockerMcpRunner.buildAndLaunch({
      projectDir,
      imageName,
      verbose: false
    });

    await app.initialize();
  }, 60000); // Increase timeout for Docker build

  afterAll(() => {
    if (app) {
      app.close();
    }
  });

  describe('Tool Discovery', () => {
    it('should provide expected filesystem tools', async () => {
      await expect(app).toHaveTool('read_file');
      await expect(app).toHaveTool('write_file');
      await expect(app).toHaveTool('list_directory');
      await expect(app).toHaveTool('create_directory');
      await expect(app).toHaveTool('move_file');
      await expect(app).toHaveTool('get_file_info');
    });

    it('should have correct tool schemas', async () => {
      const tools = await app.getTools();

      const readFileTool = tools.find(tool => tool.name === 'read_file');
      expect(readFileTool).toBeDefined();
      expect(readFileTool?.inputSchema.type).toBe('object');
      expect(readFileTool?.inputSchema.required).toContain('path');

      const writeFileTool = tools.find(tool => tool.name === 'write_file');
      expect(writeFileTool).toBeDefined();
      expect(writeFileTool?.inputSchema.required).toContain('path');
      expect(writeFileTool?.inputSchema.required).toContain('content');

      const listDirTool = tools.find(tool => tool.name === 'list_directory');
      expect(listDirTool).toBeDefined();
      expect(listDirTool?.inputSchema.required).toContain('path');
    });
  });

  describe('Filesystem Operations', () => {
    it('should list directory contents', async () => {
      const response = await app.callTool('list_directory', {
        path: '/app'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);
    });

    it('should create and read a file', async () => {
      // Write a test file
      const writeResponse = await app.callTool('write_file', {
        path: '/app/test.txt',
        content: 'Hello from expect-mcp!'
      });

      expect(writeResponse).toBeDefined();
      expect(writeResponse.content).toBeDefined();

      // Read the file back
      const readResponse = await app.callTool('read_file', {
        path: '/app/test.txt'
      });

      expect(readResponse).toBeDefined();
      expect(readResponse.content).toBeDefined();

      const content = readResponse.content.find(c => c.type === 'text');
      expect(content?.text).toContain('Hello from expect-mcp!');
    });

    it('should get file info', async () => {
      const response = await app.callTool('get_file_info', {
        path: '/app/test.txt'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
    });

    it('should create a directory', async () => {
      const response = await app.callTool('create_directory', {
        path: '/app/testdir'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      // Verify the directory exists by listing parent
      const listResponse = await app.callTool('list_directory', {
        path: '/app'
      });

      const content = listResponse.content.find(c => c.type === 'text');
      expect(content?.text).toContain('testdir');
    });

    it('should move a file', async () => {
      // Create a file to move
      await app.callTool('write_file', {
        path: '/app/source.txt',
        content: 'File to move'
      });

      // Move the file
      const moveResponse = await app.callTool('move_file', {
        source: '/app/source.txt',
        destination: '/app/testdir/moved.txt'
      });

      expect(moveResponse).toBeDefined();
      expect(moveResponse.content).toBeDefined();

      // Verify the file was moved
      const readResponse = await app.callTool('read_file', {
        path: '/app/testdir/moved.txt'
      });

      const content = readResponse.content.find(c => c.type === 'text');
      expect(content?.text).toContain('File to move');
    });
  });

  describe('Error Handling', () => {
    it('should handle reading non-existent file', async () => {
      const response = await app.callTool('read_file', {
        path: '/app/nonexistent.txt'
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });

    it('should handle invalid paths', async () => {
      const response = await app.callTool('list_directory', {
        path: '/invalid/path'
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });
  });
});