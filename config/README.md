# Host configuration examples

These are configuration snippets, not automatic installers. The public OiAir endpoint needs no API key. Host account permissions and MCP policies still apply. SDK protocol checks do not prove a connection inside a particular host account.

## Codex

Merge [codex.toml](codex.toml) into your Codex configuration, or run:

```sh
codex mcp add oiair --url https://oiair.com.br/api/mcp
codex mcp list
```

Source: [official OpenAI remote MCP configuration example](https://developers.openai.com/learn/docs-mcp).

## VS Code

Merge [vscode.mcp.json](vscode.mcp.json) into `.vscode/mcp.json`, or use **MCP: Add Server** and select a remote HTTP server. Enable the OiAir tools in your chat session. Existing entries should be preserved.

Source: [official VS Code configuration guide](https://code.visualstudio.com/docs/agent-customization/mcp-servers).

## Other hosts

Use `https://oiair.com.br/api/mcp` with **Streamable HTTP** in the host's supported remote-server interface. A host that supports only local stdio or the old SSE transport needs its own adapter; this repository does not ship one. Adding OiAir to a host is separate from listing it in a third-party catalog.
