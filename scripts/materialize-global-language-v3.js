#!/usr/bin/env node
'use strict';

/* QilyLean Sitewide Public Baseline Materializer V10｜2026-08-26
 * Recovery release:
 * - Chinese remains the authoritative source.
 * - Translation assets remain deferred.
 * - legacy first-paint forced refresh/body hiding is replaced by an instant non-blocking reveal guard.
 * - a lightweight site-shell recovery runtime restores the six-action Dock and direct /contact/ route.
 * - no MutationObserver/polling/reload is introduced by this materializer.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const checkOnly=process.argv.includes('--check');
const BASELINE_VERSION='20260826-site-recovery-v10';
const SAFE_VERSION='20260826-translation-fast-reliable-v3';
const CONSISTENCY='/site-ui-consistency-v1.js?v=20260826-translation-fast-reliable-v3';
const NAVIGATION='/site-navigation.js?v=20260826-search-navigation-contrast-v44';
const PARENT_NAV='/site-parent-navigation-v3.js?v=20260825-language-runtime-compat-v42';
const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260825-language-runtime-compat-v31';
const CORE_SERVICE_DOCK='/site-core-service-dock-closure-v1.js?v=20260826-contact-page-v103';
const LANGUAGE_CSS='/site-global-language-v1.css?v=20260825-public-translation-shell-v1';
const SAFE_RUNTIME=`/site-translation-safe-runtime-v1.js?v=${SAFE_VERSION}`;
const HEADER_AXIS='/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3';
const PROGRESS_CSS='/site-translation-progress-v1.css?v=20260825-bilingual-progress-v3';
const PROGRESS_JS='/site-translation-progress-v1.js?v=20260826-translation-fast-reliable-v3';
const PUBLIC_UI_CSS='/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7';
const PUBLIC_UI_JS='/site-translation-public-ui-v1.js?v=20260825-public-language-picker-v6';
const INTERACTION_CONTRAST_CSS='/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2';
const INTERACTION_CONTRAST_JS='/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2';
const CONTENT_CONTRAST_CSS='/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6';
const CONTENT_CONTRAST_JS='/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6';
const UNIFIED_VISUAL_CSS='/site-unified-visual-governance-v1.css?v=20260826-contrast-closure-v2';
const REGRESSION_CLOSURE_CSS='/site-visual-regression-closure-v1.css?v=20260826-screenshot-closure-v1';
const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260826-site-shell-recovery-v4';

function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean)}
function removeScriptByMarker(source){return source.replace(/\s*<script\b[^>]*(?:data-qily-global-language-direct|data-qily-google-translate-direct|data-qily-web-translate-direct|data-qily-translation-progress-direct|data-qily-translation-public-ui-direct|data-qily-interaction-contrast-direct|data-qily-content-contrast-direct|data-qily-translation-safe-direct|data-qily-contact-route-direct|data-qily-translation-safety-bootstrap)[^>]*>[\s\S]*?<\/script>\s*/gi,'\n')}
function removeLegacyManagedScripts(source){let next=source;next=next.replace(/\s*<script\b[^>]*src=["'][^"']*\/site-global-language-v3\.js[^"']*["'][^>]*><\/script>\s*/gi,'\n');next=next.replace(/\s*<script\b[^>]*src=["'][^"']*\/site-contact-route-v1\.js[^"']*["'][^>]*><\/script>\s*/gi,'\n');return next}
function removeManagedStyles(source){const patterns=[/\s*<link\b[^>]*href=["'][^"']*\/site-global-language-v1\.css[^"']*["'][^>]*>\s*/gi,/\s*<link\b[^>]*href=["'][^"']*\/site-header-axis-v1\.css[^"']*["'][^>]*>\s*/gi,/\s*<link\b[^>]*href=["'][^"']*\/site-translation-progress-v1\.css[^"']*["'][^>]*>\s*/gi,/\s*<link\b[^>]*href=["'][^"']*\/site-translation-public-ui-v1\.css[^"']*["'][^>]*>\s*/gi,/\s*<link\b[^>]*href=["'][^"']*\/site-interaction-contrast-guard-v1\.css[^"']*["'][^>]*>\s*/gi,/\s*<link\b[^>]*href=["'][^"']*\/site-content-contrast-guard-v1\.css[^"']*["'][^>]*>\s*/gi,/\s*<link\b[^>]*href=["'][^"']*\/site-unified-visual-governance-v1\.css[^"']*["'][^>]*>\s*/gi,/\s*<link\b[^>]*href=["'][^"']*\/site-visual-regression-closure-v1\.css[^"']*["'][^>]*>\s*/gi];let next=source;for(const pattern of patterns)next=next.replace(pattern,'\n');return next}

function neutralizeFirstPaint(source){
  const safe='<!-- QILY-R2-FIRST-PAINT:START -->\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-stale-document body{visibility:visible!important}</style><script data-qily-r2-first-paint>(function(d){var e=d.documentElement;e.classList.remove("qily-stale-document","qily-shell-pending","qily-r2-first-paint-pending","qily-first-paint-pending");try{localStorage.setItem("qily_site_html_build_v2","20260826-site-recovery-v10");sessionStorage.removeItem("qily_site_refresh_attempt_v1")}catch(error){}})(document);</script>\n<!-- QILY-R2-FIRST-PAINT:END -->';
  if(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/i.test(source))return source.replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/gi,safe);
  return source;
}

function materialize(source){
  let next=source;
  next=neutralizeFirstPaint(next);
  next=next.replace(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/g,CONSISTENCY);
  next=next.replace(/\/site-navigation\.js(?:\?v=[^"']*)?/g,NAVIGATION);
  next=next.replace(/\/site-parent-navigation-v3\.js(?:\?v=[^"']*)?/g,PARENT_NAV);
  next=next.replace(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/g,DOCK_SHARE);
  next=next.replace(/\/site-core-service-dock-closure-v1\.js(?:\?v=[^"']*)?/g,CORE_SERVICE_DOCK);
  next=removeScriptByMarker(next);next=removeLegacyManagedScripts(next);next=removeManagedStyles(next);
  const tags=[
    '<script data-qily-translation-safety-bootstrap="inpage-v2">window.__qilyGlobalTranslationDualRouteV2=true;window.__qilyGoogleTranslateOnDemandV1=true;window.__qilyGlobalLanguageV31=true;window.__qilyGlobalLanguageV3=true;window.__qilyGlobalLanguageV2=true;window.__qilyGlobalLanguageV1=true;</script>',
    `<link id="qilyGlobalLanguageV1Stylesheet" rel="stylesheet" href="${LANGUAGE_CSS}">`,
    `<link id="qilyHeaderAxisV1" rel="stylesheet" href="${HEADER_AXIS}">`,
    `<link id="qilyTranslationProgressV1Stylesheet" rel="stylesheet" href="${PROGRESS_CSS}">`,
    `<link id="qilyTranslationPublicUiV1Stylesheet" rel="stylesheet" href="${PUBLIC_UI_CSS}">`,
    `<link id="qilyInteractionContrastGuardV1Stylesheet" rel="stylesheet" href="${INTERACTION_CONTRAST_CSS}">`,
    `<link id="qilyContentContrastGuardV1Stylesheet" rel="stylesheet" href="${CONTENT_CONTRAST_CSS}">`,
    `<link id="qilyUnifiedVisualGovernanceV1Stylesheet" rel="stylesheet" href="${UNIFIED_VISUAL_CSS}">`,
    `<link id="qilyVisualRegressionClosureV1Stylesheet" rel="stylesheet" href="${REGRESSION_CLOSURE_CSS}">`,
    `<script defer data-qily-translation-safe-direct="inpage-v2" src="${SAFE_RUNTIME}"></script>`,
    `<script defer data-qily-translation-public-ui-direct="visitor-v2" src="${PUBLIC_UI_JS}"></script>`,
    `<script defer data-qily-translation-progress-direct="bilingual-v2" src="${PROGRESS_JS}"></script>`,
    `<script defer data-qily-interaction-contrast-direct="v2" src="${INTERACTION_CONTRAST_JS}"></script>`,
    `<script defer data-qily-content-contrast-direct="v6" src="${CONTENT_CONTRAST_JS}"></script>`,
    `<script defer data-qily-contact-route-direct="v4" src="${CONTACT_ROUTE_JS}"></script>`
  ].join('\n');
  if(/<\/head>/i.test(next))next=next.replace(/<\/head>/i,`${tags}\n</head>`);
  return next;
}

const changed=[];
for(const relative of trackedHtml()){const target=path.join(root,relative),source=fs.readFileSync(target,'utf8'),next=materialize(source);if(next===source)continue;changed.push(relative);if(!checkOnly)fs.writeFileSync(target,next,'utf8')}
if(checkOnly&&changed.length)throw new Error(`Sitewide public baseline materialization stale: ${changed.slice(0,30).join(', ')}${changed.length>30?` … +${changed.length-30}`:''}`);
process.stdout.write(`Sitewide public baseline ${checkOnly?'check passed':'materialized'}: ${changed.length} tracked HTML file(s); baseline ${BASELINE_VERSION}.\n`);
