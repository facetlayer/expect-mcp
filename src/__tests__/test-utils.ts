export const validSuccessResponse = {
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

export const errorResponse = {
  jsonrpc: '2.0' as const,
  id: 'request-2',
  error: {
    code: 123,
    message: 'Boom',
  },
};