#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function requireText(source,token,label){if(!source.includes(token))throw new Error(`${label}: missing ${token}`)}
function forbidText(source,token,label){if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)}

const runtimeBaseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;
const atomicMode=`mode: 'atomic-first-paint-${String(runtimeBaseline).toLowerCase()}'`;

const safe=read('site-translation-safe-runtime-v1.js');
requireText(safe,'__qilyTranslationSafeInPageV1','Safe translation runtime');
requireText(safe,"var SOURCE='zh-CN'",'Chinese authoritative source');
requireText(safe,'noExternalProxy:true','No external proxy contract');
requireText(safe,"brand.textContent='网页翻译'",'Visitor translation label');
requireText(safe,"base+'/translate'",'In-page translation endpoint');
requireText(safe,"runtime:'safe-inpage-v4'",'Long-page translation runtime version');
requireText(safe,"ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'",'Endpoint reuse');
requireText(safe,'function nearViewport(el)','Visible-first translation priority');
requireText(safe,'8,1400,2','Visible-first resilient batches');
requireText(safe,'12,2800,2','Background resilient batches');
requireText(safe,'function retryFailedAdaptive(','Adaptive failed-batch retry contract');
requireText(safe,'var passes=[{wait:320,items:6,chars:1200},{wait:700,items:3,chars:650},{wait:1200,items:1,chars:320}]','Progressive serial retry splitting');
requireText(safe,'function retryableStatus(status)','Retryable endpoint failure classification');
requireText(safe,'for(var i=0;i<order.length;i+=1)','All endpoint failover coverage');
requireText(safe,'function scheduleHealing(','Long-page background healing');
requireText(safe,"[900,2600,6200,12000]",'Multiple long-page healing passes');
requireText(safe,"setDocumentLanguage(target,'translated-partial')",'Partial translation remains in target-language mode');
requireText(safe,"已保留翻译结果",'Partial translation preservation UX');
forbidText(safe,'function recoverChinese(reason)','No whole-page rollback after target-language batch failure');
forbidText(safe,"recoverChinese('visible-translation-incomplete')",'No visible-batch whole-page rollback');
forbidText(safe,"recoverChinese('background-translation-incomplete')",'No background-batch whole-page rollback');
forbidText(safe,"recoverChinese('translation-service-unavailable')",'No service-failure whole-page rollback');
requireText(safe,"if(text.length<2&&!/[\\u3400-\\u9fff]/.test(text))return false",'Single-Han UI translation coverage');
requireText(safe,"setState('idle','中文原文')",'Explicit source restore returns to clean idle state');
forbidText(safe,"setState('error'",'Source mode public error overlay');
requireText(safe,'function restoreChinese()','Immediate explicit Chinese restore');
requireText(safe,'activeAbort.abort()','Translation cancellation');
requireText(safe,"select.addEventListener('pointerdown',warmEndpoint",'Endpoint prewarm on user intent');
forbidText(safe,'https://translate.google.com','External Google redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy redirect');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');

