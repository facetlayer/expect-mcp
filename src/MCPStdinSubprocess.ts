import { JsonRpcSubprocess, JsonRpcSubprocessOptions } from '@facetlayer/json-rpc-subprocess';
import { z } from 'zod';
import {
  JSONRPCMessageSchema,
  LATEST_PROTOCOL_VERSION,
} from './schemas/index.js';
import { InitializeResultSchema } from './schemas/initialization.js';

export interface MCPCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: {
    level?: string;
  };
}

export interface MCPInitializeParams {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
  instructions?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPToolsListResult {
  tools: MCPTool[];
}

export interface MCPResourcesListResult {
  resources: MCPResource[];
}

export interface MCPStdinSubprocessOptions extends JsonRpcSubprocessOptions {
  strictMode?: boolean;
}

export class MCPStdinSubprocess extends JsonRpcSubprocess {
  private initializeResult?: MCPInitializeResult;
  private toolsCache?: MCPTool[];
  private resourcesCache?: MCPResource[];
  private initialized = false;
  private stderrBuffer: string[] = [];
  private strictMode: boolean;

  constructor(options?: MCPStdinSubprocessOptions) {
    super(options);
    this.strictMode = options?.strictMode ?? false;

    this.on('stderr', line => {
      this.stderrBuffer.push(line);
    });

    if (this.strictMode) {
      this.setupStrictModeValidation();
    }
  }

  private setupStrictModeValidation() {
    this.on('response', (data: any) => {
      this.validateStrictModeResponse(data);
    });

    this.on('notification', (data: any) => {
      this.validateStrictModeNotification(data);
    });
  }

  private validateStrictModeResponse(data: any) {
    if (!this.strictMode) return;

    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const result = JSONRPCMessageSchema.safeParse(parsed);

      if (!result.success) {
        throw new Error(`Strict mode: Invalid JSON-RPC response: ${result.error.message}`);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Strict mode: Response is not valid JSON: ${error.message}`);
      }
      throw error;
    }
  }

  private validateStrictModeNotification(data: any) {
    if (!this.strictMode) return;

    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const result = JSONRPCMessageSchema.safeParse(parsed);

      if (!result.success) {
        throw new Error(`Strict mode: Invalid JSON-RPC notification: ${result.error.message}`);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Strict mode: Notification is not valid JSON: ${error.message}`);
      }
      throw error;
    }
  }

  async initialize(params?: Partial<MCPInitializeParams>): Promise<MCPInitializeResult> {
    if (this.initialized) {
      throw new Error('MCP already initialized');
    }

    await this.waitForStart();

    const initParams: MCPInitializeParams = {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      clientInfo: {
        name: 'expect-mcp',
        version: '0.0.1',
      },
      ...params,
    };

    try {
      const result = await this.sendRequest('initialize', initParams);

      if (this.strictMode) {
        const validation = InitializeResultSchema.safeParse(result);
        if (!validation.success) {
          throw new Error(`Strict mode: Initialize response validation failed: ${validation.error.message}`);
        }
      }

      this.initializeResult = result;
      this.initialized = true;

      return result;
    } catch (error: any) {
      // Show a brief error message with the stderr buffer.
      let errorMessage = error.message;
      if (error.getErrorMessageWithoutMethod) {
        errorMessage = error.getErrorMessageWithoutMethod();
      }

      throw new Error(
        'Failed to initialize MCP: ' + this.stderrBuffer.join('\n') + '\n' + errorMessage
      );
    }
  }

  async getTools(): Promise<MCPTool[]> {
    if (!this.initialized) {
      throw new Error('MCP not initialized. Call initialize() first.');
    }

    if (!this.toolsCache) {
      const result: MCPToolsListResult = await this.sendRequest('tools/list', {});
      this.toolsCache = result.tools;
    }

    return this.toolsCache;
  }

  async getResources(): Promise<MCPResource[]> {
    if (!this.initialized) {
      throw new Error('MCP not initialized. Call initialize() first.');
    }

    if (!this.resourcesCache) {
      const result: MCPResourcesListResult = await this.sendRequest('resources/list', {});
      this.resourcesCache = result.resources;
    }

    return this.resourcesCache;
  }

  async hasTool(toolName: string): Promise<boolean> {
    const tools = await this.getTools();
    return tools.some(tool => tool.name === toolName);
  }

  async hasResource(resourceName: string): Promise<boolean> {
    const resources = await this.getResources();
    return resources.some(resource => resource.name === resourceName);
  }

  async callTool(name: string, arguments_: any = {}): Promise<any> {
    if (!this.initialized) {
      throw new Error('MCP not initialized. Call initialize() first.');
    }

    const response = await this.sendRequest('tools/call', {
      name,
      arguments: arguments_,
    });

    return response;
  }

  getInitializeResult(): MCPInitializeResult | undefined {
    return this.initializeResult;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isStrictModeEnabled(): boolean {
    return this.strictMode;
  }
}
