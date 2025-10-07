#!/usr/bin/env node --experimental-strip-types

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const DOCS_DIR = './docs-site/docs';

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  const markdownFiles = getAllMarkdownFiles(DOCS_DIR);

  for (const file of markdownFiles) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`FILE: ${file}`);
    console.log('='.repeat(80));
    console.log();

    const content = readFileSync(file, 'utf-8');
    console.log(content);
  }
}

main();
