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
requireText(safe,"runtime:'safe-inpage-v3'",'Source-recovery translation runtime version');
requireText(safe,"ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'",'Endpoint reuse');
requireText(safe,'function nearViewport(el)','Visible-first translation priority');
requireText(safe,'10,1800,3','Visible-first small batches');
requireText(safe,'20,5200,3','Background throughput batches');
requireText(safe,'function retryFailed(','Targeted retry contract');
requireText(safe,'function recoverChinese(reason)','Atomic Chinese source recovery');
requireText(safe,"if(text.length<2&&!/[\\u3400-\\u9fff]/.test(text))return false",'Single-Han UI translation coverage');
requireText(safe,"setState('idle','中文原文')",'Source recovery returns to clean idle state');
forbidText(safe,"setState('error'",'Source mode public error overlay');
requireText(safe,'function restoreChinese()','Immediate Chinese restore');
requireText(safe,'activeAbort.abort()','Translation cancellation');
requireText(safe,"select.addEventListener('pointerdown',warmEndpoint",'Endpoint prewarm on user intent');
forbidText(safe,'https://translate.google.com','External Google redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy redirect');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');

const consistency=read('site-ui-consistency-v1.js');
requireText(consistency,'__qilyUiConsistencyV5','Shared shell V5');
requireText(consistency,"BUILD_ID='20260827-translation-dock-closure-v5'",'Translation/Dock shared-shell build');
requireText(consistency,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260827-source-recovery-v4'",'Source-recovery safe runtime fallback');
requireText(consistency,"progressJs:'/site-translation-progress-v1.js?v=20260827-source-recovery-v4'",'Source-clean progress fallback');
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
requireText(navigation,"version: '20260827-translation-dock-resource-v46'",'Translation/Dock navigation V46 contract');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'Translation Progress Notice V3','Progress V3');
requireText(progress,'lastState','Stable notice state');
requireText(progress,'if(unchanged)return','No repeated hide-timer reset');
requireText(progress,'function sourceIsSettled()','Source-mode clean-state guard');
requireText(progress,'hideNow();return','Settled Chinese source hides progress notice');
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
requireText(materializer,"const SAFE_VERSION = '20260827-source-recovery-v4'",'Source-recovery materializer runtime version');
requireText(materializer,"const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260827-translation-dock-resource-v46'",'Translation/Dock shared-shell cache bust');
requireText(materializer,"const NAVIGATION = '/site-navigation.js?v=20260827-translation-dock-resource-v46'",'Translation/Dock navigation cache bust');
requireText(materializer,"const HEADER_AXIS='/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'",'Unified header-axis cache bust');
requireText(materializer,"const PUBLIC_UI_CSS='/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Unified public UI cache bust');
requireText(materializer,"const PROGRESS_JS='/site-translation-progress-v1.js?v=20260827-source-recovery-v4'",'Source-clean progress cache bust');
requireText(materializer,"const CONTENT_CONTRAST_CSS='/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Fresh V6 content contrast CSS');
requireText(materializer,"const CONTENT_CONTRAST_JS='/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6'",'Fresh V6 content contrast JS');
requireText(materializer,'<script defer data-qily-translation-safe-direct="inpage-v3"','Translation runtime is non-blocking');
requireText(materializer,'data-qily-translation-progress-direct="bilingual-v3"','Source-clean translation progress marker');
requireText(materializer,'data-qily-translation-public-ui-direct="visitor-v2"','Static public UI');
requireText(materializer,'data-qily-content-contrast-direct="v6"','Static content contrast V6');
requireText(materializer,'removeLegacyManagedScripts','Legacy translator stripping');

const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Translation capacity for multi-page browsing');

process.stdout.write(`PASS: QilyLean public baseline ${runtimeBaseline} uses one primary-navigation visual contract, source-clean in-page translation V3, single-Han coverage, endpoint reuse, deterministic non-blocking progress, semantic Dock icons, full language labels and readable surfaces.\n`);
