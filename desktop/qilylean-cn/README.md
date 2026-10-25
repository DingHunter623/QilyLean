# QilyLean｜启力精益 · 中国站桌面客户端 V1.0

官方内容来源：<https://qilylean.cn/>。本目录为 **独立桌面应用工程**，不修改 `cn-site/` 和国际站页面，不克隆或重写 VI。

## 产品边界

- Windows 10/11（x64）：NSIS 安装包 `*-setup.exe`。
- macOS：分别构建 Apple Silicon arm64 / Intel x64 的 `.dmg`。
- 内容、版式、图片、导航、交互、ICP备案信息以线上中国站为准。
- 网站更新自动在下一次页面加载时体现；客户端原生代码更新需要重新打包。
- 在线版：第一版不包含网页离线镜像、账号权限、通知、托盘、自动更新或网站内容重建。
- APP 内对 `qilylean.cn` 和 `www.qilylean.cn` 的 HTTPS 导航保留；跳出中国站的 HTTPS 链接用默认浏览器打开；外链新窗口也交给系统浏览器。
- 远程网站 **不得调用 Tauri 的本地系统 API**，能力文件不向远程域授予权限。

## 本地构建

先按 Tauri 2 官方文档安装 Rust、Node.js 与本机原生依赖：
<https://v2.tauri.app/start/prerequisites/>

在仓库根目录：

```bash
cd desktop/qilylean-cn
npm install
npm run check
npm run icons
npm run dev
```

制作安装包：
```bash
# Windows 系统执行
npm run build -- --bundles nsis

# macOS 系统执行
npm run build -- --bundles dmg
```

**图标不是新设计**：`npm run icons` 从仓库已有
`assets/tools/qilylean-unified-app-icon.svg` 生成桌面所需的 `.ico`、`.icns` 和 PNG；
保持统一 Q 图，不在仓库重复存放二进制图标。

## GitHub Actions 构建

进入仓库 Actions → **QilyLean CN Desktop V1 CI** → Run workflow（选开发分支）；
亦可由针对本目录的 Pull Request 自动触发。

每个平台的构建结果放在该次运行的 **Artifacts** 中，不自动发布官网、不自动部署、不自动生成 GitHub Release。构建产物未经正式代码签名，不得宣称“已正式发布”。

- Windows：`*-setup.exe`
- macOS Apple Silicon / Intel：对应架构 `.dmg`
- 首版不采购签名证书；安装与分发前需区分开发测试版和正式可信签名版。
- macOS 公开分发建议完成 Developer ID 签名与公证；Windows 正式公开分发建议进行代码签名。

## 验收 Gates（签字放行前）

1. Windows / macOS 对应架构成功构建，安装包可安装、启动、退出和卸载；
2. 首屏内容来自 `https://qilylean.cn/`，不意外重定向国际站；
3. 首页、导航、关于我们、代表项目、知识资产及外链逐一抽样；
4. 窗口缩放、窗口极值、回退、前进、刷新、返回首页不破坏 VI；
5. 离线启动有系统错误反馈；联网恢复后使用“刷新页面 / 网络恢复后重试”可以恢复；
6. 外站链接使用系统浏览器，不能创建权限不受控的原生子窗口；
7. 图标和官网统一 Q 标识；不出现新字体或商业信息；
8. 记录平台、架构、构建版本、安装包 SHA256 与复核证据。

**当前阶段：源码 + 自动构建流程交付；CI 通过及真实桌面安装验收前，不判定为软件交付闭环。**
