#!/usr/bin/env node

/**
 * Sample MCP server that fails immediately on startup.
 * This server writes to both stdout and stderr, then exits with code 1.
 * Used for testing error handling when a subprocess fails to start.
 */

// Write some output to help diagnose the failure
console.log('Server startup initiated...');
console.error('ERROR: Failed to load required configuration file');
console.error('ERROR: Missing environment variable: REQUIRED_API_KEY');
console.log('Terminating due to configuration errors');

// Exit with non-zero code
process.exit(1);
