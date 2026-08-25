# QilyLean Global Translation Dual Route V2｜受控变更记录

日期：2026-08-25
状态：受控实施
适用基线：QL-WEB-STD-001 / R6

## 1. 变更目标

恢复并永久保持中文静态 HTML 为 QilyLean 官网唯一权威原始数据源（SSOT）及默认访客展示语言；翻译能力只作为访客主动触发的增强层，不得在页面首次加载时自动翻译、阻塞页面或锁死语言切换。

同时将原 Google-only 按需翻译升级为国内外双线路：

- 中国大陆访问特征：优先 QilyLean 国内翻译线路；
- 海外 / 非大陆访问特征：优先 Google Translate Website Translation；
- 国内线路不可达：自动降级到 Google Translate；
- 中文原文：任何时候可立即恢复，并终止正在执行的站内翻译请求。

## 2. 运行时架构

统一入口：导航最右侧 `🌐 网页翻译｜智能路由`。

大陆线路候选按可用性竞速：

1. `https://api.qilylean.com`
2. `https://ai-api.qilylean.com`
3. `https://qilylean-ai.dinghunter623.workers.dev`

成功选中的 QilyLean API 通过 `/translate` 执行翻译。现有 Worker 的翻译 provider 在已配置 DashScope 时优先具备 Qwen 链路，并保留现有 provider 回退能力。

海外线路使用 Google Translate 网站翻译当前 QilyLean canonical URL。

## 3. 性能与可用性原则

- 页面加载：0 次翻译网络请求；
- 中文默认：直接读取静态 HTML；
- 用户选择语言后才启动线路探测或翻译；
- 不使用阻塞 spinner；
- 语言 `<select>` 在翻译过程中始终可操作；
- 切回中文立即 abort 当前站内翻译并恢复原文；
- 国内站内翻译采用渐进应用、4 路并发、本地翻译缓存；
- 动态内容仅在用户已经主动翻译后进行有限次数扫尾，不形成无限后台翻译任务。

## 4. 路由判定

前端采用无网络阻塞的浏览器环境特征判定大陆优先线路，主要参考：

- `Asia/Shanghai` / `Asia/Chongqing` / `Asia/Harbin` / `Asia/Urumqi` 时区；
- `zh-CN` / `zh-Hans` 浏览器语言。

该判定用于选择“优先线路”，不是身份识别或精准地理定位。错误路由不会影响中文源站；国内线路失败时自动转 Google。

## 5. 视觉与交互

翻译工具必须与一级导航明显区分：

- 独立描边容器；
- `🌐` 地球标识；
- 明确文字 `网页翻译`；
- 高识别度 `智能路由` 徽标；
- 目标语言下拉；
- 可见状态文字（中文原文 / 国内线路 / Google / 部分完成 / 降级）。

必须继续继承 Interaction Continuity V2 的 hover / active / focus-visible / mobile touch 反馈。

## 6. 边界

- 图片像素文字、Canvas 已绘制文字不属于 DOM 翻译范围；
- 跨域 iframe 内部内容受浏览器同源策略限制；
- Google Translate 在中国大陆的外部服务可达性不由 QilyLean 控制，因此只作为大陆线路失败后的降级，不作为大陆主线路 SLA；
- `api.qilylean.com` / `ai-api.qilylean.com` 为第一方 API 候选域名；未完成 DNS / Cloudflare custom-domain 激活时，由现有 Worker endpoint 兜底。

## 7. 防回退

受控源：

- `site-global-language-v3.js`
- `site-global-language-v1.css`
- `site-ui-consistency-v1.js`
- `scripts/materialize-global-language-v3.js`
- `scripts/validate-global-language-runtime-compat-v1.js`
- `.github/workflows/validate-global-language-runtime-compat.yml`
- `.github/workflows/materialize-global-language-v3.yml`

全站 HTML 通过 materializer 统一物化版本号和 direct marker；禁止单页临时补丁。
