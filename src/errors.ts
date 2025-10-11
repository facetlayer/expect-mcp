export class ProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProtocolError';
  }
}

export class ToolCallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolCallError';
  }
}

export class ResourceCallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceCallError';
  }
}

export class PromptCallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptCallError';
  }
}

export interface ProcessFailedToStartOptions {
  shellCommand: string;
  exitCode: number;
  exitSignal: string | null;
  stdout?: string[];
  stderr?: string[];
}

export class ProcessFailedToStart extends Error {
  shellCommand: string;
  exitCode: number;
  exitSignal: string | null;
  stdout?: string[];
  stderr?: string[];

  constructor(options: ProcessFailedToStartOptions) {
    let message = `Process exited with code ${options.exitCode}${options.exitSignal ? ` (signal: ${options.exitSignal})` : ''} during startup`;

    if (options.stdout && options.stdout.length > 0) {
      message += '\n\nstdout:\n' + options.stdout.join('\n');
    }
    if (options.stderr && options.stderr.length > 0) {
      message += '\n\nstderr:\n' + options.stderr.join('\n');
    }

    super(message);
    this.name = 'ProcessFailedToStart';
    this.shellCommand = options.shellCommand;
    this.exitCode = options.exitCode;
    this.exitSignal = options.exitSignal;
    this.stdout = options.stdout;
    this.stderr = options.stderr;
  }
}

export interface ProcessExitWhileWaitingForResponseOptions {
  shellCommand: string;
  exitCode: number;
  exitSignal: string | null;
  method: string;
  stdout?: string[];
  stderr?: string[];
}

export class ProcessExitWhileWaitingForResponse extends Error {
  shellCommand: string;
  exitCode: number;
  exitSignal: string | null;
  method: string;
  stdout?: string[];
  stderr?: string[];

  constructor(options: ProcessExitWhileWaitingForResponseOptions) {
    let message = `Process exited with code ${options.exitCode}${options.exitSignal ? ` (signal: ${options.exitSignal})` : ''} while waiting for response to '${options.method}'`;

    // Add stdout/stderr to the error message if they exist and are non-empty
    if (options.stdout && options.stdout.length > 0) {
      message += '\n\nstdout:\n' + options.stdout.join('\n');
    }
    if (options.stderr && options.stderr.length > 0) {
      message += '\n\nstderr:\n' + options.stderr.join('\n');
    }

    super(message);
    this.name = 'ProcessExitWhileWaitingForResponse';
    this.shellCommand = options.shellCommand;
    this.exitCode = options.exitCode;
    this.exitSignal = options.exitSignal;
    this.method = options.method;
    this.stdout = options.stdout;
    this.stderr = options.stderr;
  }
}
