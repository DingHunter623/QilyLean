# Global Language V3.1｜运行时多语言兼容闭环

日期：2026-08-25

## 问题
Global Language V3/V3.1 已可将普通网页文本翻译为 English，但部分全站运行时仍承担“中文标签自愈”职责。典型冲突包括：`site-navigation.js` 持续把 `/lean-production/` 标签恢复为“精益生产”、把 `/links/` 标签恢复为“资源协同”；Dock 顺序/合作页 Dock/父级导航运行时也可能重新写入“首页、回顶部、回上一层、本站搜索、分享当前页、交流”等中文标签。

## 根因
中文静态 HTML 是权威原始数据源，但语言切换后的 DOM 是展示层。旧自愈脚本没有判断 `data-qily-language`，把“源数据校正”错误扩展为“展示层中文强制校正”，因此翻译结果被覆盖。

## 受控整改
- Global Language V3.1：对已追踪文本节点的 `characterData` 再次变化继续进入翻译队列；文本/属性采用幂等写入；发布 `qily:language-change`。
- `site-navigation.js`：仅 `zh-CN` 模式可强制“精益生产/资源协同”等中文源标签。
- `site-ui-consistency-v1.js`、`site-parent-navigation-v3.js`、`site-dock-share-runtime-v1.js`、`site-core-service-dock-closure-v1.js`：仅 `zh-CN` 模式允许中文标签自愈；其他语言只维护结构、顺序、路由、当前态与功能。
- 保留受保护导航基线 `atomic-first-paint-v38`，新增语言兼容能力不得破坏既有 R6/V4 防回退契约。
- `scripts/materialize-global-language-v3.js` 统一刷新所有翻译敏感公共运行时缓存版本并直连 V3.1。
- 新增 `scripts/validate-global-language-runtime-compat-v1.js` 与专用 PR CI 防回退。

## 长期规则
> 中文是内容与业务事实的权威原始数据源；语言切换后的 DOM 是展示层。所有自愈、Poka-yoke、导航治理、Dock 治理、动态模块治理在修改可见文字或可翻译属性前，必须先判断当前展示语言。除 `zh-CN` 权威源模式外，不得强制恢复中文标签。

该规则补足多语言展示层与既有运行时治理之间的兼容边界，不改变 R6 的 static-first、中文权威源、公共组件优先和防回退原则。
