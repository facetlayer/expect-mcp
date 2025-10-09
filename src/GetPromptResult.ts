import type { GetPromptResult as GetPromptResultType, PromptMessage } from './schemas/prompts.js';

/**
 * Wraps the result of a prompt get with helper methods for accessing messages.
 */
export class GetPromptResult {
  private _result: GetPromptResultType;

  constructor(result: GetPromptResultType) {
    this._result = result;
  }

  /**
   * Get the raw result object.
   */
  get raw(): GetPromptResultType {
    return this._result;
  }

  /**
   * Get the messages array.
   */
  get messages(): PromptMessage[] {
    return this._result.messages;
  }

  /**
   * Get the description of the prompt.
   */
  get description(): string | undefined {
    return this._result.description;
  }

  /**
   * Get the first user message from the messages array.
   *
   * @returns The first user message, or undefined if no user messages exist.
   *
   * @example
   * ```ts
   * const result = await app.getPrompt('code_review', { code: 'function() {}' });
   * const userMessage = result.getFirstUserMessage();
   * ```
   */
  getFirstUserMessage(): PromptMessage | undefined {
    return this._result.messages.find(msg => msg.role === 'user');
  }

  /**
   * Get the first assistant message from the messages array.
   *
   * @returns The first assistant message, or undefined if no assistant messages exist.
   *
   * @example
   * ```ts
   * const result = await app.getPrompt('code_review', { code: 'function() {}' });
   * const assistantMessage = result.getFirstAssistantMessage();
   * ```
   */
  getFirstAssistantMessage(): PromptMessage | undefined {
    return this._result.messages.find(msg => msg.role === 'assistant');
  }

  /**
   * Get all user messages from the messages array.
   *
   * @returns An array of user messages.
   */
  getAllUserMessages(): PromptMessage[] {
    return this._result.messages.filter(msg => msg.role === 'user');
  }

  /**
   * Get all assistant messages from the messages array.
   *
   * @returns An array of assistant messages.
   */
  getAllAssistantMessages(): PromptMessage[] {
    return this._result.messages.filter(msg => msg.role === 'assistant');
  }

  /**
   * Check if the result contains any user messages.
   *
   * @returns True if at least one user message exists.
   */
  hasUserMessages(): boolean {
    return this._result.messages.some(msg => msg.role === 'user');
  }

  /**
   * Check if the result contains any assistant messages.
   *
   * @returns True if at least one assistant message exists.
   */
  hasAssistantMessages(): boolean {
    return this._result.messages.some(msg => msg.role === 'assistant');
  }
}
