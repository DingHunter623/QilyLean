#!/usr/bin/env node
'use strict';

/* Dock V5.8 footer-style contract gate | 2026-09-24
 * International quick actions retain all six functions while sharing the China-site
 * fixed-footer visual language: deep teal bar, gold rule/text and compact controls.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const DOCK_URL='/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20261022-four-actions-v1&share=20261031-copy-first-v1';
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

const shareStart=source.indexOf('function shareCurrent(){');
const shareEnd=source.indexOf('function openContactPage(){',shareStart);
if(shareStart<0||shareEnd<=shareStart)throw new Error('Dock share-current handler missing');
const shareHandler=source.slice(shareStart,shareEnd);
const copyFirstAt=shareHandler.indexOf('copyText(text).then(');
const nativeShareAt=shareHandler.indexOf('navigator.share(');
if(copyFirstAt<0||nativeShareAt<=copyFirstAt)throw new Error('Share-current must copy the page title and full URL before opening native share');
if(!shareHandler.includes('标题与网址已复制，正在打开系统分享'))throw new Error('Share-current success toast text mismatch');
if(!shareHandler.includes('复制失败，请手动复制地址栏网址'))throw new Error('Share-current clipboard failure feedback missing');
if(!source.includes("d.execCommand('copy')===true"))throw new Error('Legacy clipboard fallback must verify copy success');


must('position:fixed!important','fixed footer navigation');
must('left:0!important;right:0!important','full-width footer anchoring');
must('bottom:0!important','viewport-bottom pin');
must('width:100%!important','full viewport width');
must('display:flex!important;flex-wrap:nowrap!important;justify-content:flex-start!important','desktop content-fit, left-aligned actions');
must('border-top:3px solid #c8a25a!important','China-style gold top rule');
must('background:#0f4b5a!important','China-style deep teal footer');
must('overflow-x:visible!important','no horizontal scrolling');
must('scroll-snap-type:none!important','scroll snap disabled');
must('touch-action:pan-y pinch-zoom!important','vertical gesture ownership');
must('mobile-fixed-bottom-footer-navigation','mobile footer layout marker');
must('fixed-bottom-footer-navigation','desktop footer layout marker');
must('v5.8-fixed-bottom-footer-navigation','unified footer module marker');
must("setImportant(dock,'display','flex')",'mobile flex layout');
must("setImportant(dock,'flex-wrap','nowrap')",'mobile single-row actions');
must("setImportant(dock,'justify-content','flex-start')",'mobile content-axis left alignment');
must("setImportant(button,'flex','0 0 auto')",'four buttons size to text content');
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

const trackedHtml=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
let internationalSharePages=0,chinaSharePages=0;
for(const file of trackedHtml){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const hasCurrent=/data-action=["']current["']|data-qily-footer-action=["']current["']/.test(html);
  if(!hasCurrent)continue;
  const currentButtons=[...html.matchAll(/<button\b[^>]*>/gi)].filter(m=>/data-action=["']current["']|data-qily-footer-action=["']current["']/.test(m[0]));
  if(currentButtons.length!==1)throw new Error(file+': expected exactly one 分享当前 action, found '+currentButtons.length);
  if(file.startsWith('cn-site/')){
    if(!html.includes('/assets/cn-footer-actions-v1.js?v=20261023-cn-public-footer-source-v1'))throw new Error(file+': China page is missing the canonical copy-first share runtime');
    chinaSharePages++;
  }else{
    if(!html.includes(DOCK_URL))throw new Error(file+': international page is missing the canonical copy-first share runtime/cache key');
    internationalSharePages++;
  }
}
if(!internationalSharePages||!chinaSharePages)throw new Error('Both international and China share-current page sets must be present');
const cnRuntime=fs.readFileSync(path.join(root,'cn-site/assets/cn-footer-actions-v1.js'),'utf8');
const cnStart=cnRuntime.indexOf('function shareCurrent(){'),cnEnd=cnRuntime.indexOf('function openContactPage(){',cnStart);
const cnShare=cnStart>=0&&cnEnd>cnStart?cnRuntime.slice(cnStart,cnEnd):'';
if(cnShare.indexOf('copyText(text).then(')<0||cnShare.indexOf('navigator.share(')<=cnShare.indexOf('copyText(text).then(')||!cnShare.includes('标题与网址已复制，正在打开系统分享'))throw new Error('China share-current runtime does not match the copy-first interaction contract');
console.log('PASS: sitewide 分享当前 audit — '+internationalSharePages+' international pages + '+chinaSharePages+' China pages use one canonical runtime per page.');

console.log('PASS: Dock V5.8 keeps four actions, China-style footer geometry, 4-in-1 mobile layout, and primary-navigation font parity (20/18/17px).');
