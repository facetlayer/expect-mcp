#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Sample MCP server with file operation tools
 */
class FileOperationsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'file-operations-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
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
            name: 'read_file',
            description: 'Reads the contents of a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'write_file',
            description: 'Writes content to a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file',
                },
                content: {
                  type: 'string',
                  description: 'Content to write',
                },
              },
              required: ['path', 'content'],
            },
          },
        ],
      };
    });

    // Handle tools/call
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'read_file':
          return {
            content: [
              {
                type: 'text',
                text: `File contents from ${args.path}`,
              },
            ],
          };

        case 'write_file':
          return {
            content: [
              {
                type: 'text',
                text: `Wrote to ${args.path}`,
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
  const server = new FileOperationsServer();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { FileOperationsServer };
