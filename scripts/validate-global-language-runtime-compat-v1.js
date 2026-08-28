#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function requireText(source,token,label){if(!source.includes(token))throw new Error(`${label}: missing ${token}`)}
function forbidText(source,token,label){if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)}
function assert(ok,label){if(!ok)throw new Error(label)}

const runtimeBaseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;
const safe=read('site-translation-safe-runtime-v1.js');
requireText(safe,'__qilyTranslationSafeInPageV1','Safe translation runtime');
requireText(safe,"var SOURCE='zh-CN'",'Chinese authoritative source');
requireText(safe,'noExternalProxy:true','No external proxy contract');
requireText(safe,"brand.textContent='网页翻译'",'Visitor translation label');
requireText(safe,"base+'/translate'",'In-page translation endpoint');
requireText(safe,"runtime:'safe-inpage-v4'",'Long-page translation runtime version');
requireText(safe,"ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'",'Endpoint reuse');
requireText(safe,'function nearViewport(el)','Visible-first translation priority');
requireText(safe,'function retryFailedAdaptive(','Adaptive failed-batch retry contract');
requireText(safe,'function retryableStatus(status)','Retryable endpoint failure classification');
requireText(safe,'function scheduleHealing(','Long-page background healing');
requireText(safe,'[900,2600,6200,12000]','Multiple long-page healing passes');
requireText(safe,"setDocumentLanguage(target,'translated-partial')",'Partial translation remains in target-language mode');
requireText(safe,'function restoreChinese()','Immediate explicit Chinese restore');
requireText(safe,'activeAbort.abort()','Translation cancellation');
forbidText(safe,'function recoverChinese(reason)','No whole-page rollback after target-language batch failure');
forbidText(safe,'https://translate.google.com','External Google redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy redirect');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');

