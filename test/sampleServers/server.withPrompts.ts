#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Sample MCP server with prompts capability
 */
class ServerWithPrompts {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'server-with-prompts',
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
    // Handle prompts/list
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'code_review',
            title: 'Code Review',
            description: 'Request a code review',
            arguments: [
              {
                name: 'code',
                description: 'The code to review',
                required: true,
              },
            ],
          },
          {
            name: 'summarize',
            title: 'Summarize Text',
            description: 'Summarize the given text',
            arguments: [
              {
                name: 'text',
                description: 'Text to summarize',
                required: true,
              },
              {
                name: 'length',
                description: 'Desired summary length',
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Handle prompts/get
    this.server.setRequestHandler(GetPromptRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'code_review':
          return {
            description: 'Code review prompt',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please review this code:\n${args?.code || ''}`,
                },
              },
            ],
          };

        case 'summarize':
          const lengthInfo = args?.length ? ` in ${args.length} words` : '';
          return {
            description: 'Text summarization prompt',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please summarize the following text${lengthInfo}:\n${args?.text || ''}`,
                },
              },
            ],
          };

        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ServerWithPrompts();
  server.start().catch(error => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { ServerWithPrompts };
