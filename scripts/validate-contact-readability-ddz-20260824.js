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
assert(contactRoute.includes('__qilySiteShellRecoveryV9'),'Site Shell Recovery V9 missing');
assert(contactRoute.includes('.topbar .top-actions :is(#audio-toggle,#help-open,#settings-open)'),'声音/玩法/设置深底白字规则缺失');
assert(contactRoute.includes('color:#fff!important;-webkit-text-fill-color:#fff!important'),'声音/玩法/设置未锁定高对比白字');
assert(contactRoute.includes('.table-wrap .me-player{left:50%!important'),'本人牌区未锁定桌面中轴');
assert(contactRoute.includes('width:min(1180px,calc(100% - 64px))!important'),'本人牌区宽度未覆盖17/20张牌安全区');
assert(contactRoute.includes('justify-content:safe center!important'),'本人手牌未设置安全居中');
assert(contactRoute.includes("'#floatDock,.qily-float-dock,.qily-floating-dock{display:none!important"),'浮动模块零闪烁删除规则缺失');
assert(contactRoute.includes('installRetirementObserver'),'旧脚本重新生成浮动模块的防回退缺失');
assert(!contactRoute.includes('function ensureDock'),'已废弃浮动模块创建器重新出现');

const dockRetirement=read('site-dock-share-runtime-v1.js');
assert(dockRetirement.includes('__qilyFloatingDockRetiredV1'),'浮动模块删除运行时缺失');
assert(dockRetirement.includes("querySelectorAll('#floatDock,.qily-float-dock,.qily-floating-dock')"),'浮动模块DOM删除契约缺失');

const qilyTheme=read('tools/pure-ddz/game/js/qilylean-theme.js');
['QilyLeanDDZElderV123','王炸'].forEach(marker=>assert(qilyTheme.includes(marker),'斗地主播报契约缺失：'+marker));
const visual=read('tools/pure-ddz/game/js/visual-v120.js');
['IS_WECHAT_WEBVIEW','IS_MOBILE_DEVICE',"screen.orientation.lock('landscape')"].forEach(marker=>assert(visual.includes(marker),'斗地主手机横屏契约缺失：'+marker));
const game=read('tools/pure-ddz/game/js/game.js');
assert(!game.includes("serviceWorker?.register('./sw.js')"),'斗地主不得请求不存在的 Service Worker');
assert(game.includes("const VERSION = '1.2.4'"),'斗地主运行时版本不是1.2.4');

process.stdout.write('PASS: DDZ screenshot closure validated: top controls white, hand centered, floating Dock retired, Joker contract intact.\n');
