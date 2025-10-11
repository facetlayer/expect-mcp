import { PromptCallError, ProtocolError, ResourceCallError, ToolCallError } from './errors.js';
import { GetPromptResult } from './results/GetPromptResult.js';
import { JsonRpcSubprocess, JsonRpcSubprocessOptions } from './JsonRPCSubprocess.js';
import { ReadResourceResult } from './results/ReadResourceResult.js';
import { LATEST_PROTOCOL_VERSION } from './schemas/index.js';
import { InitializeResultSchema } from './schemas/initialization.js';
import { GetPromptResultSchema } from './schemas/prompts.js';
import { ReadResourceResultSchema } from './schemas/resources.js';
import { CallToolResultSchema } from './schemas/tools.js';
import { ToolCallResult } from './results/ToolCallResult.js';
import {
  MCPInitializeParams,
  MCPInitializeResult,
  MCPPrompt,
  MCPPromptsListResult,
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
  private promptsCache?: MCPPrompt[];
  private initialized = false;

  private initializePromise: Promise<MCPInitializeResult> | null = null;
  private protocolError: Error | null = null;
  private exitPromise: Promise<number> | null = null;

  constructor(options?: MCPStdinSubprocessOptions) {
    super(options);

    this.on('output:error:non-json', (line: string) => {
      if (options?.allowDebugLogging) {
        let processName = this.initializeResult?.serverInfo?.name || 'mcp subprocess';
        console.log(`[${processName}]`, line);
      } else {
        let errorMessage = 'Process produced non-JSON output: ' + JSON.stringify(line);

        if (this.stdoutBuffer.length > 0) {
          errorMessage += '\n\nstdout:\n' + this.stdoutBuffer.join('\n');
        }
        if (this.stderrBuffer.length > 0) {
          errorMessage += '\n\nstderr:\n' + this.stderrBuffer.join('\n');
        }

        this.recordProtocolError(new ProtocolError(errorMessage));
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

  async getPrompts(): Promise<MCPPrompt[]> {
    this.assertNoProtocolError();

    await this._implicitInitialize();

    if (!this.promptsCache) {
      const result: MCPPromptsListResult = await this.sendRequest('prompts/list', {});
      this.promptsCache = result.prompts;
    }

    return this.promptsCache;
  }

  /**
   * Check if the server supports tools.
   * Note: This will implicitly initialize the server if not already initialized.
   *
   * @returns Promise<boolean> indicating if tools are supported
   */
  async supportsTools(): Promise<boolean> {
    await this._implicitInitialize();
    const capabilities = this.getInitializeResult()?.capabilities;
    return !!capabilities?.tools;
  }

  /**
   * Check if the server supports resources.
   * Note: This will implicitly initialize the server if not already initialized.
   *
   * @returns Promise<boolean> indicating if resources are supported
   */
  async supportsResources(): Promise<boolean> {
    await this._implicitInitialize();
    const capabilities = this.getInitializeResult()?.capabilities;
    return !!capabilities?.resources;
  }

  /**
   * Check if the server supports prompts.
   * Note: This will implicitly initialize the server if not already initialized.
   *
   * @returns Promise<boolean> indicating if prompts are supported
   */
  async supportsPrompts(): Promise<boolean> {
    await this._implicitInitialize();
    const capabilities = this.getInitializeResult()?.capabilities;
    return !!capabilities?.prompts;
  }

  async hasTool(toolName: string): Promise<boolean> {
    const tools = await this.getTools();
    return tools.some(tool => tool.name === toolName);
  }

  async hasResource(resourceName: string): Promise<boolean> {
    const resources = await this.getResources();
    return resources.some(resource => resource.name === resourceName);
  }

  async hasPrompt(promptName: string): Promise<boolean> {
    const prompts = await this.getPrompts();
    return prompts.some(prompt => prompt.name === promptName);
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

  async getPrompt(name: string, arguments_: any = {}): Promise<GetPromptResult> {
    await this._implicitInitialize();

    if (!(await this.supportsPrompts())) {
      throw new PromptCallError(
        `Prompts are not supported by the server (based on capabilities)`
      );
    }

    const prompts = await this.getPrompts();
    const prompt = prompts.find(p => p.name === name);

    if (!prompt) {
      throw new PromptCallError(`Prompt ${name} not declared in prompts/list`);
    }

    const response = await this.sendRequest('prompts/get', {
      name,
      arguments: arguments_,
    });

    // Validate the response against the schema
    const validation = GetPromptResultSchema.safeParse(response);
    if (!validation.success) {
      throw new ProtocolError(
        `Response to prompts/get failed schema validation: ${validation.error.message}`
      );
    }

    return new GetPromptResult(validation.data);
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
