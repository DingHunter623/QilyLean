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
requireText(safe,"setState('error','翻译服务暂不可用，已保留中文')",'Fail-closed visitor message');
requireText(safe,'function restoreChinese()','Immediate Chinese restore');
requireText(safe,'activeAbort.abort()','Translation cancellation');
forbidText(safe,'https://translate.google.com','External Google redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy redirect');
forbidText(safe,'location.assign','Translation page escape');
forbidText(safe,'location.replace','Translation page escape');
forbidText(safe,'window.open','Translation popup escape');
forbidText(safe,'智能路由','Backend term in visitor runtime');
forbidText(safe,'国内线路','Backend term in visitor runtime');

const consistency=read('site-ui-consistency-v1.js');
requireText(consistency,'__qilyUiConsistencyV4','Shared shell V4');
requireText(consistency,"BUILD_ID='20260825-mobile-navigation-recovery-v1'",'Shared mobile recovery baseline');
requireText(consistency,"safeRuntime:'/site-translation-safe-runtime-v1.js?v=20260825-translation-safe-inpage-v2'",'Safe runtime fallback');
requireText(consistency,"publicCss:'/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7'",'Public UI mobile recovery CSS fallback');
requireText(consistency,"publicJs:'/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6'",'Public UI JS fallback');
requireText(consistency,"headerCss:'/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3'",'Header-axis mobile recovery fallback');
requireText(consistency,"progressJs:'/site-translation-progress-v1.js?v=20260825-bilingual-progress-v3'",'Progress fallback');
requireText(consistency,"contentCss:'/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v5'",'Content contrast V5 CSS fallback');
requireText(consistency,"contentJs:'/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v5'",'Content contrast V5 JS fallback');
requireText(consistency,'function preemptRetiredTranslation()','Retired translator preemption');
requireText(consistency,'script[src*="/site-global-language-v3.js"]','Stale translator removal');
forbidText(consistency,"LANGUAGE_JS='/site-global-language-v3.js",'Shared shell legacy translator loader');

const navigation=read('site-navigation.js');
requireText(navigation,'function isChineseSourceMode()','Navigation language gate');
requireText(navigation,atomicMode,`Protected navigation baseline ${runtimeBaseline}`);
requireText(navigation,'unifiedHeaderAxis: true','Unified header axis contract');
requireText(navigation,'headerAxisWidth: 1560','Header axis width');
requireText(navigation,"var CONSISTENCY_SRC = '/site-ui-consistency-v1.js?v=20260826-search-navigation-contrast-v44'",'Fresh shared-shell runtime');
requireText(navigation,"var SEARCH_RUNTIME_SRC = '/site-search.js?v=20260826-search-navigation-v2'",'Fresh direct site-search runtime');
requireText(navigation,"var INTEGRITY_SRC = '/site-integrity-hotfix-v1.js?v=20260826-public-integrity-v2'",'Public integrity V2 runtime');
requireText(navigation,"loadScript('qilySiteSearchRuntimeV2', SEARCH_RUNTIME_SRC)",'Site search preloads before core fallback');
requireText(navigation,'siteSearchDirectNavigation: true','Search navigation build contract');
requireText(navigation,'terminologySingleCanonicalStrip: true','Single terminology strip contract');

const search=read('site-search.js');
requireText(search,"mask.dataset.qilyR6PostRank = 'true'",'Retired post-ranker suppression');
requireText(search,"results.addEventListener('click'",'Search result navigation event');
requireText(search,"event.stopImmediatePropagation()",'Search click isolation');
requireText(search,"window.__qilyPersistentNavigate",'Persistent/native navigation bridge');
requireText(search,"location.assign(target.href)",'Native navigation fallback');

const integrity=read('site-integrity-hotfix-v1.js');
requireText(integrity,"var BUILD = '20260826-public-integrity-v2'",'Public integrity V2 build');
requireText(integrity,"var staticNote = d.getElementById('qilyTerminologyStaticCount')",'Canonical static terminology strip');
requireText(integrity,"if (liveNote && liveNote !== staticNote) liveNote.remove()",'Duplicate terminology strip removal');
requireText(integrity,"data-qily-light-surface",'Explicit light-surface semantics');

const headerAxis=read('site-header-axis-v1.css');
requireText(headerAxis,'--qily-header-axis:var(--qily-content-axis,1560px)','1560px header axis');
requireText(headerAxis,'word-break:keep-all!important','Navigation no-break');
requireText(headerAxis,'@media (max-width:900px){','Mobile header recovery breakpoint');
requireText(headerAxis,'flex:0 0 auto!important','Mobile navigation flex reset');
requireText(headerAxis,'min-height:46px!important','Mobile navigation height floor');
requireText(headerAxis,'touch-action:pan-x pan-y!important','Mobile navigation touch panning');

