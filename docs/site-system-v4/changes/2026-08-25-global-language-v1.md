# Qily Global Language V1｜受控变更记录

- 日期：2026-08-25
- 母标准：QL-WEB-STD-001 / R6
- 变更类型：全站公共交互能力
- 状态：受控实施

## 1. 目标

在 QilyLean 全站顶部导航最右侧增加独立的全球语言切换器。中文（简体）为默认且唯一权威静态源；访客可从下拉菜单选择其他语言，并在当前页面即时翻译。成功选择的语言写入浏览器本地偏好，进入其他页面继续沿用。

## 2. 信息架构边界

语言切换器属于全站工具，不属于一级业务导航，不改变既有一级导航分类、名称、顺序、页面使命或 SEO 主路由。

## 3. 静态优先与数据边界

- 原始中文 HTML 永远保留，不以翻译结果覆盖仓库静态正文。
- JavaScript 只做运行时增强；翻译失败必须自动保留/恢复中文。
- 翻译层不改变 canonical、结构化数据、Sitemap、索引主数据与中文 SEO 静态内容。
- 当前 V1 不创建 `/en/`、`/ja/` 等独立 SEO 静态语言目录；如需国际 SEO，应另立受控静态本地化项目。

## 4. 组件与接口

- `site-global-language-v1.css`：语言切换器公共视觉与响应式样式。
- `site-global-language-v1.js`：语言选择、文本采集、恢复中文、跨页偏好、动态内容增强。
- `site-ui-consistency-v1.js`：负责全站加载语言公共资产。
- `cloudflare-worker/worker-social.js`：提供 `POST /translate` 服务端翻译代理；API 密钥只存在 Worker 环境，不进入浏览器。

## 5. 专业术语保护

翻译服务必须优先保护 QilyLean、Times26001、C919 以及 IE / VSM / SMED / ECRS / OEE / UPPH / ERP / APS / MES / PQCD / IATF 16949 等品牌、工程缩写、型号与标准标识；普通解释文字按目标语言专业表达。

## 6. 成本、缓存与防滥用

- 相同文本批次 + 相同目标语言采用 KV 共享缓存，默认 90 天。
- 仅缓存未命中时消耗翻译额度。
- 默认每 IP 每日最多 80 个缓存未命中的翻译批次，可通过 Worker 环境变量受控调整。
- 前端对页面文本去重、分批并发，避免每个 DOM 节点单独发起接口请求。

## 7. 交互与可访问性

语言控件必须具备 default / hover / active / focus-visible / touch 等可感知反馈；使用原生 `select` 保证键盘与触摸选择可用，并通过 `aria-label`、`role=status`、`aria-live` 表达状态。

## 8. V1 已知边界

- HTML 文本、导航、按钮、表格文字以及 title / aria-label / placeholder / alt 可参与翻译。
- 图片、流程图、飞机模型等“已经烘焙进像素中的文字”不会被 DOM 翻译器改写；如需图片内多语言，应提供独立本地化图片资产。
- V1 属于即时阅读翻译，不等同于搜索引擎可索引的独立多语言站。

## 9. 回滚

回滚时移除 `site-ui-consistency-v1.js` 中 Global Language 资产加载，并回退 Worker `/translate` 路由；两个独立公共资产可保留为未引用文件或随变更一并删除。不得影响中文静态页面、导航、搜索、SEO、Dock、知识资产与既有 AI/咨询接口。
