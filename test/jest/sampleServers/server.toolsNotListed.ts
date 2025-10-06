#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Deliberately broken MCP server that claims tools capability
 * but returns empty tools list, then accepts tool calls anyway
 */
class ToolsNotListedServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'tools-not-listed-server',
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
    // BROKEN: Returns empty tools list
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [],
      };
    });

    // But still handles tool calls (should fail validation)
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      return {
        content: [
          {
            type: 'text',
            text: `Called undeclared tool: ${name}`,
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
  const server = new ToolsNotListedServer();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { ToolsNotListedServer };
