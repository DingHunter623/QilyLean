#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}
function isOwnershipArtifact(relative){return /^(?:baidu_verify_codeva-[^/]+\.html|google[^/]+\.html|zohoverify\/verifyforzoho\.html)$/i.test(relative)}

const runtimeBaseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;
const navigation=read('site-navigation.js');
const dockRuntime=read('site-dock-share-runtime-v1.js');
const contactRoute=read('site-contact-route-v1.js');
const materializer=read('scripts/materialize-global-language-v3.js');
const contactMaterializer=read('scripts/materialize-contact-route-v6.js');
const contentAxis=read('site-content-axis-v1.css');
const headerAxis=read('site-header-axis-v1.css');
const safe=read('site-translation-safe-runtime-v1.js');
const contentContrastCss=read('site-content-contrast-guard-v1.css');
const home=read('index.html');
const redline=read('site-public-redline-closure-v1.css');
const capabilities=read('capabilities/index.html');
const ddz=read('tools/pure-ddz/index.html');
const ddzClosure=read('tools/pure-ddz/game/css/r8-closure-v128.css');
const game=read('tools/pure-ddz/game/js/game.js');
const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');
const career=read('site-early-career-history-v1.js');

const baselineLower=String(runtimeBaseline).toLowerCase();
assert(new RegExp(`mode\\s*:\\s*['\"]atomic-first-paint-${baselineLower}['\"]`).test(navigation),`Navigation wrapper no longer declares the ${runtimeBaseline} static first-paint baseline.`);
assert(navigation.includes('navigation runtime v45'),'Navigation wrapper is not the current V45 single-responsibility runtime.');
assert(navigation.includes('r7DockSingleAuthority:true'),'Navigation does not declare Dock single-authority ownership.');
assert(navigation.includes('r7NoNavigationDockMutation:true'),'Navigation still claims Dock mutation responsibility.');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'Navigation must not continuously rewrite navigation/Dock through MutationObserver.');
assert(contentAxis.includes('--qily-content-axis:1560px'),'Unified 1560px content axis is missing.');
assert(headerAxis.includes('--qily-header-axis:var(--qily-content-axis,1560px)'),'Header does not inherit the 1560px content axis.');
assert(headerAxis.includes('Global Header Axis V1.1'),'R9 header-axis version missing.');
assert(headerAxis.includes('overflow-x:auto!important'),'Desktop navigation horizontal scrollbar contract missing.');
assert(headerAxis.includes('overflow-x:scroll!important'),'Mobile navigation horizontal scrollbar contract missing.');
assert(headerAxis.includes('scrollbar-width:thin!important'),'Visible navigation scrollbar contract missing.');

