#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
const must=(token,label)=>{if(!source.includes(token))throw new Error(`Dock V5.7 fixed-nav: ${label} missing: ${token}`);};
const forbid=(token,label)=>{if(source.includes(token))throw new Error(`Dock V5.7 fixed-nav: ${label} forbidden: ${token}`);};

must('Floating Dock Authoritative Runtime V5.7','runtime version');
must('__qilyFloatingDockUnifiedV57','V57 single-owner guard');
must('__qilyFloatingDockUnifiedV56','V56 compatibility guard');
must("ORDER=['home','top','back','previous','search','current','contact']",'seven-action order');
for(const label of ['回首页','回顶部','回上一','层级','网页','本站','搜索','分享','当前页','联系','我们'])must(label,`label fragment ${label}`);
must("if(action==='previous'){goPreviousPage();return;}",'previous-page action');
must('w.history.back()','browser-history previous-page behavior');
must('position:fixed!important','fixed bottom navigation');
must('grid-template-columns:repeat(7,minmax(0,1fr))!important','seven-column navigation');
must('bottom:0!important','mobile viewport-bottom pin');
must('overflow-x:hidden!important','mobile horizontal overflow disabled');
must('scroll-snap-type:none!important','mobile scroll snapping disabled');
must('mobile-fixed-bottom-navigation','mobile fixed-layout marker');
must('qilyDockBottomSpacerV57','bottom content clearance spacer');
must('border-radius:8px!important','rectangular navigation geometry');
forbid('overflow-x:auto!important','mobile horizontal scrolling');
forbid('scroll-snap-type:x proximity','mobile scroll snapping');
forbid('-webkit-overflow-scrolling:touch','mobile inertial horizontal scrolling');
forbid('border-radius:50%!important','circular buttons');
if(/new\s+MutationObserver\s*\(/.test(source))throw new Error('Dock V5.7 fixed-nav: MutationObserver rebuilding is forbidden');

console.log('PASS: Dock V5.7 is a seven-action rectangular fixed-bottom navigation; mobile is seven equal columns with horizontal scrolling disabled.');