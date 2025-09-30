import { JsonRpcSubprocess, JsonRpcSubprocessOptions } from './JsonRPCSubprocess.js';
import {
  JSONRPCMessageSchema,
  LATEST_PROTOCOL_VERSION,
} from './schemas/index.js';
import { InitializeResultSchema } from './schemas/initialization.js';
import { MCPInitializeParams, MCPInitializeResult, MCPResource, MCPResourcesListResult, MCPTool, MCPToolsListResult } from './types/MCP.js';
import { ProtocolError, ToolCallError } from './errors.js';

export interface MCPStdinSubprocessOptions extends JsonRpcSubprocessOptions {
  requestTimeout?: number;
  allowDebugLogging?: boolean;
}

export class MCPStdinSubprocess extends JsonRpcSubprocess {
  private initializeResult?: MCPInitializeResult;
  private toolsCache?: MCPTool[];
  private resourcesCache?: MCPResource[];
  private initialized = false;
  private stderrBuffer: string[] = [];

  private initializePromise: Promise<MCPInitializeResult> | null = null;
  private protocolError: Error | null = null;

  constructor(options?: MCPStdinSubprocessOptions) {
    super(options);

    this.on('stderr', line => {
      this.stderrBuffer.push(line);
    });

    this.on('stdout', line => {
    });

    this.on('output:error:non-json', (line: string) => {
      if (options?.allowDebugLogging) {
        let processName = this.initializeResult?.serverInfo?.name || 'mcp subprocess';
        console.log(`[${processName}]`, line);
      } else {
        this.recordProtocolError(new ProtocolError("Process produced non-JSON output: " + line));
      }
    });

    this.on('error:protocol-error', (error: { error: string, response: any, schemaErrors: any }) => {
      this.recordProtocolError(new ProtocolError("Protocol error in response" + error.error + " " + error.schemaErrors.message));
    });
  }

  assertNoProtocolError() {
    if (this.protocolError) {
      throw this.protocolError;
    }
  }

  recordProtocolError(error: Error) {
    if (!this.protocolError) {
      this.protocolError = error;
    }
  }

  async _actuallyInitialize(params?: Partial<MCPInitializeParams>): Promise<MCPInitializeResult> {
    this.assertNoProtocolError();
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

      if (this.protocolError) {
        throw this.protocolError;
      }

      const result = await this.sendRequest('initialize', initParams);

      const validation = InitializeResultSchema.safeParse(result);
      if (!validation.success) {
          throw new Error(`Response to initialize() failed schema validation: ${validation.error.message}`);
      }

      this.initializeResult = result;
      this.initialized = true;

      if (this.protocolError) {
        throw this.protocolError;
      }

      return result;
  }

  /*
    initialize()

    Public call to explicitly initialize the MCP.

    This can be called by the client to explicitly initialize the MCP, especially with
    custom parameters.

    If the initialize step was already done, then this throws an error.
  */
  async initialize(params?: Partial<MCPInitializeParams>): Promise<MCPInitializeResult> {
    this.assertNoProtocolError();

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
    this.assertNoProtocolError();

    await this._implicitInitialize();

    if (!this.toolsCache) {
      const result: MCPToolsListResult = await this.sendRequest('tools/list', {});
      this.toolsCache = result.tools;
    }

    return this.toolsCache;
  }

  async getResources(): Promise<MCPResource[]> {
    this.assertNoProtocolError();

    await this._implicitInitialize();

    if (!this.resourcesCache) {
      const result: MCPResourcesListResult = await this.sendRequest('resources/list', {});
      this.resourcesCache = result.resources;
    }

    return this.resourcesCache;
  }

  async supportsTools() {
    const capabilities = this.getInitializeResult()?.capabilities;
    return !!(capabilities?.tools);
  }

  async supportsResources() {
    const capabilities = this.getInitializeResult()?.capabilities;
    return !!(capabilities?.resources);
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

    if (!await this.supportsTools()) {
      throw new ToolCallError(`Tools ${name} are not supported by the server (based on capabilities)`);
    }

    if (!await this.hasTool(name)) {
      throw new ToolCallError(`Tool ${name} not declared in tools/list`);
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
}
