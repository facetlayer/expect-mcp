import { describe, expect, it, vi } from 'vitest';
import '../../vitest-setup.js';
import { ReadResourceResult } from '../../ReadResourceResult.js';
import { resolveUtils } from '../../utils.js';
import { toHaveResourceContent } from '../toHaveResourceContent.js';
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

describe('toHaveResourceContent', () => {
  const mockContext = {};

  it('should pass when resource result has content for the URI', async () => {
    const result: ReadResourceResultType = {
      contents: [
        {
          uri: 'file:///app/test.txt',
          text: 'Hello world',
        },
      ],
    };
    const resourceResult = new ReadResourceResult(result);

    const matcherResult = await toHaveResourceContent.call(
      mockContext,
      resourceResult,
      'file:///app/test.txt'
    );

    expect(matcherResult.pass).toBe(true);
    expect(matcherResult.message()).toContain('Expected resource result not to have content for URI');
  });

  it('should fail when resource result does not have content for the URI', async () => {
    const result: ReadResourceResultType = {
      contents: [
        {
          uri: 'file:///app/test.txt',
          text: 'Hello world',
        },
      ],
    };
    const resourceResult = new ReadResourceResult(result);

    const matcherResult = await toHaveResourceContent.call(
      mockContext,
      resourceResult,
      'file:///app/other.txt'
    );

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('Expected resource result to have content for URI');
    expect(matcherResult.message()).toContain('other.txt');
  });

  it('should find the correct resource when multiple exist', async () => {
    const result: ReadResourceResultType = {
      contents: [
        {
          uri: 'file:///app/test1.txt',
          text: 'First',
        },
        {
          uri: 'file:///app/test2.txt',
          text: 'Second',
        },
      ],
    };
    const resourceResult = new ReadResourceResult(result);

    const matcherResult = await toHaveResourceContent.call(
      mockContext,
      resourceResult,
      'file:///app/test2.txt'
    );

    expect(matcherResult.pass).toBe(true);
  });

  it('should fail when received is not a ReadResourceResult instance', async () => {
    const notResourceResult = { someProperty: 'value' };

    const matcherResult = await toHaveResourceContent.call(
      mockContext,
      notResourceResult,
      'file:///app/test.txt'
    );

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ReadResourceResult instance');
  });

  it('should fail when received is null', async () => {
    const matcherResult = await toHaveResourceContent.call(
      mockContext,
      null,
      'file:///app/test.txt'
    );

    expect(matcherResult.pass).toBe(false);
    expect(matcherResult.message()).toContain('to be a ReadResourceResult instance');
  });

  it('should fail when received is undefined', async () => {
    const matcherResult = await toHaveResourceContent.call(
      mockContext,
      undefined,
      'file:///app/test.txt'
    );

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

    await toHaveResourceContent.call(mockContext, resourceResult, 'file:///app/test.txt');

    expect(resolveUtils).toHaveBeenCalledWith(mockContext);
  });
});
