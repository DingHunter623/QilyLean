#!/usr/bin/env node
'use strict';

/* Dock V5.8 footer-style contract gate | 2026-09-24
 * International quick actions retain all six functions while sharing the China-site
 * fixed-footer visual language: deep teal bar, gold rule/text and compact controls.
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
const visual=fs.readFileSync(path.join(root,'site-visual-system-v2.css'),'utf8');
const must=(token,label)=>{if(!source.includes(token))throw new Error(`Dock V5.8 footer-style: ${label} missing: ${token}`);};
const mustVisual=(token,label)=>{if(!visual.includes(token))throw new Error(`Dock V5.8 footer-style CSS: ${label} missing: ${token}`);};
const forbid=(token,label)=>{if(source.includes(token))throw new Error(`Dock V5.8 footer-style: ${label} forbidden: ${token}`);};

must('Floating Dock Authoritative Runtime V5.8','runtime version');
must('__qilyFloatingDockUnifiedV58','single-owner guard');
must('__qilyFloatingDockUnifiedV57','backward-compatibility guard');
must("ORDER=['top','previous','search','current']",'four-action order');
for(const label of ['回到顶部','上一网页','本站搜索','分享当前'])must(label,`approved label ${label}`);
must("MOBILE_LABELS={home:['首页'],top:['回到顶部'],back:['上一层级'],previous:['上一网页'],search:['本站搜索'],current:['分享当前'],contact:['联系我们']}",'single-line mobile labels');
must("if(action==='previous'){goPreviousPage();return;}",'previous-page action');
must('w.history.back()','browser-history previous-page behavior');

must('position:fixed!important','fixed footer navigation');
must('left:0!important;right:0!important','full-width footer anchoring');
must('bottom:0!important','viewport-bottom pin');
must('width:100%!important','full viewport width');
must('grid-template-columns:repeat(4,minmax(0,1fr))!important','desktop four-column modules');
must('border-top:3px solid #c8a25a!important','China-style gold top rule');
must('background:#0f4b5a!important','China-style deep teal footer');
must('overflow-x:visible!important','no horizontal scrolling');
must('scroll-snap-type:none!important','scroll snap disabled');
must('touch-action:pan-y pinch-zoom!important','vertical gesture ownership');
must('mobile-fixed-bottom-footer-navigation','mobile footer layout marker');
must('fixed-bottom-footer-navigation','desktop footer layout marker');
must('v5.8-fixed-bottom-footer-navigation','unified footer module marker');
must("setImportant(dock,'display','flex')",'mobile flex layout');
must("setImportant(dock,'flex-wrap','wrap')",'mobile two-row wrapping');
must("setImportant(dock,'justify-content','center')",'mobile second-row centering');
must("setImportant(button,'flex','0 0 calc((100% - 12px)/4)')",'mobile three-column control width');
must('qilyDockBottomSpacerV58','bottom content clearance spacer');

must('font:850 18px/1 "Microsoft YaHei","PingFang SC",Arial,sans-serif!important','desktop primary-nav font parity');
must("navFont=w.innerWidth<=390?'15px':w.innerWidth<1440?'16px':'18px'",'responsive primary-nav font scale');
must("setImportant(button,'font-size',navFont)",'inline typography ownership');
mustVisual('QILY-DOCK-NAV-FONT-PARITY-V1','fallback typography parity marker');
mustVisual('font-size:18px!important','wide desktop 20px navigation parity');
mustVisual('font-size:16px!important','compact/tablet/mobile 16px footer labels');
mustVisual('font-size:15px!important','narrow mobile 17px navigation parity');

must('min-height:36px!important','desktop compact control height');
must('min-height:36px!important','mobile compact control height');
must('border-radius:8px!important','compact rectangular controls');
must('color:#ffe39b!important','gold normal text');
must('background:rgba(255,255,255,.055)!important','subtle normal control fill');
must('background:#ffe39b!important','gold hover/focus fill');
must('color:#0f4b5a!important','deep teal hover/focus text');
must('box-shadow:inset 0 0 0 2px rgba(255,227,155,.24)!important','internal focus feedback');
must('background:#073c47!important','pressed deep teal state');
must("bottom:calc(var(--qily-dock-footer-h,50px) + 14px + env(safe-area-inset-bottom))",'toast above footer');

forbid('mobile-fixed-bottom-compact-navigation','retired one-row compact mobile layout');
forbid('mobile-fixed-bottom-swipe-navigation','retired swipe layout');
forbid('border-radius:50%!important','circular buttons');
forbid('--qily-dock-shell:rgba(255,255,255,.98)','retired white shell');
if(/new\s+MutationObserver\s*\(/.test(source))throw new Error('Dock V5.8 footer-style: MutationObserver rebuilding is forbidden');

console.log('PASS: Dock V5.8 keeps four actions, China-style footer geometry, 4-in-1 mobile layout, and primary-navigation font parity (20/18/17px).');
