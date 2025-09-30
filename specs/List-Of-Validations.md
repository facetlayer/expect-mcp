
Big list of things that are verified by expect-mcp

# JSON-RPC 2.0 compliance (applies to all messages)

 - Verify all requests include a non-null string or integer ID.
 - Verify request IDs are unique within a session.
 - Verify responses include the same ID as the corresponding request.
 - Verify responses contain either `result` or `error`, but not both.
 - Verify all messages include `"jsonrpc": "2.0"`.

# Console output

 - Verify that all `stdout` lines are properly formatted JSON RPC - no debug logging.

# initialize flow

 - Verify that the server replies to `initialize`.
 - Verify that the `initialize` response correctly follows the schema.

# Tool usage

When a test calls a tool with `callTool`:

 - Verify that the server's `capabilities` section has enabled `tools`.
 - Verify that the `tools/list` response contains the named tool.

When a test fetches a resource with `getResource`:

 - Verify that the server's `capabilities` section has enabled `resources`.
 - Verify that the `resources/list` response contains the named resource.
