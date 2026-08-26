#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function exists(relative){return fs.existsSync(path.join(root,relative))}
function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}

/* 1) 2026-08-25 curated brief must be genuinely published and propagated. */
assert(exists('qilylean/daily/2026-08-25.html'),'2026-08-25 curated brief file missing');
const brief=read('qilylean/daily/2026-08-25.html');
assert(brief.includes('2026-08-25'),'2026-08-25 brief date missing');
assert(brief.includes('八大浪费'),'2026-08-25 eight-wastes brief content missing');
const knowledge=read('knowledge/index.html');
assert(knowledge.includes('375篇'),'Knowledge hub is not synchronized to 375 briefs');
assert(knowledge.includes('2026-08-25'),'Knowledge hub latest date is not 2026-08-25');
assert(knowledge.includes('/qilylean/daily/2026-08-25.html'),'Knowledge hub latest brief link is stale');
const siteData=read('qilylean/site-data.json');
assert(siteData.includes('"latestDate": "2026-08-25"')||siteData.includes('"latestDate":"2026-08-25"'),'Central SSOT latestDate is stale');
assert(siteData.includes('2026-08-25.html'),'Central SSOT latest URL is stale');

/* 2) Translation must stay on-site, finish cleanly, and never leave a mixed initial page. */
const safe=read('site-translation-safe-runtime-v1.js');
assert(!safe.includes('https://translate.google.com'),'Safe runtime still contains executable Google redirect');
assert(!safe.includes('https://qilylean-com.translate.goog'),'Safe runtime still contains translated proxy redirect');
assert(safe.includes("runtime:'safe-inpage-v2'"),'Fast translation runtime V2 missing');
assert(safe.includes('function nearViewport(el)'),'Visible-first translation missing');
assert(safe.includes("setState('error','翻译未完整完成，已恢复中文原文')"),'Initial translation does not fail closed to full Chinese');
assert(safe.includes("setState('idle',languageName(target))"),'Successful translation does not clear working/partial state');
for(const sourceName of ['site-translation-safe-runtime-v1.js','site-translation-public-ui-v1.js','site-translation-progress-v1.js']){
  const source=read(sourceName);
  assert(!source.includes('智能路由'),`${sourceName}: visitor runtime exposes 智能路由`);
  assert(!source.includes('国内线路'),`${sourceName}: visitor runtime exposes 国内线路`);
}

/* 3) Language names and translated navigation must remain fully reachable. */
const publicUi=read('site-translation-public-ui-v1.js');
const publicCss=read('site-translation-public-ui-v1.css');
assert(publicUi.includes('measuredTextWidth'),'Selected-language width is not measured');
assert(publicUi.includes('data-qily-language-name-complete'),'Selected-language completeness is not tracked');
assert(publicCss.includes('max-width:420px!important'),'Long selected-language allowance is missing');
assert(publicCss.includes('overflow-x:auto!important'),'Translated navigation cannot scroll horizontally');
assert(publicCss.includes('height:10px!important'),'Horizontal movement bar is not explicit');

/* 4) Search opening and static-content readability must be governed sitewide. */
const interaction=read('site-interaction-contrast-guard-v1.js');
const content=read('site-content-contrast-guard-v1.js');
const contentCss=read('site-content-contrast-guard-v1.css');
const search=read('site-search.js');
const integrity=read('site-integrity-hotfix-v1.js');
assert(interaction.includes("setAttribute('data-qily-interaction-contrast'"),'Interactive contrast guard missing');
assert(interaction.includes('if(current>=4.5)'),'Interactive contrast threshold guard missing');
assert(content.includes('Sitewide Content Contrast Guard V6'),'Content contrast V6 runtime missing');
assert(content.includes('data-qily-content-contrast-fixed'),'Content contrast guard missing');
assert(content.includes('?3:4.5'),'Content contrast threshold guard missing');
assert(content.includes('function hasOpaqueLocalSurface(style,el)'),'Nested local-surface ownership guard missing');
assert(content.includes("data-qily-light-surface"),'Light-surface semantic guard missing');
assert(content.includes('.document-hero'),'Document hero is not protected by the shared dark-surface registry');
assert(content.includes('function renderedForeground(style)'),'Rendered foreground / text-fill inspection missing');
assert(!content.includes("style&&style.backgroundImage&&style.backgroundImage!=='none'"),'Generic gradient still suppresses contrast correction');
assert(contentCss.includes('.rule-table thead :is(th,td)'),'Shared dark table header white-text fallback missing');
assert(contentCss.includes('--ql-dark-title:#fff'),'Dark-surface title token missing');
assert(search.includes("mask.dataset.qilyR6PostRank = 'true'"),'Search modal still allows retired mutation post-ranker');
assert(search.includes("results.addEventListener('click'"),'Search results have no deterministic click navigation');
assert(search.includes('window.__qilyPersistentNavigate'),'Search result native/persistent navigation bridge missing');
assert(integrity.includes("if (liveNote && liveNote !== staticNote) liveNote.remove()"),'Duplicate terminology metadata strip is not removed');
const gbt=read('qilylean/gbt2828.html');
assert(gbt.includes('.reference-button'),'GB/T 2828 reference button source missing');
assert(gbt.includes('color:#fff'),'GB/T 2828 reference button does not define white text');
const terminology=read('knowledge/terminology.html');
assert(terminology.includes('id="qilyTerminologyStaticCount"'),'Terminology static-count strip identifier missing');

/* 5) Post-materialization all public HTML must use the fast deferred translation baseline.
 * Navigation/shared-shell are audited when present because special standalone tools intentionally omit them. */
const NAV='/site-navigation.js?v=20260826-search-navigation-contrast-v44';
const SHELL='/site-ui-consistency-v1.js?v=20260826-translation-fast-reliable-v3';
let pages=0,navigationPages=0,shellPages=0;
for(const relative of trackedHtml()){
  const html=read(relative);if(!/<\/head>/i.test(html))continue;pages+=1;
  assert(html.includes('data-qily-translation-safety-bootstrap="inpage-v2"'),`${relative}: safety bootstrap missing`);
  assert(html.includes('/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3'),`${relative}: fast safe runtime missing`);
  assert(html.includes('<script defer data-qily-translation-safe-direct="inpage-v2"'),`${relative}: translation runtime blocks document parsing`);
  assert(html.includes('/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3'),`${relative}: deterministic progress runtime missing`);
  assert(html.includes('/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6'),`${relative}: public language UI missing`);
  assert(html.includes('/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2'),`${relative}: interaction contrast missing`);
  assert(html.includes('/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'),`${relative}: content contrast v6 missing`);
  assert(html.includes('data-qily-content-contrast-direct="v6"'),`${relative}: content contrast v6 marker missing`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)){navigationPages+=1;assert(html.includes(NAV),`${relative}: navigation/search runtime stale`)}
  if(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html)){shellPages+=1;assert(html.includes(SHELL),`${relative}: shared-shell runtime stale`)}
  assert(!html.includes('/site-global-language-v3.js'),`${relative}: retired translator still referenced`);
  assert(!html.includes('智能路由'),`${relative}: visitor-facing 智能路由 remains`);
}
assert(pages>=460,`Unexpected public HTML coverage: ${pages}`);
assert(navigationPages>=460,`Unexpected navigation coverage: ${navigationPages}`);
assert(shellPages>=460,`Unexpected shared-shell coverage: ${shellPages}`);
process.stdout.write(`PASS: fast fail-closed translation and content-contrast V6 are codified across ${pages} public HTML pages; fresh navigation covers ${navigationPages}, shared shell ${shellPages}.\n`);
