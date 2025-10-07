#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHowToUse() {
  const docPath = join(__dirname, 'docs', 'Agent-How-To-Use-Expect-MCP.md');
  try {
    const content = readFileSync(docPath, 'utf-8');
    console.log(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error reading documentation: ${errorMessage}`);
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
expect-mcp CLI

Usage:
  expect-mcp how-to-use    Show guide for using expect-mcp in your tests

Options:
  --help, -h               Show this help message
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'how-to-use':
      showHowToUse();
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      showUsage();
      process.exit(1);
  }
}

main();
