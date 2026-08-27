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
requireText(safe,"runtime:'safe-inpage-v3'",'Safe runtime V3');
requireText(safe,"ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'",'Endpoint reuse');
requireText(safe,'function nearViewport(el)','Visible-first translation');
requireText(safe,'function retryFailed(','Targeted translation retry');
requireText(safe,'function recoverChinese(reason)','Atomic source recovery');
requireText(safe,"if(text.length<2&&!/[\\u3400-\\u9fff]/.test(text))return false",'Single Han UI fragments remain translatable');
requireText(safe,"setState('idle','中文原文')",'Source recovery returns public state to idle');
forbidText(safe,"setState('error'",'Source recovery must not leave public error state');
forbidText(safe,'https://translate.google.com','External translator redirect');forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy');forbidText(safe,'location.assign','Translation page escape');forbidText(safe,'location.replace','Translation page escape');forbidText(safe,'window.open','Translation popup escape');

const shell=read('site-ui-consistency-v1.js');
requireText(shell,'__qilyUiConsistencyV5','Shared shell V5');
requireText(shell,"BUILD_ID='20260827-translation-dock-closure-v5'",'Translation/Dock shared shell');
requireText(shell,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260827-source-recovery-v4'",'Fresh safe runtime fallback');
requireText(shell,"progressJs:'/site-translation-progress-v1.js?v=20260827-source-recovery-v4'",'Fresh progress runtime fallback');
requireText(shell,"normalizeDockButton(top,'top','顶部')",'Dock top semantic normalization');
requireText(shell,"normalizeDockButton(back,'back','上一层')",'Dock back semantic normalization');
requireText(shell,'qily-dock-semantic-icon','Language-neutral Dock icon');
requireText(shell,"publicCss:'/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Unified public UI CSS');
requireText(shell,"contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6'",'Content contrast fallback');
forbidText(shell,"LANGUAGE_JS='/site-global-language-v3.js",'Legacy translator shell loader');

const navigation=read('site-navigation.js');
requireText(navigation,"var SEARCH_RUNTIME_SRC = '/site-search.js?v=20260826-search-navigation-v2'",'Fresh site-search runtime');
requireText(navigation,"var CONSISTENCY_SRC = '/site-ui-consistency-v1.js?v=20260827-translation-dock-resource-v46'",'Fresh shared-shell cache owner');
requireText(navigation,'!w.__qilyUiConsistencyV5','Navigation waits for V5 shared shell');
requireText(navigation,'primaryNavigationUnifiedVisualContract: true','Primary-navigation parity contract');
requireText(navigation,'mobilePrimaryNavigationMayShrinkTypography: false','Mobile primary navigation cannot shrink typography');
requireText(navigation,'dockOrder: [\'home\',\'top\',\'back\',\'search\',\'current\',\'contact\']','Six-action Dock order');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const SAFE_VERSION = '20260827-source-recovery-v4'",'Source-recovery runtime owner');
requireText(materializer,"const NAVIGATION = '/site-navigation.js?v=20260827-translation-dock-resource-v46'",'Navigation cache owner');
requireText(materializer,"const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260827-translation-dock-resource-v46'",'Shared-shell cache owner');
requireText(materializer,'data-qily-translation-safe-direct="inpage-v3"','Deferred translation V3 marker');
requireText(materializer,'data-qily-translation-progress-direct="bilingual-v3"','Progress V3 marker');
requireText(materializer,'/site-translation-progress-v1.js?v=20260827-source-recovery-v4','Fresh progress runtime');
requireText(materializer,'removeLegacyManagedScripts','Legacy translator stripping');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'Translation Progress Notice V3','Progress notice V3');
requireText(progress,'function sourceIsSettled()','Source-mode notice suppression');
requireText(progress,'hideNow();return','Settled Chinese source stays visually clean');
const progressCss=read('site-translation-progress-v1.css');requireText(progressCss,'bottom:max(16px,env(safe-area-inset-bottom))','Progress notice avoids header/Hero');requireText(progressCss,'pointer-events:none','Progress notice remains non-blocking');

const contentJs=read('site-content-contrast-guard-v1.js');requireText(contentJs,'data-qily-content-contrast-fixed','Runtime content contrast correction');requireText(contentJs,'function renderedForeground(style)','Rendered text-fill inspection');
const contentCss=read('site-content-contrast-guard-v1.css');requireText(contentCss,'.rule-table thead :is(th,td)','Shared dark table header fallback');requireText(contentCss,'--ql-dark-title:#fff','Dark-surface title token');
const wrangler=read('wrangler.toml');requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Full-site translation capacity');
process.stdout.write('PASS: sitewide contracts cover source-clean translation recovery V3, semantic Dock icons, six-action navigation, and protected readability.\n');