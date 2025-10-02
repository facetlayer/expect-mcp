FROM node:20-slim

WORKDIR /app

# Copy the candle setup config
COPY .candle-setup.json /app/.candle-setup.json

# Install candle globally
RUN npm install -g @facetlayer/candle@0.7.1

# Run candle in MCP mode
CMD ["candle", "--mcp"]