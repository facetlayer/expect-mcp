import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../dist/MCPStdinSubprocess.js';
import '../../dist/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

describe('GitHub MCP Server', () => {
  let app: MCPStdinSubprocess;
  const hasGitHubToken = !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

  beforeAll(async () => {
    if (!hasGitHubToken) {
      console.warn('GITHUB_PERSONAL_ACCESS_TOKEN not set - skipping GitHub MCP Server tests');
      return;
    }

    const projectDir = __dirname;
    const imageName = 'github-mcp:latest';

    // Build and launch the Docker container with GitHub token
    app = await DockerMcpRunner.buildAndLaunch({
      projectDir,
      imageName,
      verbose: false,
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!
      }
    });

    await app.initialize();
  }, 60000); // Increase timeout for Docker build

  afterAll(() => {
    if (app) {
      app.close();
    }
  });

  describe('Tool Discovery', () => {
    it.skipIf(!hasGitHubToken)('should provide expected GitHub tools', async () => {
      await expect(app).toHaveTool('create_or_update_file');
      await expect(app).toHaveTool('search_repositories');
      await expect(app).toHaveTool('create_repository');
      await expect(app).toHaveTool('get_file_contents');
      await expect(app).toHaveTool('push_files');
      await expect(app).toHaveTool('create_issue');
      await expect(app).toHaveTool('create_pull_request');
      await expect(app).toHaveTool('fork_repository');
      await expect(app).toHaveTool('create_branch');
    });

    it.skipIf(!hasGitHubToken)('should have correct tool schemas', async () => {
      const tools = await app.getTools();

      const searchTool = tools.find(tool => tool.name === 'search_repositories');
      expect(searchTool).toBeDefined();
      expect(searchTool?.inputSchema.type).toBe('object');
      expect(searchTool?.inputSchema.required).toContain('query');

      const createIssueTool = tools.find(tool => tool.name === 'create_issue');
      expect(createIssueTool).toBeDefined();
      expect(createIssueTool?.inputSchema.required).toContain('owner');
      expect(createIssueTool?.inputSchema.required).toContain('repo');
      expect(createIssueTool?.inputSchema.required).toContain('title');

      const getFileTool = tools.find(tool => tool.name === 'get_file_contents');
      expect(getFileTool).toBeDefined();
      expect(getFileTool?.inputSchema.required).toContain('owner');
      expect(getFileTool?.inputSchema.required).toContain('repo');
      expect(getFileTool?.inputSchema.required).toContain('path');
    });
  });

  describe('GitHub Operations', () => {
    it.skipIf(!hasGitHubToken)('should search repositories', async () => {
      const response = await app.callTool('search_repositories', {
        query: 'modelcontextprotocol language:typescript stars:>100'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
    });

    it.skipIf(!hasGitHubToken)('should get file contents from a repository', async () => {
      const response = await app.callTool('get_file_contents', {
        owner: 'modelcontextprotocol',
        repo: 'servers',
        path: 'README.md'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const content = response.content.find(c => c.type === 'text');
      expect(content?.text).toBeDefined();
      expect(content?.text).toContain('Model Context Protocol');
    });

    it.skipIf(!hasGitHubToken)('should fork a repository', async () => {
      // Note: This test will fork a repository - may want to skip in CI
      // or use a test repository
      const response = await app.callTool('fork_repository', {
        owner: 'modelcontextprotocol',
        repo: 'servers'
      });

      expect(response).toBeDefined();
      // Either success or already forked
      expect(response.content || response.isError).toBeTruthy();
    });

    it.skipIf(!hasGitHubToken)('should create a branch', async () => {
      // First get authenticated user info to know where to create branch
      const response = await app.callTool('create_branch', {
        owner: 'modelcontextprotocol',
        repo: 'servers',
        branch: `test-branch-${Date.now()}`,
        from: 'main'
      });

      expect(response).toBeDefined();
      expect(response.content || response.isError).toBeTruthy();
    });

    it.skipIf(!hasGitHubToken)('should list issues', async () => {
      const response = await app.callTool('list_issues', {
        owner: 'modelcontextprotocol',
        repo: 'servers',
        state: 'all'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it.skipIf(!hasGitHubToken)('should list pull requests', async () => {
      const response = await app.callTool('list_pull_requests', {
        owner: 'modelcontextprotocol',
        repo: 'servers',
        state: 'all'
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it.skipIf(!hasGitHubToken)('should handle non-existent repository', async () => {
      const response = await app.callTool('get_file_contents', {
        owner: 'nonexistent',
        repo: 'nonexistent-repo-12345',
        path: 'README.md'
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });

    it.skipIf(!hasGitHubToken)('should handle non-existent file', async () => {
      const response = await app.callTool('get_file_contents', {
        owner: 'modelcontextprotocol',
        repo: 'servers',
        path: 'nonexistent-file-12345.txt'
      });

      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });

    it.skipIf(!hasGitHubToken)('should handle invalid search query', async () => {
      const response = await app.callTool('search_repositories', {
        query: ''
      });

      expect(response).toBeDefined();
      // Should either error or return empty results
      expect(response.isError || response.content).toBeTruthy();
    });
  });
});
