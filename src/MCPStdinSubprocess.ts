import { ProtocolError, ResourceCallError, ToolCallError } from './errors.js';
import { JsonRpcSubprocess, JsonRpcSubprocessOptions } from './JsonRPCSubprocess.js';
import { ReadResourceResult } from './ReadResourceResult.js';
import { LATEST_PROTOCOL_VERSION } from './schemas/index.js';
import { InitializeResultSchema } from './schemas/initialization.js';
import { ReadResourceResultSchema } from './schemas/resources.js';
import { CallToolResultSchema } from './schemas/tools.js';
import { ToolCallResult } from './ToolCallResult.js';
import {
  MCPInitializeParams,
  MCPInitializeResult,
  MCPResource,
  MCPResourcesListResult,
  MCPTool,
  MCPToolsListResult,
} from './types/MCP.js';

export interface MCPStdinSubprocessOptions extends JsonRpcSubprocessOptions {
  requestTimeout?: number;
  allowDebugLogging?: boolean;
}

export class MCPStdinSubprocess extends JsonRpcSubprocess {
  static _isMCPStdinSubprocess = true;

  private initializeResult?: MCPInitializeResult;
  private toolsCache?: MCPTool[];
  private resourcesCache?: MCPResource[];
  private initialized = false;
  private stderrBuffer: string[] = [];

  private initializePromise: Promise<MCPInitializeResult> | null = null;
  private protocolError: Error | null = null;
  private exitPromise: Promise<number> | null = null;

  constructor(options?: MCPStdinSubprocessOptions) {
    super(options);

    this.on('stderr', line => {
      this.stderrBuffer.push(line);
    });

    this.on('output:error:non-json', (line: string) => {
      if (options?.allowDebugLogging) {
        let processName = this.initializeResult?.serverInfo?.name || 'mcp subprocess';
        console.log(`[${processName}]`, line);
      } else {
        this.recordProtocolError(new ProtocolError('Process produced non-JSON output: ' + JSON.stringify(line)));
      }
    });

    this.on(
      'error:protocol-error',
      (error: { error: string; response: any; schemaErrors: any }) => {
        let stringMessage = 'Protocol error in response: ' + error.error;
        if (error.schemaErrors) {
          stringMessage += ' ' + error.schemaErrors.message;
        }
        this.recordProtocolError(new ProtocolError(stringMessage));
      }
    );

    this.on('exit', (code: number | null) => {
      if (!this.exitPromise) {
        this.exitPromise = Promise.resolve(code || 0);
      }
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
        roots: {
          listChanged: true,
        },
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
      throw new Error(
        `Response to initialize() failed schema validation: ${validation.error.message}`
      );
    }

    this.initializeResult = result;

    this.sendNotification('notifications/initialized');

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
    return !!capabilities?.tools;
  }

  async supportsResources() {
    const capabilities = this.getInitializeResult()?.capabilities;
    return !!capabilities?.resources;
  }

  async hasTool(toolName: string): Promise<boolean> {
    const tools = await this.getTools();
    return tools.some(tool => tool.name === toolName);
  }

  async hasResource(resourceName: string): Promise<boolean> {
    const resources = await this.getResources();
    return resources.some(resource => resource.name === resourceName);
  }

  async callTool(name: string, arguments_: any = {}): Promise<ToolCallResult> {
    await this._implicitInitialize();

    if (!(await this.supportsTools())) {
      throw new ToolCallError(
        `Tools ${name} are not supported by the server (based on capabilities)`
      );
    }

    if (!(await this.hasTool(name))) {
      throw new ToolCallError(`Tool ${name} not declared in tools/list`);
    }

    const response = await this.sendRequest('tools/call', {
      name,
      arguments: arguments_,
    });

    // Validate the response against the schema
    const validation = CallToolResultSchema.safeParse(response);
    if (!validation.success) {
      throw new ProtocolError(
        `Response to tools/call failed schema validation: ${validation.error.message}`
      );
    }

    return new ToolCallResult(validation.data);
  }

  async readResource(uri: string): Promise<ReadResourceResult> {
    await this._implicitInitialize();

    if (!(await this.supportsResources())) {
      throw new ResourceCallError(
        `Resources are not supported by the server (based on capabilities)`
      );
    }

    const resources = await this.getResources();
    const resource = resources.find(r => r.uri === uri);

    if (!resource) {
      throw new ResourceCallError(`Resource with URI ${uri} not declared in resources/list`);
    }

    const response = await this.sendRequest('resources/read', {
      uri,
    });

    // Validate the response against the schema
    const validation = ReadResourceResultSchema.safeParse(response);
    if (!validation.success) {
      throw new ProtocolError(
        `Response to resources/read failed schema validation: ${validation.error.message}`
      );
    }

    return new ReadResourceResult(validation.data);
  }

  getInitializeResult(): MCPInitializeResult | undefined {
    return this.initializeResult;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Wait for the process to exit.
   *
   * Returns a promise that resolves with the exit code when the process exits.
   * If the process has already exited, returns immediately with the exit code.
   *
   * @returns Promise that resolves with the exit code
   */
  async waitForExit(): Promise<number> {
    if (this.hasExited()) {
      return this.exitCode() || 0;
    }

    if (!this.exitPromise) {
      this.exitPromise = new Promise<number>(resolve => {
        this.once('exit', (code: number | null) => {
          resolve(code || 0);
        });
      });
    }

    return this.exitPromise;
  }

  /**
   * Close the MCP server gracefully.
   *
   * This closes stdin to signal the server to shut down, then waits for
   * the process to exit. If the process doesn't exit within the timeout,
   * an error is thrown.
   *
   * @param timeoutMs - Maximum time to wait for graceful shutdown (default: 5000ms)
   * @throws Error if the process doesn't exit gracefully within the timeout
   */
  async close(timeoutMs: number = 5000): Promise<void> {
    if (this.hasExited()) {
      return;
    }

    // Close stdin to signal the server to shut down
    this.closeStdin();

    // Wait for the process to exit gracefully
    const exitPromise = this.waitForExit();
    const timeoutPromise = new Promise<number>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Server did not exit gracefully within ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      await Promise.race([exitPromise, timeoutPromise]);
    } catch (error) {
      // If the process didn't exit in time, kill it forcefully
      this.kill();

      // Small delay to allow .kill() to work, this helps avoid a false 'detectOpenHandles' error on Jest.
      await new Promise(resolve => setTimeout(resolve, 1000));

      throw error;
    }
  }
}
