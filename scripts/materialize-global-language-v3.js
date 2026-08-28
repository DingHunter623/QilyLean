#!/usr/bin/env node
'use strict';

/* QilyLean Sitewide Public Baseline Materializer V21｜2026-08-29
 * R9 visual remediation baseline:
 * - Chinese remains the authoritative source and default display.
 * - translation assets remain deferred and never block first paint.
 * - navigation V45 owns navigation/search; Header Axis V1.1 owns explicit horizontal nav scrolling.
 * - Dock V5.2 alone owns Dock structure/labels/actions; all pseudo-label duplication is retired.
 * - Interaction Semantics V1.2 distinguishes routes/static content and links evidence grades to projects.
 * - Pure DDZ R9 Closure V129 stabilizes brand paint and centers the local card group.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const checkOnly=process.argv.includes('--check');
const BASELINE_VERSION='20260829-r9-visual-remediation-v21';
const SAFE_VERSION='20260828-long-page-resilience-v5';
const CONSISTENCY='/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7';
const NAVIGATION='/site-navigation.js?v=20260828-r7-navigation-v45';
const PARENT_NAV='/site-parent-navigation-v3.js?v=20260825-language-runtime-compat-v42';
const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260829-authority-v52';
const CORE_SERVICE_DOCK='/site-core-service-dock-closure-v1.js?v=20260828-r7-alignment-v105';
const LANGUAGE_CSS='/site-global-language-v1.css?v=20260825-public-translation-shell-v1';
const SAFE_RUNTIME=`/site-translation-safe-runtime-v1.js?v=${SAFE_VERSION}`;
const HEADER_AXIS='/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5';
const PROGRESS_CSS='/site-translation-progress-v1.css?v=20260827-source-recovery-v4';
const PROGRESS_JS='/site-translation-progress-v1.js?v=20260828-long-page-resilience-v5';
const PUBLIC_UI_CSS='/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8';
const PUBLIC_UI_JS='/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6';
const INTERACTION_CONTRAST_CSS='/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2';
const INTERACTION_CONTRAST_JS='/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2';
const CONTENT_CONTRAST_CSS='/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6';
const CONTENT_CONTRAST_JS='/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6';
const UNIFIED_VISUAL_CSS='/site-unified-visual-governance-v1.css?v=20260826-contrast-closure-v2';
const REGRESSION_CLOSURE_CSS='/site-visual-regression-closure-v1.css?v=20260826-screenshot-closure-v2';
const STABILITY_RECOVERY_CSS='/site-stability-recovery-v1.css?v=20260828-vi-surface-v3';
const PUBLIC_REDLINE_CSS='/site-public-redline-closure-v1.css?v=20260828-home-dock-v2';
const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260828-dock-functional-public-v131';
const INTERACTION_SEMANTICS_CSS='/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12';
const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12';
const DDZ_CLOSURE_CSS='/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r9-v129';
const WECHAT_CONTACT_ASSET='/assets/contact/wechat-contact-card.svg?v=20260826-official-restored-v2';

function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}
function removeScriptByMarker(source){return source.replace(/\s*<script\b[^>]*(?:data-qily-global-language-direct|data-qily-google-translate-direct|data-qily-web-translate-direct|data-qily-translation-progress-direct|data-qily-translation-public-ui-direct|data-qily-interaction-contrast-direct|data-qily-content-contrast-direct|data-qily-translation-safe-direct|data-qily-contact-route-direct|data-qily-interaction-semantics-direct|data-qily-translation-safety-bootstrap)[^>]*>[\s\S]*?<\/script>\s*/gi,'\n')}
function removeLegacyManagedScripts(source){let next=source;next=next.replace(/\s*<script\b[^>]*src=["'][^"']*\/site-global-language-v3\.js[^"']*["'][^>]*><\/script>\s*/gi,'\n');next=next.replace(/\s*<script\b[^>]*src=["'][^"']*\/site-contact-route-v1\.js[^"']*["'][^>]*><\/script>\s*/gi,'\n');next=next.replace(/\s*<script\b[^>]*src=["'][^"']*\/site-interaction-semantics-v1\.js[^"']*["'][^>]*><\/script>\s*/gi,'\n');return next}
function removeManagedStyles(source){
  const paths=['site-global-language-v1.css','site-header-axis-v1.css','site-translation-progress-v1.css','site-translation-public-ui-v1.css','site-interaction-contrast-guard-v1.css','site-content-contrast-guard-v1.css','site-unified-visual-governance-v1.css','site-visual-regression-closure-v1.css','site-stability-recovery-v1.css','site-public-redline-closure-v1.css','site-interaction-semantics-v1.css','tools/pure-ddz/game/css/r8-closure-v128.css'];
  let next=source;
  for(const file of paths){const pattern=new RegExp('\\s*<link\\b[^>]*href=["\\\'][^"\\\']*\\/'+file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^"\\\']*["\\\'][^>]*>\\s*','gi');next=next.replace(pattern,'\n')}
  return next;
}
function neutralizeFirstPaint(source){const safe='<!-- QILY-R2-FIRST-PAINT:START -->\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-stale-document body{visibility:visible!important}</style><script data-qily-r2-first-paint>(function(d){var BUILD=\'20260824-readable-floor-plus2-v4\';var e=d.documentElement;e.classList.remove("qily-stale-document","qily-shell-pending","qily-r2-first-paint-pending","qily-first-paint-pending");try{localStorage.setItem("qily_site_html_build_v2",BUILD);sessionStorage.removeItem("qily_site_refresh_attempt_v1")}catch(error){}})(document);</script>\n<!-- QILY-R2-FIRST-PAINT:END -->';if(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/i.test(source))return source.replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/gi,safe);return source}
function materialize(source,relative){
  let next=source;
  next=neutralizeFirstPaint(next);
  next=next.replace(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/g,CONSISTENCY);
  next=next.replace(/\/site-navigation\.js(?:\?v=[^"']*)?/g,NAVIGATION);
  next=next.replace(/\/site-parent-navigation-v3\.js(?:\?v=[^"']*)?/g,PARENT_NAV);
  next=next.replace(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/g,DOCK_SHARE);
  next=next.replace(/\/site-core-service-dock-closure-v1\.js(?:\?v=[^"']*)?/g,CORE_SERVICE_DOCK);
  next=next.replace(/\/assets\/contact\/wechat-contact-card\.svg(?:\?v=[^"']*)?/g,WECHAT_CONTACT_ASSET);
  next=removeScriptByMarker(next);
  next=removeLegacyManagedScripts(next);
  next=removeManagedStyles(next);
  const tags=[
    '<script data-qily-translation-safety-bootstrap="inpage-v4">window.__qilyGlobalTranslationDualRouteV2=true;window.__qilyGoogleTranslateOnDemandV1=true;window.__qilyGlobalLanguageV31=true;window.__qilyGlobalLanguageV3=true;window.__qilyGlobalLanguageV2=true;window.__qilyGlobalLanguageV1=true;</script>',
    `<link id="qilyGlobalLanguageV1Stylesheet" rel="stylesheet" href="${LANGUAGE_CSS}">`,
    `<link id="qilyHeaderAxisV1" rel="stylesheet" href="${HEADER_AXIS}">`,
    `<link id="qilyTranslationProgressV1Stylesheet" rel="stylesheet" href="${PROGRESS_CSS}">`,
    `<link id="qilyTranslationPublicUiV1Stylesheet" rel="stylesheet" href="${PUBLIC_UI_CSS}">`,
    `<link id="qilyInteractionContrastGuardV1Stylesheet" rel="stylesheet" href="${INTERACTION_CONTRAST_CSS}">`,
    `<link id="qilyContentContrastGuardV1Stylesheet" rel="stylesheet" href="${CONTENT_CONTRAST_CSS}">`,
    `<link id="qilyUnifiedVisualGovernanceV1Stylesheet" rel="stylesheet" href="${UNIFIED_VISUAL_CSS}">`,
    `<link id="qilyVisualRegressionClosureV1Stylesheet" rel="stylesheet" href="${REGRESSION_CLOSURE_CSS}">`,
    `<link id="qilyStabilityRecoveryV1Stylesheet" rel="stylesheet" href="${STABILITY_RECOVERY_CSS}">`,
    `<link id="qilyPublicRedlineClosureV1" rel="stylesheet" href="${PUBLIC_REDLINE_CSS}">`,
    `<link id="qilyInteractionSemanticsV1Stylesheet" rel="stylesheet" href="${INTERACTION_SEMANTICS_CSS}">`,
    relative==='tools/pure-ddz/index.html'?`<link id="qilyPureDdzR8ClosureV128" rel="stylesheet" href="${DDZ_CLOSURE_CSS}">`:'',
    `<script defer data-qily-translation-safe-direct="inpage-v4" src="${SAFE_RUNTIME}"></script>`,
    `<script defer data-qily-translation-public-ui-direct="visitor-v2" src="${PUBLIC_UI_JS}"></script>`,
    `<script defer data-qily-translation-progress-direct="bilingual-v4" src="${PROGRESS_JS}"></script>`,
    `<script defer data-qily-interaction-contrast-direct="v2" src="${INTERACTION_CONTRAST_JS}"></script>`,
    `<script defer data-qily-content-contrast-direct="v6" src="${CONTENT_CONTRAST_JS}"></script>`,
    `<script defer data-qily-interaction-semantics-direct="v1.2" src="${INTERACTION_SEMANTICS_JS}"></script>`,
    `<script defer data-qily-contact-route-direct="v13.1" src="${CONTACT_ROUTE_JS}"></script>`
  ].filter(Boolean).join('\n');
  if(/<\/head>/i.test(next))next=next.replace(/<\/head>/i,`${tags}\n</head>`);
  return next;
}

const changed=[];
for(const relative of trackedHtml()){
  const target=path.join(root,relative),source=fs.readFileSync(target,'utf8'),next=materialize(source,relative);
  if(next===source)continue;
  changed.push(relative);
  if(!checkOnly)fs.writeFileSync(target,next,'utf8');
}
if(checkOnly&&changed.length)throw new Error(`Sitewide R9 public baseline stale: ${changed.slice(0,30).join(', ')}${changed.length>30?` … +${changed.length-30}`:''}`);
process.stdout.write(`Sitewide public baseline ${checkOnly?'check passed':'materialized'}: ${changed.length} tracked HTML file(s); baseline ${BASELINE_VERSION}.\n`);
