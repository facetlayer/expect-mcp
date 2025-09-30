#!/usr/bin/env node

import { createInterface } from 'readline';

interface JSONRPCMessage {
  jsonrpc: string;
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
}

/**
 * Deliberately broken MCP server that outputs debug logs to stdout
 * This violates the MCP spec which requires all stdout to be valid JSON-RPC
 */
class DebugLoggingServer {
  private rl: ReturnType<typeof createInterface>;

  constructor() {
    // DELIBERATELY BROKEN: Writing debug logs to stdout
    console.log('DEBUG: Server starting...');
    console.log('DEBUG: Initializing readline interface');

    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    this.rl.on('line', (line) => {
      console.log(`DEBUG: Received message: ${line}`);
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
      console.log('DEBUG: Parse error');
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
    console.log('DEBUG: Handling initialize request');

    const response = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        serverInfo: {
          name: 'debug-logging-server',
          version: '1.0.0',
        }
      }
    };

    process.stdout.write(JSON.stringify(response) + '\n');
    console.log('DEBUG: Initialize response sent');
  }

  start(): void {
    console.log('DEBUG: Server ready');
  }
}

async function main() {
  const server = new DebugLoggingServer();
  server.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});