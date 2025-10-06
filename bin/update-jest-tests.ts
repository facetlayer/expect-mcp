#!/usr/bin/env node
/**
 * Script to copy Vitest tests to Jest-compatible versions
 *
 * This script:
 * - Copies all test files from test/ to test/jest/
 * - Removes vitest imports (Jest uses globals)
 * - Changes src/ imports to dist/ imports (compiled code)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const SOURCE_DIR = path.join(rootDir, 'test');
const TARGET_DIR = path.join(rootDir, 'test', 'jest');

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function transformTestFile(content: string): string {
  let transformed = content;

  // Remove vitest imports completely
  transformed = transformed.replace(/import\s+\{[^}]+\}\s+from\s+['"]vitest['"];?\s*\n/g, '');

  // Change src/ imports to dist/ imports and add extra ../ since we're going deeper
  // Match patterns like '../../src/' and replace with '../../../dist/'
  transformed = transformed.replace(/from\s+['"]((\.\.\/)+)src\//g, (match, dots) => {
    // Add one more ../ level since we're now in test/jest/ instead of test/
    return `from '${dots}../dist/`;
  });

  // Also handle imports without trailing slash, like "from '../../src'"
  transformed = transformed.replace(/from\s+['"]((\.\.\/)+)src['"]/g, (match, dots) => {
    return `from '${dots}../dist/index.js'`;
  });

  return transformed;
}

function copyDirectory(source: string, target: string) {
  ensureDirectoryExists(target);

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      // Skip the jest directory itself to avoid recursion
      if (entry.name === 'jest') {
        continue;
      }
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      // Transform and copy test files
      const content = fs.readFileSync(sourcePath, 'utf-8');
      const transformed = transformTestFile(content);
      fs.writeFileSync(targetPath, transformed, 'utf-8');
      console.log(`Copied: ${path.relative(rootDir, sourcePath)} -> ${path.relative(rootDir, targetPath)}`);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      // Copy other TypeScript files (like sample servers) as-is
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${path.relative(rootDir, sourcePath)} -> ${path.relative(rootDir, targetPath)}`);
    }
  }
}

// Clean target directory
if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true });
}

// Copy and transform tests
console.log('Copying and transforming tests from test/ to test/jest/...\n');
copyDirectory(SOURCE_DIR, TARGET_DIR);
console.log('\nDone! All test files have been copied and transformed for Jest.');
