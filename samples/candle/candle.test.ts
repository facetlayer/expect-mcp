import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MCPStdinSubprocess } from '../../src/MCPStdinSubprocess.js';
import '../../src/vitest-setup.js';
import { DockerMcpRunner } from '../dockerMcpRunner.js';

async function retryUntil(
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 100
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

describe('Candle MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    const projectDir = __dirname;
    const imageName = 'candle-mcp:latest';

    // Build and launch the Docker container
    app = await DockerMcpRunner.buildAndLaunch({
      projectDir,
      imageName,
      verbose: false,
      allowDebugLogging: true // Candle outputs non-JSON logs for service operations
    });

    await app.initialize();
  }, 60000); // Increase timeout for Docker build

  afterAll(() => {
    if (app) {
      app.kill();
    }
  });

  it('should provide expected tools', async () => {
    const tools = await app.getTools();
    const toolNames = tools.map(tool => tool.name);

    // Verify all expected tools are present
    expect(toolNames).toContain('ListServices');
    expect(toolNames).toContain('GetLogs');
    expect(toolNames).toContain('StartService');
    expect(toolNames).toContain('KillService');
    expect(toolNames).toContain('RestartService');
    expect(toolNames).toContain('AddServerConfig');

    // Verify tool count matches expected
    expect(tools).toHaveLength(6);
  });

  it('should have correct tool schemas', async () => {
    const tools = await app.getTools();

    const listServicesTools = tools.find(tool => tool.name === 'ListServices');
    expect(listServicesTools).toBeDefined();
    expect(listServicesTools?.description).toBe('List services with structured output');
    expect(listServicesTools?.inputSchema.type).toBe('object');
    expect(listServicesTools?.inputSchema.properties?.showAll).toBeDefined();

    const getLogsTool = tools.find(tool => tool.name === 'GetLogs');
    expect(getLogsTool).toBeDefined();
    expect(getLogsTool?.description).toBe('Get recent logs for a specific service');
    expect(getLogsTool?.inputSchema.required).toContain('name');

    const startServiceTool = tools.find(tool => tool.name === 'StartService');
    expect(startServiceTool).toBeDefined();
    expect(startServiceTool?.description).toBe('Start a specific service');
  });

  it('should execute ListServices tool and return structured response', async () => {
    const response = await app.callTool('ListServices', {});

    // Log what we got for debugging
    expect(response).toHaveProperty('result');
    expect(response.result).toHaveProperty('processes');
  });

  it('can launch a service and get logs', async () => {
    const startServiceResponse = await app.callTool('StartService', { name: 'echo-service' });
    expect(startServiceResponse).toHaveProperty('logs');
    expect(startServiceResponse.logs[0]).toContain(`Started 'echo-service'`);

    await retryUntil(async () => {
      const res = await app.callTool('GetLogs', { name: 'echo-service' });
      return res.logs.length > 0;
    });

    const getLogsResponse = await app.callTool('GetLogs', { name: 'echo-service' });
    expect(getLogsResponse).toHaveProperty('logs');
    expect(getLogsResponse.logs[0]).toContain(`Hello from echo service`);
  });

  it('should have proper MCP server info', () => {
    const initResult = app.getInitializeResult();
    expect(initResult).toBeDefined();
    expect(initResult?.serverInfo.name).toBe('@facetlayer/candle');
    expect(initResult?.serverInfo.version).toBeDefined();
    expect(initResult?.capabilities.tools).toBeDefined();
    expect(initResult?.instructions).toContain('Tool for running and managing local dev servers');
  });
});
