#!/usr/bin/env node
'use strict';
/* 2026-08-25 remediation compatibility closure | V35 | 2026-09-06 */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const htmlFiles=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(f);
const DDZ='tools/pure-ddz/index.html',CN='cn-site/index.html';

must(read('qilylean/daily/2026-08-25.html'),'八大浪费','Eight wastes');

const safe=read('site-translation-safe-runtime-v1.js');
for(const [t,m] of [['Google Translate Header Runtime V1.4','Google Translate V1.4'],['translate.google.com/translate_a/element.js','Google Translate embed'],["data-qily-translation-provider','google",'Google provider marker'],['__qilyGoogleTranslateElementInitialized','Single TranslateElement guard'],['loadGoogleAfterPage','Post-load Google scheduling'],["addOption(select,'zh-CN','中文简体')",'Simplified Chinese'],["addOption(select,'zh-TW','中文繁体')",'Traditional Chinese'],["addOption(select,'en','English')",'English'],["addOption(select,MORE_VALUE,'其他')",'More languages'],['function populateMoreLanguages()','Expanded Google picker']])must(safe,t,m);
for(const t of ['includedLanguages:','function handleAndroidLanguageChange(event)',"d.cookie='googtrans='",'stabilizeMobileNav','matchMedia','qilylean-ai.dinghunter623.workers.dev','createTreeWalker'])forbid(safe,t,'Translation redline');
if(/new\s+MutationObserver\s*\(/.test(safe))throw new Error('Translation MutationObserver forbidden');
if(/location\.(?:replace|assign|reload)\s*\(/.test(safe))throw new Error('Translation redirect or reload forbidden');

const shell=read('site-ui-consistency-v1.js');must(shell,'__qilyUiConsistencyV11','Shell V11');must(shell,'single-responsibility-v11-safe-translation','Shell identity');forbid(shell,'function uninstallTranslationArtifacts()','Legacy translator remover');
const header=read('site-header-axis-v1.css');must(header,'Global Header Axis V1.2','Header Axis');must(header,'overflow-x:scroll!important','Mobile nav scroll');must(header,'white-space:nowrap!important','Full nav text');must(header,'pointer-events:none!important','Phone auxiliary-rail touch isolation');
const dock=read('site-dock-share-runtime-v1.js');must(dock,'Floating Dock Authoritative Runtime V5.5','Dock V5.5');must(dock,'__qilyFloatingDockUnifiedV55','Dock V55 guard');must(dock,'setOwnedLabel','Dock single label');must(dock,"w.open(url,'_blank','noopener,noreferrer')",'Contact new tab');
const route=read('site-contact-route-v1.js');must(route,'Contact Route V13.4','Contact V13.4');
const semanticCss=read('site-interaction-semantics-v1.css'),semanticJs=read('site-interaction-semantics-v1.js'),components=read('site-visual-components-v1.css');
must(semanticCss,'Interaction Semantics V1.4','Semantics CSS');must(semanticJs,'Interaction Semantics Runtime V1.7','Semantics V1.7');must(semanticJs,"rail.type='range'",'Pre-v4 range compatibility');must(semanticJs,'PROJECT_EVIDENCE','Evidence map');must(components,'qily-project-evidence-grade','Evidence component');must(components,'input.qily-primary-nav-scroll-rail[type="range"]','Range compatibility visual');

/* Formal VI v4 supersedes the visible auxiliary range rail while native nav scrolling remains. */
const viCss=read('site-vi-standard-v4.css'),viRuntime=read('site-vi-runtime-v4.js');
must(viCss,'--qily-container:1240px','Formal content axis');must(viCss,'linear-gradient(118deg','Formal Hero');must(viRuntime,'retireLegacyNavRail','Formal rail retirement');must(viRuntime,'normalizeDock','Formal Dock flow normalization');

/* Current isolated DDZ V155/V164 contract. */
const ddzIndex=read(DDZ),ddzCss=read('tools/pure-ddz/game/css/ddz-core-v155.css'),ddzJs=read('tools/pure-ddz/game/js/ddz-core-v155.js');
for(const [t,m] of [["const version='20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161-v162-v163-v164'",'DDZ V155/V164 cache'],['data-qily-ddz-core="v158"','DDZ bundled CSS'],['data-qily-ddz-fast-shell="v155"','DDZ fast shell'],['data-qily-ddz-virtual-landscape="v154"','DDZ iOS fallback'],['id="v120-landscape-toggle"','DDZ landscape toolbar'],['id="welcome-landscape"','DDZ landscape welcome']])must(ddzIndex,t,m);
if(!/\/site-dock-share-runtime-v1\.js\?v=20260902-(?:authority|public-dock)-v55/.test(ddzIndex))throw new Error('DDZ Dock V5.5 cache missing');
for(const t of ["loadStyle('css/ddz-core-v155.css')",'qilyPureDdzR8ClosureV128','name="screen-orientation"','name="x5-orientation"'])forbid(ddzIndex,t,'DDZ retired shell');
must(ddzCss,'overflow-x:clip!important','DDZ containment');must(ddzCss,'var(--ddz-mobile-vh,390px)','DDZ viewport sizing');must(ddzJs,"version:'1.2.4-mobile-landscape-adaptive'",'DDZ adaptive landscape runtime');must(ddzJs,'screen.orientation?.lock','DDZ landscape lock');

const mat=read('scripts/materialize-global-language-v3.js');
for(const t of ["const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'20260831-r7-single-responsibility-v11-safe-translation','20260831-project-grade-readability-v3','20260831-r11-semantics-v17-native-range','20260901-google-translate-single-runtime-v16','20260831-redline-no-translation-v23','20260901-google-translate-mobile-ui-v16','20260831-unified-components-v29-native-range','20260906-authority-v56-flow-navigation'])must(mat,t,'V32 materializer');
forbid(mat,'DDZ_CLOSURE_CSS','Retired DDZ closure materializer');

const cn=read(CN);must(cn,'name="robots" content="noindex,nofollow,noarchive"','CN indexing lock');must(cn,'/site-vi-standard-v4.css?v=20260906-vi-v4-formal-closure','CN formal CSS');must(cn,'/site-vi-runtime-v4.js?v=20260906-vi-v4-formal-closure','CN formal runtime');
const containment=read('site-responsive-containment-v1.css');must(containment,'QilyLean Responsive Containment V1','Responsive containment');forbid(containment,'width:100vw','Viewport widening');

const legacyTranslation=['data-qily-translation-safety-bootstrap','site-translation-public-ui-v1.js','site-translation-progress-v1.js','site-translation-progress-v1.css','site-global-language-v1.css','site-global-language-v3.js','20260831-safe-inpage-v7-header-utility','data-qily-translation-safe-direct="v7"','stable-diagnostic','qily_translate_debug'];
let pages=0,nav=0,shellPages=0;
for(const file of htmlFiles()){
  const html=read(file);if(!/<\/head>/i.test(html)||ownership(file)||file===DDZ||file===CN)continue;pages++;
  for(const [t,m] of [['/site-header-axis-v1.css?v=20260901-primary-navigation-native-scroll-v8','header'],['/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3','project integrity'],['/site-interaction-semantics-v1.css?v=20260830-r11-semantics-v14-visual-v3-vi-teal','semantics css'],['/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range','semantics js'],['data-qily-interaction-semantics-direct="v1.7"','semantics marker'],['/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range','components'],['/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16','translation UI'],['/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16','translation runtime'],['data-qily-translation-safe-direct="google-v1"','translation marker'],['/site-contact-route-v1.js?v=20260829-dock-functional-public-v134','contact'],['/site-responsive-containment-v1.css?v=20260830-header-integrity-v2','containment']])must(html,t,`${file} ${m}`);
  for(const token of legacyTranslation)forbid(html,token,`${file} legacy translation`);
  if(/\/site-navigation\.js/.test(html))nav++;
  if(/\/site-ui-consistency-v1\.js/.test(html)){shellPages++;must(html,'/site-ui-consistency-v1.js?v=20260831-r7-single-responsibility-v11-safe-translation',`${file} shell`);}
}
if(pages<460||nav<460||shellPages<460)throw new Error(`coverage regression pages=${pages} nav=${nav} shell=${shellPages}`);
console.log(`PASS: V35 remediation closure covers ${pages} production pages, formal VI v4, CN noindex preproduction and DDZ V155/V164 isolated performance route.`);
