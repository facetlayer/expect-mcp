# Model Context Protocol v2025-06-18

## Overview

The Model Context Protocol (MCP) is an open standard for connecting AI assistants to the systems where data lives, including content repositories, business tools, and development environments. It provides a stateful session protocol focused on context exchange and sampling coordination between clients and servers.

## Key Features

- **JSON-RPC 2.0 Based**: Built on the JSON-RPC 2.0 specification for reliable communication
- **Stateful Sessions**: Maintains connection state for efficient context exchange
- **Extensible Architecture**: Supports custom capabilities and experimental features
- **Security-First Design**: Built-in support for progress tracking and cancellation

## Protocol Version

**Current Version**: `2025-06-18`

The protocol uses string-based version identifiers in the format "YYYY-MM-DD" indicating the last date backwards incompatible changes were made.

## Core Architecture

### Client-Server Model

MCP operates on a client-server architecture where:
- **Clients** are typically AI applications or LLM hosts
- **Servers** provide access to resources, tools, and prompts

### Primitives

#### Server Primitives
- **Resources**: Structured data which can be included in the LLM prompt context
- **Tools**: Executable functions which LLMs can call to retrieve information or perform actions
- **Prompts**: Instructions or templates for instructions

#### Client Primitives
- **Roots**: Entry points into a filesystem giving servers access to files on the client side
- **Sampling**: Allows servers to request "completions" or "generations" from a client-side LLM

## JSON-RPC Message Types

### Base Types

```typescript
// Core message union type
export type JSONRPCMessage =
  | JSONRPCRequest
  | JSONRPCNotification
  | JSONRPCResponse
  | JSONRPCError;

// Protocol constants
export const LATEST_PROTOCOL_VERSION = "2025-06-18";
export const JSONRPC_VERSION = "2.0";
```

### Request/Response Pattern

```typescript
// A request that expects a response
export interface JSONRPCRequest extends Request {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
}

// A successful response
export interface JSONRPCResponse {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  result: Result;
}
```

## Initialization Protocol

### Initialize Request

The client sends an initialization request to establish the session:

```typescript
export interface InitializeRequest extends Request {
  method: "initialize";
  params: {
    protocolVersion: string;
    capabilities: ClientCapabilities;
    clientInfo: Implementation;
  };
}
```

### Initialize Response

The server responds with its capabilities and protocol version:

```typescript
export interface InitializeResult extends Result {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: Implementation;
  instructions?: string; // Optional usage instructions
}
```

### Key Validation Points for Strict Mode

1. **Protocol Version Negotiation**: The server's `protocolVersion` in the response may differ from the client's request. If the client cannot support the server's version, it MUST disconnect.

2. **JSON-RPC Compliance**: All messages must conform to JSON-RPC 2.0 format with required fields:
   - `jsonrpc: "2.0"`
   - `id` for requests/responses
   - `method` for requests/notifications

3. **Required Fields**: Critical fields like `protocolVersion`, `capabilities`, and implementation info must be present and properly typed.

## Error Handling

Standard JSON-RPC error codes:
- `-32700`: Parse error
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error

## Capabilities

### Client Capabilities

```typescript
export interface ClientCapabilities {
  experimental?: { [key: string]: object };
  roots?: {
    listChanged?: boolean;
  };
  sampling?: object;
  elicitation?: object;
}
```

### Server Capabilities

```typescript
export interface ServerCapabilities {
  experimental?: { [key: string]: object };
  logging?: object;
  completions?: object;
  prompts?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  tools?: {
    listChanged?: boolean;
  };
}
```

## Resource Management

Resources represent structured data that can be included in LLM context:

```typescript
export interface Resource extends BaseMetadata {
  uri: string;
  description?: string;
  mimeType?: string;
  annotations?: Annotations;
  size?: number;
}
```

## Tool System

Tools are executable functions that LLMs can call:

```typescript
export interface Tool extends BaseMetadata {
  description?: string;
  inputSchema: {
    type: "object";
    properties?: { [key: string]: object };
    required?: string[];
  };
  outputSchema?: {
    type: "object";
    properties?: { [key: string]: object };
    required?: string[];
  };
  annotations?: ToolAnnotations;
}
```

## Strict Mode Validation Requirements

When implementing strict mode, the following validations should be enforced:

### 1. JSON-RPC Format Validation
- All stdin responses must be valid JSON-RPC 2.0 messages
- Reject any non-JSON output from subprocess
- Validate required fields (`jsonrpc`, `id`, `method`/`result`)

### 2. Schema Validation
- Initialize response must match `InitializeResult` interface
- All message types must conform to their respective schemas
- Type checking for required vs optional fields

### 3. Protocol Compliance
- Version negotiation must succeed
- Method names must be recognized
- Parameter structures must match expected schemas

## References

- **Official Specification**: https://modelcontextprotocol.io/specification
- **GitHub Repository**: https://github.com/modelcontextprotocol/modelcontextprotocol
- **Schema Files**: Available in TypeScript and JSON Schema formats

---

*This documentation is based on the official Model Context Protocol specification version 2025-06-18.*