#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const versions={governance:'/site-visual-governance-v2.css?v=20260824-readable-floor-plus2-v7',contentAxis:'/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5'};
const requiredDockOrder=['home','top','back','search','current','contact'];
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}

const runtimeBaseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;
const atomicMode=`mode: 'atomic-first-paint-${String(runtimeBaseline).toLowerCase()}'`;
const navigation=read('site-navigation.js');
const core=read('site-navigation-core.js');
const dockClosure=read('site-dock-share-runtime-v1.js');
const cooperationDockClosure=read('site-core-service-dock-closure-v1.js');
const consistency=read('site-ui-consistency-v1.js');
const materializer=read('scripts/materialize-global-language-v3.js');
const contentAxis=read('site-content-axis-v1.css');
const headerAxis=read('site-header-axis-v1.css');
const publicUi=read('site-translation-public-ui-v1.js');
const publicUiCss=read('site-translation-public-ui-v1.css');
const progress=read('site-translation-progress-v1.js');
const progressCss=read('site-translation-progress-v1.css');
const safe=read('site-translation-safe-runtime-v1.js');
const contentContrast=read('site-content-contrast-guard-v1.js');
const contentContrastCss=read('site-content-contrast-guard-v1.css');
const interactionContrast=read('site-interaction-contrast-guard-v1.js');
const home=read('index.html');
const experience=read('experience/index.html');

assert(navigation.includes(atomicMode),`Navigation wrapper is not ${runtimeBaseline}.`);
assert(navigation.includes("dockOrder: ['home','top','back','search','current','contact']"),'Navigation contract has the wrong Dock order.');
assert(navigation.includes('/site-navigation-core.js?v=20260824-contact-channel-v30'),'Navigation core cache key is stale.');
assert(navigation.includes('/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5'),'Content-axis cache key is stale.');
assert(navigation.includes('unifiedHeaderAxis: true'),'Unified header axis contract missing.');
assert(navigation.includes('headerAxisWidth: 1560'),'Header axis is not governed at 1560px.');
assert(dockClosure.includes("var order = ['home', 'top', 'back', 'search', 'current', 'contact'];"),'Dock closure order is stale.');
assert(!core.includes('data-action="share"'),'Duplicate official-site share button returned to the core Dock.');
assert(core.includes('data-action="back" type="button">回<br>上一层</button>'),'Core Dock back label is not 回上一层.');
assert(dockClosure.includes("back: '回<br>上一层'"),'Dock closure back label is not 回上一层.');
assert(cooperationDockClosure.includes("back:{html:'回<br>上一层',aria:'回上一层'}"),'Cooperation Dock back label is not 回上一层.');
assert(consistency.includes("setAttribute('aria-label','回上一层')"),'Dock accessibility label is not 回上一层.');

/* One public baseline owns fast translation, navigation and readability. */
assert(materializer.includes("const SAFE_VERSION = '20260826-translation-fast-reliable-v3'"),'Fast translation version owner missing.');
assert(materializer.includes("const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260826-translation-fast-reliable-v3'"),'Fast shared-shell cache owner missing.');
assert(materializer.includes("const NAVIGATION = '/site-navigation.js?v=20260826-search-navigation-contrast-v44'"),'Navigation V44 cache owner missing.');
assert(materializer.includes('<script defer data-qily-translation-safe-direct="inpage-v2"'),'Deferred safe translation runtime missing.');
assert(materializer.includes('/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3'),'Deterministic translation progress owner missing.');
assert(materializer.includes('/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'),'Content contrast V6 owner missing.');
assert(materializer.includes('data-qily-content-contrast-direct="v6"'),'Content contrast V6 static marker missing.');
assert(!materializer.includes('LEGACY_LANGUAGE_SRC'),'Retired translator is still owned by public materializer.');
assert(consistency.includes("BUILD_ID='20260826-translation-fast-reliable-v3'"),'Shared shell fast translation build missing.');
assert(consistency.includes("safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3'"),'Shared shell safe runtime is stale.');
assert(consistency.includes("contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'"),'Shared shell content contrast V6 CSS is stale.');
assert(consistency.includes("contentJs:'/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'"),'Shared shell content contrast V6 JS is stale.');
assert(safe.includes('function nearViewport(el)'),'Visible-first translation missing.');
assert(safe.includes('function retryFailed('),'Targeted translation retry missing.');
assert(safe.includes("setState('error','翻译未完整完成，已恢复中文原文')"),'Mixed initial translation is not fail-closed.');
assert(safe.includes("ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'"),'Translation endpoint reuse missing.');

