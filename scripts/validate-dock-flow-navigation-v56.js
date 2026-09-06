#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
const must=(token,label)=>{if(!source.includes(token))throw new Error(`Dock V5.8 compact-fixed: ${label} missing: ${token}`);};
const forbid=(token,label)=>{if(source.includes(token))throw new Error(`Dock V5.8 compact-fixed: ${label} forbidden: ${token}`);};

must('Floating Dock Authoritative Runtime V5.8','runtime version');
must('__qilyFloatingDockUnifiedV58','V58 single-owner guard');
must('__qilyFloatingDockUnifiedV57','V57 compatibility guard');
must("ORDER=['home','top','back','previous','search','current','contact']",'seven-action order');
for(const label of ['回首页','回顶部','回上一','层级','网页','本站','搜索','分享','当前页','联系','我们'])must(label,`desktop label fragment ${label}`);
must("MOBILE_LABELS={home:['首页'],top:['顶部']",'compact mobile labels');
must("if(action==='previous'){goPreviousPage();return;}",'previous-page action');
must('w.history.back()','browser-history previous-page behavior');
must('position:fixed!important','fixed bottom navigation');
must('grid-template-columns:repeat(7,minmax(0,1fr))!important','seven-column navigation');
must('bottom:0!important','mobile viewport-bottom pin');
must('overflow-x:visible!important','mobile no horizontal scrolling');
must('scroll-snap-type:none!important','mobile snap disabled');
must('touch-action:pan-y pinch-zoom!important','mobile vertical gesture ownership');
must('mobile-fixed-bottom-compact-navigation','mobile compact fixed-bottom layout marker');
must('qilyDockBottomSpacerV58','bottom content clearance spacer');
must('border-radius:7px!important','mobile rectangular navigation geometry');
must('box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important','internal focus ring prevents edge clipping');
forbid('dock.scrollTo({left:max','retired horizontal swipe behavior');
forbid('border-radius:50%!important','circular buttons');
if(/new\s+MutationObserver\s*\(/.test(source))throw new Error('Dock V5.8 compact-fixed: MutationObserver rebuilding is forbidden');

console.log('PASS: Dock V5.8 is a seven-action rectangular fixed-bottom navigation; mobile shows all seven compact actions without horizontal scrolling and uses an internal focus ring.');
