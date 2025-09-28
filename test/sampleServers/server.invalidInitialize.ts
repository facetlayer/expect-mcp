#!/usr/bin/env node

import { createInterface } from 'readline';

interface JSONRPCMessage {
  jsonrpc: string;
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

class MCPServer {
  private rl: ReturnType<typeof createInterface>;

  constructor() {
    // Set up stdin/stdout for JSON-RPC communication
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
      // This is a response, not a request - ignore for now
      return;
    }

    switch (message.method) {
      case 'initialize':
        this.handleInitialize(message);
        break;
      case 'notifications/initialized':
        this.handleInitialized(message);
        break;
      default:
        this.sendError(message.id ?? null, -32601, `Method not found: ${message.method}`);
    }
  }

  private handleInitialize(message: JSONRPCMessage): void {
    // DELIBERATELY BROKEN: Missing required fields in response
    // According to the spec, we need: protocolVersion, capabilities, serverInfo
    // But we're intentionally omitting some to test validation

    const brokenResponse = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        // Missing protocolVersion - this should cause validation to fail
        capabilities: {
          // Missing some expected capabilities structure
        },
        // Missing serverInfo - this should cause validation to fail
        instructions: 'This is a deliberately broken MCP server for testing'
      }
    };

    this.sendMessage(brokenResponse);
  }

  private handleInitialized(_message: JSONRPCMessage): void {
    // This is a notification, no response needed
    // Just acknowledge it was received
  }

  private sendMessage(message: JSONRPCMessage): void {
    process.stdout.write(JSON.stringify(message) + '\n');
  }

  private sendError(id: string | number | null, code: number, message: string, data?: any): void {
    const errorResponse: JSONRPCMessage = {
      jsonrpc: '2.0',
      id: id ?? undefined,
      error: {
        code,
        message,
        data
      }
    };
    this.sendMessage(errorResponse);
  }

  start(): void {
    // Server is ready and listening for messages on stdin
  }
}

async function main() {
  const server = new MCPServer();
  server.start();
}

main()
.catch(err => {
  console.error(err);
  process.exit(1);
});
