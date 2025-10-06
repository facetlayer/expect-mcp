#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Deliberately broken MCP server that claims resources capability
 * but returns empty resources list, then accepts resource reads anyway
 */
class ResourcesNotListedServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'resources-not-listed-server',
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
    // BROKEN: Returns empty resources list
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [],
      };
    });

    // But still handles resource reads (should fail validation)
    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      const { uri } = request.params;

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Content of undeclared resource: ${uri}`,
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
  const server = new ResourcesNotListedServer();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { ResourcesNotListedServer };
