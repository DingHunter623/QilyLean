#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};

const ddz=read('tools/pure-ddz/index.html');
["const version='20260829-ddz-mobile-ready-v132'","loadStyle('css/card-comfort-v122.css')",'id="welcome-start"'].forEach(x=>assert(ddz.includes(x),'斗地主公开入口契约缺失：'+x));

const closure=read('tools/pure-ddz/game/css/r8-closure-v128.css');
assert(closure.includes('Pure DDZ R12 Closure V132'),'斗地主 R12 闭环缺失');
assert(closure.includes('Pure DDZ R9 Closure V129'),'斗地主 R9 兼容标记缺失');
assert(closure.includes('left:20px!important')&&closure.includes('right:20px!important')&&closure.includes('transform:none!important'),'本人牌区未使用完整桌面中轴');
assert(closure.includes('width:100%!important'),'本人手牌未使用完整玩家区作为居中轴');
assert(closure.includes('justify-content:safe center!important'),'本人手牌未按“能居中则居中、溢出则安全滚动”策略处理');
assert(closure.includes('overflow-x:auto!important'),'本人手牌缺少溢出横向滚动');
assert(!closure.includes('width:max-content!important'),'旧 max-content 左偏策略重新出现');
assert(closure.includes('.topbar .brand *')&&closure.includes('animation:none!important'),'斗地主品牌防闪烁契约缺失');
assert(closure.includes('html body #floatDock'),'斗地主 Dock 排除缺失');

const dock=read('site-dock-share-runtime-v1.js');
assert(dock.includes('Floating Dock Authoritative Runtime V5.4'),'Dock V5.4 缺失');
assert(dock.includes('__qilyFloatingDockUnifiedV54'),'Dock V5.4 防重复装载标记缺失');
assert(dock.includes("ORDER=['home','top','back','search','current','contact']"),'六按钮顺序漂移');
assert(dock.includes('setOwnedLabel'),'Dock 单一文字所有权缺失');
assert(dock.includes('--qily-dock-size:52px')&&dock.includes('--qily-dock-size:50px'),'移动端 Dock 源几何缺失');
assert(dock.includes('function openContactPage()'),'联系我们完整页面路由缺失');
assert(dock.includes("w.open(url,'_blank','noopener,noreferrer')"),'联系我们未明确新窗口/新标签打开');
assert(dock.includes("if(action==='contact'){openContactPage();return;}"),'Dock 联系我们仍未绑定完整联系页');
assert(!dock.includes("mask.classList.add('show')"),'Dock 联系我们不得再打开二维码模态框');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Dock 禁止 MutationObserver 持续重建');

const contact=read('site-contact-route-v1.js');
assert(contact.includes('Contact Route V13.4'),'Contact Route V13.4 缺失');
assert(contact.includes('__qilyFloatingDockUnifiedV54'),'Contact recovery 未切换 Dock V5.4');
assert(contact.includes('20260829-authority-v54'),'Contact recovery 仍可能回写旧 Dock');

const semanticsJs=read('site-interaction-semantics-v1.js'),semanticsCss=read('site-interaction-semantics-v1.css');
assert(semanticsJs.includes('Interaction Semantics Runtime V1.4')&&semanticsJs.includes('__qilyInteractionSemanticsV14'),'交互语义 V1.4 缺失');
for(const token of ['.brief-action-strip>span','.tag-row>li','qily-primary-nav-scroll-rail','qily-primary-nav-scroll-thumb'])assert(semanticsJs.includes(token),'交互语义运行时缺失：'+token);
assert(semanticsCss.includes('Interaction Semantics V1.4'),'交互语义 CSS V1.4 缺失');
for(const token of ['.brief-action-strip>span','.tag-row>li','.qily-primary-nav-scroll-rail','.qily-primary-nav-scroll-thumb','cursor:ew-resize'])assert(semanticsCss.includes(token),'视觉契约缺失：'+token);

const header=read('site-header-axis-v1.css');
assert(header.includes('overflow-x:auto!important')&&header.includes('overflow-x:scroll!important'),'一级导航横向滚动能力缺失');
assert(header.includes('white-space:nowrap!important'),'一级导航文字完整显示契约缺失');

const materializer=read('scripts/materialize-global-language-v3.js');
assert(materializer.includes("BASELINE_VERSION='20260829-sitewide-visual-closure-v27'"),'Visual System V2 全站物化基线缺失');
assert(materializer.includes("VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260830-visual-system-v2-r7'"),'Visual System V2 r7 未进入全站物化');
assert(materializer.includes('20260829-authority-v54'),'Dock V5.4 未进入全站物化');
assert(materializer.includes('20260829-dock-functional-public-v134'),'Contact V13.4 未进入全站物化');
assert(materializer.includes('20260829-r11-semantics-v14'),'Semantics V1.4 未进入全站物化');
assert(materializer.includes('20260829-r12-v132'),'DDZ R12 未进入物化');
const visual=read('site-visual-system-v2.css');
assert(visual.includes('QilyLean Visual System V2'),'Visual System V2 样式源缺失');
assert(visual.includes('@media (max-width:767px)'),'Mobile Visual System V2 构图缺失');
assert(visual.includes('width:52px!important')&&visual.includes('width:50px!important'),'Mobile Dock 安全文字几何缺失');
assert(visual.includes('Only real navigation cards receive elevation feedback'),'静态卡片视觉反馈治理缺失');
const matrix=JSON.parse(read('visual-regression-matrix.json'));
assert(matrix.scope==='visual-only'&&matrix.viewports.length>=10,'三端视觉回归矩阵缺失');

const game=read('tools/pure-ddz/game/js/game.js');
assert(game.includes("const VERSION = '1.2.4'")&&game.includes("$('welcome-start').addEventListener('click',startRound)"),'斗地主运行/开始按钮契约漂移');
console.log('PASS: behavior owners remain stable while Visual System V2 owns final responsive presentation.');
