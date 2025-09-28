# Model Context Protocol (MCP) Specification

## Overview

The Model Context Protocol (MCP) is an open standard that enables seamless integration between Large Language Model (LLM) applications and external data sources and tools. It provides a universal protocol for connecting AI systems with data sources, replacing fragmented integrations with a single standardized approach.

## Protocol Foundation

### JSON-RPC 2.0 Base
All messages between MCP clients and servers **MUST** follow the JSON-RPC 2.0 specification. The protocol is built on this foundation but includes MCP-specific extensions and requirements.

### Key Participants

1. **Hosts**: LLM applications that initiate connections
2. **Clients**: Connectors within host applications that communicate with servers
3. **Servers**: Services that provide context, data, and capabilities to clients

## Core Architecture

### Communication Model
- **Stateful Sessions**: MCP maintains stateful sessions between clients and servers
- **Bidirectional Communication**: Both clients and servers can send requests and notifications
- **Context Exchange**: Focus on exchanging contextual information and coordinating sampling

### Message Types

#### 1. Requests
```json
{
  "jsonrpc": "2.0",
  "id": "string | number",
  "method": "string",
  "params": {
    "[key: string]": "unknown"
  }
}
```

**Requirements**:
- Requests **MUST** include a string or integer ID
- The ID **MUST NOT** be null (unlike base JSON-RPC)
- The request ID **MUST NOT** have been previously used by the requestor within the same session

#### 2. Responses
```json
{
  "jsonrpc": "2.0",
  "id": "string | number",
  "result": {
    "[key: string]": "unknown"
  },
  "error": {
    "code": "number",
    "message": "string",
    "data": "unknown"
  }
}
```

**Requirements**:
- Responses **MUST** include the same ID as the corresponding request
- Either `result` or `error` **MUST** be set, but **NOT** both

#### 3. Notifications
```json
{
  "jsonrpc": "2.0",
  "method": "string",
  "params": {
    "[key: string]": "unknown"
  }
}
```

Notifications are sent without expecting a response and do not include an ID.

## Core Capabilities

### 1. Resources
- **Application-controlled context**: Data and content that the application controls
- **Resource sharing**: Expose data sources to LLM applications
- **Resource subscription**: Real-time updates when resources change
- **URI-based addressing**: Resources are identified by URIs

### 2. Tools
- **Model-controlled actions**: Functions that the LLM can execute
- **Tool execution**: Servers provide callable tools to clients
- **Parameter validation**: Tools define their expected parameters and types
- **Safety controls**: Built-in mechanisms for safe tool execution

### 3. Prompts
- **User-controlled interactions**: Templates and structures for user interactions
- **Prompt templates**: Reusable conversation starters and workflows
- **Dynamic prompts**: Context-aware prompt generation

### 4. Sampling
- **LLM coordination**: Coordinate sampling requests between clients and servers
- **Context awareness**: Maintain context across different tools and datasets
- **Sampling controls**: Safety and control mechanisms for LLM sampling

## Security Framework

### Core Security Principles

1. **User Consent and Control**
   - Explicit user consent required for all operations
   - Clear authorization flows
   - User visibility into all actions

2. **Data Privacy Protection**
   - Protect user data throughout the protocol
   - Transparent data usage policies
   - Secure data transmission

3. **Tool Safety**
   - Safe execution environments for tools
   - Validation of tool parameters
   - Control mechanisms for potentially dangerous operations

4. **LLM Sampling Controls**
   - Controls over LLM sampling behavior
   - Safety mechanisms for generated content
   - Context isolation where needed

### Security Implementation Guidelines

- **Access Controls**: Implement robust access control mechanisms
- **Authentication**: Secure authentication flows between clients and servers
- **Authorization**: Fine-grained authorization for different operations
- **Audit Trails**: Logging and monitoring of all protocol interactions

## Protocol Features

### Initialization and Capability Negotiation
- **Version negotiation**: Clients and servers negotiate protocol versions
- **Capability discovery**: Dynamic discovery of available features
- **Feature enablement**: Selective enabling of protocol features

