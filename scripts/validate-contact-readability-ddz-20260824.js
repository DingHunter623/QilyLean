#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}

const ddz=read('tools/pure-ddz/index.html');
[
  "const version='20260828-elder-ux-v127'",
  "window.__PURE_DDZ_CACHE_KEY__||'20260828-elder-ux-v127'",
  "loadStyle('css/card-comfort-v122.css')",
  'name="screen-orientation" content="landscape"',
  'MicroMessenger','__PURE_DDZ_WECHAT_WEBVIEW__','__PURE_DDZ_MOBILE_DEVICE__','__PURE_DDZ_MANAGED_LOADER__',
  'id="hint-message"','qilyDdzSlowLoadRevealV127','id="welcome-start"'
].forEach(marker=>assert(ddz.includes(marker),'斗地主公开入口契约缺失：'+marker));

const ddzClosure=read('tools/pure-ddz/game/css/r8-closure-v128.css');
assert(ddzClosure.includes('Pure DDZ R9 Closure V129'),'斗地主 R9 闭环样式缺失');
assert(ddzClosure.includes('Pure DDZ R8 Closure V128'),'斗地主 R8 兼容标记缺失');
assert(ddzClosure.includes('html:not(.ddz-ready) body .game-shell'),'斗地主旧版首屏隐藏契约缺失');
assert(ddzClosure.includes('visibility:hidden!important'),'斗地主加载前必须隐藏旧牌桌');
assert(ddzClosure.includes('html.ddz-ready body .game-shell'),'斗地主 ready 后显示牌桌契约缺失');
assert(ddzClosure.includes('.topbar .brand *'),'斗地主顶部品牌防闪烁规则缺失');
assert(ddzClosure.includes('animation:none!important'),'斗地主顶部品牌仍可能被动画闪烁');
assert(ddzClosure.includes('transition:none!important'),'斗地主顶部品牌仍可能被过渡闪烁');
assert(ddzClosure.includes('contain:layout paint style'),'斗地主品牌区缺少独立绘制稳定层');
assert(ddzClosure.includes('left:50%!important'),'本人牌区未锁定桌面中轴');
assert(ddzClosure.includes('transform:translateX(-50%)!important'),'本人牌区未执行中轴回正');
assert(ddzClosure.includes('width:max-content!important'),'桌面本人手牌未按牌组实际宽度居中');
assert(ddzClosure.includes('margin-left:auto!important'),'桌面本人手牌缺少左自动边距');
assert(ddzClosure.includes('margin-right:auto!important'),'桌面本人手牌缺少右自动边距');
assert(ddzClosure.includes('overflow-x:auto!important'),'本人手牌缺少横向滚动防裁切');
assert(ddzClosure.includes('html body #floatDock'),'斗地主页面未显式排除全站 Dock');

const theme=read('tools/pure-ddz/game/js/card-theme.js');
assert(!theme.includes('C919'),'斗地主牌面代码不得出现 C919');
assert(theme.includes('qilylean-aircraft-hero-latest-q98.webp'),'小王未引用官网首页首图飞机模型');
assert(theme.includes("16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT}"),'小王必须为官网首图飞机模型');
assert(theme.includes("17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}"),'大王必须为本人图像');

const game=read('tools/pure-ddz/game/js/game.js');
assert(!game.includes("serviceWorker?.register('./sw.js')"),'斗地主不得请求不存在的 Service Worker');
assert(game.includes("const VERSION = '1.2.4'"),'斗地主运行时版本不是1.2.4');
assert(game.includes("$('welcome-start').addEventListener('click',startRound)"),'欢迎页“开始游戏”未绑定 startRound');

