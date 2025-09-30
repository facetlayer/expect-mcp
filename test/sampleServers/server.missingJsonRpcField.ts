#!/usr/bin/env node

import { createInterface } from 'readline';

interface JSONRPCMessage {
  jsonrpc?: string;
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Deliberately broken MCP server that omits the "jsonrpc" field from messages
 */
class BrokenJSONRPCServer {
  private rl: ReturnType<typeof createInterface>;

  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    this.rl.on('line', (line) => {
      this.handleMessage(line);
    });

    this.rl.on('close', () => {
      process.exit(0);
    });
  }

  private handleMessage(line: string): void {
    try {
      const message: JSONRPCMessage = JSON.parse(line);
      this.dispatch(message);
    } catch (error) {
      this.sendError(null, -32700, 'Parse error');
    }
  }

  private dispatch(message: JSONRPCMessage): void {
    if (!message.method) {
      return;
    }

    switch (message.method) {
      case 'initialize':
        this.handleInitialize(message);
        break;
      default:
        this.sendError(message.id ?? null, -32601, `Method not found: ${message.method}`);
    }
  }

  private handleInitialize(message: JSONRPCMessage): void {
    // DELIBERATELY BROKEN: Missing "jsonrpc" field
    const brokenResponse = {
      // jsonrpc: '2.0', // MISSING!
      id: message.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        serverInfo: {
          name: 'broken-jsonrpc-server',
          version: '1.0.0',
        }
      }
    };

    process.stdout.write(JSON.stringify(brokenResponse) + '\n');
  }

  private sendError(id: string | number | null, code: number, message: string, data?: any): void {
    // Also broken - missing jsonrpc field
    const errorResponse = {
      // jsonrpc: '2.0', // MISSING!
      id: id ?? undefined,
      error: {
        code,
        message,
        data
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }

  start(): void {
    // Server is ready
  }
}

async function main() {
  const server = new BrokenJSONRPCServer();
  server.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});