# Chrome 扩展文件登记

维护方为 Nyx 浏览器扩展项目。安装、使用及浏览器验收的入口为根 README 的「安装与使用」和「维护与验收」。扩展目录由桌面版 Chrome 直接加载。运行成本与人工验收耗时尚未测量。

| 文件 | 输入及依赖 | 使用方和用途 |
|---|---|---|
| README.md | Actions 下载入口、安装目录、Chrome 版本、NyxID 授权 | 用户下载安装，维护者验证跨页对话 |
| .github/workflows/chrome-extension.yml | 下列扩展及官网文件、checkout、GitHub artifact 和 Pages 服务 | CI 从固定提交的 extension 树生成一个 ZIP，供 Actions 和 Pages 使用。`dev` 从清单生成演示接口 release.json，部署两种语言的页面及同一份 ZIP，部署失败则报告错误。Actions 安装包保留 30 天，官网文件由下一次成功部署替换。运行及存储成本未知。 |
| site/index.html | 中文安装步骤、扩展授权及 SDK 接口、下列样式和资源 | 中文访客下载、安装和开发，切换到英文 |
| site/en/index.html | 英文安装步骤、扩展授权及 SDK 接口、共享站点资源 | 英文访客下载、安装和开发，切换到中文 |
| site/site.css | 两种语言的 HTML、earthrise.jpg | 浏览器绘制适应窄屏的站点和示意图 |
| site/nyxid-coloured-icon.svg | [NyxID 产品站图标原件](https://github.com/ChronoAIProject/NyxID/blob/4f828cc4995796227a9b210f3d327b7835f119af/frontend/public/nyxid-coloured-icon.svg) | 中英文官网导航、侧边栏示意、页脚和标签页图标 |
| site/site.js | 两种语言的章节链接、复制按钮、登记的 get_release 及示例源码 | 访客复制安装地址和命令，运行示例并查看响应，切换语言时保留章节 |
| site/earthrise.jpg | NASA / JSC，Apollo 8 影像 AS08-14-2383，来源链接见页面图注 | 在官网示意图中展示浏览页与侧边栏的位置 |
| extension/manifest.json | background.js、panel.html、四种尺寸的图标、NyxID API 来源 | Chrome 安装、权限、原生翻译与入口注册 |
| extension/background.js | Chrome runtime、sidePanel API | Chrome 在点击工具栏图标时打开窗口侧边栏 |
| extension/panel.html | panel.css、vendor/nyx-widget.js、read-page.js、panel.js、NyxID API 和登录来源 | Chrome 承载聊天与授权 |
| extension/panel.js | SDK 宿主、i18n.js、site-tools.js、预览弹窗、Chrome activeTab 与 scripting、collectPageExcerpt | 侧边栏用户预览并确认快照，当前对话通过 read_shared_page 读取确认的文字 |
| extension/read-page.js | 当前获准 HTTP(S) 主文档中的选区、渲染文字 | 用户按需预览限长文字，跳过编辑器及表单字段 |
| extension/panel.css | SDK 公开的组件部件、nyx-128.png、NyxID 深色品牌配色 | 用户在不同侧边栏尺寸下阅读和输入 |
| extension/vendor/nyx-widget.js | README 链接的 SDK 固定构建，内含授权、对话、Markdown 和依赖许可 | panel.html 在扩展来源运行 NyxID 授权与聊天 |
| extension/icons/nyx-16.png | site/nyxid-coloured-icon.svg 的 16 像素 PNG | Chrome 工具栏 |
| extension/icons/nyx-32.png | site/nyxid-coloured-icon.svg 的 32 像素 PNG | 高分辨率工具栏 |
| extension/icons/nyx-48.png | site/nyxid-coloured-icon.svg 的 48 像素 PNG | Chrome 扩展管理页 |
| extension/icons/nyx-128.png | site/nyxid-coloured-icon.svg 的 128 像素 PNG | Chrome 安装界面、侧边栏标题 |
| extension/_locales/en/messages.json | 英文清单和面板文案 | Chrome 原生名称、手动英文界面与状态 |
| extension/_locales/zh_CN/messages.json | 简体中文清单和面板文案 | Chrome 原生名称、手动简体中文界面与状态 |
| extension/i18n.js | 两份语言目录、Chrome 语言、localStorage | panel.js 与 site-tools.js 更新当前语言和挂件状态 |
| extension/page-api.js | 页面显式声明、当前 URL、用户选中的描述和已验证参数 | scripting 在顶层页面发现或调用单个回调，侧边栏验证声明及返回大小 |
| extension/site-tools.js | page-api.js、i18n.js、Chrome 标签页、文档编号、SDK host | 用户在 panel.html 按 API 授权或停用，页面切换时清除授权 |
| test/page-api.test.mjs | extension/page-api.js、模拟网页声明与切换 | 维护者与打包 CI 通过 node --test test/page-api.test.mjs 验证参数顺序、元数据变化、文档和声明边界 |
