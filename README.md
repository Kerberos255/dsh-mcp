# dsh-mcp

[English](README.en.md) · [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

在 DSH 中集中管理 MCP 服务器和工具。支持按需检索工具，减少工具描述占用的上下文，同时保持未变化工具的注册稳定。

> 本项目 fork 自 [ArvinQi/dsh-mcp](https://github.com/ArvinQi/dsh-mcp)，保留原项目 MIT 许可证及必要署名。

![MCP 设置界面](static/snapshot.webp)

## 主要功能

- **可视化管理**：添加、编辑、测试、启停和刷新 stdio / Streamable HTTP 服务器，逐个启用或禁用工具。
- **按需工具检索**：默认通过 `mcp_tool_search` 查找并加载相关工具；也可切换为全量注入。工具列表更新时尽量保持未变化工具稳定。
- **配置与认证**：支持服务器级及全局环境变量、JSON 批量配置、请求头变量替换和 MCP OAuth（授权码 + PKCE）。
- **声明式服务器**：识别 `cordis.patch.yml` 中的原生 MCP 声明并只读展示；支持安全接管或释放，避免同名工具重复挂载。
- **兼容 HTTPS 证书**：合并系统信任的根证书，供受支持的 MCP HTTPS 连接使用；保留证书校验。

## 安装

安装到实际使用的 DSH Profile（`desktop` 仅为示例）：

```sh
dsh plugin --profile desktop add github:Kerberos255/dsh-mcp
```

启用插件后重启 DSH；若设置页仍显示旧版本，再硬刷新界面。安装后打开 **设置 → MCP**（或插件详情页）配置服务器。

## 快速使用

1. 点击 **添加服务器**，选择 `stdio`（本地命令）或 `streamable-http`（远端 URL），填写必要参数。
2. 点击 **测试连接**，确认可用工具，再保存并选择需要暴露的工具。
3. 默认使用 **按需检索**；需要每轮暴露全部工具时，再切换为全量注入。
4. 需要 OAuth 的服务器启用 **使用 OAuth 授权**，然后通过服务器卡片完成浏览器授权；静态 Token / Authorization 请求头通常无需开启 OAuth。

已有原生 `cordis.patch.yml` 声明会显示为只读；需要由插件管理认证和变量时，可使用 **接管**。接管失败不会与原生声明争抢同名工具；有待生效的组合变更时可能需要重启。

## 注意事项

- 插件只管理已配置的 MCP 服务器，不能绕过当前 DSH Agent 的工具与权限设置。
- 凭证应保存在 DSH 凭据服务或受保护的运行环境中，不要提交配置中的秘密值。
- 兼容范围以 [package.json](package.json) 的 `engines`、`peerDependencies` 和 `dshCompatibility.testedRuntime` 为准；更换 DSH 版本后应重新验证。
- **排查**：看不到管理页时先检查 Profile、插件启用状态并重启；工具未出现时检查服务器连接、工具开关和注入模式。

开发：`npm test`；需要重新构建界面时运行 `npm run build`。变更历史见 [CHANGELOG.md](CHANGELOG.md)，许可见 [LICENSE](LICENSE)。
