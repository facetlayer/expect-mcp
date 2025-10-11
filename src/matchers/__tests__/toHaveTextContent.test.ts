import { describe, expect, it, vi } from 'vitest';
import '../../vitest-setup.js';
import { ToolCallResult } from '../../results/ToolCallResult.js';
import { resolveUtils } from '../../utils.js';
import { toHaveTextContent } from '../toHaveTextContent.js';
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

describe('toHaveTextContent', () => {
  const mockContext = {};

  it('should pass when tool result has matching text content', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Hello world',
        },
      ],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toHaveTextContent.call(mockContext, toolResult, 'Hello world');

    expect(matcherResult.pass).toBe(true);
    expect(matcherResult.message()).toContain('Expected tool result not to have text content');
  });

  it('should fail when text content does not match', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Hello world',
        },
      ],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toHaveTextContent.call(mockContext, toolResult, 'Goodbye world');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected tool result to have text content');
    expect(matcherResult.message()).toContain('Goodbye world');
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

    const matcherResult = await toHaveTextContent.call(mockContext, toolResult, 'Any text');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected tool result to have text content');
    expect(matcherResult.message()).toContain('but it has none');
  });

  it('should fail when content array is empty', async () => {
    const result: CallToolResult = {
      content: [],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toHaveTextContent.call(mockContext, toolResult, 'Any text');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('but it has none');
  });

  it('should fail when received is not a ToolCallResult instance', async () => {
    const notToolResult = { someProperty: 'value' };

    const matcherResult = await toHaveTextContent.call(mockContext, notToolResult, 'test');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should fail when received is null', async () => {
    const matcherResult = await toHaveTextContent.call(mockContext, null, 'test');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should fail when received is undefined', async () => {
    const matcherResult = await toHaveTextContent.call(mockContext, undefined, 'test');

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

    await toHaveTextContent.call(mockContext, toolResult, 'Hello');

    expect(resolveUtils).toHaveBeenCalledWith(mockContext);
  });
});
