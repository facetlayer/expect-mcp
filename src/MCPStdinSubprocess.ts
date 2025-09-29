import { JsonRpcSubprocess, JsonRpcSubprocessOptions } from '@facetlayer/json-rpc-subprocess';
import {
  JSONRPCMessageSchema,
  LATEST_PROTOCOL_VERSION,
} from './schemas/index.js';
import { InitializeResultSchema } from './schemas/initialization.js';
import { MCPInitializeParams, MCPInitializeResult, MCPResource, MCPResourcesListResult, MCPTool, MCPToolsListResult } from './types/MCP.js';

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

  private initializePromise: Promise<MCPInitializeResult> | null = null;
  private strictModeFailure: Error | null = null;

  constructor(options?: MCPStdinSubprocessOptions) {
    super(options);
    this.strictMode = options?.strictMode ?? false;

    this.on('stderr', line => {
      this.stderrBuffer.push(line);
    });

    if (this.strictMode) {
      // todo
    }
  }

  async _actuallyInitialize(params?: Partial<MCPInitializeParams>): Promise<MCPInitializeResult> {

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

  /*
    initialize()

    Public call to explicitly initialize the MCP.

    This can be called by the client to explicitly initialize the MCP, especially with
    custom parameters.

    If the initialize step was already done, then this throws an error.
  */
  async initialize(params?: Partial<MCPInitializeParams>): Promise<MCPInitializeResult> {
    if (this.initializePromise) {
      throw new Error('initialize() already in progress');
    }

    this.initializePromise = this._actuallyInitialize(params);
    return this.initializePromise;
  }

  /*
    _implicitInitialize

    Called internally to ensure the MCP is initialized.

    If the initialize step was already done, then this just returns the existing promise result.
  */
  async _implicitInitialize() {
    if (this.initializePromise) {
      return this.initializePromise;
    }
    this.initializePromise = this._actuallyInitialize();
    return this.initializePromise;
  }

  async getTools(): Promise<MCPTool[]> {
    await this._implicitInitialize();

    if (!this.toolsCache) {
      const result: MCPToolsListResult = await this.sendRequest('tools/list', {});
      this.toolsCache = result.tools;
    }

    return this.toolsCache;
  }

  async getResources(): Promise<MCPResource[]> {
    await this._implicitInitialize();

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
    await this._implicitInitialize();

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
