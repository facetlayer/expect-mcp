import { spawn } from 'child_process';
import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync } from 'fs';

const commonConfig = {
  bundle: true,
  platform: 'node',
  target: 'node16',
  external: ['vitest', '@facetlayer/parse-stdout-lines', 'zod'],
};

const entryPoints = [
    'src/index.ts',
    'src/vitest-setup.ts',
    'src/jest-setup.ts',
    'src/main-cli.ts',
];

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    process.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

try {
  // Build ESM JavaScript with esbuild
  console.log('Building ESM JavaScript with esbuild...');
  await build({
    ...commonConfig,
    format: 'esm',
    outdir: 'dist',
    entryPoints,
  });
  console.log('ESM build completed');

  // Build CommonJS JavaScript with esbuild
  console.log('Building CommonJS JavaScript with esbuild...');
  await build({
    ...commonConfig,
    format: 'cjs',
    outdir: 'dist/cjs',
    entryPoints: ['src/index.ts', 'src/jest-setup.ts'],
    outExtension: { '.js': '.cjs' },
  });
  console.log('CommonJS build completed');

  // Generate TypeScript declaration files
  console.log('Generating TypeScript declaration files...');
  await runCommand('npx', ['tsc']);
  console.log('TypeScript declaration files generated');

  // Copy docs folder to dist
  console.log('Copying docs folder to dist...');
  if (existsSync('src/docs')) {
    const distDocsDir = 'dist/docs';
    if (!existsSync(distDocsDir)) {
      mkdirSync(distDocsDir, { recursive: true });
    }
    cpSync('src/docs', distDocsDir, { recursive: true });
    console.log('Docs folder copied');
  }

  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