const consistency=read('site-ui-consistency-v1.js');
requireText(consistency,'__qilyUiConsistencyV7','Shared shell V7 compatibility');
requireText(consistency,"BUILD_ID='20260828-r7-single-responsibility-v7'",'R7 shared-shell build');
requireText(consistency,'__qilyUiSingleResponsibilityV7','Shared-shell single responsibility');
requireText(consistency,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5'",'Long-page safe runtime fallback');
requireText(consistency,"progressJs:'/site-translation-progress-v1.js?v=20260828-long-page-resilience-v5'",'Resilient progress fallback');
requireText(consistency,"publicCss:'/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Unified public UI CSS fallback');
requireText(consistency,"headerCss:'/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'",'Unified header CSS fallback');
requireText(consistency,"contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Content contrast V6 CSS fallback');
forbidText(consistency,'normalizeDockButton','Shared shell must not mutate Dock buttons');
forbidText(consistency,'dockIconMarkup','Shared shell must not inject Dock icons');
forbidText(consistency,'[data-action="back"]','Shared shell must not intercept Dock back action');
forbidText(consistency,"LANGUAGE_JS='/site-global-language-v3.js",'Shared shell legacy translator loader');

const navigation=read('site-navigation.js');
requireText(navigation,'function isChineseSourceMode()','Navigation language gate');
assert(new RegExp(`mode\\s*:\\s*['\"]atomic-first-paint-${String(runtimeBaseline).toLowerCase()}['\"]`).test(navigation),`Protected navigation baseline ${runtimeBaseline} missing`);
requireText(navigation,'navigation runtime v45','Navigation V45');
requireText(navigation,'unifiedHeaderAxis:true','Unified header axis contract');
requireText(navigation,'primaryNavigationUnifiedVisualContract:true','Unified primary-navigation visual contract');
requireText(navigation,'mobilePrimaryNavigationMayShrinkTypography:false','Mobile primary navigation typography parity');
requireText(navigation,'siteSearchDirectNavigation:true','Search navigation build contract');
requireText(navigation,"version:'20260828-r7-navigation-v45'",'Navigation V45 contract');
requireText(navigation,'r7DockSingleAuthority:true','Dock single authority contract');
requireText(navigation,'r7NoNavigationDockMutation:true','Navigation does not mutate Dock');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'Navigation must not continuously rewrite shared UI');

const dock=read('site-dock-share-runtime-v1.js');
requireText(dock,'Floating Dock Authoritative Runtime V5.1','Dock V5.1');
requireText(dock,"LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'}",'Canonical Dock wording');
requireText(dock,'installAuthoritativeEvents','Capture-phase Dock behavior authority');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Dock must not continuously rebuild DOM');

const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');
requireText(semanticsCss,'Interaction Semantics V1.1','Interaction semantics CSS');
requireText(semanticsCss,'content:"回\\A顶部"','Unified top visual label');
requireText(semanticsCss,'content:"回\\A上一层"','Unified back visual label');
requireText(semanticsCss,'[data-qily-interaction="static"]','Static term feedback suppression');
requireText(semanticsJs,'__qilyInteractionSemanticsV11','Interaction semantics runtime');
requireText(semanticsJs,'freezeStaticVisual','Static term visual freeze');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'Translation Progress Notice V4','Progress V4');
requireText(progress,'lastState','Stable notice state');
requireText(progress,'if(unchanged)return','No repeated hide-timer reset');
requireText(progress,'function sourceIsSettled()','Source-mode clean-state guard');
requireText(progress,'hideNow();return','Settled Chinese source hides progress notice');
requireText(progress,'Translated content is preserved while remaining sections retry.','Partial state does not imply rollback');
const progressCss=read('site-translation-progress-v1.css');
requireText(progressCss,'pointer-events:none','Non-blocking notice');
requireText(progressCss,'bottom:max(16px,env(safe-area-inset-bottom))','Progress notice avoids header/Hero');

const publicUi=read('site-translation-public-ui-v1.js');
requireText(publicUi,'measuredTextWidth','Measured selected language');
requireText(publicUi,'data-qily-language-name-complete','Selected language completeness');
const publicCss=read('site-translation-public-ui-v1.css');
requireText(publicCss,'overflow-x:auto!important','Horizontal navigation movement');
requireText(publicCss,'--qily-primary-nav-font-size:20px','Unified first-level navigation size');
requireText(publicCss,'--qily-primary-nav-font-weight:900','Unified first-level navigation weight');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const BASELINE_VERSION='20260828-r8-authoritative-v20'",'R8 materializer baseline');
requireText(materializer,"const SAFE_VERSION='20260828-long-page-resilience-v5'",'Long-page materializer runtime version');
requireText(materializer,"const CONSISTENCY='/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7'",'R7 shared-shell cache bust');
requireText(materializer,"const NAVIGATION='/site-navigation.js?v=20260828-r7-navigation-v45'",'Navigation V45 cache bust');
requireText(materializer,"const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260828-authority-v51'",'Dock V5.1 cache bust');
requireText(materializer,"const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260828-dock-functional-public-v131'",'Contact V13.1 cache bust');
requireText(materializer,"const INTERACTION_SEMANTICS_CSS='/site-interaction-semantics-v1.css?v=20260828-r8-semantics-v11'",'Interaction semantics CSS cache bust');
requireText(materializer,"const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260828-r8-semantics-v11'",'Interaction semantics JS cache bust');
requireText(materializer,'<script defer data-qily-translation-safe-direct="inpage-v4"','Translation runtime is non-blocking');
requireText(materializer,'data-qily-translation-progress-direct="bilingual-v4"','Resilient translation progress marker');
requireText(materializer,'data-qily-translation-public-ui-direct="visitor-v2"','Static public UI');
requireText(materializer,'data-qily-content-contrast-direct="v6"','Static content contrast V6');
requireText(materializer,'data-qily-interaction-semantics-direct="v1.1"','Interaction semantics marker');
requireText(materializer,'removeLegacyManagedScripts','Legacy translator stripping');

const worker=read('cloudflare-worker/worker-social.js');
requireText(worker,"const TRANSLATION_CACHE_VERSION = 'v3'",'Per-string translation cache version');
requireText(worker,'async function hashTranslationText(text)','Per-string cache hashing');
requireText(worker,'async function readTranslationCache(env, targetLanguage, texts)','Per-string cache reads');
requireText(worker,'async function writeTranslationCache(env, targetLanguage, entries)','Per-string cache writes');
requireText(worker,'const missingTextToIndexes = new Map()','Duplicate source-string deduplication');
requireText(worker,'const uniqueMissingTexts = [...missingTextToIndexes.keys()]','Only unique misses reach provider');
for (const term of ['APQP','PPAP','PFMEA','DFMEA','FMEA','SPC','MSA','GR&R','DOE','DVP&R','Run@Rate','MTBF','MTTR','Kanban','Heijunka','Jidoka','Andon','CMMS'])requireText(worker,`'${term}'`,`Protected manufacturing term ${term}`);

const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Translation capacity for multi-page browsing');
process.stdout.write(`PASS: QilyLean ${runtimeBaseline}/R8 runtime compatibility protects resilient in-page translation, Navigation V45, Dock V5.1 single authority, static-term semantics and manufacturing terminology.\n`);
