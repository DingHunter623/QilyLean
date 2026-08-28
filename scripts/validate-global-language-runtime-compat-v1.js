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
requireText(safe,'function retryFailedAdaptive(','Adaptive failed-batch retry contract');
requireText(safe,'function scheduleHealing(','Long-page background healing');
requireText(safe,"setDocumentLanguage(target,'translated-partial')",'Partial translation remains in target-language mode');
requireText(safe,'function restoreChinese()','Immediate explicit Chinese restore');
forbidText(safe,'function recoverChinese(reason)','No whole-page rollback after target-language batch failure');
forbidText(safe,'https://translate.google.com','External Google redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy redirect');

const consistency=read('site-ui-consistency-v1.js');
requireText(consistency,'__qilyUiConsistencyV7','Shared shell V7 compatibility');
requireText(consistency,'__qilyUiSingleResponsibilityV7','Shared-shell single responsibility');
forbidText(consistency,'normalizeDockButton','Shared shell must not mutate Dock buttons');
forbidText(consistency,'dockIconMarkup','Shared shell must not inject Dock icons');
forbidText(consistency,'[data-action="back"]','Shared shell must not intercept Dock back action');

const navigation=read('site-navigation.js');
requireText(navigation,'function isChineseSourceMode()','Navigation language gate');
assert(new RegExp(`mode\\s*:\\s*['\"]atomic-first-paint-${String(runtimeBaseline).toLowerCase()}['\"]`).test(navigation),`Protected navigation baseline ${runtimeBaseline} missing`);
requireText(navigation,'navigation runtime v45','Navigation V45');
requireText(navigation,'unifiedHeaderAxis:true','Unified header axis contract');
requireText(navigation,'primaryNavigationUnifiedVisualContract:true','Unified primary-navigation visual contract');
requireText(navigation,'r7DockSingleAuthority:true','Dock single authority contract');
requireText(navigation,'r7NoNavigationDockMutation:true','Navigation does not mutate Dock');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'Navigation must not continuously rewrite shared UI');

const header=read('site-header-axis-v1.css');
requireText(header,'Global Header Axis V1.1','Header Axis V1.1');
requireText(header,'overflow-x:auto!important','Desktop navigation scrolling');
requireText(header,'overflow-x:scroll!important','Mobile navigation scrolling');
requireText(header,'::-webkit-scrollbar','Visible WebKit navigation scrollbar');

const dock=read('site-dock-share-runtime-v1.js');
requireText(dock,'Floating Dock Authoritative Runtime V5.2','Dock V5.2');
requireText(dock,'__qilyFloatingDockUnifiedV52','Dock V5.2 guard');
requireText(dock,"ORDER=['home','top','back','search','current','contact']",'Canonical Dock order');
requireText(dock,'setOwnedLabel','Dock single-label ownership');
requireText(dock,'qily-dock-label','Dock owned label node');
requireText(dock,'installAuthoritativeEvents','Capture-phase Dock behavior authority');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Dock must not continuously rebuild DOM');

const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');
requireText(semanticsCss,'Interaction Semantics V1.2','Interaction semantics CSS');
requireText(semanticsCss,'[data-qily-interaction="static"]','Static term feedback suppression');
requireText(semanticsCss,'.qily-float-btn::before','Dock pseudo reset');
forbidText(semanticsCss,'content:"回\\A顶部"','Duplicate top pseudo label must stay retired');
forbidText(semanticsCss,'content:"回\\A上一层"','Duplicate back pseudo label must stay retired');
requireText(semanticsJs,'__qilyInteractionSemanticsV12','Interaction semantics runtime');
requireText(semanticsJs,'PROJECT_EVIDENCE','Project evidence mapping');
requireText(semanticsJs,'addTrustLinks','Trust project linkage');
requireText(semanticsJs,'freezeStaticVisual','Static term visual freeze');

const progress=read('site-translation-progress-v1.js');
requireText(progress,'Translation Progress Notice V4','Progress V4');
requireText(progress,'function sourceIsSettled()','Source-mode clean-state guard');
requireText(progress,'hideNow();return','Settled Chinese source hides progress notice');
const publicUi=read('site-translation-public-ui-v1.js');
requireText(publicUi,'measuredTextWidth','Measured selected language');
requireText(publicUi,'data-qily-language-name-complete','Selected language completeness');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const BASELINE_VERSION='20260829-r9-visual-remediation-v21'",'R9 materializer baseline');
requireText(materializer,"const SAFE_VERSION='20260828-long-page-resilience-v5'",'Long-page materializer runtime version');
requireText(materializer,"const NAVIGATION='/site-navigation.js?v=20260828-r7-navigation-v45'",'Navigation V45 cache bust');
requireText(materializer,"const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260829-authority-v52'",'Dock V5.2 cache bust');
requireText(materializer,"const HEADER_AXIS='/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'",'Header scrollbar cache bust');
requireText(materializer,"const INTERACTION_SEMANTICS_CSS='/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12'",'Interaction semantics CSS cache bust');
requireText(materializer,"const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12'",'Interaction semantics JS cache bust');
requireText(materializer,'<script defer data-qily-translation-safe-direct="inpage-v4"','Translation runtime is non-blocking');
requireText(materializer,'data-qily-translation-public-ui-direct="visitor-v2"','Static public UI');
requireText(materializer,'data-qily-content-contrast-direct="v6"','Static content contrast V6');
requireText(materializer,'data-qily-interaction-semantics-direct="v1.2"','Interaction semantics marker');
requireText(materializer,'removeLegacyManagedScripts','Legacy translator stripping');

const ddz=read('tools/pure-ddz/game/css/r8-closure-v128.css');
requireText(ddz,'Pure DDZ R9 Closure V129','DDZ R9 closure');
requireText(ddz,'.topbar .brand *','Brand flicker suppression');
requireText(ddz,'width:max-content!important','Local card-group centering');

const worker=read('cloudflare-worker/worker-social.js');
requireText(worker,"const TRANSLATION_CACHE_VERSION = 'v3'",'Per-string translation cache version');
requireText(worker,'async function hashTranslationText(text)','Per-string cache hashing');
requireText(worker,'const missingTextToIndexes = new Map()','Duplicate source-string deduplication');
for (const term of ['APQP','PPAP','PFMEA','DFMEA','FMEA','SPC','MSA','GR&R','DOE','DVP&R','Run@Rate','MTBF','MTTR','Kanban','Heijunka','Jidoka','Andon','CMMS'])requireText(worker,`'${term}'`,`Protected manufacturing term ${term}`);

const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Translation capacity for multi-page browsing');
process.stdout.write(`PASS: QilyLean ${runtimeBaseline}/R9 runtime compatibility protects resilient translation, Navigation V45, visible nav scrolling, Dock V5.2 single-label authority, project evidence semantics and DDZ visual stability.\n`);