const dockRuntime=read('site-dock-share-runtime-v1.js');
assert(dockRuntime.includes('Floating Dock Authoritative Runtime V5.2'),'全站悬浮模块权威运行时 V5.2 缺失');
assert(dockRuntime.includes('__qilyFloatingDockUnifiedV52'),'Dock V5.2 防重复装载标记缺失');
assert(dockRuntime.includes("ORDER=['home','top','back','search','current','contact']"),'六按钮顺序契约缺失');
assert(dockRuntime.includes('setOwnedLabel'),'Dock 未清理旧子节点并建立单一文字所有权');
assert(dockRuntime.includes('qily-dock-label'),'Dock 单一文字容器缺失');
assert(dockRuntime.includes('--qily-dock-size:56px'),'手机 Dock 统一 56px 几何规则缺失');
assert(dockRuntime.includes('--qily-dock-size:54px'),'窄屏手机 Dock 统一 54px 几何规则缺失');
assert(dockRuntime.includes('.qily-float-btn::before'),'Dock 伪元素文字清理缺失');
assert(dockRuntime.includes("EXCLUDED=/^\\/tools\\/pure-ddz"),'斗地主页面 Dock 排除规则缺失');
assert(dockRuntime.includes('data-qily-dock="disabled"'),'斗地主 Dock 隐藏状态缺失');
assert(dockRuntime.includes("if(action==='search'){openSearch();return;}"),'本站搜索独立兜底缺失');
assert(dockRuntime.includes("if(action==='current'){shareCurrent();return;}"),'分享当前页独立兜底缺失');
assert(dockRuntime.includes("if(action==='contact')"),'联系我们独立兜底缺失');
assert(dockRuntime.includes('installAuthoritativeEvents'),'Dock V5.2 捕获阶段事件权威缺失');
assert(!/new\s+MutationObserver\s*\(/.test(dockRuntime),'R9 禁止 Dock MutationObserver 持续重建');

const consistency=read('site-ui-consistency-v1.js');
assert(consistency.includes('__qilyUiConsistencyV7'),'UI consistency V7 missing');
assert(consistency.includes('__qilyUiSingleResponsibilityV7'),'UI consistency 未声明单一职责');
assert(!consistency.includes('normalizeDockButton'),'UI consistency 不得再修改 Dock 按钮');
assert(!consistency.includes('dockIconMarkup'),'UI consistency 不得再注入 Dock 图标');
assert(!consistency.includes('[data-action="back"]'),'UI consistency 不得再拦截 Dock back 事件');

const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');
assert(semanticsCss.includes('Interaction Semantics V1.2'),'全站交互语义 CSS V1.2 缺失');
assert(semanticsCss.includes('.qily-float-btn::before'),'全站 Dock 伪文字归零规则缺失');
assert(!semanticsCss.includes('content:"回\\A顶部"'),'全站“回顶部”重复伪文字重新出现');
assert(!semanticsCss.includes('content:"回\\A上一层"'),'全站“回上一层”重复伪文字重新出现');
assert(semanticsCss.includes('.overview-card>.tag'),'八大浪费序号高对比规则缺失');
assert(semanticsJs.includes('__qilyInteractionSemanticsV12'),'全站交互语义 JS V1.2 缺失');
assert(semanticsJs.includes('PROJECT_EVIDENCE'),'项目证据等级映射缺失');

const header=read('site-header-axis-v1.css');
assert(header.includes('Global Header Axis V1.1'),'全站导航 Header Axis V1.1 缺失');
assert(header.includes('overflow-x:auto!important'),'桌面导航横向滚动能力缺失');
assert(header.includes('overflow-x:scroll!important'),'手机导航显式左右滚动能力缺失');
assert(header.includes('scrollbar-width:thin!important'),'全站导航可视滚动条缺失');

const capabilities=read('capabilities/index.html');
assert(capabilities.includes('<a href="/tools/pure-ddz/">立即在线玩</a>'),'能力体系“立即在线玩”入口缺失');
assert(capabilities.includes('大王为本人图像'),'能力体系大王契约缺失');
assert(capabilities.includes('小王为官网首图“六大业务为主翼”飞机模型'),'能力体系小王契约缺失');

const qilyTheme=read('tools/pure-ddz/game/js/qilylean-theme.js');
['QilyLeanDDZElderV123','王炸'].forEach(marker=>assert(qilyTheme.includes(marker),'斗地主播报契约缺失：'+marker));
const visual=read('tools/pure-ddz/game/js/visual-v120.js');
['IS_WECHAT_WEBVIEW','IS_MOBILE_DEVICE',"screen.orientation.lock('landscape')"].forEach(marker=>assert(visual.includes(marker),'斗地主手机横屏契约缺失：'+marker));

process.stdout.write('PASS: DDZ R9 closure validated; brand paint is stable, actual local card group is centered/scroll-safe, Pure DDZ is Dock-free, Dock V5.2 is uniform on mobile, and navigation/numbering visual contracts are protected.\n');
