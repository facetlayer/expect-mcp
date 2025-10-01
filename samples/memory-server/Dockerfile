FROM node:20-slim

WORKDIR /app

# Install the MCP memory server
RUN npm install -g @modelcontextprotocol/server-memory

# Run the MCP memory server
CMD ["mcp-server-memory"]