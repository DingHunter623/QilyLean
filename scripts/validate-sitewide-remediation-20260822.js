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
const contentContrast=read('site-content-contrast-guard-v1.js');
const interactionContrast=read('site-interaction-contrast-guard-v1.js');
const home=read('index.html');
const experience=read('experience/index.html');

assert(navigation.includes("mode: 'atomic-first-paint-v38'"),'Navigation wrapper is not V38.');
assert(navigation.includes("dockOrder: ['home','top','back','search','current','contact']"),'Navigation contract has the wrong Dock order.');
assert(navigation.includes('/site-navigation-core.js?v=20260824-contact-channel-v30'),'Navigation core cache key is stale.');
assert(navigation.includes('/site-navigation-legacy-20260802.js?v=20260822-dock-back-label-v23'),'Navigation legacy cache key is stale.');
assert(read('site-navigation-legacy-20260802.js').includes('/site-navigation-core.js?v=20260824-contact-channel-v30'),'Legacy navigation core cache key is stale.');
assert(navigation.includes('/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5'),'Content-axis cache key is stale.');
assert(navigation.includes('unifiedHeaderAxis: true'),'Unified header axis contract missing.');
assert(navigation.includes('headerAxisWidth: 1560'),'Header axis is not governed at 1560px.');
assert(dockClosure.includes("var order = ['home', 'top', 'back', 'search', 'current', 'contact'];"),'Dock closure order is stale.');
assert(!core.includes('data-action="share"'),'Duplicate official-site share button returned to the core Dock.');
assert(core.includes('data-action="back" type="button">回<br>上一层</button>'),'Core Dock back label is not 回上一层.');
assert(!core.includes('返回<br>上一层'),'Core Dock returned to the retired 返回上一层 label.');
assert(dockClosure.includes("back: '回<br>上一层'"),'Dock closure back label is not 回上一层.');
assert(cooperationDockClosure.includes("back:{html:'回<br>上一层',aria:'回上一层'}"),'Cooperation Dock back label is not 回上一层.');
assert(consistency.includes("setAttribute('aria-label','回上一层')"),'Dock accessibility label is not 回上一层.');

/* One public baseline owns translation safety, full language labels, navigation scrolling and readability. */
assert(materializer.includes("const BASELINE_VERSION = '20260825-sitewide-baseline-reconcile-v1'"),'Unified baseline version owner missing.');
assert(materializer.includes("const SAFE_VERSION = '20260825-translation-safe-inpage-v2'"),'Safe translation version owner missing.');
assert(materializer.includes('/site-navigation.js?v=20260825-language-runtime-compat-v42'),'Navigation V42 cache owner missing.');
assert(materializer.includes('/site-ui-consistency-v1.js?v=${BASELINE_VERSION}'),'Shared-shell baseline cache owner missing.');
assert(materializer.includes('data-qily-translation-safety-bootstrap="inpage-v2"'),'Safety bootstrap missing.');
assert(materializer.includes('data-qily-translation-safe-direct="inpage-v2"'),'Safe translation runtime missing.');
assert(materializer.includes('/site-header-axis-v1.css?v=20260825-header-axis-nav-fit-v2'),'Header-axis materialization owner missing.');
assert(materializer.includes('/site-translation-progress-v1.js?v=20260825-bilingual-progress-v3'),'Translation progress materialization owner missing.');
assert(materializer.includes('/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6'),'Public translation UI materialization owner missing.');
assert(materializer.includes('/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2'),'Interaction contrast owner missing.');
assert(materializer.includes('/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v2'),'Content contrast owner missing.');
assert(materializer.includes('removeLegacyTranslatorScripts'),'Legacy translator stripping missing.');
assert(!materializer.includes('LEGACY_LANGUAGE_SRC'),'Retired translator is still owned by public materializer.');
assert(!materializer.includes('<script defer ${LEGACY_MARKER}'),'Retired translator is still emitted.');
assert(consistency.includes("safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260825-translation-safe-inpage-v2'"),'Shared shell does not fail safe to in-page translation.');
assert(!consistency.includes("LANGUAGE_JS='/site-global-language-v3.js"),'Shared shell still loads retired translator.');

