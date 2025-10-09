import { describe, expect, it } from 'vitest';
import { GetPromptResult } from '../GetPromptResult.js';
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
    expect(result.raw).toEqual(sampleResult);
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

  it('should get first user message', () => {
    const result = new GetPromptResult(sampleResult);
    const userMessage = result.getFirstUserMessage();
    expect(userMessage?.role).toBe('user');
    expect(userMessage?.content).toEqual({
      type: 'text',
      text: 'Hello, world!',
    });
  });

  it('should get first assistant message', () => {
    const result = new GetPromptResult(sampleResult);
    const assistantMessage = result.getFirstAssistantMessage();
    expect(assistantMessage?.role).toBe('assistant');
    expect(assistantMessage?.content).toEqual({
      type: 'text',
      text: 'Hi there!',
    });
  });

  it('should get all user messages', () => {
    const result = new GetPromptResult(sampleResult);
    const userMessages = result.getAllUserMessages();
    expect(userMessages).toHaveLength(1);
    expect(userMessages[0].role).toBe('user');
  });

  it('should get all assistant messages', () => {
    const result = new GetPromptResult(sampleResult);
    const assistantMessages = result.getAllAssistantMessages();
    expect(assistantMessages).toHaveLength(1);
    expect(assistantMessages[0].role).toBe('assistant');
  });

  it('should check if has user messages', () => {
    const result = new GetPromptResult(sampleResult);
    expect(result.hasUserMessages()).toBe(true);
  });

  it('should check if has assistant messages', () => {
    const result = new GetPromptResult(sampleResult);
    expect(result.hasAssistantMessages()).toBe(true);
  });

  it('should return undefined when no user messages', () => {
    const resultWithoutUser: GetPromptResultType = {
      messages: [
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: 'Hi!',
          },
        },
      ],
    };
    const result = new GetPromptResult(resultWithoutUser);
    expect(result.getFirstUserMessage()).toBeUndefined();
    expect(result.hasUserMessages()).toBe(false);
  });

  it('should return undefined when no assistant messages', () => {
    const resultWithoutAssistant: GetPromptResultType = {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Hello!',
          },
        },
      ],
    };
    const result = new GetPromptResult(resultWithoutAssistant);
    expect(result.getFirstAssistantMessage()).toBeUndefined();
    expect(result.hasAssistantMessages()).toBe(false);
  });
});
