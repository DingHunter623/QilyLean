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
  'html:not(.ddz-ready) .game-shell{visibility:visible!important;opacity:1!important}',
  'id="welcome-start"'
].forEach(marker=>assert(ddz.includes(marker),'斗地主公开入口契约缺失：'+marker));

const theme=read('tools/pure-ddz/game/js/card-theme.js');
assert(!theme.includes('C919'),'斗地主牌面代码不得出现 C919');
assert(theme.includes('qilylean-aircraft-hero-latest-q98.webp'),'小王未引用官网首页首图飞机模型');
assert(theme.includes("16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT}"),'小王必须为官网首图飞机模型');
assert(theme.includes("17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}"),'大王必须为本人图像');
assert(!theme.includes('qily-joker-aircraft')&&!theme.includes('qily-mini-joker-aircraft'),'小王不得叠加第二层飞机图');

const game=read('tools/pure-ddz/game/js/game.js');
assert(!game.includes("serviceWorker?.register('./sw.js')"),'斗地主不得请求不存在的 Service Worker');
assert(game.includes("const VERSION = '1.2.4'"),'斗地主运行时版本不是1.2.4');
assert(game.includes("$('welcome-start').addEventListener('click',startRound)"),'欢迎页“开始游戏”未绑定 startRound');

const contactRoute=read('site-contact-route-v1.js');
assert(contactRoute.includes('__qilySiteShellRecoveryV13'),'Site Shell Recovery V13 missing');
assert(contactRoute.includes('.topbar .top-actions :is(#audio-toggle,#help-open,#settings-open)'),'声音/玩法/设置深底白字规则缺失');
assert(contactRoute.includes('color:#fff!important;-webkit-text-fill-color:#fff!important'),'声音/玩法/设置未锁定高对比白字');
assert(contactRoute.includes('__qilyFloatingDockUnifiedV5'),'Contact Route 未切换到 Dock V5');
assert(contactRoute.includes('/site-dock-share-runtime-v1.js?v=20260828-authority-v5'),'Dock V5 cache owner missing');
assert(!contactRoute.includes('removeLegacyContactModal'),'不得再删除正式联系面板 #wxMask');
assert(!contactRoute.includes('mask.remove()'),'公共恢复层不得删除正式联系面板');

const dockRuntime=read('site-dock-share-runtime-v1.js');
assert(dockRuntime.includes('Floating Dock Authoritative Runtime V5'),'全站悬浮模块权威运行时 V5 缺失');
assert(dockRuntime.includes("ORDER=['home','top','back','search','current','contact']"),'六按钮顺序契约缺失');
assert(dockRuntime.includes("LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'}"),'六按钮文字契约缺失');
assert(dockRuntime.includes("EXCLUDED=/^\\/tools\\/pure-ddz"),'斗地主页面 Dock 排除规则缺失');
assert(dockRuntime.includes('data-qily-dock="disabled"'),'斗地主 Dock 隐藏状态缺失');
assert(dockRuntime.includes('justify-content:safe center!important'),'本人手牌未设置安全居中');
assert(dockRuntime.includes('left:50%!important'),'本人牌区未锁定桌面中轴');
assert(dockRuntime.includes("if(action==='search'){openSearch();return;}"),'本站搜索独立兜底缺失');
assert(dockRuntime.includes("if(action==='current'){shareCurrent();return;}"),'分享当前页独立兜底缺失');
assert(dockRuntime.includes("if(action==='contact')"),'联系我们独立兜底缺失');
assert(!dockRuntime.includes('MutationObserver'),'R7 禁止 Dock MutationObserver 持续重建');

const consistency=read('site-ui-consistency-v1.js');
assert(consistency.includes('__qilyUiConsistencyV7'),'UI consistency V7 missing');
assert(consistency.includes('__qilyUiSingleResponsibilityV7'),'UI consistency 未声明单一职责');
assert(!consistency.includes('normalizeDockButton'),'UI consistency 不得再修改 Dock 按钮');
assert(!consistency.includes('dockIconMarkup'),'UI consistency 不得再注入 Dock 图标');
assert(!consistency.includes('[data-action="back"]'),'UI consistency 不得再拦截 Dock back 事件');

const capabilities=read('capabilities/index.html');
assert(capabilities.includes('<a href="/tools/pure-ddz/">立即在线玩</a>'),'能力体系“立即在线玩”入口缺失');
assert(capabilities.includes('大王为本人图像'),'能力体系大王契约缺失');
assert(capabilities.includes('小王为官网首图“六大业务为主翼”飞机模型'),'能力体系小王契约缺失');

const qilyTheme=read('tools/pure-ddz/game/js/qilylean-theme.js');
['QilyLeanDDZElderV123','王炸'].forEach(marker=>assert(qilyTheme.includes(marker),'斗地主播报契约缺失：'+marker));
const visual=read('tools/pure-ddz/game/js/visual-v120.js');
['IS_WECHAT_WEBVIEW','IS_MOBILE_DEVICE',"screen.orientation.lock('landscape')"].forEach(marker=>assert(visual.includes(marker),'斗地主手机横屏契约缺失：'+marker));

process.stdout.write('PASS: DDZ R7 closure validated; welcome start flow works, local hand is centered, Pure DDZ is Dock-free, and Dock V5 remains authoritative elsewhere.\n');
