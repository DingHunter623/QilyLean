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
  'id="hint-message"','qilyDdzSlowLoadRevealV127',
  'html:not(.ddz-ready) .game-shell{visibility:visible!important;opacity:1!important}'
].forEach(marker=>assert(ddz.includes(marker),'斗地主公开入口契约缺失：'+marker));

const theme=read('tools/pure-ddz/game/js/card-theme.js');
assert(!theme.includes('C919'),'斗地主牌面代码不得出现 C919');
assert(theme.includes('qilylean-aircraft-hero-latest-q98.webp'),'小王未引用官网首页首图飞机模型');
assert(theme.includes("16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT}"),'小王必须为官网首图飞机模型');
assert(theme.includes("17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}"),'大王必须为本人图像');
assert(!theme.includes('qily-joker-aircraft')&&!theme.includes('qily-mini-joker-aircraft'),'小王不得叠加第二层飞机图');

const contactRoute=read('site-contact-route-v1.js');
assert(contactRoute.includes('__qilySiteShellRecoveryV10'),'Site Shell Recovery V10 missing');
assert(contactRoute.includes('.topbar .top-actions :is(#audio-toggle,#help-open,#settings-open)'),'声音/玩法/设置深底白字规则缺失');
assert(contactRoute.includes('color:#fff!important;-webkit-text-fill-color:#fff!important'),'声音/玩法/设置未锁定高对比白字');
assert(contactRoute.includes('.table-wrap .me-player{left:50%!important'),'本人牌区未锁定桌面中轴');
assert(contactRoute.includes('width:min(1180px,calc(100% - 64px))!important'),'本人牌区宽度未覆盖17/20张牌安全区');
assert(contactRoute.includes('justify-content:safe center!important'),'本人手牌未设置安全居中');
assert(contactRoute.includes('#floatDock.qily-float-dock,#floatDock.qily-floating-dock{display:flex!important'),'全站悬浮模块显示恢复规则缺失');
assert(contactRoute.includes('disconnectRetiredDockObserver'),'旧删除观察器清理缺失');
assert(!contactRoute.includes('installRetirementObserver'),'全站悬浮模块不得再被删除观察器接管');

const dockRuntime=read('site-dock-share-runtime-v1.js');
assert(dockRuntime.includes('__qilyFloatingDockUnifiedV2'),'全站悬浮模块统一运行时V2缺失');
assert(dockRuntime.includes("ORDER=['home','top','back','search','current','contact']"),'六按钮顺序契约缺失');
assert(dockRuntime.includes('qilyDockSemanticUnifiedV2'),'顶部/上一层符号公共样式缺失');
assert(dockRuntime.includes("normalizeSemanticButton(controls.top,'top',LABELS.top)"),'“顶部”统一符号缺失');
assert(dockRuntime.includes("normalizeSemanticButton(controls.back,'back',LABELS.back)"),'“上一层”统一符号缺失');
assert(dockRuntime.includes("w.scrollTo({top:0,left:0,behavior:'smooth'})"),'顶部按钮功能兜底缺失');
assert(!dockRuntime.includes('function removeDock'),'旧悬浮模块删除逻辑不得返回');

const consistency=read('site-ui-consistency-v1.js');
assert(consistency.includes('qily-dock-semantic-icon'),'全站公共UI语义符号契约缺失');
assert(consistency.includes("normalizeDockButton(top,'top','顶部')"),'全站顶部符号归一缺失');
assert(consistency.includes("normalizeDockButton(back,'back','上一层')"),'全站上一层符号归一缺失');

const qilyTheme=read('tools/pure-ddz/game/js/qilylean-theme.js');
['QilyLeanDDZElderV123','王炸'].forEach(marker=>assert(qilyTheme.includes(marker),'斗地主播报契约缺失：'+marker));
const visual=read('tools/pure-ddz/game/js/visual-v120.js');
['IS_WECHAT_WEBVIEW','IS_MOBILE_DEVICE',"screen.orientation.lock('landscape')"].forEach(marker=>assert(visual.includes(marker),'斗地主手机横屏契约缺失：'+marker));
const game=read('tools/pure-ddz/game/js/game.js');
assert(!game.includes("serviceWorker?.register('./sw.js')"),'斗地主不得请求不存在的 Service Worker');
assert(game.includes("const VERSION = '1.2.4'"),'斗地主运行时版本不是1.2.4');

process.stdout.write('PASS: DDZ screenshot closure validated; functional six-action floating Dock retained with unified top/back semantic symbols.\n');
