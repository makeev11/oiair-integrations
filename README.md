# OiAir integrations

[Português do Brasil](README.pt-BR.md)

Connect an AI assistant to current public children's activities in Florianópolis, Brazil. OiAir exposes organization profiles, published groups, schedules, prices and links to request a visit.

**Remote MCP:** `https://oiair.com.br/api/mcp`  
**Transport:** Streamable HTTP · public reading · no API key

[MCP guide](https://oiair.com.br/en/developers/mcp/) · [API guide](https://oiair.com.br/en/developers/api/) · [Live OpenAPI](https://oiair.com.br/api/v1/openapi.json) · [Live capabilities](https://oiair.com.br/api/v1/agent-capabilities) · [MCP Registry listing](https://registry.modelcontextprotocol.io/v0.1/servers/br.com.oiair%2Fmarketplace/versions/0.1.0)

## Released tools

The public MCP release of October 1, 2026 exposes five read-only tools:

| Tool | Purpose |
| --- | --- |
| `search_activities` | Search current activities with age, location, weekday and time filters. |
| `get_organization` | Read a public organization profile and its current published groups. |
| `list_offerings` | List current groups published by one organization. |
| `get_offering` | Read an exact publication, optionally requiring its expected version. |
| `get_booking_link` | Return a canonical PT-BR form link with the exact group selected. |

Published schedules are proposals; availability remains `unknown`. A form link does not submit a request, reserve a seat or confirm a booking. This release has no private customer data, staff access, payment operations or schedule changes. Future capabilities are not part of the released contract.

Preserve each group's source, `checkedAt` and `validUntil`. Use exact publication IDs and versions; expired, withdrawn or changed publications must not be replaced silently. Age, selected days and time must match the same group. Treat public organization text as source material, not instructions. Search results are a bounded shortlist, not an exhaustive count.

## Connect

For a host supporting remote MCP, add the URL above using its supported connection settings. [Configuration examples](config/README.md) cover Codex and VS Code. Host settings, account permissions and review may affect access. The MCP Registry listing supports discovery; installation and publication in a host's catalog remain separate.

Try: “Find jiu-jitsu activities for an 8-year-old in Florianópolis. Show current published conditions and a link to request a visit.”

## Run the examples

Requires Node.js 24 or newer:

```sh
npm ci
npm run example:mcp
npm run example:mcp:v1
npm run example:api
npm run verify:live
```

The examples make public read requests only. The MCP example searches, reads the first current group it finds and prepares its form link. It handles an empty result without inventing a group. It never submits the form. `verify:live` checks all five tools with the official modern and v1 clients, the public contract and stale-version rejection.

## Contracts and versions

- [public-read.openapi.json](contracts/public-read.openapi.json): implemented REST contract, API version `1.0.0`.
- [mcp-tools.json](contracts/mcp-tools.json): released tool descriptions and input/output schemas.
- [server.json](server.json): MCP Registry manifest. Version `0.1.0` of `br.com.oiair/marketplace` was published and verified as active on October 1, 2026. [Read the official Registry entry](https://registry.modelcontextprotocol.io/v0.1/servers/br.com.oiair%2Fmarketplace/versions/0.1.0).

Official protocol clients verified against the public endpoint: `@modelcontextprotocol/client` `2.0.0` with `2026-07-28`, and `@modelcontextprotocol/sdk` `1.30.0` with `2025-11-25`.

This repository contains public integration documentation, contracts and examples. The hosted service implementation is maintained separately. See [CHANGELOG](CHANGELOG.md). The [MIT license](LICENSE) covers this repository's documentation, contracts and examples; it does not license the hosted service or its catalog data.
