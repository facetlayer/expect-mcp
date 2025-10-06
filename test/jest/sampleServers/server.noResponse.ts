#!/usr/bin/env node

import { createInterface } from 'readline';

/**
 * Deliberately broken MCP server that never responds to initialize
 */
class NoResponseServer {
  private rl: ReturnType<typeof createInterface>;

  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.rl.on('line', line => {
      // Receive the message but never respond
      // This simulates a hanging server
    });

    this.rl.on('close', () => {
      process.exit(0);
    });
  }

  start(): void {
    // Server is ready (but won't respond to anything)
  }
}

async function main() {
  const server = new NoResponseServer();
  server.start();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
