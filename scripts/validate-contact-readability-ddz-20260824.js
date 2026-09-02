#!/usr/bin/env node
'use strict';

/* Contact / readability / DDZ compatibility gate | V34 | 2026-09-02 */
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};

/* DDZ is now an ordinary QilyLean page. Its own files may govern only the game module, never the site shell/Dock. */
const ddz=read('tools/pure-ddz/index.html');
["const version='20260902-ddz-integrated-v151'","loadStyle('css/card-comfort-v122.css')","loadStyle('css/ddz-site-page-v140.css')",'id="welcome-start"','/site-navigation.js?','/site-dock-share-runtime-v1.js?','<p id="hint-message" class="hint-message" aria-hidden="true"></p>'].forEach(x=>assert(ddz.includes(x),'斗地主公开入口契约缺失：'+x));
['qilyPureDdzR8ClosureV128','ddz-site-shell-v140.js','js/qilylean-theme.js','js/elder-assist-v140.js','<footer class="site-footer">','class="ddz-page-note"'].forEach(x=>assert(!ddz.includes(x),'斗地主退役页面契约重新出现：'+x));
const ddzLayout=read('tools/pure-ddz/game/css/ddz-site-page-v140.css');
assert(ddzLayout.includes('--ddz-game-max:var(--qily-content-axis,1560px)'),'斗地主未复用官网内容轴');
assert(ddzLayout.includes('height:clamp(560px,calc(100vh - 260px),620px)'),'斗地主纵向工作区未按 V151 收口');
assert(ddzLayout.includes('overflow-x:auto!important'),'本人手牌缺少溢出横向滚动');
assert(ddzLayout.includes('justify-content:safe center!important'),'本人手牌未按“能居中则居中、溢出则安全滚动”策略处理');
assert(ddzLayout.includes('#hint-message.hint-message{display:none!important}'),'运维/提示固定文字未退出公开视觉');
assert(!ddzLayout.includes('#floatDock'),'斗地主局部 CSS 不得拥有全站 Dock');
const game=read('tools/pure-ddz/game/js/game.js');
assert(game.includes("const VERSION = '1.5.1'")&&game.includes("$('welcome-start').addEventListener('click',startRound)"),'斗地主运行/开始按钮契约漂移');
assert(game.includes('function describePlay(play)')&&game.includes('function speakAsync'),'斗地主详细播报契约缺失');
assert(game.includes("afterNarration(narration,()=>{state.current=nextPlayer(player);render();scheduleTurn();},1100)"),'斗地主未等待上家播报完成再移交回合');
assert(game.includes("pass(0,{auto:true})"),'启力提示无牌时自动要不起契约缺失');
assert(game.includes("utterance.rate=.82"),'适老播报速度未固化');

