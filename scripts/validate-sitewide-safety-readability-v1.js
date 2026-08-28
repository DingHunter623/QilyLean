#!/usr/bin/env node
'use strict';
const fs=require('fs');const path=require('path');const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function requireText(source,token,label){assert(source.includes(token),`${label}: missing ${token}`)}
function forbidText(source,token,label){assert(!source.includes(token),`${label}: forbidden ${token}`)}

const safe=read('site-translation-safe-runtime-v1.js');
requireText(safe,'__qilyTranslationSafeInPageV2','Safe in-page runtime V2 compatibility');
requireText(safe,'__qilyTranslationSafeInPageV1','Safe in-page runtime V1 compatibility');
requireText(safe,"var SOURCE='zh-CN'",'Chinese source contract');
requireText(safe,'noExternalProxy:true','No-external-proxy contract');
requireText(safe,"runtime:'safe-inpage-v4'",'Safe runtime V4');
requireText(safe,"ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'",'Endpoint reuse');
requireText(safe,'function nearViewport(el)','Visible-first translation');
requireText(safe,'function retryFailedAdaptive(','Adaptive translation retry');
requireText(safe,'function retryableStatus(status)','Retryable endpoint classification');
requireText(safe,"setDocumentLanguage(target,'translated-partial')",'Partial target-language preservation');
requireText(safe,'function scheduleHealing(','Background translation healing');
requireText(safe,'[900,2600,6200,12000]','Repeated long-page healing');
forbidText(safe,'function recoverChinese(reason)','Whole-page rollback on translation failure');
forbidText(safe,'https://translate.google.com','External translator redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');

const shell=read('site-ui-consistency-v1.js');
requireText(shell,'__qilyUiConsistencyV7','Shared shell V7');
requireText(shell,"BUILD_ID='20260828-r7-single-responsibility-v7'",'R7 shared-shell build');
requireText(shell,'__qilyUiSingleResponsibilityV7','Single-responsibility contract');
requireText(shell,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260828-long-page-resilience-v5'",'Fresh resilient safe runtime fallback');
requireText(shell,"progressJs:'/site-translation-progress-v1.js?v=20260828-long-page-resilience-v5'",'Fresh resilient progress runtime fallback');
requireText(shell,"publicCss:'/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Unified public UI CSS');
requireText(shell,"contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Content contrast fallback');
forbidText(shell,'normalizeDockButton','Shared shell must not mutate Dock buttons');
forbidText(shell,'dockIconMarkup','Shared shell must not inject Dock icons');
forbidText(shell,'[data-action="back"]','Shared shell must not intercept Dock back action');
forbidText(shell,"LANGUAGE_JS='/site-global-language-v3.js",'Legacy translator shell loader');

const dock=read('site-dock-share-runtime-v1.js');
requireText(dock,'Floating Dock Authoritative Runtime V5','Authoritative Dock V5');
requireText(dock,"LABELS={home:'首页',top:'回顶部',back:'回上一层',search:'本站搜索',current:'分享当前页',contact:'联系我们'}",'Canonical Dock labels');
requireText(dock,"EXCLUDED=/^\\/tools\\/pure-ddz",'Pure DDZ Dock exclusion');
requireText(dock,'data-qily-dock="disabled"','Pure DDZ Dock disabled state');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Authoritative Dock must not continuously rebuild DOM');

const navigation=read('site-navigation.js');
requireText(navigation,"var SEARCH_RUNTIME_SRC = '/site-search.js?v=20260826-search-navigation-v2'",'Fresh site-search runtime');
requireText(navigation,'primaryNavigationUnifiedVisualContract: true','Primary-navigation parity contract');
requireText(navigation,'mobilePrimaryNavigationMayShrinkTypography: false','Mobile primary navigation cannot shrink typography');
requireText(navigation,"dockOrder: ['home','top','back','search','current','contact']",'Six-action Dock order');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const BASELINE_VERSION='20260828-r7-authoritative-v17'",'R7 global baseline owner');
requireText(materializer,"const SAFE_VERSION='20260828-long-page-resilience-v5'",'Long-page translation runtime owner');
requireText(materializer,"const CONSISTENCY='/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7'",'R7 shared-shell cache owner');
requireText(materializer,"const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260828-authority-v5'",'Dock V5 cache owner');
requireText(materializer,"const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260828-dock-functional-public-v13'",'Contact V13 cache owner');
requireText(materializer,"const PUBLIC_REDLINE_CSS='/site-public-redline-closure-v1.css?v=20260828-home-dock-v2'",'Redline V2 cache owner');
requireText(materializer,'data-qily-translation-safe-direct="inpage-v4"','Deferred translation V4 marker');
requireText(materializer,'data-qily-translation-progress-direct="bilingual-v4"','Progress V4 marker');
requireText(materializer,'data-qily-contact-route-direct="v13"','Contact V13 marker');
requireText(materializer,'removeLegacyManagedScripts','Legacy translator stripping');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'Translation Progress Notice V4','Progress notice V4');
requireText(progress,'function sourceIsSettled()','Source-mode notice suppression');
requireText(progress,'hideNow();return','Settled Chinese source stays visually clean');
requireText(progress,'Translated content is preserved while remaining sections retry.','Partial translation preservation notice');
const progressCss=read('site-translation-progress-v1.css');
requireText(progressCss,'bottom:max(16px,env(safe-area-inset-bottom))','Progress notice avoids header/Hero');
requireText(progressCss,'pointer-events:none','Progress notice remains non-blocking');

const contentJs=read('site-content-contrast-guard-v1.js');
requireText(contentJs,'data-qily-content-contrast-fixed','Runtime content contrast correction');
requireText(contentJs,'function renderedForeground(style)','Rendered text-fill inspection');
const contentCss=read('site-content-contrast-guard-v1.css');
requireText(contentCss,'.rule-table thead :is(th,td)','Shared dark table header fallback');
requireText(contentCss,'--ql-dark-title:#fff','Dark-surface title token');
const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Full-site translation capacity');

process.stdout.write('PASS: R7 safety/readability contracts cover resilient translation, single-responsibility UI shell, authoritative Dock V5, six-action navigation and protected content contrast.\n');
