# Nyx 助手 · Chrome 扩展

在任意普通网页点击工具栏的 Nyx 图标，即可在侧边栏提问。侧边栏在同一窗口的标签页之间保持打开，可以边浏览边继续对话。

[中文开发者官网](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/) · [English developer site](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/en/)

## 安装与使用

1. 从开发者官网下载扩展 ZIP 并解压。[下载扩展](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/nyx-chrome-extension.zip)
2. 在桌面版 Chrome 116 或更新版本打开 `chrome://extensions/`，启用「开发者模式」，点击「加载已解压的扩展程序」，选择解压后包含 `manifest.json` 的文件夹。使用源码安装时，选择仓库中的 `extension/`。
3. 在任一网页打开 Chrome 的「扩展程序」菜单，点击「Nyx 助手」。可以点击图钉，将入口固定到工具栏。
4. 在侧边栏点击「连接 NyxID」，前往授权页核对授权码，文字聊天使用 `llm-nyx` 和 `chrono-llm-public`。默认勾选「启用语音通话」，还需批准自己的 OpenAI API 连接（`llm-openai`）。从 0.3.0 升级后，首次使用语音需要重新连接 NyxID。连接前取消勾选可继续使用原来的文字授权。回到侧边栏，输入问题并按 Enter 发送，Shift+Enter 换行。
5. 在同一窗口打开另一个网站，可继续刚才的对话。要讨论正在浏览的网页，请在该标签页点击工具栏的 Nyx 图标，选择「附上网页内容」。有选区时预览选区，否则预览顶层网页正文（最多 12,000 字符）。可删改后点击「使用此摘录」，再输入问题。

除侧边栏和 NyxID API 权限外，扩展使用 `activeTab` 与 `scripting`，在你点击 Nyx 图标后按需从当前标签页提取文字。输入框、密码框、可编辑区域和嵌入框架均跳过。确认的摘录会作为只读工具提供给本次对话；「移除摘录」可停止后续读取，已发送的内容仍在对话中。切换网页后可重新附上。聊天记录随本次侧边栏关闭而结束。已核验的授权加密保存在扩展来源，重新打开可以继续使用同一授权。点击「断开授权」可撤销当前子凭据。

已经加载旧版时，将新版解压到原扩展目录，在 `chrome://extensions/` 的 Nyx 卡片上点击「重新加载」。

## 语音通话

连接后，清空输入框并点击右侧的「语音通话」，按 Chrome 提示允许麦克风。若侧边栏提示权限不足，点击「麦克风权限」，在新标签页允许后返回重拨。若授权了多个 OpenAI 连接，在通话设置中选择一个并点击「开始通话」。双方字幕显示在侧边栏，可以静音、取消静音或挂断。挂断后回到文字聊天。语音和文字各有会话，语音也可使用拨号前已启用且仍有效的网站 API 或网页摘录。

## 语言和网站 API

侧边栏默认跟随 Chrome。可以在标题栏选择简体中文或 English，切换时保留聊天和输入草稿。

网站开发者在顶层页面设置 `window.nyxPageAPI = { version: 1, tools: [...] }`，也可以在自己网站的设置开关开启时登记。每个操作定义名称、描述、参数和回调。用户在该标签页点击 Nyx 图标，连接 NyxID，进入「网站 API」，勾选操作后点击「启用所选 API」。Nyx 调用选中的回调，使用网页自身的会话访问后端。切换标签页、页面导航或关闭侧边栏都会结束授权。官网两种语言的接入指南均提供可复制并直接运行的版本查询示例。[中文示例](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/#website-api) · [English example](https://chronoaiproject.github.io/nyx-assistant-browser-extensions/en/#website-api)

## 维护与验收

扩展、官网或打包工作流有变更时，GitHub Actions 会为面向 `dev` 的 PR 和合入 `dev` 的提交生成 ZIP。登录 GitHub 可在运行的 **Artifacts** 中下载该次产物，保留 30 天。`dev` 的成功部署会更新中英文官网及其公开下载，站点提供与该次 CI 相同的 ZIP。需要重新发布时，在工作流页面选择 **Run workflow** 并运行 `dev` 分支。[打开扩展下载与发布工作流](https://github.com/ChronoAIProject/nyx-assistant-browser-extensions/actions/workflows/chrome-extension.yml?query=branch%3Adev)

`extension/vendor/nyx-widget.js` 是随扩展分发的 SDK 浏览器构建，含上游打包的依赖许可。更新时从固定版本复制该文件，然后验证授权、消息和侧边栏启动。本版使用 SDK 正式版 `v0.2.0`。[SDK 源文件](https://github.com/ChronoAIProject/nyx-assistant-sdk/blob/v0.2.0/browser/nyx-widget.js)

在独立 Chrome 配置中按安装步骤加载扩展。在两个不同来源的普通网页打开侧边栏，确认能连接 NyxID，在第一个标签发送消息，切到第二个标签继续对话。保持侧边栏打开并刷新网页，再检查消息是否仍在。扩展的文件、依赖和验收入口见[登记表](.chrono-harness/FILEMAP.md)。仓库协作工具沿用[安装说明](.chrono-harness/USAGE.md)。

网站接口的回归检查使用 `node --test test/page-api.test.mjs`。在 Chrome 中分别打开中文和英文示例，核对页面按钮与 Nyx 工具返回的版本，验证停用、切换标签页和刷新使授权失效。

语音验收使用独立 Chrome 配置、测试麦克风和 WebRTC 对端。检查首次拒绝后的授权入口、双向音轨、字幕、静音和挂断释放麦克风，并在通话中核对已启用的网站接口可调用、停用后不可调用。
