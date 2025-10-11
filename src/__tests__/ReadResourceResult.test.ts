import { describe, expect, it } from 'vitest';
import { ReadResourceResult } from '../results/ReadResourceResult.js';
import type { ReadResourceResult as ReadResourceResultType } from '../schemas/resources.js';

describe('ReadResourceResult', () => {
  describe('constructor and getters', () => {
    it('should create an instance from a valid result', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult).toBeInstanceOf(ReadResourceResult);
      expect(resourceResult.content).toEqual(result.contents);
    });

    it('should handle resources with metadata', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            name: 'test.txt',
            title: 'Test File',
            mimeType: 'text/plain',
            text: 'Hello world',
            annotations: {
              audience: ['user'],
              priority: 0.8,
            },
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.content[0].name).toBe('test.txt');
      expect(resourceResult.content[0].title).toBe('Test File');
      expect(resourceResult.content[0].annotations?.priority).toBe(0.8);
    });
  });

  describe('getTextContent', () => {
    it('should return text from the first text resource', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.getTextContent()).toBe('Hello world');
    });

    it('should return text from the first text resource when multiple exist', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test1.txt',
            text: 'First text',
          },
          {
            uri: 'file:///app/test2.txt',
            text: 'Second text',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.getTextContent()).toBe('First text');
    });

    it('should return undefined when no text resources exist', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/image.png',
            blob: 'base64data',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.getTextContent()).toBeUndefined();
    });

    it('should return undefined when contents array is empty', () => {
      const result: ReadResourceResultType = {
        contents: [],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.getTextContent()).toBeUndefined();
    });
  });

  describe('getBlobContent', () => {
    it('should return blob from the first blob resource', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/image.png',
            blob: 'base64data',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.getBlobContent()).toBe('base64data');
    });

    it('should return blob from the first blob resource when multiple exist', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/image1.png',
            blob: 'base64data1',
          },
          {
            uri: 'file:///app/image2.png',
            blob: 'base64data2',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.getBlobContent()).toBe('base64data1');
    });

    it('should return undefined when no blob resources exist', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.getBlobContent()).toBeUndefined();
    });
  });

  describe('findByUri', () => {
    it('should find a resource by its URI', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      const found = resourceResult.findByUri('file:///app/test.txt');
      expect(found).toBeDefined();
      expect(found?.uri).toBe('file:///app/test.txt');
    });

    it('should return undefined when URI is not found', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      const found = resourceResult.findByUri('file:///app/other.txt');
      expect(found).toBeUndefined();
    });

    it('should find the correct resource when multiple exist', () => {
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
      const found = resourceResult.findByUri('file:///app/test2.txt');
      expect(found).toBeDefined();
      if ('text' in found!) {
        expect(found.text).toBe('Second');
      }
    });
  });

  describe('getAllTextResources', () => {
    it('should return all text resources', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test1.txt',
            text: 'First text',
          },
          {
            uri: 'file:///app/image.png',
            blob: 'base64data',
          },
          {
            uri: 'file:///app/test2.txt',
            text: 'Second text',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      const textResources = resourceResult.getAllTextResources();
      expect(textResources).toHaveLength(2);
      expect(textResources[0].text).toBe('First text');
      expect(textResources[1].text).toBe('Second text');
    });

    it('should return empty array when no text resources exist', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/image.png',
            blob: 'base64data',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      const textResources = resourceResult.getAllTextResources();
      expect(textResources).toHaveLength(0);
    });
  });

  describe('getAllBlobResources', () => {
    it('should return all blob resources', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/image1.png',
            blob: 'base64data1',
          },
          {
            uri: 'file:///app/test.txt',
            text: 'Some text',
          },
          {
            uri: 'file:///app/image2.png',
            blob: 'base64data2',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      const blobResources = resourceResult.getAllBlobResources();
      expect(blobResources).toHaveLength(2);
      expect(blobResources[0].blob).toBe('base64data1');
      expect(blobResources[1].blob).toBe('base64data2');
    });

    it('should return empty array when no blob resources exist', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      const blobResources = resourceResult.getAllBlobResources();
      expect(blobResources).toHaveLength(0);
    });
  });

  describe('hasTextContent', () => {
    it('should return true when text content exists', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.hasTextContent()).toBe(true);
    });

    it('should return false when no text content exists', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/image.png',
            blob: 'base64data',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.hasTextContent()).toBe(false);
    });

    it('should return false when contents array is empty', () => {
      const result: ReadResourceResultType = {
        contents: [],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.hasTextContent()).toBe(false);
    });
  });

  describe('hasBlobContent', () => {
    it('should return true when blob content exists', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/image.png',
            blob: 'base64data',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.hasBlobContent()).toBe(true);
    });

    it('should return false when no blob content exists', () => {
      const result: ReadResourceResultType = {
        contents: [
          {
            uri: 'file:///app/test.txt',
            text: 'Hello world',
          },
        ],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.hasBlobContent()).toBe(false);
    });

    it('should return false when contents array is empty', () => {
      const result: ReadResourceResultType = {
        contents: [],
      };

      const resourceResult = new ReadResourceResult(result);
      expect(resourceResult.hasBlobContent()).toBe(false);
    });
  });
});
