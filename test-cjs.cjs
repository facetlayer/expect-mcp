// Simple script to test CommonJS import
const expectMCP = require('./dist/cjs/index.cjs');

console.log('CommonJS import successful!');
console.log('Exported properties:', Object.keys(expectMCP));

// Verify key exports are present
const requiredExports = ['mcpShell', 'MCPStdinSubprocess'];
const missingExports = requiredExports.filter(exp => !(exp in expectMCP));

if (missingExports.length > 0) {
  console.error('Missing exports:', missingExports);
  process.exit(1);
}

console.log('All required exports are present ✓');