const consistency=read('site-ui-consistency-v1.js');
requireText(consistency,'__qilyUiConsistencyV5','Shared shell V5 compatibility');
requireText(consistency,"BUILD_ID='20260828-translation-resilience-v6'",'Translation-resilience shared-shell build');
requireText(consistency,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5'",'Long-page safe runtime fallback');
requireText(consistency,"progressJs:'/site-translation-progress-v1.js?v=20260828-long-page-resilience-v5'",'Resilient progress fallback');
requireText(consistency,"publicCss:'/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Unified public UI CSS fallback');
requireText(consistency,"headerCss:'/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'",'Unified header CSS fallback');
requireText(consistency,"contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Content contrast V6 CSS fallback');
requireText(consistency,"contentJs:'/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'",'Content contrast V6 JS fallback');
requireText(consistency,'function preemptRetiredTranslation()','Retired translator preemption');
requireText(consistency,"normalizeDockButton(top,'top','顶部')",'Top Dock semantic normalization');
requireText(consistency,"normalizeDockButton(back,'back','上一层')",'Back Dock semantic normalization');
requireText(consistency,'qily-dock-semantic-icon','Language-neutral Dock icon');
forbidText(consistency,"LANGUAGE_JS='/site-global-language-v3.js",'Shared shell legacy translator loader');

const navigation=read('site-navigation.js');
requireText(navigation,'function isChineseSourceMode()','Navigation language gate');
requireText(navigation,atomicMode,`Protected navigation baseline ${runtimeBaseline}`);
requireText(navigation,'unifiedHeaderAxis: true','Unified header axis contract');
requireText(navigation,'primaryNavigationUnifiedVisualContract: true','Unified primary-navigation visual contract');
requireText(navigation,'mobilePrimaryNavigationMayShrinkTypography: false','Mobile primary navigation typography parity');
requireText(navigation,'siteSearchDirectNavigation: true','Search navigation build contract');
requireText(navigation,"version: '20260827-primary-navigation-unified-v44'",'Primary-navigation V44 contract');

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

const interaction=read('site-interaction-contrast-guard-v1.js');
requireText(interaction,"setAttribute('data-qily-interaction-contrast'",'Interactive contrast correction');
const content=read('site-content-contrast-guard-v1.js');
requireText(content,'data-qily-content-contrast-fixed','Static content contrast correction');
requireText(content,'function hasOpaqueLocalSurface(style,el)','Nested local-surface guard');
requireText(content,'function renderedForeground(style)','Rendered foreground detection');
forbidText(content,"style&&style.backgroundImage&&style.backgroundImage!=='none'",'Generic gradient blanket exclusion');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const SAFE_VERSION = '20260828-long-page-resilience-v5'",'Long-page materializer runtime version');
requireText(materializer,"const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260828-translation-resilience-v47'",'Translation-resilience shared-shell cache bust');
requireText(materializer,"const NAVIGATION = '/site-navigation.js?v=20260827-translation-dock-resource-v46'",'Translation/Dock navigation cache bust');
requireText(materializer,"const HEADER_AXIS='/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'",'Unified header-axis cache bust');
requireText(materializer,"const PUBLIC_UI_CSS='/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Unified public UI cache bust');
requireText(materializer,"const PROGRESS_JS='/site-translation-progress-v1.js?v=20260828-long-page-resilience-v5'",'Resilient progress cache bust');
requireText(materializer,"const CONTENT_CONTRAST_CSS='/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Fresh V6 content contrast CSS');
requireText(materializer,"const CONTENT_CONTRAST_JS='/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'",'Fresh V6 content contrast JS');
requireText(materializer,'<script defer data-qily-translation-safe-direct="inpage-v4"','Translation runtime is non-blocking');
requireText(materializer,'data-qily-translation-progress-direct="bilingual-v4"','Resilient translation progress marker');
requireText(materializer,'data-qily-translation-public-ui-direct="visitor-v2"','Static public UI');
requireText(materializer,'data-qily-content-contrast-direct="v6"','Static content contrast V6');
requireText(materializer,'removeLegacyManagedScripts','Legacy translator stripping');

/* Worker efficiency and terminology contract: cache each unique source string so adaptive browser batches reuse translations. */
const worker=read('cloudflare-worker/worker-social.js');
requireText(worker,"const TRANSLATION_CACHE_VERSION = 'v3'",'Per-string translation cache version');
requireText(worker,'async function hashTranslationText(text)','Per-string cache hashing');
requireText(worker,'async function readTranslationCache(env, targetLanguage, texts)','Per-string cache reads');
requireText(worker,'async function writeTranslationCache(env, targetLanguage, entries)','Per-string cache writes');
requireText(worker,'const missingTextToIndexes = new Map()','Duplicate source-string deduplication');
requireText(worker,'const uniqueMissingTexts = [...missingTextToIndexes.keys()]','Only unique misses reach provider');
requireText(worker,'for (const sourceIndex of indexes) translations[sourceIndex] = translated','Original-order translation reassembly');
requireText(worker,'cache: { hits: cacheHits, misses: uniqueMissingTexts.length }','Translation cache diagnostics');
forbidText(worker,'hashTranslationBatch(','Batch-level cache hashing must not return');
for (const term of ['APQP','PPAP','PFMEA','DFMEA','FMEA','SPC','MSA','GR&R','DOE','DVP&R','Run@Rate','MTBF','MTTR','Kanban','Heijunka','Jidoka','Andon','CMMS']) {
  requireText(worker,`'${term}'`,`Protected manufacturing term ${term}`);
}
requireText(worker,'Use established professional terminology for lean manufacturing, industrial engineering, NPI, quality engineering, production operations and digital manufacturing','Professional manufacturing translation instruction');

const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Translation capacity for multi-page browsing');

process.stdout.write(`PASS: QilyLean public baseline ${runtimeBaseline} uses resilient in-page translation V4 plus Worker V3 string-level cache: visible-first progressive translation, all-endpoint failover, adaptive batch splitting, preserved partial results, background healing, cross-batch cache reuse, manufacturing glossary protection, semantic Dock icons and readable surfaces.\n`);