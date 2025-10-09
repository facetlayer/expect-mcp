#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Deliberately broken MCP server that claims prompts capability
 * but returns empty prompts list, then accepts prompt calls anyway
 */
class PromptsNotListedServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'prompts-not-listed-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // BROKEN: Returns empty prompts list
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [],
      };
    });

    // But still handles prompt calls (should fail validation)
    this.server.setRequestHandler(GetPromptRequestSchema, async request => {
      const { name } = request.params;

      return {
        description: 'Undeclared prompt',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Called undeclared prompt: ${name}`,
            },
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
  const server = new PromptsNotListedServer();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { PromptsNotListedServer };
