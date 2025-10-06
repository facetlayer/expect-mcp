export default {
  testEnvironment: 'node',
  testMatch: ['**/test/jest/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/samples/'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest-test-setup.ts'],
};
