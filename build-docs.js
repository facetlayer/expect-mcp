#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Simple build script that handles the Docusaurus build
// This is a fallback in case the direct build has issues

async function buildDocs() {
  return new Promise((resolve, reject) => {
    const docsDir = path.join(__dirname, 'docs-site');

    const docusaurus = spawn('npx', ['docusaurus', 'build'], {
      stdio: 'inherit',
      cwd: docsDir,
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });

    docusaurus.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Documentation built successfully!');
        resolve();
      } else {
        console.error('❌ Documentation build failed');
        reject(new Error(`Build failed with code ${code}`));
      }
    });

    docusaurus.on('error', (err) => {
      console.error('❌ Failed to start build process:', err);
      reject(err);
    });
  });
}

if (require.main === module) {
  buildDocs()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { buildDocs };
