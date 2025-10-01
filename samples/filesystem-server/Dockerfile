FROM node:20-slim

WORKDIR /app

# Install the MCP filesystem server
RUN npm install -g @modelcontextprotocol/server-filesystem

# Set the working directory as the allowed directory for filesystem operations
ENV ALLOWED_DIR=/app

# Run the MCP filesystem server with the allowed directory
CMD ["mcp-server-filesystem", "/app"]