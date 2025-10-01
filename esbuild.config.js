import { build } from 'esbuild';
import { spawn } from 'child_process';

const commonConfig = {
  bundle: true,
  platform: 'node',
  target: 'node16',
  format: 'esm',
  outdir: 'dist',
  external: [
    'vitest',
    '@facetlayer/parse-stdout-lines',
    '@modelcontextprotocol/sdk',
    'zod'
  ]
};

const entryPoints = [
  'src/index.ts',
  'src/vitest-setup.ts',
];

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

try {
  // Build JavaScript with esbuild
  console.log('Building JavaScript with esbuild...');
  await build({
    ...commonConfig,
    entryPoints
  });
  console.log('JavaScript build completed');

  // Generate TypeScript declaration files
  console.log('Generating TypeScript declaration files...');
  await runCommand('npx', ['tsc']);
  console.log('TypeScript declaration files generated');

  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
