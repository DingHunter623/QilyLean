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
requireText(safe,'function retryFailedAdaptive(','Adaptive translation retry');
requireText(safe,'function scheduleHealing(','Background translation healing');
forbidText(safe,'https://translate.google.com','External translator redirect');
forbidText(safe,'https://qilylean-com.translate.goog','Translated proxy');

const shell=read('site-ui-consistency-v1.js');
requireText(shell,'__qilyUiConsistencyV7','Shared shell V7');
requireText(shell,'__qilyUiSingleResponsibilityV7','Single-responsibility contract');
forbidText(shell,'normalizeDockButton','Shared shell must not mutate Dock buttons');
forbidText(shell,'dockIconMarkup','Shared shell must not inject Dock icons');
forbidText(shell,'[data-action="back"]','Shared shell must not intercept Dock back action');

const dock=read('site-dock-share-runtime-v1.js');
requireText(dock,'Floating Dock Authoritative Runtime V5.2','Authoritative Dock V5.2');
requireText(dock,'__qilyFloatingDockUnifiedV52','Dock V5.2 guard');
requireText(dock,"ORDER=['home','top','back','search','current','contact']",'Canonical Dock order');
requireText(dock,'qily-dock-label','Single owned Dock label');
requireText(dock,"EXCLUDED=/^\\/tools\\/pure-ddz",'Pure DDZ Dock exclusion');
requireText(dock,'setOwnedLabel','Legacy Dock child replacement');
requireText(dock,'installAuthoritativeEvents','Dock capture-phase authority');
requireText(dock,'.qily-float-btn::before','Dock pseudo reset');
assert(!/new\s+MutationObserver\s*\(/.test(dock),'Authoritative Dock must not continuously rebuild DOM');

const navigation=read('site-navigation.js');
requireText(navigation,'r7DockSingleAuthority:true','Navigation defers Dock ownership');
requireText(navigation,'r7NoNavigationDockMutation:true','Navigation no-Dock-mutation contract');
assert(!/new\s+MutationObserver\s*\(/.test(navigation),'Navigation must not continuously rewrite shared UI');

const header=read('site-header-axis-v1.css');
requireText(header,'Global Header Axis V1.1','Header Axis V1.1');
requireText(header,'overflow-x:auto!important','Desktop horizontal navigation scroll');
requireText(header,'overflow-x:scroll!important','Mobile explicit horizontal navigation scroll');
requireText(header,'scrollbar-width:thin!important','Visible navigation scrollbar');
requireText(header,'--qily-nav-scroll-thumb:#0f4b5a','Navigation scrollbar VI token');

const semanticsCss=read('site-interaction-semantics-v1.css');
const semanticsJs=read('site-interaction-semantics-v1.js');
requireText(semanticsCss,'Interaction Semantics V1.2','Interaction semantics CSS V1.2');
requireText(semanticsCss,'[data-qily-interaction="route"]','Real-route feedback');
requireText(semanticsCss,'[data-qily-interaction="static"]','Static-term feedback suppression');
requireText(semanticsCss,'.qily-float-btn::before','Dock pseudo-label retirement');
forbidText(semanticsCss,'content:"回\\A顶部"','Duplicate Dock top pseudo label');
forbidText(semanticsCss,'content:"回\\A上一层"','Duplicate Dock back pseudo label');
requireText(semanticsCss,'.overview-card>.tag','Eight-waste sequence contrast guard');
requireText(semanticsJs,'__qilyInteractionSemanticsV12','Interaction semantics runtime V1.2');
requireText(semanticsJs,'PROJECT_EVIDENCE','Project evidence mapping');
requireText(semanticsJs,'addTrustLinks','Trust-to-project linkage');
requireText(semanticsJs,'injectProjectDetailGrade','Project evidence attribution');

const career=read('site-early-career-history-v1.js');
const careerCss=read('site-early-career-history-v1.css');
requireText(career,"var VERSION = 'v5'",'Career anchor runtime V5');
requireText(career,'function stickyHeaderOffset()','Measured sticky header offset');
requireText(career,'getBoundingClientRect().height','Rendered header measurement');
requireText(careerCss,'--qily-career-anchor-offset','Career CSS fallback offset');

const ddz=read('tools/pure-ddz/game/css/r8-closure-v128.css');
requireText(ddz,'Pure DDZ R9 Closure V129','DDZ R9 closure');
requireText(ddz,'.topbar .brand *','DDZ brand flicker suppression');
requireText(ddz,'width:max-content!important','Centered local card-group sizing');
requireText(ddz,'margin-left:auto!important','Centered local card-group margin');

const materializer=read('scripts/materialize-global-language-v3.js');
requireText(materializer,"const BASELINE_VERSION='20260829-r9-visual-remediation-v21'",'R9 global baseline owner');
requireText(materializer,"const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260829-authority-v52'",'Dock V5.2 cache owner');
requireText(materializer,"const HEADER_AXIS='/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'",'Header scroll cache owner');
requireText(materializer,"const INTERACTION_SEMANTICS_CSS='/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12'",'Interaction semantics CSS owner');
requireText(materializer,"const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12'",'Interaction semantics JS owner');
requireText(materializer,"const DDZ_CLOSURE_CSS='/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r9-v129'",'Pure DDZ R9 closure owner');
requireText(materializer,'data-qily-interaction-semantics-direct="v1.2"','Interaction semantics V1.2 marker');
requireText(materializer,'removeLegacyManagedScripts','Legacy translator stripping');

const contentCss=read('site-content-contrast-guard-v1.css');
requireText(contentCss,'--ql-dark-title:#fff','Dark-surface title token');
const wrangler=read('wrangler.toml');
requireText(wrangler,'TRANSLATE_DAILY_IP_LIMIT = "600"','Full-site translation capacity');

process.stdout.write('PASS: R9 safety/readability contracts cover Dock V5.2 uniform mobile geometry, explicit navigation scrolling, career anchor clearance, evidence-grade linkage, DDZ brand/hand stability and readable waste numbering.\n');
