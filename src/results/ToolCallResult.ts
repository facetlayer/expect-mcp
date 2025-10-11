import { ToolCallError } from '../errors.js';
import type { CallToolResult, ContentBlock, TextContent } from '../schemas/tools.js';

/**
 * Wraps the result of a tool call with helper methods for accessing content.
 */
export class ToolCallResult {
  content: ContentBlock[] = [];
  structuredContent: Record<string, unknown> | undefined = undefined;
  isError: boolean = false;

  constructor(result: CallToolResult) {
    this.content = result.content;
    this.structuredContent = result.structuredContent;
    this.isError = result.isError ?? false;
  }

  /**
   * Get the text content from the first text content block.
   *
   * @returns The text content, or undefined if no text content blocks exist.
   *
   * @example
   * ```ts
   * const result = await app.callTool('read_file', {path: '/app/test.txt'});
   * const text = result.getTextContent();
   * ```
   */
  getTextContent(): string | undefined {
    const textBlock = this.content.find(
      (block): block is TextContent => block.type === 'text'
    );
    return textBlock?.text;
  }

  /**
   * Assert that the result is not an error.
   *
   * @throws {ToolCallError} If the result has isError set to true.
   * @returns This ToolCallResult instance for chaining.
   *
   * @example
   * ```ts
   * const result = await app.callTool('write_file', {...});
   * result.expectSuccess(); // Throws if isError is true
   * ```
   */
  expectSuccess(): this {
    if (this.isError) {
      const textContent = this.getTextContent();
      const errorMessage = textContent
        ? `Tool call failed with error: ${textContent}`
        : 'Tool call failed with error (no text content available)';
      throw new ToolCallError(errorMessage);
    }
    return this;
  }

  /**
   * Get all content blocks of a specific type.
   *
   * @param type The type of content blocks to retrieve.
   * @returns An array of content blocks matching the specified type.
   */
  getContentByType<T extends ContentBlock['type']>(
    type: T
  ): Extract<ContentBlock, { type: T }>[] {
    return this.content.filter(
      (block): block is Extract<ContentBlock, { type: T }> => block.type === type
    );
  }

  /**
   * Find a content block by type.
   *
   * @param type The type of content block to find.
   * @returns The first content block of the specified type, or undefined.
   */
  findContentByType<T extends ContentBlock['type']>(
    type: T
  ): Extract<ContentBlock, { type: T }> | undefined {
    return this.content.find(
      (block): block is Extract<ContentBlock, { type: T }> => block.type === type
    );
  }
}