assert(dockRuntime.includes('Floating Dock Authoritative Runtime V5.2'),'Authoritative Dock V5.2 missing.');
assert(dockRuntime.includes('__qilyFloatingDockUnifiedV52'),'Dock V5.2 guard missing.');
assert(dockRuntime.includes("ORDER=['home','top','back','search','current','contact']"),'Dock order contract missing.');
assert(dockRuntime.includes('setOwnedLabel'),'Dock single-label ownership missing.');
assert(dockRuntime.includes('qily-dock-label'),'Dock canonical label node missing.');
assert(dockRuntime.includes('--qily-dock-size:56px'),'Mobile Dock 56px geometry missing.');
assert(dockRuntime.includes('--qily-dock-size:54px'),'Narrow-mobile Dock geometry missing.');
assert(dockRuntime.includes("EXCLUDED=/^\\/tools\\/pure-ddz"),'Pure DDZ Dock exclusion missing.');
assert(dockRuntime.includes('createStandaloneDock'),'Standalone Dock fallback missing.');
assert(dockRuntime.includes('installAuthoritativeEvents'),'Authoritative Dock event handler missing.');
for(const action of ['top','back','search','current','contact'])assert(dockRuntime.includes("if(action==='"+action+"')"),action+' function missing.');
assert(!/new\s+MutationObserver\s*\(/.test(dockRuntime),'R9 violation: Dock runtime must not continuously rebuild DOM.');

/* Contact Route V13.1 stays compatible, but its sitewide materializer must no longer write old Dock V5.1 refs. */
assert(contactRoute.includes('__qilySiteShellRecoveryV131'),'Site Shell Recovery V13.1 missing.');
assert(contactRoute.includes('__qilyFloatingDockUnifiedV51'),'Contact route compatibility guard missing.');
assert(contactRoute.includes('/site-public-redline-closure-v1.css?v=20260828-home-dock-v2'),'Redline V2 cache owner missing.');
assert(contactRoute.includes('canonical shared contact panel'),'Canonical contact-panel preservation marker missing.');
assert(!contactRoute.includes('removeLegacyContactModal'),'Canonical #wxMask must not be removed by shared recovery.');
assert(!contactRoute.includes('mask.remove()'),'Shared recovery must not delete #wxMask.');
assert(contactMaterializer.includes("const DOCK='/site-dock-share-runtime-v1.js?v=20260829-authority-v52'"),'Contact materializer can regress Dock V5.2.');

assert(redline.includes('Public Redline Closure V2'),'Public redline V2 missing.');
assert(redline.includes('header.qily-global-header'),'Unified top navigation rule missing.');
assert(redline.includes('body.qily-home-v3 .hero .hero-grid'),'Homepage hero containment rule missing.');
assert(redline.includes('#pure-ddz-digital-tool'),'Capability DDZ direct-link protection missing.');
assert(capabilities.includes('<a href="/tools/pure-ddz/">立即在线玩</a>'),'Capability DDZ direct link missing.');
assert(ddz.includes('id="welcome-start"'),'Pure DDZ welcome Start button missing.');
assert(game.includes("$('welcome-start').addEventListener('click',startRound)"),'Pure DDZ welcome Start is not bound to startRound.');
assert(ddzClosure.includes('Pure DDZ R9 Closure V129'),'Pure DDZ R9 closure missing.');
assert(ddzClosure.includes('html:not(.ddz-ready) body .game-shell'),'Pure DDZ clean first-paint gate missing.');
assert(ddzClosure.includes('.topbar .brand *'),'Pure DDZ brand stability guard missing.');
assert(ddzClosure.includes('left:50%!important'),'Pure DDZ local player centering rule missing.');
assert(ddzClosure.includes('width:max-content!important'),'Pure DDZ centered card-group sizing missing.');
assert(ddzClosure.includes('margin-left:auto!important'),'Pure DDZ centered card-group auto margin missing.');

assert(semanticsCss.includes('Interaction Semantics V1.2'),'Interaction semantics CSS V1.2 missing.');
assert(semanticsCss.includes('[data-qily-interaction="route"]'),'Route feedback contract missing.');
assert(semanticsCss.includes('[data-qily-interaction="static"]'),'Static terminology feedback-suppression contract missing.');
assert(semanticsCss.includes('.qily-float-btn::before'),'Dock pseudo reset missing.');
assert(!semanticsCss.includes('content:"回\\A顶部"'),'Duplicate Dock top pseudo label returned.');
assert(!semanticsCss.includes('content:"回\\A上一层"'),'Duplicate Dock back pseudo label returned.');
assert(semanticsCss.includes('.overview-card>.tag'),'Eight-waste numeric contrast guard missing.');
assert(semanticsJs.includes('__qilyInteractionSemanticsV12'),'Interaction semantics V1.2 runtime missing.');
assert(semanticsJs.includes('PROJECT_EVIDENCE'),'Project evidence mapping missing.');
assert(semanticsJs.includes('addTrustLinks'),'Trust-to-project linkage missing.');
assert(semanticsJs.includes('injectProjectDetailGrade'),'Project evidence attribution missing.');
assert(career.includes("var VERSION = 'v5'"),'Career V5 missing.');
assert(career.includes('function stickyHeaderOffset()'),'Career sticky-header measured offset missing.');

assert(/const\s+SAFE_VERSION\s*=\s*['"]20260828-long-page-resilience-v5['"]/.test(materializer),'Long-page translation version owner missing.');
assert(materializer.includes("const BASELINE_VERSION='20260829-r9-visual-remediation-v21'"),'R9 V21 global materializer missing.');
assert(materializer.includes('site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'),'R9 header scrollbar is not materialized.');
assert(materializer.includes('site-dock-share-runtime-v1.js?v=20260829-authority-v52'),'Dock V5.2 is not materialized.');
assert(materializer.includes('site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12'),'Sitewide interaction semantics CSS is not materialized.');
assert(materializer.includes('r8-closure-v128.css?v=20260829-r9-v129'),'Pure DDZ R9 closure is not materialized.');
assert(safe.includes('function retryFailedAdaptive('),'Adaptive translation retry missing.');
assert(safe.includes('function scheduleHealing('),'Background translation healing missing.');
assert(contentContrastCss.includes('--ql-dark-title:#fff'),'Dark-surface text token missing.');
assert(home.includes('<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->'),'Homepage aircraft brand hero start marker missing.');

let navigationPages=0,contactPages=0,staleContact=[],staleSemantics=[],staleHeader=[],staleDock=[],ownershipArtifacts=0;
for(const relative of trackedHtml()){
  const html=read(relative);
  if(isOwnershipArtifact(relative)){ownershipArtifacts+=1;continue;}
  if(!/<\/head>/i.test(html))continue;
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html))navigationPages+=1;
  if(/\/site-contact-route-v1\.js(?:\?v=[^"']*)?/.test(html)){
    contactPages+=1;
    if(!html.includes('/site-contact-route-v1.js?v=20260828-dock-functional-public-v131')||!html.includes('data-qily-contact-route-direct="v13.1"'))staleContact.push(relative);
  }
  if(!html.includes('/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12')||!html.includes('/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12'))staleSemantics.push(relative);
  if(!html.includes('/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'))staleHeader.push(relative);
  if(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/.test(html)&&!html.includes('/site-dock-share-runtime-v1.js?v=20260829-authority-v52'))staleDock.push(relative);
}
assert(navigationPages>=460,`Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(contactPages>=470,`Contact/shared recovery coverage unexpectedly fell to ${contactPages} pages.`);
assert(staleContact.length===0,`Stale contact/public pages: ${staleContact.slice(0,12).join(', ')}`);
assert(staleSemantics.length===0,`Stale R9 interaction-semantics pages: ${staleSemantics.slice(0,12).join(', ')}`);
assert(staleHeader.length===0,`Stale R9 header-scroll pages: ${staleHeader.slice(0,12).join(', ')}`);
assert(staleDock.length===0,`Stale direct Dock pages: ${staleDock.slice(0,12).join(', ')}`);
process.stdout.write(`PASS: R9 sitewide remediation validates ${navigationPages} navigation pages and ${contactPages} shared recovery pages; ${ownershipArtifacts} ownership artifacts remain shell-free; Dock V5.2, visible nav scrolling, precise career anchors, evidence linkage and DDZ visual closure are protected (${runtimeBaseline}).\n`);
