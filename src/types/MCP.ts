export interface MCPCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  roots?: {
    listChanged?: boolean;
  };
  logging?: {
    level?: string;
  };
}

export interface MCPInitializeParams {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
  instructions?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPToolsListResult {
  tools: MCPTool[];
}

export interface MCPResourcesListResult {
  resources: MCPResource[];
}

export interface MCPTextResourceContents {
  uri: string;
  mimeType?: string;
  text: string;
}

export interface MCPBlobResourceContents {
  uri: string;
  mimeType?: string;
  blob: string;
}

export type MCPResourceContents = MCPTextResourceContents | MCPBlobResourceContents;

export interface MCPReadResourceResult {
  contents: MCPResourceContents[];
}