### Transport Mechanisms
- **Multiple transports**: Support for various transport layers
- **Connection management**: Robust connection handling and recovery
- **Session management**: Stateful session lifecycle management

### Schema and Validation
- **TypeScript Schema**: Protocol defined with TypeScript as source of truth
- **JSON Schema**: Auto-generated JSON Schema for tooling compatibility
- **Runtime Validation**: Zod schemas for runtime message validation
- **Type Safety**: Compile-time type checking with TypeScript

## Message Protocol Details

### Initialization Flow
1. Client initiates connection to server
2. Protocol version negotiation
3. Capability exchange and negotiation
4. Session establishment

### Resource Operations
- **List Resources**: Discover available resources
- **Read Resource**: Retrieve specific resource content
- **Subscribe**: Register for resource change notifications
- **Unsubscribe**: Remove resource change subscriptions
- **Resource Updated**: Notifications when resources change

### Tool Operations
- **List Tools**: Discover available tools
- **Call Tool**: Execute a specific tool with parameters
- **Tool Result**: Response from tool execution

### Prompt Operations
- **List Prompts**: Discover available prompt templates
- **Get Prompt**: Retrieve specific prompt template
- **Prompt Result**: Generated prompt content

## Implementation Standards

### Normative Language
The specification uses BCP 14 terminology as defined in RFC2119 and RFC8174:
- **MUST**: Absolute requirement
- **SHOULD**: Strong recommendation
- **MAY**: Optional feature

### Schema Definition
- **Source of Truth**: TypeScript schema in `/schema/2025-06-18/schema.ts`
- **Compatibility**: JSON Schema generated from TypeScript for broad compatibility
- **Validation**: Zod schemas for runtime validation and type inference

### Error Handling
- **Standard Error Codes**: Predefined error codes for common scenarios
- **Error Details**: Rich error information for debugging
- **Graceful Degradation**: Handling of unsupported features

## Ecosystem Integration

### Development Tools
- **SDKs**: Official Software Development Kits for multiple languages
- **Documentation**: Comprehensive documentation at modelcontextprotocol.io
- **Examples**: Reference implementations and example servers

### Industry Adoption
- **Early Adopters**: Block, Apollo, Zed, Replit, Codeium, Sourcegraph
- **Enterprise Integration**: Support for enterprise systems (Google Drive, Slack, GitHub, Git, Postgres)
- **Open Source**: Community-driven development with 250+ contributors

### Client Applications
- **Claude Desktop**: Built-in MCP server support
- **Third-party Clients**: SDK support for building custom clients
- **Integration Examples**: Real-world integration patterns and examples

## Protocol Versioning

### Current Version
- **Specification**: 2025-06-18 (as referenced in search results)
- **Schema Location**: `/schema/2025-06-18/schema.ts`
- **Backward Compatibility**: Versioned protocol with compatibility guidelines

### Version Evolution
- **Incremental Updates**: Regular updates to the specification
- **Community Input**: Open development process with community feedback
- **Migration Guidance**: Clear migration paths between versions

## Licensing and Governance

- **License**: MIT License for open-source adoption
- **Repository**: https://github.com/modelcontextprotocol/modelcontextprotocol
- **Community**: Governed by community contribution guidelines
- **Standards Body**: Open standard maintained by the community

## References

- **Official Specification**: modelcontextprotocol.io/specification
- **GitHub Repository**: https://github.com/modelcontextprotocol/modelcontextprotocol
- **Documentation**: modelcontextprotocol.io
- **JSON-RPC 2.0**: https://www.jsonrpc.org/specification
- **RFC2119**: https://tools.ietf.org/html/rfc2119 (Key words for use in RFCs)
- **RFC8174**: https://tools.ietf.org/html/rfc8174 (Ambiguity in RFC 2119 Key Words)

---

*This specification is compiled from publicly available documentation and represents the current understanding of the Model Context Protocol as of the compilation date. For the most current and authoritative information, please refer to the official specification at modelcontextprotocol.io.*