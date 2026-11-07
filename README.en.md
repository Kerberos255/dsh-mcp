# dsh-mcp

[简体中文](README.md) · [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

Manage MCP servers and tools in DSH. On-demand discovery reduces tool-schema context overhead, while unchanged tools retain stable registrations where possible.

> Forked from [ArvinQi/dsh-mcp](https://github.com/ArvinQi/dsh-mcp). The upstream MIT license and required attribution are preserved.

![MCP settings](static/snapshot.en.webp)

## Features

- **Server management:** Add, edit, test, enable, disable and refresh stdio and Streamable HTTP servers; choose individual tools.
- **On-demand discovery:** The default `mcp_tool_search` mode loads relevant tools as needed; full injection is also available.
- **Configuration and authentication:** Per-server and shared environment variables, bulk JSON editing, request-header substitution and MCP OAuth (authorization code + PKCE).
- **Declared servers:** Show native `cordis.patch.yml` servers as read-only entries, with controlled takeover/release to avoid duplicate tool registration.
- **HTTPS trust:** Include OS-trusted root certificates for supported MCP HTTPS connections without disabling certificate verification.

## Install

Install into the DSH profile that runs your agents (`desktop` is an example):

```sh
dsh plugin --profile desktop add github:Kerberos255/dsh-mcp
```

Restart DSH after installation or a code update. Hard-refresh the UI if it still shows an older client bundle. Open **Settings → MCP** (or the plugin details page).

## Quick start

1. **Add server:** Choose `stdio` (local command) or `streamable-http` (remote URL), then supply its connection settings.
2. **Test connection**, save, and enable only the tools you need.
3. Use **on-demand search** by default; choose **full** mode if every enabled tool must be visible on each turn.
4. For OAuth servers, enable **Use OAuth** and complete the authorization from the server card. Static Authorization headers generally do not need OAuth.

Servers declared in `cordis.patch.yml` appear read-only. Use **Take over** if the plugin must manage their authentication or variables. A pending native configuration reload may require a DSH restart; takeover does not intentionally double-mount a server.

## Notes

- The plugin does not bypass native agent tool permissions.
- Keep secrets in DSH credentials or a protected host environment; never commit live tokens.
- Check [package.json](package.json) for `engines`, `peerDependencies` and `dshCompatibility.testedRuntime`. Retest after upgrading DSH.
- **Troubleshooting:** If the UI is missing, check the profile, bundle activation and restart; if tools are missing, check connectivity, per-tool switches and injection mode.

Development: `npm test`; rebuild the UI with `npm run build` when needed. See [CHANGELOG.md](CHANGELOG.md) and [LICENSE](LICENSE).
