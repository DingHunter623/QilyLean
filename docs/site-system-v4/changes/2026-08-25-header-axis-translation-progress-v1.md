# QilyLean Header Axis V1 + Translation Progress V1｜受控变更记录

日期：2026-08-25
适用基线：QL-WEB-STD-001 / R6

## 1. 变更目标

解决桌面浏览器 100% 缩放下一级导航与网页翻译控件挤压、右侧内容显示不完整的问题，并将 Header 的视觉边界正式纳入全站 1560px 主内容轴治理。

同时增加用户主动翻译过程的非阻塞双语提示，降低长页面翻译等待期间的误解与重复操作。

## 2. Header 统一轴

- Header / Logo / 一级导航 / 网页翻译统一使用 `--qily-content-axis:1560px`；
- Logo 左边界与正文主内容左边界对齐；
- 网页翻译控件贴合 Header 右边界；
- 1181–1500px 桌面宽度先压缩导航 gap / padding，再允许一级导航在 18–20px 范围内响应式适配；
- 一级导航中文禁止折行；
- 桌面不允许通过横向裁切隐藏导航项；
- 1180px 及以下进入可横向滚动的紧凑导航模式，避免硬压缩导致不可读。

受控样式：`site-header-axis-v1.css`。

## 3. 网页翻译控件宽度治理

翻译控件继续保持独立边框、地球图标和“网页翻译”品牌识别；非必要状态信息优先隐藏，为一级导航释放宽度。

- ≤1800px：隐藏重复状态文字；
- ≤1700px：隐藏“智能路由”徽标，但保留控件主视觉身份；
- 翻译语言选择器采用受控紧凑字号，不受全站正文最低字号规则误放大。

## 4. 翻译过程双语提示

访客主动选择目标语言，且翻译状态为 `working / fallback / opening` 时，显示非阻塞小提示窗：

**正在翻译，请稍候**  
**Translating — a brief delay may occur.**

约束：

- 不遮挡导航；
- `pointer-events:none`，不得阻断任何交互；
- 不锁定语言下拉；
- 翻译完成、失败收口或切回中文后自动隐藏；
- 提示自身标记 `translate=no`，不得被翻译运行时二次翻译。

受控资源：`site-translation-progress-v1.js` + `site-translation-progress-v1.css`。

## 5. 全站物化与防回退

`scripts/materialize-global-language-v3.js` 统一物化：

- Navigation V42；
- Header Axis V1 CSS；
- Global Translation Dual Route V2；
- Translation Progress V1 CSS/JS。

并由 Global Translation、R6 first-paint、sitewide remediation 三条 CI 门禁共同验证，不允许退回单页 CSS 补丁或旧导航版本。
