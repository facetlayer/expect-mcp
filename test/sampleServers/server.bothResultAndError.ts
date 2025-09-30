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

/**
 * Deliberately broken MCP server that includes both result and error in response
 */
class BothResultAndErrorServer {
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
      // ignore
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
    }
  }

  private handleInitialize(message: JSONRPCMessage): void {
    // DELIBERATELY BROKEN: Has both result AND error
    const brokenResponse = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        serverInfo: {
          name: 'both-result-and-error-server',
          version: '1.0.0',
        }
      },
      error: {
        code: -32000,
        message: 'This should not be here with result!'
      }
    };

    process.stdout.write(JSON.stringify(brokenResponse) + '\n');
  }

  start(): void {
    // Server is ready
  }
}

async function main() {
  const server = new BothResultAndErrorServer();
  server.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});