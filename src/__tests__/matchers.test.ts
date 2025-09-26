import { describe, expect, it } from 'vitest';
import { isMCPResponse } from '../index.js';

const validSuccessResponse = {
  jsonrpc: '2.0' as const,
  id: 'request-1',
  result: {
    content: [
      {
        role: 'assistant',
        type: 'text',
        content: 'Hello world',
      },
    ],
  },
};

const errorResponse = {
  jsonrpc: '2.0' as const,
  id: 'request-2',
  error: {
    code: 123,
    message: 'Boom',
  },
};

describe('isMCPResponse', () => {
  it('returns true for a structurally valid MCP response', () => {
    expect(isMCPResponse(validSuccessResponse)).toBe(true);
  });

  it('returns false for non-object values', () => {
    expect(isMCPResponse(null)).toBe(false);
    expect(isMCPResponse('not-a-response')).toBe(false);
  });

  it('returns false when result and error are missing', () => {
    expect(
      isMCPResponse({
        jsonrpc: '2.0',
        id: null,
      }),
    ).toBe(false);
  });
});

describe('toBeValidMCPResponse', () => {
  it('passes when the received value is a valid response', () => {
    expect(validSuccessResponse).toBeValidMCPResponse();
  });

  it('throws a readable error message when the assertion fails', () => {
    expect(() => expect({}).toBeValidMCPResponse()).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected received value to be a valid MCP response, but got Object {}]`,
    );
  });
});

describe('toHaveMCPError', () => {
  it('passes when the response contains any error', () => {
    expect(errorResponse).toHaveMCPError();
  });

  it('passes when the response contains the expected error code', () => {
    expect(errorResponse).toHaveMCPError(123);
  });

  it('fails when the response is successful', () => {
    expect(() => expect(validSuccessResponse).toHaveMCPError()).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected MCP response to include an error, but it was successful.]`,
    );
  });

  it('fails when the error code does not match', () => {
    expect(() => expect(errorResponse).toHaveMCPError(500)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected MCP error code 500, but received 123]`,
    );
  });
});
