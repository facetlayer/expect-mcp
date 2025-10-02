import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('../../src', import.meta.url));

export default defineConfig({
  test: {
      include: ['samples/**'],
  },
  resolve: {
    alias: [
      { find: /^expect-mcp\/vitest-setup$/, replacement: `${srcDir}/vitest-setup.ts` },
      { find: /^expect-mcp$/, replacement: `${srcDir}/index.ts` },
    ],
  },
});