let last=-1;
for(const action of requiredDockOrder){const position=core.indexOf(`data-action="${action}"`);assert(position>last,`Core Dock action is missing or out of order: ${action}`);last=position}

assert(contentAxis.includes('--qily-content-axis:1560px'),'Unified 1560px content axis is missing.');
assert(contentAxis.includes('overflow-wrap:anywhere!important'),'Long-content wrapping guard is missing.');
assert(contentAxis.includes('white-space:normal!important'),'Natural content wrapping guard is missing.');
assert(contentAxis.includes('.article-hub-inner'),'Article-hub content axis guard is missing.');
assert(contentAxis.includes('.daily-hero,.daily-index-section,.daily-single-section'),'Daily hero/content alignment guard is missing.');
assert(contentAxis.includes('-webkit-text-fill-color:#fff!important'),'Number-badge white text guard is missing.');
assert(contentAxis.includes('background-color:#0f6570!important'),'Number-badge brand-teal background guard is missing.');

assert(headerAxis.includes('--qily-header-axis:var(--qily-content-axis,1560px)'),'Header does not inherit the 1560px content axis.');
assert(headerAxis.includes('max-width:var(--qily-header-axis)!important'),'Header maximum width guard missing.');
assert(headerAxis.includes('word-break:keep-all!important'),'Navigation CJK no-break guard missing.');
assert(headerAxis.includes('font-size:clamp(18px,1.35vw,20px)!important'),'Desktop navigation fit font guard missing.');

assert(publicUi.includes("if(badge)badge.remove()"),'Internal translation badge is still exposed to visitors.');
assert(publicUi.includes('status.hidden=true'),'Internal translation status is still exposed to visitors.');
assert(publicUi.includes('measuredTextWidth'),'Selected-language measured width guard missing.');
assert(publicUi.includes('data-qily-language-name-complete'),'Selected-language completeness state missing.');
assert(publicUiCss.includes('overflow-x:auto!important'),'Navigation horizontal movement is not enabled.');
assert(publicUiCss.includes('scrollbar-width:auto!important'),'Firefox horizontal movement bar is not explicit.');
assert(publicUiCss.includes('scrollbar-color:#0f6570 #e8f2f0!important'),'Horizontal movement bar lacks governed contrast.');
assert(publicUiCss.includes('::-webkit-scrollbar-thumb'),'Chromium/Safari draggable navigation thumb missing.');
assert(publicUiCss.includes('height:10px!important'),'Desktop navigation movement bar is not visually explicit.');
assert(publicUiCss.includes('max-width:420px!important'),'Long selected language can still be clipped on desktop.');

assert(progress.includes('正在翻译，请稍候'),'Chinese translation progress copy missing.');
assert(progress.includes('Translating — a brief delay may occur.'),'English translation progress copy missing.');
assert(progress.includes('翻译服务暂不可用，已保留中文'),'Translation failure copy missing.');
assert(progressCss.includes('pointer-events:none'),'Translation progress notice must remain non-blocking.');
assert(interactionContrast.includes('data-qily-interaction-contrast-fixed'),'Interactive contrast guard missing.');
assert(contentContrast.includes('data-qily-content-contrast-fixed'),'Static content contrast guard missing.');

assert(home.includes('<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->'),'Homepage C919 V4 start marker missing.');
assert(home.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START')<home.indexOf('<section class="hero">'),'C919 is not the first homepage content visual.');
assert(home.includes('/qilylean/c919-strategy-hero-v14.png'),'Homepage latest V14 aircraft visual asset missing.');

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
process.stdout.write(`PASS: sitewide remediation validates ${navigationPages} navigation pages and one unified safe translation/readability baseline.\n`);
