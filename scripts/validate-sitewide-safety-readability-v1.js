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
requireText(safe,"brand.textContent='网页翻译'",'Public translation label');
requireText(safe,"setState('error','翻译服务暂不可用，已保留中文')",'Failure stays on Chinese source');
forbidText(safe,'https://translate.google.com','External translator redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');
forbidText(safe,'智能路由','Backend term in public runtime');
forbidText(safe,'国内线路','Backend term in public runtime');

const shell=read('site-ui-consistency-v1.js');
requireText(shell,'__qilyUiConsistencyV4','Shared shell V4');
requireText(shell,"BUILD_ID='20260825-mobile-navigation-recovery-v1'",'Mobile recovery shared shell');
requireText(shell,'function preemptRetiredTranslation()','Retired translator preemption');
requireText(shell,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260825-translation-safe-inpage-v2'",'Safe runtime shell fallback');
requireText(shell,"publicCss:'/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7'",'Mobile recovery public CSS fallback');
requireText(shell,"headerCss:'/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3'",'Mobile recovery header CSS fallback');
requireText(shell,"contentCss:'/site-content-contrast-guard-v1.css?v=20260825-sitewide-content-contrast-v3'",'Content contrast V3 shell fallback');
requireText(shell,"contentJs:'/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v3'",'Content contrast V3 JS shell fallback');
forbidText(shell,"LANGUAGE_JS='/site-global-language-v3.js",'Legacy translator shell loader');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const BASELINE_VERSION = '20260825-mobile-navigation-recovery-v1'",'Mobile recovery materializer baseline');
requireText(materializer,'data-qily-translation-safety-bootstrap="inpage-v2"','Fail-closed safety bootstrap');
requireText(materializer,'data-qily-translation-safe-direct="inpage-v2"','Safe runtime materialization');
requireText(materializer,'/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3','Mobile header-axis materialization');
requireText(materializer,'/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7','Mobile public CSS materialization');
requireText(materializer,'/site-translation-progress-v1.js?v=20260825-bilingual-progress-v3','Translation notice V3 materialization');
requireText(materializer,'/site-content-contrast-guard-v1.css?v=20260825-sitewide-content-contrast-v3','Content contrast V3 CSS materialization');
requireText(materializer,'/site-content-contrast-guard-v1.js?v=20260825-sitewide-content-contrast-v3','Content contrast V3 JS materialization');
requireText(materializer,'data-qily-content-contrast-direct="v3"','Content contrast V3 marker');
requireText(materializer,'removeLegacyTranslatorScripts','Legacy translator stripping');
forbidText(materializer,'LEGACY_LANGUAGE_SRC','Legacy translator source emitted by materializer');

const publicUi=read('site-translation-public-ui-v1.js');
requireText(publicUi,'measuredTextWidth','Rendered selected-language measurement');
requireText(publicUi,'data-qily-language-name-complete','Full selected-language visibility state');
requireText(publicUi,"viewport<=760?Math.min(360,viewport-70):420",'Deep-page language width allowance');
requireText(publicUi,"if(badge)badge.remove()",'Internal badge removal');
const publicCss=read('site-translation-public-ui-v1.css');
requireText(publicCss,'max-width:420px!important','Desktop long-language allowance');
requireText(publicCss,'overflow-x:auto!important','Navigation horizontal movement');
requireText(publicCss,'height:10px!important','Visible desktop navigation scrollbar');
requireText(publicCss,'@media (max-width:900px){','Mobile navigation final-cascade guard');
requireText(publicCss,'flex:0 0 auto!important','Mobile navigation flex reset');
requireText(publicCss,'min-height:46px!important','Mobile navigation height floor');
requireText(publicCss,'touch-action:pan-x pan-y!important','Mobile navigation touch panning');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'翻译服务暂不可用，已保留中文','Bilingual failure notice');
requireText(progress,'Translation unavailable — the Chinese page remains available.','English failure notice');
requireText(progress,'部分内容暂未翻译','Partial translation notice');

const contentJs=read('site-content-contrast-guard-v1.js');
requireText(contentJs,'return(size>=24||(size>=18.66&&weight>=700))?3:4.5','WCAG-oriented text contrast thresholds');
requireText(contentJs,'data-qily-content-contrast-fixed','Runtime content contrast correction');
requireText(contentJs,"COMPONENT_OWNED_DARK='.hero,.module-hero,.daily-hero,.project-hero,.cooperation-hero,.qily-ia-dark,.closing,[data-qily-dark-surface],[data-theme=\"dark\"]'",'Gradient/dark surface ownership');
requireText(contentJs,'function componentOwnsContrast(el)','Dark surface ownership guard');
requireText(contentJs,"if(componentOwnsContrast(el)){release(el);return}",'Auto contrast cannot recolor component-owned dark surfaces');
const contentCss=read('site-content-contrast-guard-v1.css');
requireText(contentCss,'#qilyTerminologyStaticCount','Terminology info-strip first-paint guard');
requireText(contentCss,'-webkit-text-fill-color:#173f49!important','Chromium/Safari dark text guard');
requireText(contentCss,'-webkit-text-fill-color:#fff!important','Chromium/Safari light text guard');

const terminology=read('knowledge/terminology.html');
requireText(terminology,'id="qilyTerminologyStaticCount"','Terminology static information strip');

process.stdout.write('PASS: source contracts cover fail-closed translation, complete language labels, mobile touch navigation, interaction readability, static-content readability and component-owned dark surfaces.\n');
