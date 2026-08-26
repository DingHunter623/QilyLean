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
requireText(safe,"runtime:'safe-inpage-v2'",'Fast translation runtime version');
requireText(safe,"ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'",'Endpoint reuse');
requireText(safe,'function nearViewport(el)','Visible-first translation priority');
requireText(safe,'10,1800,3','Visible-first small batches');
requireText(safe,'20,5200,3','Background throughput batches');
requireText(safe,'function retryFailed(','Targeted retry contract');
requireText(safe,"setState('error','翻译未完整完成，已恢复中文原文')",'Fail-closed incomplete translation');
requireText(safe,'function restoreChinese()','Immediate Chinese restore');
requireText(safe,'activeAbort.abort()','Translation cancellation');
requireText(safe,"select.addEventListener('pointerdown',warmEndpoint",'Endpoint prewarm on user intent');
forbidText(safe,'https://translate.google.com','External Google redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy redirect');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');

const consistency=read('site-ui-consistency-v1.js');
requireText(consistency,'__qilyUiConsistencyV4','Shared shell V4');
requireText(consistency,"BUILD_ID='20260826-translation-fast-reliable-v3'",'Fast translation shared-shell build');
requireText(consistency,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3'",'Fast safe runtime fallback');
requireText(consistency,"progressJs:'/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3'",'Deterministic progress fallback');
requireText(consistency,"publicCss:'/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7'",'Public UI CSS fallback');
requireText(consistency,"contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Content contrast V6 CSS fallback');
requireText(consistency,"contentJs:'/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'",'Content contrast V6 JS fallback');
requireText(consistency,'function preemptRetiredTranslation()','Retired translator preemption');
forbidText(consistency,"LANGUAGE_JS='/site-global-language-v3.js",'Shared shell legacy translator loader');

const navigation=read('site-navigation.js');
requireText(navigation,'function isChineseSourceMode()','Navigation language gate');
requireText(navigation,atomicMode,`Protected navigation baseline ${runtimeBaseline}`);
requireText(navigation,'unifiedHeaderAxis: true','Unified header axis contract');
requireText(navigation,'siteSearchDirectNavigation: true','Search navigation build contract');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'Translation Progress Notice V2','Progress V2');
requireText(progress,'lastState','Stable notice state');
requireText(progress,'if(unchanged)return','No repeated hide-timer reset');
requireText(progress,'翻译未完整完成，已恢复中文原文','Fail-closed visitor notice');
const progressCss=read('site-translation-progress-v1.css');
requireText(progressCss,'pointer-events:none','Non-blocking notice');

const publicUi=read('site-translation-public-ui-v1.js');
requireText(publicUi,'measuredTextWidth','Measured selected language');
requireText(publicUi,'data-qily-language-name-complete','Selected language completeness');
const publicCss=read('site-translation-public-ui-v1.css');
requireText(publicCss,'overflow-x:auto!important','Horizontal navigation movement');

const interaction=read('site-interaction-contrast-guard-v1.js');
requireText(interaction,"setAttribute('data-qily-interaction-contrast'",'Interactive contrast correction');
const content=read('site-content-contrast-guard-v1.js');
requireText(content,'Sitewide Content Contrast Guard V6','Content contrast V6 runtime');
requireText(content,'data-qily-content-contrast-fixed','Static content contrast correction');
requireText(content,'function hasOpaqueLocalSurface(style,el)','Nested local-surface guard');
requireText(content,'function renderedForeground(style)','Rendered foreground detection');
forbidText(content,"style&&style.backgroundImage&&style.backgroundImage!=='none'",'Generic gradient blanket exclusion');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const SAFE_VERSION = '20260826-translation-fast-reliable-v3'",'Fast materializer runtime version');
requireText(materializer,"const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260826-translation-fast-reliable-v3'",'Fast shared-shell cache bust');
requireText(materializer,"const PROGRESS_JS = '/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3'",'Fresh progress cache bust');
requireText(materializer,"const CONTENT_CONTRAST_CSS = '/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Fresh V6 content contrast CSS');
requireText(materializer,"const CONTENT_CONTRAST_JS = '/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'",'Fresh V6 content contrast JS');
requireText(materializer,'<script defer data-qily-translation-safe-direct="inpage-v2"','Translation runtime is non-blocking');
requireText(materializer,'data-qily-translation-public-ui-direct="visitor-v2"','Static public UI');
requireText(materializer,'data-qily-content-contrast-direct="v6"','Static content contrast V6');
requireText(materializer,'removeLegacyTranslatorScripts','Legacy translator stripping');

const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Translation capacity for multi-page browsing');

process.stdout.write(`PASS: QilyLean public baseline ${runtimeBaseline} uses visible-first fail-closed in-page translation, endpoint reuse, deterministic progress, non-blocking loading, full language labels and V6 readable surfaces.\n`);
