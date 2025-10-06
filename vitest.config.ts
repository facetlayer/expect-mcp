import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', 'samples/**', 'test/jest/**'],
    setupFiles: ['./vitest-test-setup.ts'],
  },
});
