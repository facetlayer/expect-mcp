import { unixPipeToLines } from '@facetlayer/parse-stdout-lines';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import * as events from 'events';
import { ProcessExitWhileWaitingForResponse } from './errors.js';
import { JSONRPCMessageSchema } from './schemas/index.js';
import { JsonRpcNotification, JsonRpcRequest, JsonRpcResponse } from './types/JsonRPC.js';

const VerboseLogging = false;
const DefaultRequestTimeout = 15000;

export interface JsonRpcSubprocessOptions extends SpawnOptions {
  existingProcess?: ChildProcess;
  requestTimeout?: number;
}

interface PendingRequest {
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  method: string;
  timeoutId: any;
}

export class JsonRpcSubprocess extends events.EventEmitter {
  private subprocess: ChildProcess | null = null;
  private _hasSetupListeners = false;
  private pendingRequests = new Map<string | number, PendingRequest>();
  private enqueuedRequests = new Map<string | number, JsonRpcRequest>();
  private nextRequestId = 1;
  private _hasStarted = false;
  private _hasExited = false;
  private _exitCode: number | null = null;
  private startPromise?: Promise<void>;
  private stdoutCleanup?: () => void;
  private stderrCleanup?: () => void;

  options: JsonRpcSubprocessOptions;

  constructor(options: JsonRpcSubprocessOptions = {}) {
    super();

    if (options.existingProcess) {
      this.subprocess = options.existingProcess;
      this._setupListeners();
      this._hasStarted = true;
    }

    this.options = {
      requestTimeout: DefaultRequestTimeout,
      ...options,
    };
  }

  /*
    Create the subprocess using child_process.spawn

    This must be called once after creating the JsonRpcSubprocess instance.
  */
  spawn(command: string, args: string[] = [], spawnOptions: SpawnOptions = {}): void {
    if (this.subprocess) {
      throw new Error('Subprocess already spawned');
    }

    const finalOptions: SpawnOptions = {
      ...spawnOptions,
      stdio: ['pipe', 'pipe', 'pipe'],
    };

    this.subprocess = spawn(command, args, finalOptions);
    this._setupListeners();
  }

  _setupListeners(): void {
    if (this._hasSetupListeners) {
      return;
    }

    this._hasSetupListeners = true;

    // Forward error events immediately to prevent unhandled errors
    this.subprocess!.on('error', (error: Error) => {
      if (VerboseLogging) {
        console.error(`[json-rpc-subprocess] subprocess 'error' event`, error);
      }
      this.emit('error', error);
    });

    this.startPromise = new Promise<void>((resolve, reject) => {
      this.subprocess!.on('spawn', () => {
        this.emit('spawn');
        if (VerboseLogging) {
          console.error(`[json-rpc-subprocess] subprocess 'spawn' event`);
        }

        this._hasStarted = true;
        this.processEnqueuedRequests();
        resolve();
      });
    });

    this.stdoutCleanup = unixPipeToLines(this.subprocess!.stdout!, (line: string | null) => {
      if (line === null) return;

      this.emit('stdout', line);

      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      let jsonMessage: JsonRpcRequest | JsonRpcResponse;
      try {
        jsonMessage = JSON.parse(trimmedLine);
      } catch (e) {
        this.emit('output:error:non-json', trimmedLine);
        return;
      }

      if ('method' in jsonMessage) {
        // Incoming request. Not implemented yet. This is used in some cases like roots.
        return;
      }

      this.handleIncomingMessage(jsonMessage);
    });

    this.stderrCleanup = unixPipeToLines(this.subprocess!.stderr!, (line: string | null) => {
      if (line === null) return;

      this.emit('stderr', line);
    });

    this.subprocess!.on('exit', (code: number | null, signal: string | null) => {
      if (VerboseLogging) {
        console.error(`[json-rpc-subprocess] subprocess 'exit' event`, code, signal);
      }

      this._hasExited = true;
      this._exitCode = code;

      this.emit('exit', code, signal);

      if (code !== 0 && code !== null) {
        for (const [, pendingRequest] of this.pendingRequests) {
          const error = new ProcessExitWhileWaitingForResponse({
            exitCode: code,
            exitSignal: signal,
            method: pendingRequest.method,
          });
          pendingRequest.reject(error);
        }
        this.pendingRequests.clear();
      }

      this.subprocess = null;
    });
  }

  /*
    Wait for the subprocess to finish spawning.

    This will throw an error if the subprocess fails to spawn (such as 'command not found' error).
  */
  async waitForStart(): Promise<void> {
    if (!this.startPromise) {
      throw new Error('Subprocess not spawned');
    }
    return this.startPromise;
  }

  /*
    processEnqueuedRequests - Called when the subprocess has spawned, to write any enqueued requests
    to the subprocess.
  */
  private processEnqueuedRequests(): void {
    if (!this.subprocess || !this.subprocess.stdin) {
      return;
    }

    for (const [, request] of this.enqueuedRequests) {
      this.subprocess.stdin.write(JSON.stringify(request) + '\n');
    }

    this.enqueuedRequests.clear();
  }

