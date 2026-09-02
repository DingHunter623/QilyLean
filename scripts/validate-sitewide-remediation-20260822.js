#!/usr/bin/env node
'use strict';

/* Sitewide remediation compatibility gate | V33 | 2026-09-02 */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const files=()=>execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=f=>/^(?:baidu_verify_codeva-[^/]+\.html|google[^/]+\.html|zohoverify\/verifyforzoho\.html)$/i.test(f);

const nav=read('site-navigation.js'),dock=read('site-dock-share-runtime-v1.js'),route=read('site-contact-route-v1.js'),header=read('site-header-axis-v1.css'),css=read('site-interaction-semantics-v1.css'),js=read('site-interaction-semantics-v1.js'),career=read('site-early-career-history-v1.js'),mat=read('scripts/materialize-global-language-v3.js'),contactMat=read('scripts/materialize-contact-route-v6.js'),safe=read('site-translation-safe-runtime-v1.js'),components=read('site-visual-components-v1.css');
const ddzIndex=read('tools/pure-ddz/index.html'),ddzLayout=read('tools/pure-ddz/game/css/ddz-site-page-v140.css'),ddzComfort=read('tools/pure-ddz/game/css/card-comfort-v122.css'),ddzGame=read('tools/pure-ddz/game/js/game.js');

