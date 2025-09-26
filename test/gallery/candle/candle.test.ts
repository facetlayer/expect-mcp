import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { shellCommand } from '../../../src/index.js';
import type { MCPStdinSubprocess } from '../../../src/MCPStdinSubprocess.js';
import '../../../../src/vitest.js';

const LocalBinPath = __dirname + '/node_modules/.bin';

describe('Candle MCP Server', () => {
  let app: MCPStdinSubprocess;

  beforeAll(async () => {
    // Launch candle in MCP mode
    app = shellCommand('node', [LocalBinPath + '/candle', '--mcp']);
    await app.initialize();
  });

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
    if (!app.callTool) {
      throw new Error('callTool method not available on MCPStdinSubprocess');
    }

    const response = await app.callTool('ListServices', {});

    // Candle returns its response wrapped in MCP JSON-RPC format
    expect(response).toHaveProperty('result');

    // The actual candle result is directly in response.result, which has { error?, logs }
    const candleResult = response.result;

    // Should always have logs array
    expect(candleResult).toHaveProperty('logs');
    expect(Array.isArray(candleResult.logs)).toBe(true);

    // Should have either result or error field (not both undefined/null)
    const hasResult = 'result' in candleResult && candleResult.result !== undefined && candleResult.result !== null;
    const hasError = 'error' in candleResult && candleResult.error !== undefined && candleResult.error !== null;
    expect(hasResult || hasError).toBe(true);

    // Log what we got for debugging
    console.log('ListServices response:', JSON.stringify(candleResult, null, 2));
  });

  it('should execute GetLogs tool and handle nonexistent service', async () => {
    if (!app.callTool) {
      throw new Error('callTool method not available on MCPStdinSubprocess');
    }

    const response = await app.callTool('GetLogs', { name: 'nonexistent-service' });

    expect(response).toHaveProperty('result');
    const candleResult = response.result;

    // Should always have logs array
    expect(candleResult).toHaveProperty('logs');
    expect(Array.isArray(candleResult.logs)).toBe(true);

    // Should have either result or error
    const hasResult = candleResult.result !== undefined && candleResult.result !== null;
    const hasError = candleResult.error !== undefined && candleResult.error !== null;
    expect(hasResult || hasError).toBe(true);

    // Log what we got for debugging
    console.log('GetLogs response:', JSON.stringify(candleResult, null, 2));
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