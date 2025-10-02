import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../dist/index.js';
import '../../dist/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

describe('Memory MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    const projectDir = __dirname;
    const imageName = 'memory-mcp:latest';

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
    it('should provide expected memory tools', async () => {
      await expect(app).toHaveTool('create_entities');
      await expect(app).toHaveTool('create_relations');
      await expect(app).toHaveTool('add_observations');
      await expect(app).toHaveTool('delete_entities');
      await expect(app).toHaveTool('delete_observations');
      await expect(app).toHaveTool('delete_relations');
      await expect(app).toHaveTool('read_graph');
      await expect(app).toHaveTool('search_nodes');
      await expect(app).toHaveTool('open_nodes');
    });

    it('should have correct tool schemas', async () => {
      const tools = await app.getTools();

      const createEntitiesToolSchema = tools.find(tool => tool.name === 'create_entities');
      expect(createEntitiesToolSchema).toBeDefined();
      expect(createEntitiesToolSchema?.inputSchema.type).toBe('object');
      expect(createEntitiesToolSchema?.inputSchema.required).toContain('entities');

      const searchNodesTool = tools.find(tool => tool.name === 'search_nodes');
      expect(searchNodesTool).toBeDefined();
      expect(searchNodesTool?.inputSchema.required).toContain('query');

      const readGraphTool = tools.find(tool => tool.name === 'read_graph');
      expect(readGraphTool).toBeDefined();
    });
  });

  describe('Memory Operations', () => {
    it('should create entities in the knowledge graph', async () => {
      const response = await app.callTool('create_entities', {
        entities: [
          {
            name: 'test-entity',
            entityType: 'concept',
            observations: ['This is a test entity'],
          },
        ],
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);
    });

    it('should search for nodes in the knowledge graph', async () => {
      const response = await app.callTool('search_nodes', {
        query: 'test',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const textContent = response.content.find(c => c.type === 'text');
      expect(textContent).toBeDefined();
    });

    it('should read the entire knowledge graph', async () => {
      const response = await app.callTool('read_graph', {});

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const textContent = response.content.find(c => c.type === 'text');
      expect(textContent).toBeDefined();
    });

    it('should create relations between entities', async () => {
      // First create two entities
      await app.callTool('create_entities', {
        entities: [
          {
            name: 'entity-a',
            entityType: 'concept',
            observations: ['First entity'],
          },
          {
            name: 'entity-b',
            entityType: 'concept',
            observations: ['Second entity'],
          },
        ],
      });

      // Create a relation between them
      const response = await app.callTool('create_relations', {
        relations: [
          {
            from: 'entity-a',
            to: 'entity-b',
            relationType: 'related_to',
          },
        ],
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should add observations to existing entities', async () => {
      const response = await app.callTool('add_observations', {
        observations: [
          {
            entityName: 'test-entity',
            contents: ['Additional observation about test entity'],
          },
        ],
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should open specific nodes by name', async () => {
      const response = await app.callTool('open_nodes', {
        names: ['test-entity'],
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();

      const textContent = response.content.find(c => c.type === 'text');
      expect(textContent?.text).toContain('test-entity');
    });

    it('should delete entities', async () => {
      const response = await app.callTool('delete_entities', {
        entityNames: ['test-entity'],
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle searching for non-existent nodes', async () => {
      const response = await app.callTool('search_nodes', {
        query: 'nonexistent-entity-12345',
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle opening non-existent nodes', async () => {
      const response = await app.callTool('open_nodes', {
        names: ['nonexistent-entity'],
      });

      expect(response).toBeDefined();
      // Should either return empty or error
      expect(response.content || response.isError).toBeTruthy();
    });

    it('should handle invalid entity creation', async () => {
      const response = await app.callTool('create_entities', {
        entities: [],
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });
});
