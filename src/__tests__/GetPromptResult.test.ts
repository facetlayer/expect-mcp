import { describe, expect, it } from 'vitest';
import { GetPromptResult } from '../results/GetPromptResult.js';
import type { GetPromptResult as GetPromptResultType } from '../schemas/prompts.js';

describe('GetPromptResult', () => {
  const sampleResult: GetPromptResultType = {
    description: 'A test prompt',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Hello, world!',
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: 'Hi there!',
        },
      },
    ],
  };

  it('should wrap a GetPromptResult', () => {
    const result = new GetPromptResult(sampleResult);
    expect(result.messages).toEqual(sampleResult.messages);
    expect(result.description).toEqual(sampleResult.description);
  });

  it('should provide access to messages', () => {
    const result = new GetPromptResult(sampleResult);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[1].role).toBe('assistant');
  });

  it('should provide access to description', () => {
    const result = new GetPromptResult(sampleResult);
    expect(result.description).toBe('A test prompt');
  });
});
