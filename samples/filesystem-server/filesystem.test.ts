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
    it('should provide expected filesystem tools', async () => {
      await expect(app).toHaveTool('read_file');
      await expect(app).toHaveTool('write_file');
      await expect(app).toHaveTool('list_directory');
      await expect(app).toHaveTool('create_directory');
      await expect(app).toHaveTool('move_file');
      await expect(app).toHaveTool('get_file_info');
    });
  });

  describe('Filesystem Operations', () => {
    it('should list directory contents and show newly created files', async () => {
      // Create a unique file to verify listing works
      const uniqueFilename = `test-list-${Date.now()}.txt`;
      await app.callTool('write_file', {
        path: `/app/${uniqueFilename}`,
        content: 'Test content for listing',
      });

      // List directory and verify the file appears
      const response = await app.callTool('list_directory', {
        path: '/app',
      });

      expect(response.isError).toBeFalsy();
      expect(Array.isArray(response.content)).toBe(true);

      const textContent = response.content.find(c => c.type === 'text');
      expect(textContent?.text).toContain(uniqueFilename);
    });

    it('should write and read back exact file contents', async () => {
      const testContent = 'Hello from expect-mcp!\nThis is line 2.\nSpecial chars: !@#$%^&*()';

      // Write a test file
      const writeResponse = await app.callTool('write_file', {
        path: '/app/test.txt',
        content: testContent,
      });

      expect(writeResponse.isError).toBeFalsy();

      // Read the file back
      const readResponse = await app.callTool('read_file', {
        path: '/app/test.txt',
      });

      expect(readResponse.isError).toBeFalsy();

      const content = readResponse.content.find(c => c.type === 'text');
      expect(content?.text).toBe(testContent);
    });

    it('should get file info with size and type information', async () => {
      // Create a file with known content
      const testContent = 'File info test content';
      await app.callTool('write_file', {
        path: '/app/fileinfo-test.txt',
        content: testContent,
      });

      const response = await app.callTool('get_file_info', {
        path: '/app/fileinfo-test.txt',
      });

      expect(response.isError).toBeFalsy();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
      // File info should contain size information
      expect(content?.text).toMatch(/size|bytes/i);
    });

    it('should create a directory', async () => {
      const response = await app.callTool('create_directory', {
        path: '/app/testdir',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      // Verify the directory exists by listing parent
      const listResponse = await app.callTool('list_directory', {
        path: '/app',
      });

      const content = listResponse.content.find(c => c.type === 'text');
      expect(content?.text).toContain('testdir');
    });

    it('should move a file and verify source no longer exists', async () => {
      const sourceContent = 'File to move with unique content';

      // Create a file to move
      await app.callTool('write_file', {
        path: '/app/source.txt',
        content: sourceContent,
      });

      // Move the file
      const moveResponse = await app.callTool('move_file', {
        source: '/app/source.txt',
        destination: '/app/testdir/moved.txt',
      });

      expect(moveResponse.isError).toBeFalsy();

      // Verify the file exists at destination with correct content
      const readResponse = await app.callTool('read_file', {
        path: '/app/testdir/moved.txt',
      });

      expect(readResponse.isError).toBeFalsy();
      const content = readResponse.content.find(c => c.type === 'text');
      expect(content?.text).toBe(sourceContent);

      // Verify the source file no longer exists
      const sourceReadResponse = await app.callTool('read_file', {
        path: '/app/source.txt',
      });

      expect(sourceReadResponse.isError).toBe(true);
    });

    it('should write to subdirectory and read back contents', async () => {
      const subdirPath = '/app/testdir';
      const filePath = `${subdirPath}/nested-file.txt`;
      const fileContent = 'Content in a subdirectory';

      // Ensure directory exists
      await app.callTool('create_directory', {
        path: subdirPath,
      });

      // Write to subdirectory
      const writeResponse = await app.callTool('write_file', {
        path: filePath,
        content: fileContent,
      });

      expect(writeResponse.isError).toBeFalsy();

      // Read back from subdirectory
      const readResponse = await app.callTool('read_file', {
        path: filePath,
      });

      expect(readResponse.isError).toBeFalsy();
      const content = readResponse.content.find(c => c.type === 'text');
      expect(content?.text).toBe(fileContent);

      // Verify file appears in directory listing
      const listResponse = await app.callTool('list_directory', {
        path: subdirPath,
      });

      const listContent = listResponse.content.find(c => c.type === 'text');
      expect(listContent?.text).toContain('nested-file.txt');
    });
  });

  describe('Error Handling', () => {
    it('should handle reading non-existent file', async () => {
      const response = await app.callTool('read_file', {
        path: '/app/nonexistent.txt',
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });

    it('should handle invalid paths', async () => {
      const response = await app.callTool('list_directory', {
        path: '/invalid/path',
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });
  });
});
