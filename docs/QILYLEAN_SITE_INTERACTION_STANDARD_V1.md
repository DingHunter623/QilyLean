# QilyLean 全站交互反馈永久规范 V1.0

生效日期：2026-08-17

本规范为 QilyLean 全站永久设计系统规则，不属于单页视觉补丁。任何新页面、新模块、新按钮和后续重构均不得绕开。

## 1. 强制状态

所有可点击控件必须具备：

- default：默认态；
- hover：鼠标经过必须产生明显视觉反馈；
- active / pressed：按下时必须产生压下反馈；
- focus-visible：键盘焦点必须清晰可见；
- disabled：禁用态必须与可操作态明显区分，且不得产生伪交互。

## 2. 统一视觉语言

- Hover：背景／边框／亮度或阴影变化，并允许约 1–3px 轻微上浮；
- Active：回落并轻微缩放，形成明确按压确认；
- Focus-visible：统一高辨识度焦点环；
- 动画速度：约 180–220ms；
- 禁止通过改变元素宽高、边框厚度或文字字号制造反馈，避免页面抖动；
- 移动端不得依赖 hover，必须保留 active / pressed 反馈；
- `prefers-reduced-motion` 时取消位移动画。

## 3. 永久覆盖对象

包括但不限于：

- 顶部八大一级导航；
- 首页 Hero CTA；
- `qily-home-actions`、`qily-section-actions`、`qily-ia-actions`；
- `module-actions`、`article-actions`、`hero-actions`、`form-actions`；
- `qily-ia-button`、`resource-action`、`service-contract-link`；
- 项目合作联系方式按钮；
- 全站右侧 `floatDock`；
- 可点击项目卡片、知识卡片、资源卡片、信任卡片；
- 后续新增的同类控件。

## 4. 当前页导航规则

当前页面导航项保持深青底＋金色边界的最高辨识度。非当前项 hover 不得模拟当前态；当前项 hover 只允许亮度、阴影或轻微位移增强，不得丢失当前页标识。

## 5. 禁止项

- 禁止只有主按钮有反馈、次按钮无反馈；
- 禁止仅改变鼠标指针而视觉完全不变；
- 禁止使用 `outline:none` 后不补 `focus-visible`；
- 禁止局部页面重新覆盖公共交互规则导致全站不一致；
- 禁止新增第二套同职责的按钮交互系统；
- 禁止后续生成脚本或 CI 把旧交互版本重新写回。

## 6. 唯一公共实现源

公共交互样式：`/site-interaction-continuity-v1.css`

当前缓存版本：`20260817-continuity-v2`

全站物化与防回退脚本：`scripts/enforce-sitewide-interaction-feedback.js`

CI 工作流：`.github/workflows/enforce-sitewide-interaction-feedback.yml`

所有公开页面必须且只能加载一次上述公共样式。CI 对缺失、重复、旧版本回退进行自动纠正和校验。

## 7. 验收判定

用户将鼠标移到任何可点击控件上，应在约 0.2 秒内明确感知“这里可以点击”；按下时应明确感知“操作已经触发”；键盘 Tab 导航必须明确显示当前焦点。若同类控件在不同页面交互行为不一致，视为未通过验收。