const dock=read('site-dock-share-runtime-v1.js');assert(dock.includes('Floating Dock Authoritative Runtime V5.5'),'Dock V5.5 缺失');assert(dock.includes('__qilyFloatingDockUnifiedV55'),'Dock V5.5 防重复装载标记缺失');assert(dock.includes("ORDER=['home','top','back','search','current','contact']"),'六按钮顺序漂移');assert(dock.includes('setOwnedLabel'),'Dock 单一文字所有权缺失');assert(dock.includes('--qily-dock-size:52px')&&dock.includes('--qily-dock-size:50px'),'移动端 Dock 源几何缺失');assert(dock.includes('function openContactPage()'),'联系我们完整页面路由缺失');assert(dock.includes("w.open(url,'_blank','noopener,noreferrer')"),'联系我们未明确新窗口/新标签打开');assert(dock.includes("if(action==='contact'){openContactPage();return;}"),'Dock 联系我们仍未绑定完整联系页');assert(dock.includes('function isExcluded(){return false;}'),'普通公开页面不得再排除斗地主 Dock');assert(!dock.includes("mask.classList.add('show')"),'Dock 联系我们不得再打开二维码模态框');assert(!/new\s+MutationObserver\s*\(/.test(dock),'Dock 禁止 MutationObserver 持续重建');
const contact=read('site-contact-route-v1.js');assert(contact.includes('Contact Route V13.4'),'Contact Route V13.4 缺失');assert(contact.includes('__qilyFloatingDockUnifiedV54'),'Contact recovery 向后兼容标记缺失');assert(contact.includes('20260829-authority-v54'),'Contact recovery 兼容入口缺失');
const contactMat=read('scripts/materialize-contact-route-v6.js');assert(contactMat.includes('global shell ownership untouched'),'Contact 物化器单一职责标记缺失');assert(!contactMat.includes('const UI='),'Contact 物化器不得重写全站 UI shell');

const semanticsJs=read('site-interaction-semantics-v1.js'),semanticsCss=read('site-interaction-semantics-v1.css');assert(semanticsJs.includes('Interaction Semantics Runtime V1.7')&&semanticsJs.includes('__qilyInteractionSemanticsV17'),'交互语义 V1.7 缺失');for(const token of ['.brief-action-strip>span','.tag-row>li','qily-primary-nav-scroll-rail',"rail.type='range'",'nav.scrollLeft=startScroll-dx'])assert(semanticsJs.includes(token),'交互语义运行时缺失：'+token);assert(!semanticsJs.includes('qily-primary-nav-scroll-thumb'),'旧合成滑块重新出现');assert(semanticsCss.includes('Interaction Semantics V1.4'),'交互语义 CSS 视觉基线缺失');for(const token of ['.brief-action-strip>span','.tag-row>li','.qily-primary-nav-scroll-rail'])assert(semanticsCss.includes(token),'视觉契约缺失：'+token);
const header=read('site-header-axis-v1.css');assert(header.includes('overflow-x:auto!important')&&header.includes('overflow-x:scroll!important'),'一级导航横向滚动能力缺失');assert(header.includes('white-space:nowrap!important'),'一级导航文字完整显示契约缺失');

const safeTranslation=read('site-translation-safe-runtime-v1.js');assert(safeTranslation.includes('Google Translate Header Runtime V1.4'),'Google 翻译 V1.4 缺失');assert(safeTranslation.includes('__qilyGoogleTranslateElementInitialized'),'Google 翻译单次初始化保护缺失');assert(safeTranslation.includes("addOption(select,'zh-CN','中文简体')")&&safeTranslation.includes("addOption(select,'zh-TW','中文繁体')")&&safeTranslation.includes("addOption(select,'en','English')"),'公开主语言集合缺失');assert(safeTranslation.includes("addOption(select,MORE_VALUE,'其他')"),'Google 更多语言入口缺失');assert(safeTranslation.includes('data-qily-header-utility'),'翻译器未作为 Header Utility 独立存在');assert(safeTranslation.includes('translate.google.com/translate_a/element.js'),'Google 官方脚本缺失');assert(!/new\s+MutationObserver\s*\(/.test(safeTranslation),'翻译器禁止 MutationObserver');
const components=read('site-visual-components-v1.css');assert(components.includes('input.qily-primary-nav-scroll-rail[type="range"]'),'原生 range 滑轨样式缺失');assert(components.includes('::-webkit-slider-thumb'),'Safari/WebKit 滑轨手柄样式缺失');assert(components.includes('data-qily-header-utility="translation"'),'翻译器 Header Utility 布局缺失');assert(components.includes('-webkit-text-fill-color:#fff!important'),'A/B/C/D 字母白色高对比缺失');

const materializer=read('scripts/materialize-global-language-v3.js');assert(materializer.includes("BASELINE_VERSION='20260831-google-translate-single-runtime-v32'"),'V32 全站物化基线缺失');assert(materializer.includes("VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260830-visual-system-v2-r7'"),'Visual System V2 r7 未进入全站物化');assert(materializer.includes('20260902-authority-v55'),'Dock V5.5 未进入全站物化');assert(materializer.includes('20260829-dock-functional-public-v134'),'Contact V13.4 未进入全站物化');assert(materializer.includes('20260831-r11-semantics-v17-native-range'),'Semantics V1.7 未进入全站物化');assert(materializer.includes('20260901-google-translate-single-runtime-v16'),'Google 翻译 V1.4 未进入全站物化');assert(materializer.includes('20260831-redline-no-translation-v23'),'公共红线运行时仍持有翻译职责');assert(materializer.includes('20260831-unified-components-v29-native-range'),'Unified Visual Components 未进入全站物化');assert(materializer.includes('20260831-project-grade-readability-v3'),'项目等级高可读性 V3 未进入全站物化');assert(!materializer.includes('DDZ_CLOSURE_CSS'),'退役 DDZ 专属闭环不得再进入全站物化');assert(!materializer.includes('const PUBLIC_UI_JS='),'退役翻译选择器不得作为主动注入常量');
const visual=read('site-visual-system-v2.css');assert(visual.includes('QilyLean Visual System V2'),'Visual System V2 样式源缺失');assert(visual.includes('@media (max-width:767px)'),'Mobile Visual System V2 构图缺失');assert(visual.includes('width:52px!important')&&visual.includes('width:50px!important'),'Mobile Dock 安全文字几何缺失');assert(visual.includes('Only real navigation cards receive elevation feedback'),'静态卡片视觉反馈治理缺失');
const integrity=read('site-header-project-integrity-v2.css');assert(integrity.includes('Header + Project Integrity V3'),'项目等级 V3 样式源缺失');assert(integrity.includes('font-size:26px!important')&&integrity.includes('font-size:29px!important'),'A/B/C/D 字母可读性字号下限缺失');
const matrix=JSON.parse(read('visual-regression-matrix.json'));assert(matrix.scope==='visual-only'&&matrix.viewports.length>=10,'三端视觉回归矩阵缺失');
console.log('PASS: V34 behavior owners remain stable: native-range mobile navigation, Google Translate V1.4 header utility, readable A/B/C/D project grades, Contact/Dock single responsibility and DDZ V151 elder-paced site integration.');
