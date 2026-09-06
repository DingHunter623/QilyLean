#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'site-dock-share-runtime-v1.js'),'utf8');
const must=(token,label)=>{if(!source.includes(token))throw new Error(`Dock V5.6 flow-nav: ${label} missing: ${token}`);};
const forbid=(token,label)=>{if(source.includes(token))throw new Error(`Dock V5.6 flow-nav: ${label} forbidden: ${token}`);};

must('Floating Dock Authoritative Runtime V5.6','runtime version');
must('__qilyFloatingDockUnifiedV56','V56 single-owner guard');
must("ORDER=['home','top','back','previous','search','current','contact']",'seven-action order');
for(const label of ['回首页','回顶部','回上一层级','回上一网页','本站搜索','分享当前页','联系我们'])must(label,`label ${label}`);
must("if(action==='previous'){goPreviousPage();return;}",'previous-page action');
must('w.history.back()','browser-history previous-page behavior');
must('placeDockInFlow','in-flow placement owner');
must('data-qily-dock-layout','flow-navigation marker');
must('grid-template-columns:repeat(7,minmax(0,1fr))!important','desktop seven-column modules');
must('border-radius:8px!important','rectangular navigation geometry');
must('overflow-x:auto!important','mobile horizontal scrolling');
must('scroll-snap-type:x proximity','mobile scroll snapping');
must('-webkit-overflow-scrolling:touch','mobile inertial scrolling');
forbid('border-radius:50%!important','circular buttons');
if(/#floatDock[^'"\n]*position:fixed!important/.test(source))throw new Error('Dock V5.6 flow-nav: floating fixed Dock returned');
if(/new\s+MutationObserver\s*\(/.test(source))throw new Error('Dock V5.6 flow-nav: MutationObserver rebuilding is forbidden');

console.log('PASS: Dock V5.6 is a seven-action in-flow rectangular navigation module; mobile uses horizontal scrolling and no circular floating buttons remain.');
