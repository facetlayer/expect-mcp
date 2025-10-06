const {  MCPStdinSubprocess, mcpShell  } = require('../../../dist/cjs/index.cjs');

const DefaultRequestTimeout = 1000;

describe('Resource Usage', () => {
  describe('server with resources capability', () => {
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withResources.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    afterAll(async () => {
      await process.close();
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
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.noCapabilities.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    afterAll(async () => {
      await process.close();
    });

    it('should verify that resources are not supported', async () => {
      const supportsResources = await process.supportsResources();
      expect(supportsResources).toBe(false);
    });
  });

  describe('resource not in list', () => {
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.resourcesNotListed.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    afterAll(async () => {
      await process.close();
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
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withResources.ts', {
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

  describe('custom matchers - positive cases', () => {
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withResources.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    afterAll(async () => {
      await process.close();
    });

    it('should pass when checking for existing resource with toHaveResource', async () => {
      await expect(process).toHaveResource('example.txt');
    });

    it('should pass when checking for multiple existing resources with toHaveResources', async () => {
      await expect(process).toHaveResources(['example.txt', 'data.json']);
    });

    it('should pass when checking for single resource with toHaveResources', async () => {
      await expect(process).toHaveResources(['example.txt']);
    });
  });

  describe('custom matchers - negative cases', () => {
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withResources.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    afterAll(async () => {
      await process.close();
    });

    it('should fail when checking for nonexistent resource with toHaveResource', async () => {
      await expect(
        expect(process).toHaveResource('nonexistent.txt')
      ).rejects.toThrow();
    });

    it('should fail when checking for nonexistent resource in toHaveResources', async () => {
      await expect(
        expect(process).toHaveResources(['nonexistent.txt'])
      ).rejects.toThrow();
    });

    it('should fail when one of multiple resources is missing in toHaveResources', async () => {
      await expect(
        expect(process).toHaveResources(['example.txt', 'nonexistent.txt'])
      ).rejects.toThrow();
    });

    it('should fail when all resources are missing in toHaveResources', async () => {
      await expect(
        expect(process).toHaveResources(['missing1.txt', 'missing2.txt'])
      ).rejects.toThrow();
    });
  });

  describe('custom matchers - .not. modifier', () => {
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.withResources.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    afterAll(async () => {
      await process.close();
    });

    it('should pass when resource does not exist with .not.toHaveResource', async () => {
      await expect(process).not.toHaveResource('nonexistent.txt');
    });

    it('should fail when existing resource is checked with .not.toHaveResource', async () => {
      await expect(
        expect(process).not.toHaveResource('example.txt')
      ).rejects.toThrow();
    });

    it('should pass when resources do not exist with .not.toHaveResources', async () => {
      await expect(process).not.toHaveResources(['nonexistent1.txt', 'nonexistent2.txt']);
    });

    it('should fail when all resources exist with .not.toHaveResources', async () => {
      await expect(
        expect(process).not.toHaveResources(['example.txt', 'data.json'])
      ).rejects.toThrow();
    });

    it('should pass when at least one resource is missing with .not.toHaveResources', async () => {
      // .not.toHaveResources means "NOT all resources exist", so passes when at least one is missing
      await expect(process).not.toHaveResources(['example.txt', 'nonexistent.txt']);
    });
  });

  describe('custom matchers - empty list server', () => {
    let process;

    beforeAll(async () => {
      process = mcpShell('node test/sampleServers/server.resourcesNotListed.ts', {
        requestTimeout: DefaultRequestTimeout,
      });
      await process.initialize();
    });

    afterAll(async () => {
      await process.close();
    });

    it('should fail when checking for any resource on empty server', async () => {
      await expect(
        expect(process).toHaveResource('undeclaredResource')
      ).rejects.toThrow();
    });

    it('should pass when using .not.toHaveResource on empty server', async () => {
      await expect(process).not.toHaveResource('undeclaredResource');
    });

    it('should fail when checking for any resources on empty server', async () => {
      await expect(
        expect(process).toHaveResources(['undeclaredResource'])
      ).rejects.toThrow();
    });

    it('should pass when using .not.toHaveResources on empty server', async () => {
      await expect(process).not.toHaveResources(['undeclaredResource']);
    });
  });
});
