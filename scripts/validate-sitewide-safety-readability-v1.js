#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function requireText(source,token,label){assert(source.includes(token),`${label}: missing ${token}`)}
function forbidText(source,token,label){assert(!source.includes(token),`${label}: forbidden ${token}`)}

const safe=read('site-translation-safe-runtime-v1.js');
requireText(safe,'__qilyTranslationSafeInPageV1','Safe in-page runtime');
requireText(safe,"var SOURCE='zh-CN'",'Chinese source contract');
requireText(safe,'noExternalProxy:true','No-external-proxy contract');
requireText(safe,"runtime:'safe-inpage-v2'",'Safe runtime V2');
requireText(safe,"ENDPOINT_KEY='qily_translation_preferred_endpoint_v2'",'Endpoint reuse');
requireText(safe,'function nearViewport(el)','Visible-first translation');
requireText(safe,'function retryFailed(','Targeted translation retry');
requireText(safe,"setState('error','翻译未完整完成，已恢复中文原文')",'Incomplete translation fails closed');
requireText(safe,"setState('idle',languageName(target))",'Translation completion clears partial state');
forbidText(safe,'https://translate.google.com','External translator redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');

const shell=read('site-ui-consistency-v1.js');
requireText(shell,'__qilyUiConsistencyV4','Shared shell V4');
requireText(shell,"BUILD_ID='20260826-translation-fast-reliable-v3'",'Fast reliable shared shell');
requireText(shell,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260826-translation-fast-reliable-v3'",'Fresh safe runtime fallback');
requireText(shell,"progressJs:'/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3'",'Fresh progress runtime fallback');
requireText(shell,"contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v5'",'Content contrast V5 shell fallback');
forbidText(shell,"LANGUAGE_JS='/site-global-language-v3.js",'Legacy translator shell loader');

const navigation=read('site-navigation.js');
requireText(navigation,"var SEARCH_RUNTIME_SRC = '/site-search.js?v=20260826-search-navigation-v2'",'Fresh site-search runtime');
requireText(navigation,'siteSearchDirectNavigation: true','Search navigation contract');
requireText(navigation,'terminologySingleCanonicalStrip: true','Single terminology strip contract');

const search=read('site-search.js');
requireText(search,"results.addEventListener('click'",'Search result click bridge');
requireText(search,"window.__qilyPersistentNavigate",'Persistent native search navigation');
requireText(search,"location.assign(target.href)",'Search navigation fallback');

const integrity=read('site-integrity-hotfix-v1.js');
requireText(integrity,"var staticNote = d.getElementById('qilyTerminologyStaticCount')",'Static terminology canonical note');
requireText(integrity,"if (liveNote && liveNote !== staticNote) liveNote.remove()",'Duplicate terminology note removal');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const SAFE_VERSION = '20260826-translation-fast-reliable-v3'",'Fast materializer runtime');
requireText(materializer,'<script defer data-qily-translation-safe-direct="inpage-v2"','Translation runtime does not block HTML parsing');
requireText(materializer,'/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3','Fresh translation progress runtime');
requireText(materializer,'data-qily-content-contrast-direct="v5"','Content contrast V5 marker');
requireText(materializer,'removeLegacyTranslatorScripts','Legacy translator stripping');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'Translation Progress Notice V2','Progress notice V2');
requireText(progress,'if(unchanged)return','Progress notice timer stability');
requireText(progress,'Translation did not complete; the full Chinese source has been restored.','English fail-closed notice');

const contentJs=read('site-content-contrast-guard-v1.js');
requireText(contentJs,'return(size>=24||(size>=18.66&&weight>=700))?3:4.5','WCAG-oriented text contrast thresholds');
requireText(contentJs,'data-qily-content-contrast-fixed','Runtime content contrast correction');
requireText(contentJs,'function hasOpaqueLocalSurface(style,el)','Nested local-surface guard');
const contentCss=read('site-content-contrast-guard-v1.css');
requireText(contentCss,'[data-qily-light-surface="true"]','Explicit light-surface CSS guard');
requireText(contentCss,'-webkit-text-fill-color:#fff!important','Chromium/Safari light text guard');

const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Full-site translation capacity');

process.stdout.write('PASS: sitewide contracts cover fast fail-closed translation, deterministic search opening, one terminology strip, and readable dark/light surfaces.\n');
