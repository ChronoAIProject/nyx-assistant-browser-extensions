# Chrome 扩展文件登记

维护方为 Nyx 浏览器扩展项目。安装、使用及浏览器验收的入口为根 README 的「安装与使用」和「维护与验收」。扩展目录由桌面版 Chrome 直接加载。运行成本与人工验收耗时尚未测量。

| 文件 | 输入及依赖 | 使用方和用途 |
|---|---|---|
| README.md | 安装目录、Chrome 版本、NyxID 授权 | 用户安装，维护者验证跨页对话 |
| extension/manifest.json | background.js、panel.html、四种尺寸的图标、NyxID API 来源 | Chrome 安装、权限与入口注册 |
| extension/background.js | Chrome runtime、sidePanel API | Chrome 在点击工具栏图标时打开窗口侧边栏 |
| extension/panel.html | panel.css、vendor/nyx-widget.js、panel.js、NyxID API 和登录来源 | Chrome 承载聊天与授权 |
| extension/panel.js | 已升级的 nyx-assistant 元素、其授权提示和启动按钮 | 用户打开侧边栏即进入助手 |
| extension/panel.css | SDK 公开的组件部件、nyx-32.png、系统配色 | 用户在不同侧边栏尺寸下阅读和输入 |
| extension/vendor/nyx-widget.js | README 链接的 SDK 固定构建，内含授权、对话、Markdown 和依赖许可 | panel.html 在扩展来源运行 NyxID 授权与聊天 |
| extension/icons/nyx-16.png | Nyx 图标 16 像素 | Chrome 工具栏 |
| extension/icons/nyx-32.png | Nyx 图标 32 像素 | 高分辨率工具栏、侧边栏标题 |
| extension/icons/nyx-48.png | Nyx 图标 48 像素 | Chrome 扩展管理页 |
| extension/icons/nyx-128.png | Nyx 图标 128 像素 | Chrome 安装界面 |
