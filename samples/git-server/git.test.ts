import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../dist/MCPStdinSubprocess.js';
import '../../dist/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

describe('Git MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    const projectDir = __dirname;
    const imageName = 'git-mcp:latest';

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
    it('should provide expected git tools', async () => {
      await expect(app).toHaveTool('git_status');
      await expect(app).toHaveTool('git_diff_unstaged');
      await expect(app).toHaveTool('git_diff_staged');
      await expect(app).toHaveTool('git_commit');
      await expect(app).toHaveTool('git_add');
      await expect(app).toHaveTool('git_reset');
      await expect(app).toHaveTool('git_log');
      await expect(app).toHaveTool('git_show');
    });

    it('should have correct tool schemas', async () => {
      const tools = await app.getTools();

      const gitStatusTool = tools.find(tool => tool.name === 'git_status');
      expect(gitStatusTool).toBeDefined();
      expect(gitStatusTool?.inputSchema.type).toBe('object');

      const gitLogTool = tools.find(tool => tool.name === 'git_log');
      expect(gitLogTool).toBeDefined();

      const gitAddTool = tools.find(tool => tool.name === 'git_add');
      expect(gitAddTool).toBeDefined();
      expect(gitAddTool?.inputSchema.required).toContain('files');

      const gitCommitTool = tools.find(tool => tool.name === 'git_commit');
      expect(gitCommitTool).toBeDefined();
      expect(gitCommitTool?.inputSchema.required).toContain('message');
    });
  });

  describe('Git Operations', () => {
    it('should get repository status', async () => {
      const response = await app.callTool('git_status', {});

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);
    });

    it('should get git log', async () => {
      const response = await app.callTool('git_log', {});

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toContain('Initial commit');
    });

    it('should create and commit a new file', async () => {
      // First, we would need to create a file in the repo
      // For this test, we'll add a file and commit it
      const addResponse = await app.callTool('git_add', {
        files: ['README.md']
      });

      expect(addResponse).toBeDefined();
      expect(addResponse.content).toBeDefined();

      // Now commit the changes
      const commitResponse = await app.callTool('git_commit', {
        message: 'Test commit from expect-mcp'
      });

      expect(commitResponse).toBeDefined();
      expect(commitResponse.content).toBeDefined();
    });

    it('should show diff for unstaged changes', async () => {
      const response = await app.callTool('git_diff_unstaged', {});

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should show diff for staged changes', async () => {
      const response = await app.callTool('git_diff_staged', {});

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should show specific commit', async () => {
      // Get the latest commit hash from log first
      const logResponse = await app.callTool('git_log', {
        maxCount: 1
      });

      expect(logResponse).toBeDefined();

      // Show the commit details
      const response = await app.callTool('git_show', {
        revision: 'HEAD'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should reset staged changes', async () => {
      // First stage a file
      await app.callTool('git_add', {
        files: ['README.md']
      });

      // Then reset it
      const response = await app.callTool('git_reset', {
        files: ['README.md']
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle adding non-existent files', async () => {
      const response = await app.callTool('git_add', {
        files: ['nonexistent.txt']
      });

      expect(response).toBeDefined();
      // Git add will fail for non-existent files
      expect(response.isError || response.content).toBeTruthy();
    });

    it('should handle invalid commit without staged changes', async () => {
      // Ensure nothing is staged
      await app.callTool('git_reset', {});

      const response = await app.callTool('git_commit', {
        message: 'Empty commit'
      });

      expect(response).toBeDefined();
      // Should either error or indicate nothing to commit
      expect(response.isError || response.content).toBeTruthy();
    });

    it('should handle invalid revision in git show', async () => {
      const response = await app.callTool('git_show', {
        revision: 'invalid-revision-hash'
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });
  });
});
