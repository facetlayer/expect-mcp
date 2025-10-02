FROM node:20-slim

WORKDIR /app

# Install the MCP everything server
RUN npm install -g @modelcontextprotocol/server-everything

# Run the MCP everything server using npx
CMD ["npx", "@modelcontextprotocol/server-everything"]