  /*
    handleJsonRpcResponse - Called when a JSON-RPC response is received from the subprocess.
  */
  private handleIncomingMessage(response: JsonRpcResponse): void {
    this.emit('response', response);

    // Check schema
    const schemaCheck = JSONRPCMessageSchema.safeParse(response);
    if (!schemaCheck.success) {
      this.emit('error:protocol-error', {
        error: `Response that does not match the JSON-RPC schema`,
        response,
        schemaErrors: schemaCheck.error,
      });
    }

    const pendingRequest = this.pendingRequests.get(response.id!);
    if (!pendingRequest) {
      this.emit('error:protocol-error', {
        error: `Received a response that does not match any pending request`,
        response,
      });
      return;
    }

    this.pendingRequests.delete(response.id!);
    clearTimeout(pendingRequest.timeoutId);

    if (response.error) {
      pendingRequest.reject(
        new Error(
          `JSON-RPC error in ${pendingRequest.method}: ${response.error.message} (code: ${response.error.code})`
        )
      );
    } else {
      pendingRequest.resolve(response.result);
    }
  }

  sendNotification(method: string, params?: any): void {
    if (!this.subprocess) {
      throw new Error('Subprocess not started');
    }

    const notification: JsonRpcNotification = {
      jsonrpc: '2.0',
      method,
    };

    // Only include params if it's not undefined and not an empty object
    if (params !== undefined && !(typeof params === 'object' && Object.keys(params).length === 0)) {
      notification.params = params;
    }

    this.emit('notification', notification);

    if (this._hasStarted && this.subprocess!.stdin) {
      this.subprocess!.stdin.write(JSON.stringify(notification) + '\n');
    }
  }

  async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.subprocess) {
      throw new Error('Subprocess not started');
    }

    const id = this.nextRequestId++;

    // Build request, omitting params if it's undefined or an empty object
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      id,
    };

    // Only include params if it's not undefined and not an empty object
    if (params !== undefined && !(typeof params === 'object' && Object.keys(params).length === 0)) {
      request.params = params;
    }

    this.emit('request', request);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        this.enqueuedRequests.delete(id);
        reject(new Error(`Request timeout for method: ${method}`));
      }, this.options.requestTimeout);

      this.pendingRequests.set(id, {
        resolve,
        reject: error => {
          clearTimeout(timeoutId);
          reject(error);
        },
        method,
        timeoutId,
      });

      if (this._hasStarted && this.subprocess!.stdin) {
        // Process is ready, send immediately
        this.subprocess!.stdin.write(JSON.stringify(request) + '\n');
      } else {
        // Process not ready yet, enqueue the request
        this.enqueuedRequests.set(id, request);
      }
    });
  }

  kill(): void {
    for (const [, pendingRequest] of this.pendingRequests) {
      clearTimeout(pendingRequest.timeoutId);
      pendingRequest.reject(
        new Error(`Process killed while waiting for response to ${pendingRequest.method}`)
      );
    }
    this.pendingRequests.clear();

    if (this.subprocess) {
      // Clean up event listeners first
      if (this.stdoutCleanup) {
        this.stdoutCleanup();
        this.stdoutCleanup = undefined;
      }
      if (this.stderrCleanup) {
        this.stderrCleanup();
        this.stderrCleanup = undefined;
      }

      // Destroy streams to ensure proper cleanup and prevent open handles
      if (this.subprocess.stdin && !this.subprocess.stdin.destroyed) {
        this.subprocess.stdin.destroy();
      }
      if (this.subprocess.stdout && !this.subprocess.stdout.destroyed) {
        this.subprocess.stdout.destroy();
      }
      if (this.subprocess.stderr && !this.subprocess.stderr.destroyed) {
        this.subprocess.stderr.destroy();
      }

      if (!this.subprocess.kill()) {
          console.warn("child_process.kill() failed");
      }
      this.subprocess = null;
      this.emit('killed');
    }
  }

  isRunning(): boolean {
    return this.subprocess != null && !this.subprocess.killed;
  }

  hasStarted(): boolean {
    return this._hasStarted;
  }

  hasExited(): boolean {
    return this._hasExited;
  }

  exitCode(): number | null {
    return this._exitCode;
  }

  async waitForExit(): Promise<number> {
    if (!this.subprocess) {
      throw new Error('Subprocess not started');
    }

    if (this._hasExited) {
      return this._exitCode || 0;
    }

    return new Promise<number>(resolve => {
      this.subprocess!.on('exit', (code: number | null) => {
        resolve(code || 0);
      });
    });
  }

  /**
   * Close stdin to signal the subprocess to shut down gracefully.
   * This is typically used in conjunction with waitForExit() to implement
   * a graceful shutdown flow.
   */
  closeStdin(): void {
    if (this.subprocess && this.subprocess.stdin && !this.subprocess.stdin.destroyed) {
      this.subprocess.stdin.end();
    }
  }
}
