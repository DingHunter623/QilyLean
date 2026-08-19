# QilyLean 全站悬浮功能区与箭头几何 V4 验收约束

日期：2026-08-19

## 悬浮功能区

- 全站统一动作顺序：首页 → 回顶部 → 本站搜索 → 返回上一层 → 分享当前页 → 分享官网 → 交流。
- 桌面端按钮统一 62×62px；移动端统一 58×58px。
- 所有按钮统一圆形、深青底、金色边框、白字；不得存在“分享官网”单独放大或单页特例。
- hover / focus / active 反馈统一；页面局部样式不得覆盖全站标准。

## 箭头几何

- 简单 marker 箭头统一转换为用户坐标的一体化填充 path，禁止 markerUnits 与 strokeWidth 相乘造成箭头头部失控放大。
- “直线 + 三角形”分体箭头统一转换为一体化填充 path；转换后原 line / polygon 删除，不允许轴线穿过三角箭头尖端。
- 箭头与目标框保持明确安全间距，不得压框、穿框或出现尖端凸线。
- 2026-08-14《改革自上而下，改善自下而上》场景简图02：上下箭头均缩小并对称；上下框间距均按 12px 源端安全距 + 12px 目标端安全距控制，中心轴均为 x=600。

## 防回退

R6 production guard 必须同时验证：

- `site-floating-dock-standard-v1.css?v=20260819-sitewide-dock-v1`
- `site-visual-geometry-v1.js?v=20260819-arrow-geometry-v4`
- `unifiedOnePieceArrows: true`
- `separateTriangleLineEliminated: true`
- `dockUniformVisualContract: true`
- 不得重新出现 `JOIN_OVERLAP` 分体拼接逻辑。
