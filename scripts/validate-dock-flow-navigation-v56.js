#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
const must=(token,label)=>{if(!source.includes(token))throw new Error(`Dock V5.8 swipe-fixed: ${label} missing: ${token}`);};
const forbid=(token,label)=>{if(source.includes(token))throw new Error(`Dock V5.8 swipe-fixed: ${label} forbidden: ${token}`);};

must('Floating Dock Authoritative Runtime V5.8','runtime version');
must('__qilyFloatingDockUnifiedV58','V58 single-owner guard');
must('__qilyFloatingDockUnifiedV57','V57 compatibility guard');
must("ORDER=['home','top','back','previous','search','current','contact']",'seven-action order');
for(const label of ['回首页','回顶部','回上一','层级','网页','本站','搜索','分享','当前页','联系','我们'])must(label,`label fragment ${label}`);
must("if(action==='previous'){goPreviousPage();return;}",'previous-page action');
must('w.history.back()','browser-history previous-page behavior');
must('position:fixed!important','fixed bottom navigation');
must('grid-template-columns:repeat(7,minmax(0,1fr))!important','desktop seven-column navigation');
must('bottom:0!important','mobile viewport-bottom pin');
must('display:flex!important','mobile native swipe rail');
must('overflow-x:auto!important','mobile horizontal scrolling');
must('scroll-snap-type:x proximity!important','mobile scroll snapping');
must('-webkit-overflow-scrolling:touch!important','mobile inertial scrolling');
must('touch-action:pan-x pan-y pinch-zoom!important','mobile gesture ownership');
must('mobile-fixed-bottom-swipe-navigation','mobile swipe-fixed layout marker');
must('qilyDockBottomSpacerV58','bottom content clearance spacer');
must('scroll-snap-align:start!important','mobile item snapping');
must('border-radius:8px!important','rectangular navigation geometry');
forbid('mobile-fixed-bottom-navigation','retired no-swipe mobile layout marker');
forbid('border-radius:50%!important','circular buttons');
if(/new\s+MutationObserver\s*\(/.test(source))throw new Error('Dock V5.8 swipe-fixed: MutationObserver rebuilding is forbidden');

console.log('PASS: Dock V5.8 is a seven-action rectangular fixed-bottom navigation; mobile is a native horizontally swipeable rail with readable fixed-width controls.');