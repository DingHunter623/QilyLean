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
function ownershipArtifact(relative){return /^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(relative)}

/* Curated brief and SSOT continuity. */
assert(exists('qilylean/daily/2026-08-25.html'),'2026-08-25 curated brief file missing');
const brief=read('qilylean/daily/2026-08-25.html');
assert(brief.includes('八大浪费'),'2026-08-25 eight-wastes brief content missing');
const siteData=read('qilylean/site-data.json');
assert(siteData.includes('2026-08-25.html'),'Central SSOT latest URL is stale');

/* Resilient translation remains on-site and non-blocking. */
const safe=read('site-translation-safe-runtime-v1.js');
assert(!safe.includes('https://translate.google.com'),'Safe runtime still contains executable Google redirect');
assert(!safe.includes('https://qilylean-com.translate.goog'),'Safe runtime still contains translated proxy redirect');
assert(safe.includes("runtime:'safe-inpage-v4'"),'Resilient translation runtime V4 missing');
assert(safe.includes('function retryFailedAdaptive('),'Adaptive failed-batch retry missing');
assert(safe.includes('function scheduleHealing('),'Background translation healing missing');
assert(!safe.includes('function recoverChinese(reason)'),'Translation failure may not roll the whole page back to Chinese');

/* R9 visual closure. */
const header=read('site-header-axis-v1.css');
assert(header.includes('Global Header Axis V1.1'),'R9 header axis missing');
assert(header.includes('overflow-x:scroll!important'),'Mobile explicit horizontal nav scrollbar missing');
assert(header.includes('scrollbar-width:thin!important'),'Navigation scrollbar must remain visible');
const dock=read('site-dock-share-runtime-v1.js');
assert(dock.includes('Floating Dock Authoritative Runtime V5.2'),'Dock V5.2 missing');
assert(dock.includes('setOwnedLabel'),'Dock single-label ownership missing');
assert(dock.includes('qily-dock-label'),'Dock label node missing');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Dock must not continuously rebuild DOM');
const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');
assert(semanticsCss.includes('Interaction Semantics V1.2'),'Interaction Semantics V1.2 missing');
assert(!semanticsCss.includes('content:"回\\A顶部"'),'Duplicate Dock top pseudo label returned');
assert(!semanticsCss.includes('content:"回\\A上一层"'),'Duplicate Dock back pseudo label returned');
assert(semanticsCss.includes('.overview-card>.tag'),'Eight-waste number contrast protection missing');
assert(semanticsJs.includes('PROJECT_EVIDENCE'),'Project evidence mapping missing');
assert(semanticsJs.includes('addTrustLinks'),'Trust-to-project evidence linkage missing');
assert(semanticsJs.includes('injectProjectDetailGrade'),'Project detail evidence attribution missing');
const career=read('site-early-career-history-v1.js');
assert(career.includes("var VERSION = 'v5'"),'Career anchor V5 missing');
assert(career.includes('function stickyHeaderOffset()'),'Career anchor does not measure sticky header');
const ddz=read('tools/pure-ddz/game/css/r8-closure-v128.css');
assert(ddz.includes('Pure DDZ R9 Closure V129'),'DDZ R9 closure missing');
assert(ddz.includes('.topbar .brand *'),'DDZ brand flicker guard missing');
assert(ddz.includes('width:max-content!important'),'DDZ local card-group center contract missing');

/* Post-materialization every actual public UI page must use R9 cache-isolated resources. */
const NAV='/site-navigation.js?v=20260828-r7-navigation-v45';
const SHELL='/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7';
const HEADER='/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5';
const SEM_CSS='/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12';
const SEM_JS='/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12';
let pages=0,navigationPages=0,shellPages=0;
for(const relative of trackedHtml()){
  const html=read(relative);if(!/<\/head>/i.test(html)||ownershipArtifact(relative))continue;pages+=1;
  assert(html.includes('data-qily-translation-safety-bootstrap="inpage-v4"'),`${relative}: safety bootstrap missing`);
  assert(html.includes('/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5'),`${relative}: resilient safe runtime missing`);
  assert(html.includes('<script defer data-qily-translation-safe-direct="inpage-v4"'),`${relative}: translation runtime blocks document parsing`);
  assert(html.includes(HEADER),`${relative}: R9 header scrollbar resource stale`);
  assert(html.includes(SEM_CSS),`${relative}: R9 interaction semantics CSS stale`);
  assert(html.includes(SEM_JS),`${relative}: R9 interaction semantics JS stale`);
  assert(html.includes('data-qily-interaction-semantics-direct="v1.2"'),`${relative}: R9 interaction semantics marker stale`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html)){navigationPages+=1;assert(html.includes(NAV),`${relative}: navigation/search runtime stale`)}
  if(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/.test(html)){shellPages+=1;assert(html.includes(SHELL),`${relative}: shared-shell runtime stale`)}
  assert(!html.includes('/site-global-language-v3.js'),`${relative}: retired translator still referenced`);
}
assert(pages>=460,`Unexpected public HTML coverage: ${pages}`);
assert(navigationPages>=460,`Unexpected navigation coverage: ${navigationPages}`);
assert(shellPages>=460,`Unexpected shared-shell coverage: ${shellPages}`);
const ddzPage=read('tools/pure-ddz/index.html');
assert(ddzPage.includes('/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r9-v129'),'DDZ R9 closure is not materialized');
process.stdout.write(`PASS: R9 remediation closure protects ${pages} public pages: resilient translation, visible nav scrolling, uniform Dock V5.2, precise career anchors, evidence linkage, DDZ stability and readable waste numbering.\n`);
