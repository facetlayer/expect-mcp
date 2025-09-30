import { describe, expect, it, beforeAll } from 'vitest';
import { MCPStdinSubprocess, shellCommand } from '../../src';
import '../../src/vitest-setup.js';

const DefaultRequestTimeout = 1000;

describe('Resource Usage', () => {
  describe('server with resources capability', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = shellCommand('node test/sampleServers/server.withResources.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should verify that the server capabilities section has enabled resources', async () => {
      const supportsResources = await process.supportsResources();
      expect(supportsResources).toBe(true);
    });

    it('should verify that resources/list returns available resources', async () => {
      const resources = await process.getResources();
      expect(resources).toBeDefined();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
    });

    it('should verify that resources/list response contains example.txt resource', async () => {
      const hasResource = await process.hasResource('example.txt');
      expect(hasResource).toBe(true);
    });

    it('should verify that resources/list response contains data.json resource', async () => {
      const hasResource = await process.hasResource('data.json');
      expect(hasResource).toBe(true);
    });

    it('should have resource schema with required fields', async () => {
      const resources = await process.getResources();
      const exampleResource = resources.find(r => r.name === 'example.txt');

      expect(exampleResource).toBeDefined();
      expect(exampleResource?.name).toBe('example.txt');
      expect(exampleResource?.uri).toBeDefined();
      expect(exampleResource?.uri).toBe('file:///example.txt');
    });
  });

  describe('server without resources capability', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = shellCommand('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should verify that resources are not supported', async () => {
      const supportsResources = await process.supportsResources();
      expect(supportsResources).toBe(false);
    });
  });

  describe('resource not in list', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = shellCommand('node test/sampleServers/server.resourcesNotListed.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should have resources capability enabled', async () => {
      const supportsResources = await process.supportsResources();
      expect(supportsResources).toBe(true);
    });

    it('should return empty resources list', async () => {
      const resources = await process.getResources();
      expect(resources).toBeDefined();
      expect(resources.length).toBe(0);
    });

    it('should not have undeclaredResource in the list', async () => {
      const hasResource = await process.hasResource('undeclaredResource');
      expect(hasResource).toBe(false);
    });
  });

  describe('resource validation', () => {
    let process: MCPStdinSubprocess;

    beforeAll(async () => {
      process = shellCommand('node test/sampleServers/server.withResources.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    it('should verify resource has name field', async () => {
      const resources = await process.getResources();
      resources.forEach(resource => {
        expect(resource.name).toBeDefined();
        expect(typeof resource.name).toBe('string');
      });
    });

    it('should verify resource has uri field', async () => {
      const resources = await process.getResources();
      resources.forEach(resource => {
        expect(resource.uri).toBeDefined();
        expect(typeof resource.uri).toBe('string');
      });
    });

    it('should verify resource URIs follow expected format', async () => {
      const resources = await process.getResources();
      resources.forEach(resource => {
        // URIs should be valid URI format
        expect(resource.uri).toMatch(/^[a-z]+:\/\//);
      });
    });
  });
});