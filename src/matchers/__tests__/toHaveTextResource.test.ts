import { describe, expect, it, vi } from 'vitest';
import '../../vitest-setup.js';
import { ReadResourceResult } from '../../ReadResourceResult.js';
import { resolveUtils } from '../../utils.js';
import { toHaveTextResource } from '../toHaveTextResource.js';
import type { ReadResourceResult as ReadResourceResultType } from '../../schemas/resources.js';

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

describe('toHaveTextResource', () => {
  const mockContext = {};

  it('should pass when resource result has matching text content', async () => {
    const result: ReadResourceResultType = {
      contents: [
        {
          uri: 'file:///app/test.txt',
          text: 'Hello world',
        },
      ],
    };
    const resourceResult = new ReadResourceResult(result);

    const matcherResult = await toHaveTextResource.call(mockContext, resourceResult, 'Hello world');

    expect(matcherResult.pass).toBe(true);
    expect(matcherResult.message()).toContain('Expected resource result not to have text content');
  });

  it('should fail when text content does not match', async () => {
    const result: ReadResourceResultType = {
      contents: [
        {
          uri: 'file:///app/test.txt',
          text: 'Hello world',
        },
      ],
    };
    const resourceResult = new ReadResourceResult(result);

    const matcherResult = await toHaveTextResource.call(mockContext, resourceResult, 'Goodbye world');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected resource result to have text content');
    expect(matcherResult.message()).toContain('Goodbye world');
    expect(matcherResult.message()).toContain('Hello world');
  });

  it('should fail when resource result has no text content', async () => {
    const result: ReadResourceResultType = {
      contents: [
        {
          uri: 'file:///app/image.png',
          blob: 'base64data',
        },
      ],
    };
    const resourceResult = new ReadResourceResult(result);

    const matcherResult = await toHaveTextResource.call(mockContext, resourceResult, 'Any text');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected resource result to have text content');
    expect(matcherResult.message()).toContain('but it has none');
  });

  it('should fail when contents array is empty', async () => {
    const result: ReadResourceResultType = {
      contents: [],
    };
    const resourceResult = new ReadResourceResult(result);

    const matcherResult = await toHaveTextResource.call(mockContext, resourceResult, 'Any text');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('but it has none');
  });

  it('should fail when received is not a ReadResourceResult instance', async () => {
    const notResourceResult = { someProperty: 'value' };

    const matcherResult = await toHaveTextResource.call(mockContext, notResourceResult, 'test');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ReadResourceResult instance');
  });

  it('should fail when received is null', async () => {
    const matcherResult = await toHaveTextResource.call(mockContext, null, 'test');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ReadResourceResult instance');
  });

  it('should fail when received is undefined', async () => {
    const matcherResult = await toHaveTextResource.call(mockContext, undefined, 'test');

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ReadResourceResult instance');
  });

  it('should call resolveUtils with the correct context', async () => {
    const result: ReadResourceResultType = {
      contents: [
        {
          uri: 'file:///app/test.txt',
          text: 'Hello',
        },
      ],
    };
    const resourceResult = new ReadResourceResult(result);

    await toHaveTextResource.call(mockContext, resourceResult, 'Hello');

    expect(resolveUtils).toHaveBeenCalledWith(mockContext);
  });
});
