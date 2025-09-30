import { unixPipeToLines } from '@facetlayer/parse-stdout-lines';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import * as events from 'events';
import { JsonRpcRequest, JsonRpcResponse } from './types/JsonRPC.js';
import { ProcessExitWhileWaitingForResponse } from './errors.js';
import { JSONRPCMessageSchema } from './schemas/index.js';

const VerboseLogging = false;
const DefaultRequestTimeout = 15000;

export interface JsonRpcSubprocessOptions extends SpawnOptions {
  requestTimeout?: number;
}

interface PendingRequest {
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  method: string;
  timeoutId: any;
}

export class JsonRpcSubprocess extends events.EventEmitter {
  private subprocess?: ChildProcess;
  private pendingRequests = new Map<string | number, PendingRequest>();
  private enqueuedRequests = new Map<string | number, JsonRpcRequest>();
  private nextRequestId = 1;
  private _hasStarted = false;
  private _hasExited = false;
  private _exitCode: number | null = null;
  private startPromise?: Promise<void>;

  options: JsonRpcSubprocessOptions;

  constructor(options: JsonRpcSubprocessOptions = {}) {
    super();
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

    // Forward error events immediately to prevent unhandled errors
    this.subprocess.on('error', (error: Error) => {
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

    this.setupListeners();
  }

  private setupListeners(): void {
    unixPipeToLines(this.subprocess!.stdout!, (line: string | null) => {
      if (line === null) return;

      this.emit('stdout', line);

      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      try {
        const jsonResponse: JsonRpcResponse = JSON.parse(trimmedLine);
        this.handleJsonRpcResponse(jsonResponse);
      } catch (e) {
        this.emit('output:error:non-json', trimmedLine);
      }
    });

    unixPipeToLines(this.subprocess!.stderr!, (line: string | null) => {
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
  private handleJsonRpcResponse(response: JsonRpcResponse): void {
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

  async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.subprocess) {
      throw new Error('Subprocess not started');
    }

    const id = this.nextRequestId++;
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id,
    };

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
      this.subprocess.kill();
    }

    this.emit('killed');
  }

  isRunning(): boolean {
    return this.subprocess !== undefined && !this.subprocess.killed;
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
