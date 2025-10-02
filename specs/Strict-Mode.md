# Strict Mode Specification

## Overview

Strict Mode is an optional feature in the expect-mcp library that enables enhanced validation and error checking for Model Context Protocol (MCP) communications. When enabled, strict mode adds comprehensive validation to ensure all MCP interactions conform to the official specification.

## Purpose

Strict mode addresses the need for:

- **Protocol Compliance**: Ensuring all messages conform to JSON-RPC 2.0 and MCP specifications
- **Early Error Detection**: Catching malformed responses and invalid data structures before they cause issues
- **Testing Reliability**: Providing more deterministic behavior in test environments
- **Development Safety**: Helping developers identify protocol violations during development

## Features

### 1. JSON-RPC Format Validation

Strict mode validates that all incoming messages conform to JSON-RPC 2.0 format:

- **Required Fields**: Ensures `jsonrpc`, `id`, and `method`/`result` fields are present
- **Correct Types**: Validates field types match the specification
- **JSON Parsing**: Rejects non-JSON output from subprocess
- **Version Compliance**: Enforces `jsonrpc: "2.0"` version requirement

### 2. MCP Schema Validation

Uses Zod schemas to validate MCP-specific message structures:

- **Initialize Response**: Validates server capabilities, protocol version, and server info
- **Tool Definitions**: Ensures tool schemas match expected format
- **Resource Metadata**: Validates resource URI format and metadata structure
- **Content Types**: Validates text, image, and audio content blocks

### 3. Protocol Version Enforcement

Strict mode enforces protocol version compatibility:

- **Version Negotiation**: Validates version exchange during initialization
- **Latest Protocol**: Uses the most recent MCP protocol version (`2025-06-18`)
- **Compatibility Checking**: Ensures client and server versions are compatible

## Implementation

### Enabling Strict Mode

```typescript
import { MCPStdinSubprocess } from 'expect-mcp';

// Enable strict mode
const mcp = new MCPStdinSubprocess({
  strictMode: true,
  command: 'my-mcp-server',
  args: [],
});

// Check if strict mode is enabled
console.log(mcp.isStrictModeEnabled()); // true
```

### Configuration Options

```typescript
interface MCPStdinSubprocessOptions {
  strictMode?: boolean; // Default: false
  // ... other JsonRpcSubprocessOptions
}
```

### Validation Points

Strict mode validation occurs at these key points:

1. **Message Reception**: All incoming JSON-RPC messages are validated
2. **Initialize Response**: Server initialization response is schema-validated
3. **Response Processing**: All method responses are checked for format compliance
4. **Notification Handling**: Notifications are validated against schemas

## Error Handling

### Error Types

Strict mode can throw the following types of errors:

```typescript
// JSON parsing errors
'Strict mode: Response is not valid JSON: <error details>';

// JSON-RPC format errors
'Strict mode: Invalid JSON-RPC response: <validation details>';

// Schema validation errors
'Strict mode: Initialize response validation failed: <schema errors>';
```

### Error Context

All strict mode errors include:

- Clear indication that strict mode is enabled
- Specific validation failure reason
- Detailed error context from Zod validation

## Testing Integration

### Test Configuration

```typescript
import { describe, it, expect } from 'vitest';
import { MCPStdinSubprocess } from 'expect-mcp';

describe('MCP Server Tests', () => {
  it('should handle valid responses in strict mode', async () => {
    const mcp = new MCPStdinSubprocess({
      strictMode: true,
      command: 'test-server',
    });

    const result = await mcp.initialize();
    expect(result.protocolVersion).toBe('2025-06-18');
  });
});
```

### Validation Testing

Test cases should cover:

- Valid message formats
- Invalid JSON-RPC structures
- Schema validation failures
- Protocol version mismatches

## Schema Architecture

### Core Schemas

The strict mode validation uses Zod schemas organized by domain:

```
src/schemas/
├── index.ts          # Main exports
├── jsonrpc.ts        # JSON-RPC 2.0 schemas
├── initialization.ts # MCP initialization schemas
├── resources.ts      # Resource-related schemas
└── tools.ts          # Tool-related schemas
```

### Key Schema Exports

- `JSONRPCMessageSchema`: Validates all JSON-RPC message types
- `InitializeResultSchema`: Validates server initialization response
- `ToolSchema`: Validates tool definitions
- `ResourceSchema`: Validates resource metadata

## Performance Considerations

### Validation Overhead

Strict mode adds validation overhead:

- **Schema Parsing**: Zod validation on each message
- **Memory Usage**: Schema objects stored in memory
- **CPU Cost**: Additional processing for validation

### Optimization

- Validation only occurs when strict mode is enabled
- Schemas are compiled once and reused
- Fast-path for valid messages

## Migration Guide

### Enabling Strict Mode Gradually

1. **Start with Tests**: Enable strict mode in test environments first
2. **Fix Validation Errors**: Address any schema validation failures
3. **Production Rollout**: Enable in production once validation is clean

### Common Migration Issues

1. **Missing Fields**: Servers may omit optional fields that strict mode expects
2. **Type Mismatches**: Field types may not match schema expectations
3. **Protocol Versions**: Older servers may use outdated protocol versions

## Best Practices

### Development

- **Enable Early**: Use strict mode during development to catch issues early
- **Test Coverage**: Write tests that validate both success and failure cases
- **Error Handling**: Implement proper error handling for validation failures

### Production

- **Gradual Rollout**: Enable strict mode incrementally
- **Monitoring**: Monitor for validation errors in production
- **Fallback Strategy**: Have a plan to disable strict mode if needed

## Related Documentation

- [Model Context Protocol Specification](../docs/Model-Context-Protocol-v2025-06-18.md)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [Zod Schema Validation](https://zod.dev/)

## Future Enhancements

Potential future additions to strict mode:

- **Custom Validators**: User-defined validation rules
- **Partial Validation**: Selective validation of specific message types
- **Performance Metrics**: Validation timing and performance tracking
- **Detailed Reporting**: Enhanced error reporting with suggestions