const publicUi=read('site-translation-public-ui-v1.js');
requireText(publicUi,'measuredTextWidth','Measured selected language');
requireText(publicUi,'data-qily-language-name-complete','Selected language completeness');
requireText(publicUi,"viewport<=760?Math.min(360,viewport-70):420",'Deep-page width allowance');
requireText(publicUi,"if(badge)badge.remove()",'Backend badge removal');
requireText(publicUi,"control.setAttribute('aria-label','网页翻译')",'Public translation label');

const publicCss=read('site-translation-public-ui-v1.css');
requireText(publicCss,'max-width:420px!important','Long language width allowance');
requireText(publicCss,'overflow-x:auto!important','Horizontal navigation movement');
requireText(publicCss,'height:10px!important','Visible horizontal scrollbar');
requireText(publicCss,'::-webkit-scrollbar-thumb','Draggable scrollbar thumb');
requireText(publicCss,'.qily-web-translate__status{display:none!important}','Internal status hidden');
requireText(publicCss,'@media (max-width:900px){','Final mobile navigation guard');
requireText(publicCss,'min-height:46px!important','Final mobile navigation height floor');
requireText(publicCss,'touch-action:pan-x pan-y!important','Final mobile navigation touch panning');
requireText(publicCss,'::before{display:none!important}','Mobile navigation spacer removal');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'正在翻译，请稍候','Chinese progress notice');
requireText(progress,'Translating — a brief delay may occur.','English progress notice');
requireText(progress,'翻译服务暂不可用，已保留中文','Failure notice');
const progressCss=read('site-translation-progress-v1.css');
requireText(progressCss,'pointer-events:none','Non-blocking notice');

const interaction=read('site-interaction-contrast-guard-v1.js');
requireText(interaction,"setAttribute('data-qily-interaction-contrast'",'Interactive contrast correction');
requireText(interaction,'if(current>=4.5)','Interactive WCAG AA threshold');
const content=read('site-content-contrast-guard-v1.js');
requireText(content,'data-qily-content-contrast-fixed','Static content contrast correction');
requireText(content,'?3:4.5','WCAG-oriented contrast thresholds');
requireText(content,'function isVisualSurface(el,style)','Visual surface ownership guard');
requireText(content,"style.backgroundImage&&style.backgroundImage!=='none'",'Gradient/image background detection');
requireText(content,'function hasOpaqueLocalSurface(style,el)','Nested opaque light-surface guard');
requireText(content,"data-qily-light-surface",'Explicit light-surface recognition');
requireText(content,'if(isVisualSurface(current,style))return !localSurface','Nested light surface overrides ancestor hero ownership');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const BASELINE_VERSION = '20260825-mobile-navigation-recovery-v1'",'Materializer mobile recovery version');
requireText(materializer,"const SAFE_VERSION = '20260825-translation-safe-inpage-v2'",'Materializer safe runtime version');
requireText(materializer,"const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260826-search-navigation-contrast-v44'",'Materializer shared-shell cache bust');
requireText(materializer,"const NAVIGATION = '/site-navigation.js?v=20260826-search-navigation-contrast-v44'",'Materializer search navigation cache bust');
requireText(materializer,"const HEADER_AXIS = '/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3'",'Materializer mobile header version');
requireText(materializer,"const PUBLIC_UI_CSS = '/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7'",'Materializer mobile public CSS version');
requireText(materializer,"const CONTENT_CONTRAST_CSS = '/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v5'",'Materializer content contrast V5 CSS');
requireText(materializer,"const CONTENT_CONTRAST_JS = '/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v5'",'Materializer content contrast V5 JS');
requireText(materializer,'data-qily-translation-safety-bootstrap="inpage-v2"','Static safety bootstrap');
requireText(materializer,'data-qily-translation-safe-direct="inpage-v2"','Static safe runtime');
requireText(materializer,'data-qily-translation-public-ui-direct="visitor-v2"','Static public UI');
requireText(materializer,'data-qily-content-contrast-direct="v5"','Static content contrast V5');
requireText(materializer,'removeLegacyTranslatorScripts','Legacy translator stripping');
forbidText(materializer,'<script defer ${LEGACY_MARKER}','Legacy translator emission');
forbidText(materializer,'LEGACY_LANGUAGE_SRC','Legacy translator source ownership');

const dock=read('site-dock-share-runtime-v1.js');
requireText(dock,'function sourceMode()','Dock language gate');
const parentNav=read('site-parent-navigation-v3.js');
requireText(parentNav,'function sourceMode()','Parent navigation language gate');

process.stdout.write(`PASS: QilyLean public baseline ${runtimeBaseline} uses safe in-page translation, complete language labels, deterministic search navigation, fresh shared shell, single terminology metadata, mobile touch navigation, and nested-surface readability guards.\n`);
