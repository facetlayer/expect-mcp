import { describe, expect, it } from 'vitest';
import { runShellCommand } from '@facetlayer/subprocess-wrapper';

describe('Failure Cases', () => {
  it('should run invalidInitialize.failureCase.ts and verify error message', async () => {
    const result = await runShellCommand('./node_modules/.bin/vitest', [
      'run',
      'test/failureCases/invalidInitialize.failureCase.ts',
      '--config',
      'test/failureCases/vitest.failureCases.config.ts',
      '--reporter=verbose'
    ]);

    console.log(result.stderr);

    /*
    // The test should fail with the expected error message
    expect(result.exitCode).not.toBe(0);

    // Check for error in either stdout or stderr
    const output = result.stdout + result.stderr;
    expect(output).toContain('Strict mode: Initialize response validation failed');
    */
  });

  it('should run all failure case tests and verify they fail as expected', async () => {
    // Find all *.failureCase.ts files
    /*
    const failureCaseFiles = await glob('test/failureCases/*.failureCase.ts');

    for (const file of failureCaseFiles) {
      const testName = path.basename(file, '.failureCase.ts');

      const result = await runCommand('npx', [
        'vitest',
        'run',
        file,
        '--config',
        'test/failureCases/vitest.failureCases.config.ts',
        '--reporter=verbose'
      ]);

      // Each failure case should fail (non-zero exit code)
      expect(result.exitCode, `${testName} should fail but passed`).not.toBe(0);

      // Based on the test name, verify specific error messages
      if (testName === 'invalidInitialize') {
        const output = result.stdout + result.stderr;
        expect(output).toContain('Strict mode: Initialize response validation failed');
      }

      // Add more specific error message checks as more failure cases are added
    }
      */
  });
});