must(nav,'navigation runtime v45','Navigation V45');must(nav,'r7DockSingleAuthority:true','Nav Dock split');if(/new\s+MutationObserver\s*\(/.test(nav))throw new Error('Navigation MutationObserver forbidden');
must(dock,'Floating Dock Authoritative Runtime V5.5','Dock V5.5');must(dock,'__qilyFloatingDockUnifiedV55','Dock V55 guard');must(dock,'setOwnedLabel','Dock label owner');must(dock,'--qily-dock-size:52px','Mobile Dock size');must(dock,'function openContactPage()','Full contact route');must(dock,"w.open(url,'_blank','noopener,noreferrer')",'New-tab contact route');must(dock,'function isExcluded(){return false;}','Normal public pages share canonical Dock');forbid(dock,"mask.classList.add('show')",'Dock contact modal');if(/new\s+MutationObserver\s*\(/.test(dock))throw new Error('Dock MutationObserver forbidden');
must(route,'Contact Route V13.4','Contact V13.4');must(route,'__qilyFloatingDockUnifiedV54','Contact Dock backward-compatibility marker');must(contactMat,'20260829-dock-functional-public-v134','Contact materializer V134');must(contactMat,'20260829-authority-v54','Contact recovery compatibility entry');must(contactMat,'global shell ownership untouched','Contact ownership boundary');forbid(contactMat,'const UI=','Contact shell rewrite');

must(header,'Global Header Axis V1.2','Header Axis');must(header,'overflow-x:auto!important','Desktop scroll');must(header,'overflow-x:scroll!important','Mobile scroll');must(header,'white-space:nowrap!important','Full nav labels');
must(css,'Interaction Semantics V1.4','Semantics CSS');must(css,'--qily-nav-rail-thumb:#0f4b5a','VI deep-teal rail');must(css,'.qily-primary-nav-scroll-rail','Persistent nav rail');must(css,'.brief-action-strip>span','Static brief labels');must(css,'.tag-row>li','Static tag rows');forbid(css,'content:"回\\A顶部"','Duplicate top label');forbid(css,'content:"回\\A上一层"','Duplicate back label');must(css,'.overview-card>.tag','Waste number contrast');
must(js,'__qilyInteractionSemanticsV17','Semantics JS V17');must(js,"rail.type='range'",'Native range nav rail');must(js,'qily-primary-nav-scroll-rail','Nav rail runtime');must(js,'.brief-action-strip>span','Static token runtime');must(js,'PROJECT_EVIDENCE','Evidence map');must(js,'addTrustLinks','Trust links');forbid(js,'qily-primary-nav-scroll-thumb','Retired synthetic thumb');
must(safe,'Google Translate Header Runtime V1.4','Google Translate V1.4');must(safe,'__qilyGoogleTranslateElementInitialized','Single translation initialization');must(safe,"addOption(select,MORE_VALUE,'其他')",'Primary more-language entry');must(safe,'function populateMoreLanguages()','Google-supported more-language picker');must(safe,'data-qily-header-utility','Translation header utility');forbid(safe,'includedLanguages:','Expanded translator must not restrict Google languages');if(/new\s+MutationObserver\s*\(/.test(safe))throw new Error('Translation MutationObserver forbidden');
must(components,'input.qily-primary-nav-scroll-rail[type="range"]','Native range rail visual');must(components,'-webkit-text-fill-color:#fff!important','Evidence grade letter contrast');must(components,'grid-template-areas:"qily-brand qily-translation" "qily-navigation qily-navigation"!important','Mobile translation/nav separation');

/* DDZ V152 is a normal public page: site Header/Dock are canonical; game files own only the table module. */
must(ddzIndex,"const version='20260902-ddz-integrated-v152'",'DDZ V152 cache');must(ddzIndex,'/site-navigation.js?','DDZ canonical navigation');must(ddzIndex,'/site-dock-share-runtime-v1.js?','DDZ canonical Dock');for(const token of ['qilyPureDdzR8ClosureV128','ddz-site-shell-v140.js','<footer class="site-footer">','class="ddz-page-note"'])forbid(ddzIndex,token,'DDZ retired shell');
must(ddzLayout,'--ddz-game-max:var(--qily-content-axis,1560px)','DDZ site content axis');must(ddzLayout,'overflow-x:clip!important','DDZ sticky-header-safe containment');must(ddzLayout,'justify-content:safe center!important','DDZ safe center');must(ddzLayout,'overflow-x:auto!important','DDZ hand overflow safety');must(ddzLayout,'scoreboard :is(small,strong,span)','DDZ status contrast');forbid(ddzLayout,'#floatDock','DDZ layout Dock ownership');forbid(ddzComfort,'#floatDock','DDZ comfort Dock ownership');must(ddzGame,"const VERSION = '1.5.2'",'DDZ game V152');must(ddzGame,"auto?'不要':'您不要'",'DDZ Hint auto-pass narration');

must(career,'function stickyHeaderOffset()','Career anchor offset');
must(mat,"const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'V32');must(mat,'20260829-dock-functional-public-v134','Contact V134 owner');must(mat,'20260902-authority-v55','Dock V55 owner');must(mat,'20260901-primary-navigation-native-scroll-v8','Header native-scroll owner');must(mat,'20260831-r11-semantics-v17-native-range','Semantics V17 owner');must(mat,'20260830-r11-semantics-v14-visual-v3-vi-teal','VI rail owner');must(mat,'20260901-google-translate-single-runtime-v16','Safe translation owner');must(mat,'20260901-google-translate-mobile-ui-v16','Translation public UI owner');must(mat,'20260831-unified-components-v29-native-range','Visual components owner');must(mat,'20260831-r7-single-responsibility-v11-safe-translation','Shell V11 owner');must(mat,'20260831-project-grade-readability-v3','Project grade owner');forbid(mat,'DDZ_CLOSURE_CSS','Retired DDZ closure owner');

const legacyTranslation=['site-translation-public-ui-v1.js','site-translation-progress-v1.js','site-translation-progress-v1.css','site-global-language-v1.css','site-global-language-v3.js'];
let pages=0,navPages=0,contactPages=0,owners=0,fail=[];
for(const file of files()){
  const html=read(file);if(ownership(file)){owners++;continue;}if(!/<\/head>/i.test(html))continue;pages++;
  if(/\/site-navigation\.js/.test(html))navPages++;
  if(/\/site-contact-route-v1\.js/.test(html)){contactPages++;if(!html.includes('/site-contact-route-v1.js?v=20260829-dock-functional-public-v134')||!html.includes('data-qily-contact-route-direct="v13.4"'))fail.push(`${file}: contact stale`);}
  if(!html.includes('/site-header-axis-v1.css?v=20260901-primary-navigation-native-scroll-v8'))fail.push(`${file}: header stale`);
  if(!html.includes('/site-interaction-semantics-v1.css?v=20260830-r11-semantics-v14-visual-v3-vi-teal')||!html.includes('/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range')||!html.includes('data-qily-interaction-semantics-direct="v1.7"'))fail.push(`${file}: semantics stale`);
  if(!html.includes('/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16')||!html.includes('/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16')||!html.includes('data-qily-translation-safe-direct="google-v1"'))fail.push(`${file}: translation stale`);
  if(!html.includes('/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'))fail.push(`${file}: visual components stale`);
  if(/\/site-ui-consistency-v1\.js/.test(html)&&!html.includes('/site-ui-consistency-v1.js?v=20260831-r7-single-responsibility-v11-safe-translation'))fail.push(`${file}: shell stale`);
  for(const token of legacyTranslation)if(html.includes(token))fail.push(`${file}: legacy translation ${token}`);
  if(/\/site-dock-share-runtime-v1\.js/.test(html)&&!/\/site-dock-share-runtime-v1\.js\?v=20260902-(?:authority|public-dock)-v55/.test(html))fail.push(`${file}: Dock stale`);
  if(file==='tools/pure-ddz/index.html'){
    if(!html.includes('20260902-ddz-integrated-v152'))fail.push(`${file}: DDZ V152 cache missing`);
    if(html.includes('r8-closure-v128.css'))fail.push(`${file}: retired DDZ closure loaded`);
  }
}
if(pages<460||navPages<460||contactPages<470)fail.push(`coverage pages=${pages} nav=${navPages} contact=${contactPages}`);
if(fail.length)throw new Error(`V33 sitewide remediation failed:\n${fail.slice(0,40).join('\n')}`);
console.log(`PASS: V33 sitewide remediation covers ${pages} pages; ${owners} ownership artifacts remain shell-free; Google Translate V1.4, native range nav V1.7, Dock V5.5/Contact V13.4 and DDZ V152 are current.`);
