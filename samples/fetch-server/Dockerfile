FROM python:3.11-slim

WORKDIR /app

# Install the MCP fetch server
RUN pip install mcp-server-fetch

# Run the MCP fetch server
CMD ["python", "-m", "mcp_server_fetch"]
