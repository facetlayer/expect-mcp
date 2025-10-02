#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListResourcesRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Sample MCP server with configuration resources
 */
class ConfigResourcesServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'config-resources-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle resources/list
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'config://app_config',
            name: 'app_config',
            description: 'Application configuration',
            mimeType: 'application/json',
          },
          {
            uri: 'config://user_settings',
            name: 'user_settings',
            description: 'User settings',
            mimeType: 'application/json',
          },
        ],
      };
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ConfigResourcesServer();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { ConfigResourcesServer };
