import { describe, expect, it, vi } from 'vitest';
import '../../vitest-setup.js';
import { ToolCallResult } from '../../ToolCallResult.js';
import { resolveUtils } from '../../utils.js';
import { toBeSuccessful } from '../toBeSuccessful.js';
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

describe('toBeSuccessful', () => {
  const mockContext = {};

  it('should pass when tool result is successful', async () => {
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

    const matcherResult = await toBeSuccessful.call(mockContext, toolResult);

    expect(matcherResult.pass).toBe(true);
    expect(matcherResult.message()).toContain('Expected tool call to have failed');
  });

  it('should pass when isError is undefined', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Success',
        },
      ],
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toBeSuccessful.call(mockContext, toolResult);

    expect(matcherResult.pass).toBe(true);
  });

  it('should fail when tool result has error', async () => {
    const result: CallToolResult = {
      content: [
        {
          type: 'text',
          text: 'Error occurred',
        },
      ],
      isError: true,
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toBeSuccessful.call(mockContext, toolResult);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected tool call to succeed');
    expect(matcherResult.message()).toContain('Error occurred');
  });

  it('should fail with generic message when isError is true but no text content', async () => {
    const result: CallToolResult = {
      content: [],
      isError: true,
    };
    const toolResult = new ToolCallResult(result);

    const matcherResult = await toBeSuccessful.call(mockContext, toolResult);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected tool call to succeed');
    expect(matcherResult.message()).not.toContain(':');
  });

  it('should fail when received is not a ToolCallResult instance', async () => {
    const notToolResult = { someProperty: 'value' };

    const matcherResult = await toBeSuccessful.call(mockContext, notToolResult);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected');
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should fail when received is null', async () => {
    const matcherResult = await toBeSuccessful.call(mockContext, null);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should fail when received is undefined', async () => {
    const matcherResult = await toBeSuccessful.call(mockContext, undefined);

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ToolCallResult instance');
  });

  it('should call resolveUtils with the correct context', async () => {
    const result: CallToolResult = {
      content: [],
      isError: false,
    };
    const toolResult = new ToolCallResult(result);

    await toBeSuccessful.call(mockContext, toolResult);

    expect(resolveUtils).toHaveBeenCalledWith(mockContext);
  });
});
