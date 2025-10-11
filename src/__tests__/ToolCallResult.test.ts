import { describe, expect, it } from 'vitest';
import { ToolCallResult } from '../ToolCallResult.js';
import { ToolCallError } from '../errors.js';
import type { CallToolResult } from '../schemas/tools.js';

describe('ToolCallResult', () => {
  describe('constructor and getters', () => {
    it('should create an instance from a valid result', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Hello world',
          },
        ],
        isError: false,
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult).toBeInstanceOf(ToolCallResult);
      expect(toolResult.content).toEqual(result.content);
      expect(toolResult.isError).toBe(false);
    });

    it('should expose structured content when present', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: '{"key": "value"}',
          },
        ],
        structuredContent: { key: 'value' },
        isError: false,
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.structuredContent).toEqual({ key: 'value' });
    });

    it('should have undefined structuredContent when not present', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Hello',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.structuredContent).toBeUndefined();
    });
  });

  describe('getTextContent', () => {
    it('should return text from the first text content block', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Hello world',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.getTextContent()).toBe('Hello world');
    });

    it('should return text from the first text block when multiple blocks exist', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'image',
            data: 'base64data',
            mimeType: 'image/png',
          },
          {
            type: 'text',
            text: 'First text',
          },
          {
            type: 'text',
            text: 'Second text',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.getTextContent()).toBe('First text');
    });

    it('should return undefined when no text content exists', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'image',
            data: 'base64data',
            mimeType: 'image/png',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.getTextContent()).toBeUndefined();
    });

    it('should return undefined when content array is empty', () => {
      const result: CallToolResult = {
        content: [],
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.getTextContent()).toBeUndefined();
    });
  });

  describe('expectSuccess', () => {
    it('should return the instance when result is successful', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Success',
          },
        ],
        isError: false,
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.expectSuccess()).toBe(toolResult);
    });

    it('should return the instance when isError is undefined', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Success',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.expectSuccess()).toBe(toolResult);
    });

    it('should throw ToolCallError when result has isError set to true', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Something went wrong',
          },
        ],
        isError: true,
      };

      const toolResult = new ToolCallResult(result);
      expect(() => toolResult.expectSuccess()).toThrow(ToolCallError);
      expect(() => toolResult.expectSuccess()).toThrow('Something went wrong');
    });

    it('should throw with a generic message when isError is true but no text content', () => {
      const result: CallToolResult = {
        content: [],
        isError: true,
      };

      const toolResult = new ToolCallResult(result);
      expect(() => toolResult.expectSuccess()).toThrow(ToolCallError);
      expect(() => toolResult.expectSuccess()).toThrow('no text content available');
    });
  });

  describe('getContentByType', () => {
    it('should return all text content blocks', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'First text',
          },
          {
            type: 'image',
            data: 'base64data',
            mimeType: 'image/png',
          },
          {
            type: 'text',
            text: 'Second text',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      const textBlocks = toolResult.getContentByType('text');
      expect(textBlocks).toHaveLength(2);
      expect(textBlocks[0].text).toBe('First text');
      expect(textBlocks[1].text).toBe('Second text');
    });

    it('should return empty array when no blocks match the type', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Only text',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      const imageBlocks = toolResult.getContentByType('image');
      expect(imageBlocks).toHaveLength(0);
    });

    it('should return all image content blocks', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'image',
            data: 'data1',
            mimeType: 'image/png',
          },
          {
            type: 'text',
            text: 'Some text',
          },
          {
            type: 'image',
            data: 'data2',
            mimeType: 'image/jpeg',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      const imageBlocks = toolResult.getContentByType('image');
      expect(imageBlocks).toHaveLength(2);
      expect(imageBlocks[0].data).toBe('data1');
      expect(imageBlocks[1].data).toBe('data2');
    });
  });

  describe('findContentByType', () => {
    it('should return the first content block of the specified type', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'image',
            data: 'base64data',
            mimeType: 'image/png',
          },
          {
            type: 'text',
            text: 'First text',
          },
          {
            type: 'text',
            text: 'Second text',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      const textBlock = toolResult.findContentByType('text');
      expect(textBlock).toBeDefined();
      expect(textBlock?.text).toBe('First text');
    });

    it('should return undefined when no block matches the type', () => {
      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: 'Only text',
          },
        ],
      };

      const toolResult = new ToolCallResult(result);
      const imageBlock = toolResult.findContentByType('image');
      expect(imageBlock).toBeUndefined();
    });
  });

  describe('isError', () => {
    it('should return true when isError is true', () => {
      const result: CallToolResult = {
        content: [],
        isError: true,
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.isError).toBe(true);
    });

    it('should return false when isError is false', () => {
      const result: CallToolResult = {
        content: [],
        isError: false,
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.isError).toBe(false);
    });

    it('should return false when isError is undefined', () => {
      const result: CallToolResult = {
        content: [],
      };

      const toolResult = new ToolCallResult(result);
      expect(toolResult.isError).toBe(false);
    });
  });
});
