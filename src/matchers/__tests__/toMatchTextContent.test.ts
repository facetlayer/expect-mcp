import { describe, expect, it, vi } from 'vitest';
import '../../vitest-setup.js';
import { ToolCallResult } from '../../ToolCallResult.js';
import { resolveUtils } from '../../utils.js';
import { toMatchTextContent } from '../toMatchTextContent.js';
import type { CallToolResult } from '../../schemas/tools.js';

// Mock the resolveUtils function
vi.mock('../../utils.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../../utils.js')>();
  return {
    ...actual,
    resolveUtils: vi.fn(() => ({
      printReceived: vi.fn(value => `received: ${JSON.stringify(value)}`),
      printExpected: vi.fn(value => `expected: ${JSON.stringify(value)}`),
    })),
  };
});

describe('toMatchTextContent', () => {
  const mockContext = {};

  it('should pass when text content matches the pattern', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Hello world',
        },
      ],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toMatchTextContent.call(mockContext, toolResult, /Hello/);

    expect(matcherResult.pass).toBe(true);
    expect(matcherResult.message()).toContain('Expected tool result not to match pattern');
  });

  it('should pass when text content matches a complex pattern', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Error: Something went wrong on line 42',
        },
      ],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toMatchTextContent.call(
      mockContext,
      toolResult,
      /Error:.*line \d+/
    );

    expect(matcherResult.pass).toBe(true);
  });

  it('should fail when text content does not match the pattern', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Hello world',
        },
      ],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toMatchTextContent.call(mockContext, toolResult, /Goodbye/);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected tool result to match pattern');
    expect(matcherResult.message()).toContain('Hello world');
  });

  it('should fail when tool result has no text content', async () => {
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

    const matcherResult = await toMatchTextContent.call(mockContext, toolResult, /test/);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected tool result to have text content');
    expect(matcherResult.message()).toContain('but it has none');
  });

  it('should fail when content array is empty', async () => {
    const result: CallToolResult = {
      content: [],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toMatchTextContent.call(mockContext, toolResult, /test/);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('but it has none');
  });

  it('should fail when received is not a ToolCallResult instance', async () => {
    const notToolResult = { someProperty: 'value' };

    const matcherResult = await toMatchTextContent.call(mockContext, notToolResult, /test/);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should fail when received is null', async () => {
    const matcherResult = await toMatchTextContent.call(mockContext, null, /test/);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should fail when received is undefined', async () => {
    const matcherResult = await toMatchTextContent.call(mockContext, undefined, /test/);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should call resolveUtils with the correct context', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Hello',
        },
      ],
    };
    const toolResult = new ToolCallResult(result);

    await toMatchTextContent.call(mockContext, toolResult, /Hello/);

    expect(resolveUtils).toHaveBeenCalledWith(mockContext);
  });
});