let last=-1;
for(const action of requiredDockOrder){const position=core.indexOf(`data-action="${action}"`);assert(position>last,`Core Dock action is missing or out of order: ${action}`);last=position}

assert(contentAxis.includes('--qily-content-axis:1560px'),'Unified 1560px content axis is missing.');
assert(contentAxis.includes('overflow-wrap:anywhere!important'),'Long-content wrapping guard is missing.');
assert(headerAxis.includes('--qily-header-axis:var(--qily-content-axis,1560px)'),'Header does not inherit the 1560px content axis.');
assert(headerAxis.includes('word-break:keep-all!important'),'Navigation CJK no-break guard missing.');
assert(headerAxis.includes('@media (max-width:900px){'),'Mobile header recovery breakpoint missing.');
assert(headerAxis.includes('touch-action:pan-x pan-y!important'),'Mobile navigation touch-panning contract missing.');

assert(publicUi.includes('measuredTextWidth'),'Selected-language measured width guard missing.');
assert(publicUi.includes('data-qily-language-name-complete'),'Selected-language completeness state missing.');
assert(publicUiCss.includes('overflow-x:auto!important'),'Navigation horizontal movement is not enabled.');
assert(publicUiCss.includes('max-width:420px!important'),'Long selected language can still be clipped on desktop.');
assert(progress.includes('Translation Progress Notice V2'),'Translation progress V2 missing.');
assert(progress.includes('if(unchanged)return'),'Translation progress notice can still endlessly reset.');
assert(progressCss.includes('pointer-events:none'),'Translation progress notice must remain non-blocking.');
assert(interactionContrast.includes("setAttribute('data-qily-interaction-contrast'"),'Interactive contrast guard missing.');
assert(contentContrast.includes('Sitewide Content Contrast Guard V7'),'Static content contrast V7 runtime missing.');
assert(contentContrast.includes('data-qily-content-contrast-fixed'),'Static content contrast guard missing.');
assert(contentContrast.includes('function renderedForeground(style)'),'Rendered text-fill inspection missing.');
assert(!contentContrast.includes("style&&style.backgroundImage&&style.backgroundImage!=='none'"),'Generic gradient still bypasses contrast correction.');
assert(contentContrastCss.includes('.rule-table thead :is(th,td)'),'Shared dark table header fallback missing.');
assert(contentContrastCss.includes('--ql-dark-title:#fff'),'Dark-surface text token missing.');

assert(home.includes('<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->'),'Homepage C919 V4 start marker missing.');
assert(home.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START')<home.indexOf('<section class="hero">'),'C919 is not the first homepage content visual.');
assert(home.includes('/qilylean/c919-strategy-hero-v14.png?v=20260826-c919-crossbrowser-v1'),'Homepage latest V14 aircraft visual asset/cache key missing.');
assert(!home.includes('c919-strategy-hero-v14.webp'),'Homepage still references retired V14 WebP source.');

const officialUrls=['https://www.jinggon.com/','https://www.gdgaosheng.cn/','https://www.masonled.com/','https://www.mason-led.com/','https://www.eaton.com.cn/cn/zh-cn/products/electronic-components/circuit-protection/fuses.html','https://flex.com/zh/'];
for(const url of officialUrls)assert(experience.includes(`href="${url}"`),`Experience official link missing: ${url}`);

let navigationPages=0;const stale=[];
for(const relative of trackedHtml()){
  const html=read(relative);
  if(html.includes('data-qily-dock-firstpaint-lock'))stale.push(`${relative}: retired Dock first-paint lock`);
  if(/分享<br>官网|data-action=["']share["']/.test(html))stale.push(`${relative}: duplicate official-site share`);
  if(/\/site-navigation\.js(?:\?v=[^"']*)?/.test(html))navigationPages+=1;
  if(/\/site-visual-governance-v2\.css(?:\?v=[^"']*)?/.test(html)&&!html.includes(versions.governance))stale.push(`${relative}: readability governance cache`);
  if(/\/site-content-axis-v1\.css(?:\?v=[^"']*)?/.test(html)&&!html.includes(versions.contentAxis))stale.push(`${relative}: content-axis cache`);
}
assert(navigationPages>=460,`Navigation coverage unexpectedly fell to ${navigationPages} pages.`);
assert(stale.length===0,`Stale public shell entries: ${stale.slice(0,20).join(', ')}`);
process.stdout.write(`PASS: sitewide remediation validates ${navigationPages} navigation pages plus fast fail-closed translation, content contrast V7 readable surfaces and mobile navigation (${runtimeBaseline}).\n`);
