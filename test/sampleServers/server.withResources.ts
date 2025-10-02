#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Sample MCP server with resources capability
 */
class ServerWithResources {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'server-with-resources',
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
            uri: 'file:///example.txt',
            name: 'example.txt',
            description: 'An example text file',
            mimeType: 'text/plain',
          },
          {
            uri: 'file:///data.json',
            name: 'data.json',
            description: 'Example JSON data',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Handle resources/read
    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      const { uri } = request.params;

      switch (uri) {
        case 'file:///example.txt':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/plain',
                text: 'Hello, world!',
              },
            ],
          };

        case 'file:///data.json':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({ key: 'value' }),
              },
            ],
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ServerWithResources();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { ServerWithResources };
