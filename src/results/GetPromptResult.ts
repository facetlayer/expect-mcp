import type { GetPromptResult as GetPromptResultType, PromptMessage } from '../schemas/prompts.js';

/**
 * Wraps the result of a prompt get with helper methods for accessing messages.
 */
export class GetPromptResult {
  static _isGetPromptResult = true;

  messages: PromptMessage[] = [];
  description: string | undefined = undefined;

  constructor(result: GetPromptResultType) {
    this.messages = result.messages;
    this.description = result.description;
  }
}
