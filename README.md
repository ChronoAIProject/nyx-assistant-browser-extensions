# Nyx 助手 · Chrome 扩展

在任意普通网页点击工具栏的 Nyx 图标，即可在侧边栏提问。侧边栏在同一窗口的标签页之间保持打开，可以边浏览边继续对话。

[中文开发者官网](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/) · [English developer site](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/en/)

## 安装与使用

1. 从开发者官网下载扩展 ZIP 并解压。[下载扩展](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/nyx-chrome-extension.zip)
2. 在桌面版 Chrome 116 或更新版本打开 `chrome://extensions/`，启用「开发者模式」，点击「加载已解压的扩展程序」，选择解压后包含 `manifest.json` 的文件夹。使用源码安装时，选择仓库中的 `extension/`。
3. 在任一网页打开 Chrome 的「扩展程序」菜单，点击「Nyx 助手」。可以点击图钉，将入口固定到工具栏。
4. 在侧边栏点击「连接 NyxID」，前往授权页核对授权码，批准可访问 `llm-nyx` 和 `chrono-llm-public` 的 Key。回到侧边栏，输入问题并按 Enter 发送，Shift+Enter 换行。
5. 在同一窗口打开另一个网站，可继续刚才的对话。要讨论正在浏览的网页，请在该标签页点击工具栏的 Nyx 图标，选择「附上网页内容」。有选区时预览选区，否则预览顶层网页正文（最多 12,000 字符）。可删改后点击「使用此摘录」，再输入问题。

除侧边栏和 NyxID API 权限外，扩展使用 `activeTab` 与 `scripting`，在你点击 Nyx 图标后按需从当前标签页提取文字。输入框、密码框、可编辑区域和嵌入框架均跳过。确认的摘录会作为只读工具提供给本次对话；「移除摘录」可停止后续读取，已发送的内容仍在对话中。切换网页后可重新附上。聊天记录随本次侧边栏关闭而结束。已核验的授权加密保存在扩展来源，重新打开可以继续使用同一授权。点击「断开授权」可撤销当前子凭据。

## 维护与验收

扩展、官网或打包工作流有变更时，GitHub Actions 会为面向 `dev` 的 PR 和合入 `dev` 的提交生成 ZIP。登录 GitHub 可在运行的 **Artifacts** 中下载该次产物，保留 30 天。`dev` 的成功部署会更新中英文官网及其公开下载，站点提供与该次 CI 相同的 ZIP。需要重新发布时，在工作流页面选择 **Run workflow** 并运行 `dev` 分支。[打开扩展下载与发布工作流](https://github.com/ChronoAIProject/nyx-assistant-browser-extensions/actions/workflows/chrome-extension.yml?query=branch%3Adev)

`extension/vendor/nyx-widget.js` 是随扩展分发的 SDK 浏览器构建，含上游打包的依赖许可。更新时从固定版本复制该文件，然后验证授权、消息和侧边栏启动。当前版本为 `v0.1.0-alpha.11`。[SDK 源文件](https://github.com/ChronoAIProject/nyx-assistant-sdk/blob/6da8ee2c65c37cccd68329c741862bfc186508e1/browser/nyx-widget.js)

在独立 Chrome 配置中按安装步骤加载扩展。在两个不同来源的普通网页打开侧边栏，确认能连接 NyxID，在第一个标签发送消息，切到第二个标签继续对话。保持侧边栏打开并刷新网页，再检查消息是否仍在。扩展的文件、依赖和验收入口见[登记表](.chrono-harness/FILEMAP.md)。仓库协作工具沿用[安装说明](.chrono-harness/USAGE.md)。
