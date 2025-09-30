#!/usr/bin/env node

import { createInterface } from 'readline';

interface JSONRPCMessage {
  jsonrpc: string;
  id?: string | number | null;
  method?: string;
  params?: any;
  result?: any;
}

/**
 * Deliberately broken MCP server that sends requests with null IDs
 */
class NullIdServer {
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
    const response = {
      jsonrpc: '2.0',
      id: null, // <-- deliberately null!
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        serverInfo: {
          name: 'null-id-server',
          version: '1.0.0',
        }
      }
    };

    process.stdout.write(JSON.stringify(response) + '\n');
  }

  start(): void {
    // Server is ready
  }
}

async function main() {
  const server = new NullIdServer();
  server.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});