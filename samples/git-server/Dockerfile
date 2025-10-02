FROM python:3.11-slim

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install the MCP git server
RUN pip install mcp-server-git

# Initialize a test git repository
RUN git config --global user.email "test@example.com" && \
    git config --global user.name "Test User" && \
    git init /test-repo && \
    cd /test-repo && \
    echo "# Test Repository" > README.md && \
    git add README.md && \
    git commit -m "Initial commit"

# Run the MCP git server
CMD ["python", "-m", "mcp_server_git", "--repository", "/test-repo"]
