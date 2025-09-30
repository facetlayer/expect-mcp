#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Sample MCP server that ignores stdin close and continues running.
 * This is used to test the timeout behavior of the close() method.
 *
 * This server intentionally keeps running even after stdin is closed,
 * simulating a misbehaving server that doesn't handle shutdown properly.
 */
class ServerThatIgnoresClose {
  private server: Server;
  private keepAliveInterval?: NodeJS.Timeout;

  constructor() {
    this.server = new Server(
      {
        name: "server-ignore-close",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async start(): Promise<void> {
    // Connect using stdio transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Keep the process alive by setting up an interval
    // This prevents the normal Node.js behavior of exiting when stdin closes
    this.keepAliveInterval = setInterval(() => {
      // Do nothing, just keep the event loop busy
    }, 100);

    // Prevent the default behavior of exiting on stdin end
    process.stdin.on('end', () => {
      // Ignore - don't exit
    });
  }
}

// Start the server when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ServerThatIgnoresClose();
  server.start().catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
}

export { ServerThatIgnoresClose };