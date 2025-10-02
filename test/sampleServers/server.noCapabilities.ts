#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Sample MCP server using the official ModelContextProtocol SDK.
 * This server provides no tools or resources - it only implements
 * the basic MCP protocol handshake and lifecycle.
 */
class OfficialSDKSampleServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'official-sdk-sample',
        version: '1.0.0',
      },
      {
        capabilities: {
          // No tools, resources, or prompts capabilities
        },
      }
    );
  }

  async start(): Promise<void> {
    // Connect using stdio transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new OfficialSDKSampleServer();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { OfficialSDKSampleServer };
