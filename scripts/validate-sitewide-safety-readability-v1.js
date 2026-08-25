#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function requireText(source,token,label){assert(source.includes(token),`${label}: missing ${token}`)}
function forbidText(source,token,label){assert(!source.includes(token),`${label}: forbidden ${token}`)}

const safe = read('site-translation-safe-runtime-v1.js');
requireText(safe,'__qilyTranslationSafeInPageV1','Safe in-page runtime');
requireText(safe,"var SOURCE='zh-CN'",'Chinese source contract');
requireText(safe,'noExternalProxy:true','No-external-proxy contract');
requireText(safe,"'https://api.qilylean.com'",'First-party translation endpoint');
requireText(safe,"'https://ai-api.qilylean.com'",'Second first-party translation endpoint');
requireText(safe,"'https://qilylean-ai.dinghunter623.workers.dev'",'Worker fallback endpoint');
requireText(safe,"base+'/translate'",'In-page translation endpoint');
requireText(safe,"brand.textContent='网页翻译'",'Visitor translation label');
requireText(safe,"setState('error','翻译服务暂不可用，已保留中文')",'Failure stays on Chinese source');
requireText(safe,'function restoreChinese()','Immediate source restoration');
requireText(safe,'activeAbort.abort()','In-flight cancellation');
forbidText(safe,'https://translate.google.com','Safe runtime external Google redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Safe runtime translated proxy');
forbidText(safe,'location.assign','Safe runtime page escape');
forbidText(safe,'location.replace','Safe runtime page escape');
forbidText(safe,'window.open','Safe runtime popup escape');
forbidText(safe,'智能路由','Backend terminology in visitor runtime');
forbidText(safe,'国内线路','Backend terminology in visitor runtime');

const materializer = read('scripts/materialize-global-language-v3.js');
requireText(materializer,'data-qily-translation-safety-bootstrap="inpage-v1"','Fail-closed safety bootstrap');
requireText(materializer,'window.__qilyGlobalTranslationDualRouteV2=true','Legacy redirect runtime preemption');
requireText(materializer,"const SAFE_VERSION = '20260825-translation-safe-inpage-v1'",'Safe runtime version ownership');
requireText(materializer,'/site-translation-safe-runtime-v1.js?v=${SAFE_VERSION}','Safe runtime template ownership');
requireText(materializer,'/site-translation-public-ui-v1.css?v=20260825-public-language-picker-v5','Language picker V5 materialization');
requireText(materializer,'/site-translation-progress-v1.js?v=20260825-bilingual-progress-v2','Translation notice V2 materialization');
requireText(materializer,'/site-content-contrast-guard-v1.css?v=20260825-sitewide-content-contrast-v1','Content contrast CSS materialization');
requireText(materializer,'/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v1','Content contrast JS materialization');
const bootstrapPos=materializer.indexOf('data-qily-translation-safety-bootstrap="inpage-v1"');
const safePos=materializer.indexOf('data-qily-translation-safe-direct="inpage-v1"');
const legacyPos=materializer.indexOf('data-qily-web-translate-direct="dual-route-v2"');
assert(bootstrapPos>=0&&safePos>bootstrapPos&&legacyPos>safePos,'Safety bootstrap/runtime must precede legacy compatibility runtime.');

const publicUi = read('site-translation-public-ui-v1.js');
requireText(publicUi,'measuredTextWidth','Rendered selected-language measurement');
requireText(publicUi,'data-qily-language-name-complete','Full selected-language visibility state');
requireText(publicUi,"viewport<=760?Math.min(360,viewport-70):420",'Deep-page language width allowance');
requireText(publicUi,"if(badge)badge.remove()",'Internal badge removal');
requireText(publicUi,"control.setAttribute('aria-label','网页翻译')",'Public-only control label');

const publicCss = read('site-translation-public-ui-v1.css');
requireText(publicCss,'max-width:420px!important','Desktop long-language allowance');
requireText(publicCss,'min-width:var(--qily-language-select-width,148px)!important','Measured language minimum width');
requireText(publicCss,'overflow-x:auto!important','Navigation horizontal movement');
requireText(publicCss,'height:10px!important','Visible navigation scrollbar');

const progress = read('site-translation-progress-v1.js');
requireText(progress,'翻译服务暂不可用，已保留中文','Bilingual failure notice');
requireText(progress,'Translation unavailable — the Chinese page remains available.','English failure notice');
requireText(progress,'部分内容暂未翻译','Partial translation notice');

const contentJs = read('site-content-contrast-guard-v1.js');
requireText(contentJs,'return(size>=24||(size>=18.66&&weight>=700))?3:4.5','WCAG-oriented text contrast thresholds');
requireText(contentJs,'data-qily-content-contrast-fixed','Runtime content contrast correction');
requireText(contentJs,"header,.qily-site-header,.qily-global-header",'Header exclusion from content guard');
const contentCss = read('site-content-contrast-guard-v1.css');
requireText(contentCss,'#qilyTerminologyStaticCount','Terminology info-strip first-paint guard');
requireText(contentCss,'-webkit-text-fill-color:#173f49!important','Chromium/Safari dark text guard');
requireText(contentCss,'-webkit-text-fill-color:#fff!important','Chromium/Safari light text guard');

const terminology = read('knowledge/terminology.html');
requireText(terminology,'id="qilyTerminologyStaticCount"','Terminology static information strip');

process.stdout.write('PASS: translation stays inside QilyLean, selected languages remain readable, and non-interactive content contrast is governed.\n');
