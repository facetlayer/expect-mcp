#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Sample MCP server with filesystem tools and resources
 */
class FilesystemServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'filesystem-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle tools/list
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'filesystem_list',
            description: 'Lists files in a directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Directory path',
                },
              },
              required: ['path'],
            },
          },
        ],
      };
    });

    // Handle resources/list
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'file://config.json',
            name: 'config.json',
            description: 'Configuration file',
            mimeType: 'application/json',
          },
          {
            uri: 'file://project_files',
            name: 'project_files',
            description: 'Project files directory',
            mimeType: 'text/plain',
          },
        ],
      };
    });

    // Handle tools/call
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'filesystem_list':
          return {
            content: [
              {
                type: 'text',
                text: `Files in ${args.path}: file1.txt, file2.txt`,
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new FilesystemServer();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { FilesystemServer };
