import { JsonRpcSubprocess, JsonRpcSubprocessOptions } from '@facetlayer/json-rpc-subprocess';

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

export class MCPStdinSubprocess extends JsonRpcSubprocess {
  private initializeResult?: MCPInitializeResult;
  private toolsCache?: MCPTool[];
  private resourcesCache?: MCPResource[];
  private initialized = false;

  constructor(options?: JsonRpcSubprocessOptions) {
    super(options);
  }

  async initialize(params?: Partial<MCPInitializeParams>): Promise<MCPInitializeResult> {
    if (this.initialized) {
      throw new Error('MCP already initialized');
    }

    const initParams: MCPInitializeParams = {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      },
      clientInfo: {
        name: 'expect-mcp',
        version: '0.0.1'
      },
      ...params
    };

    const result = await this.sendRequest('initialize', initParams);
    this.initializeResult = result;
    this.initialized = true;

    await this.sendRequest('initialized', {});

    return result;
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

  getInitializeResult(): MCPInitializeResult | undefined {
    return this.initializeResult;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}