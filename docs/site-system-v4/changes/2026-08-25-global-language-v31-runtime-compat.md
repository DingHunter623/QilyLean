# Global Language V3.1｜运行时多语言兼容闭环

日期：2026-08-25

## 问题

Global Language V3 已可将普通网页文本翻译为 English，但部分全站运行时仍承担“中文标签自愈”职责。典型冲突：

- `site-navigation.js` 持续把 `/lean-production/` 标签恢复为“精益生产”；
- `site-navigation.js` 持续把 `/links/` 标签恢复为“资源协同”；
- Dock 顺序/合作页 Dock/父级导航运行时可能重新写入“首页、回顶部、回上一层、本站搜索、分享当前页、交流”等中文标签。

结果是翻译器已经完成英文转换后，治理脚本又把局部 DOM 拉回中文。

## 根因

两个长期规则缺少语言状态边界：

1. 中文静态 HTML 是权威原始数据源；
2. 浏览器允许以 English / 其他语言作为展示层。

原自愈脚本只实现了第 1 条，没有判断当前 `data-qily-language`，因此把“源数据校正”错误扩展到了“展示层校正”。

## 受控整改

### 1. Global Language V3.1

- 保持中文静态 HTML 为唯一权威源；默认展示 English 不变；
- MutationObserver 对 `characterData`、可翻译属性和新增节点持续监听；
- 已被追踪的文本节点再次被其他脚本改写时，也重新进入翻译队列；
- 文本/属性应用改为幂等写入，仅在目标值不同的时候修改 DOM，避免翻译观察器自激循环；
- 发布 `qily:language-change` 事件，供全站公共运行时感知展示语言；
- 扩充导航和 Dock 高频英文种子词典。

### 2. 全站自愈脚本语言感知

以下公共运行时只允许在 `zh-CN` 模式强制中文标签：

- `site-navigation.js`
- `site-ui-consistency-v1.js`
- `site-parent-navigation-v3.js`
- `site-dock-share-runtime-v1.js`
- `site-core-service-dock-closure-v1.js`

English / 其他语言模式下，只维持路由、顺序、当前态、Dock 功能、父级关系等结构语义，不再改写已经翻译的可见文字。

### 3. 全站缓存与物化

`scripts/materialize-global-language-v3.js` 统一刷新上述公共运行时的版本参数，并继续把 Global Language V3.1 直连脚本物化到所有受 Git 跟踪的 HTML，避免旧缓存继续执行中文回写逻辑。

### 4. 防回退

新增：

- `scripts/validate-global-language-runtime-compat-v1.js`
- `.github/workflows/validate-global-language-runtime-compat.yml`

用于锁定：V3.1 字符文本回写修复、导航语言门、Dock 语言门、父级导航语言门以及全站缓存版本。

## 长期规则

> 中文是内容与业务事实的权威原始数据源；语言切换后的 DOM 是展示层。所有自愈、Poka-yoke、导航治理、Dock 治理、动态模块治理在修改可见文字或可翻译属性前，必须先判断当前展示语言。除 `zh-CN` 权威源模式外，不得强制恢复中文标签。

该规则不改变 R6 的 static-first、中文权威源、公共组件优先和防回退原则，而是补足多语言展示层与既有运行时治理之间的兼容边界。
