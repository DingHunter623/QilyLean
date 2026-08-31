#!/usr/bin/env node
'use strict';

/* QilyLean Sitewide Public Baseline Materializer V32｜2026-08-31
 * Chinese static HTML remains the authoritative source and default display.
 * Google Translate Header Runtime V1.3 is the single public translation provider and lifecycle owner.
 * Header Axis owns non-clipping horizontal navigation; Interaction Semantics V1.7 owns interaction meaning and the native range navigation rail.
 * Visual System V2 remains the primary sitewide visual authority across four device compositions.
 * Unified Visual Components V29 closes reusable card/flow/diagram/table, Logo, evidence-grade and translation utility integrity.
 * Brand Home Feedback V1 is a narrow exception for the header Logo/home route only.
 * Responsive Containment V1 guards page geometry.
 * Header + Project Integrity V3 retains complete header framing and project-evidence layout.
 * Public Redline Closure V2.3 retains shared visual/professional corrections without translation ownership.
 * Dock V5.4 alone owns Dock structure/labels/actions.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const checkOnly=process.argv.includes('--check');

const BASELINE_VERSION='20260831-google-translate-single-runtime-v32';
const CONSISTENCY='/site-ui-consistency-v1.js?v=20260831-r7-single-responsibility-v11-safe-translation';
const NAVIGATION='/site-navigation.js?v=20260828-r7-navigation-v45';
const PARENT_NAV='/site-parent-navigation-v3.js?v=20260825-language-runtime-compat-v42';
const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260829-authority-v54';
const CORE_SERVICE_DOCK='/site-core-service-dock-closure-v1.js?v=20260828-r7-alignment-v105';
const HEADER_AXIS='/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7';
const INTERACTION_CONTRAST_CSS='/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v2';
const INTERACTION_CONTRAST_JS='/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v2';
const CONTENT_CONTRAST_CSS='/site-content-contrast-guard-v1.css?v=20260826-sitewide-content-contrast-v6';
const CONTENT_CONTRAST_JS='/site-content-contrast-guard-v1.js?v=20260826-sitewide-content-contrast-v6';
const UNIFIED_VISUAL_CSS='/site-unified-visual-governance-v1.css?v=20260826-contrast-closure-v2';
const REGRESSION_CLOSURE_CSS='/site-visual-regression-closure-v1.css?v=20260826-screenshot-closure-v2';
const STABILITY_RECOVERY_CSS='/site-stability-recovery-v1.css?v=20260828-vi-surface-v3';
const PUBLIC_REDLINE_CSS='/site-public-redline-closure-v1.css?v=20260828-home-dock-v2';
const PUBLIC_REDLINE_V2_CSS='/site-public-redline-closure-v2.css?v=20260830-annotated-v2';
const PUBLIC_REDLINE_V2_JS='/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23';
const VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260830-visual-system-v2-r7';
const RESPONSIVE_CONTAINMENT_CSS='/site-responsive-containment-v1.css?v=20260830-header-integrity-v2';
const FINAL_INTEGRITY_CSS='/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3';
const VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range';
const BRAND_HOME_FEEDBACK_CSS='/site-brand-home-feedback-v1.css?v=20260831-brand-home-overlay-v1';
const BRAND_HOME_FEEDBACK_JS='/site-brand-home-feedback-v1.js?v=20260831-brand-home-overlay-v1';
const TRANSLATION_PUBLIC_CSS='/site-translation-public-ui-v1.css?v=20260831-google-translate-mobile-ui-v14&rev=20260831-android-header-fit';
const TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260831-google-translate-single-runtime-v13';
const TRANSLATION_SAFE_PUBLIC_JS=TRANSLATION_SAFE_JS+'&rev=20260831-cross-device-stable';
const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260829-dock-functional-public-v134';
const INTERACTION_SEMANTICS_CSS='/site-interaction-semantics-v1.css?v=20260830-r11-semantics-v14-visual-v3-vi-teal';
const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range';
const DDZ_CLOSURE_CSS='/tools/pure-ddz/game/css/r8-closure-v128.css?v=20260829-r12-v132';
const WECHAT_CONTACT_ASSET='/assets/contact/wechat-contact-card.svg?v=20260826-official-restored-v2';

function trackedHtml(){return execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);}
function removeScriptByMarker(source){return source.replace(/\s*<script\b[^>]*(?:data-qily-global-language-direct|data-qily-google-translate-direct|data-qily-web-translate-direct|data-qily-translation-progress-direct|data-qily-translation-public-ui-direct|data-qily-interaction-contrast-direct|data-qily-content-contrast-direct|data-qily-translation-safe-direct|data-qily-contact-route-direct|data-qily-interaction-semantics-direct|data-qily-public-redline-v2-direct|data-qily-brand-home-feedback-direct|data-qily-translation-safety-bootstrap)[^>]*>[\s\S]*?<\/script>\s*/gi,'\n');}
function removeManagedScripts(source){
  let next=source;
  const paths=['site-global-language-v3.js','site-translation-safe-runtime-v1.js','site-translation-public-ui-v1.js','site-translation-progress-v1.js','site-contact-route-v1.js','site-interaction-semantics-v1.js','site-public-redline-closure-v2.js','site-brand-home-feedback-v1.js'];
  for(const file of paths){const pattern=new RegExp('\\s*<script\\b[^>]*src=["\\\'][^"\\\']*\\/'+file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^"\\\']*["\\\'][^>]*><\\/script>\\s*','gi');next=next.replace(pattern,'\n');}
  return next;
}
function removeManagedStyles(source){
  const paths=['site-global-language-v1.css','site-header-axis-v1.css','site-translation-progress-v1.css','site-translation-public-ui-v1.css','site-interaction-contrast-guard-v1.css','site-content-contrast-guard-v1.css','site-unified-visual-governance-v1.css','site-visual-regression-closure-v1.css','site-stability-recovery-v1.css','site-public-redline-closure-v1.css','site-public-redline-closure-v2.css','site-interaction-semantics-v1.css','site-visual-system-v2.css','site-responsive-containment-v1.css','site-header-project-integrity-v2.css','site-visual-components-v1.css','site-brand-home-feedback-v1.css','tools/pure-ddz/game/css/r8-closure-v128.css'];
  let next=source;
  for(const file of paths){const pattern=new RegExp('\\s*<link\\b[^>]*href=["\\\'][^"\\\']*\\/'+file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^"\\\']*["\\\'][^>]*>\\s*','gi');next=next.replace(pattern,'\n');}
  return next;
}
function removeTranslationMarkup(source){return source.replace(/\s*<[^>]+id=["']qilyGlobalTranslationDualRouteV2["'][^>]*>[\s\S]*?<\/[^>]+>\s*/gi,'\n').replace(/\s*<[^>]+class=["'][^"']*qily-web-translate[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>\s*/gi,'\n');}
function neutralizeFirstPaint(source){
  const safe='<!-- QILY-R2-FIRST-PAINT:START -->\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-stale-document body{visibility:visible!important}</style><script data-qily-r2-first-paint>(function(d){var BUILD=\'20260824-readable-floor-plus2-v4\';var e=d.documentElement;e.classList.remove("qily-stale-document","qily-shell-pending","qily-r2-first-paint-pending","qily-first-paint-pending");try{localStorage.setItem("qily_site_html_build_v2",BUILD);sessionStorage.removeItem("qily_site_refresh_attempt_v1")}catch(error){}})(document);</script>\n<!-- QILY-R2-FIRST-PAINT:END -->';
  if(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/i.test(source))return source.replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/gi,safe);return source;
}
function materialize(source,relative){
  let next=neutralizeFirstPaint(source);
  next=next.replace(/\/site-ui-consistency-v1\.js(?:\?v=[^"']*)?/g,CONSISTENCY);
  next=next.replace(/\/site-navigation\.js(?:\?v=[^"']*)?/g,NAVIGATION);
  next=next.replace(/\/site-parent-navigation-v3\.js(?:\?v=[^"']*)?/g,PARENT_NAV);
  next=next.replace(/\/site-dock-share-runtime-v1\.js(?:\?v=[^"']*)?/g,DOCK_SHARE);
  next=next.replace(/\/site-core-service-dock-closure-v1\.js(?:\?v=[^"']*)?/g,CORE_SERVICE_DOCK);
  next=next.replace(/\/assets\/contact\/wechat-contact-card\.svg(?:\?v=[^"']*)?/g,WECHAT_CONTACT_ASSET);
  next=removeScriptByMarker(next);next=removeManagedScripts(next);next=removeManagedStyles(next);next=removeTranslationMarkup(next);
  const tags=[
    `<link id="qilyHeaderAxisV1" rel="stylesheet" href="${HEADER_AXIS}">`,
    `<link id="qilyInteractionContrastGuardV1Stylesheet" rel="stylesheet" href="${INTERACTION_CONTRAST_CSS}">`,
    `<link id="qilyContentContrastGuardV1Stylesheet" rel="stylesheet" href="${CONTENT_CONTRAST_CSS}">`,
    `<link id="qilyUnifiedVisualGovernanceV1Stylesheet" rel="stylesheet" href="${UNIFIED_VISUAL_CSS}">`,
    `<link id="qilyVisualRegressionClosureV1Stylesheet" rel="stylesheet" href="${REGRESSION_CLOSURE_CSS}">`,
    `<link id="qilyStabilityRecoveryV1Stylesheet" rel="stylesheet" href="${STABILITY_RECOVERY_CSS}">`,
    `<link id="qilyPublicRedlineClosureV1" rel="stylesheet" href="${PUBLIC_REDLINE_CSS}">`,
    `<link id="qilyPublicRedlineClosureV2" rel="stylesheet" href="${PUBLIC_REDLINE_V2_CSS}">`,
    `<link id="qilyInteractionSemanticsV1Stylesheet" rel="stylesheet" href="${INTERACTION_SEMANTICS_CSS}">`,
    relative==='tools/pure-ddz/index.html'?`<link id="qilyPureDdzR8ClosureV128" rel="stylesheet" href="${DDZ_CLOSURE_CSS}">`:'',
    `<script defer data-qily-public-redline-v2-direct="annotated-v2" src="${PUBLIC_REDLINE_V2_JS}"></script>`,
    `<script defer data-qily-interaction-contrast-direct="v2" src="${INTERACTION_CONTRAST_JS}"></script>`,
    `<script defer data-qily-content-contrast-direct="v6" src="${CONTENT_CONTRAST_JS}"></script>`,
    `<script defer data-qily-interaction-semantics-direct="v1.7" src="${INTERACTION_SEMANTICS_JS}"></script>`,
    `<script defer data-qily-contact-route-direct="v13.4" src="${CONTACT_ROUTE_JS}"></script>`,
    `<link id="qilyVisualSystemV2" rel="stylesheet" href="${VISUAL_SYSTEM_V2}">`,
    `<link id="qilyResponsiveContainmentV1" rel="stylesheet" href="${RESPONSIVE_CONTAINMENT_CSS}">`,
    `<link id="qilyHeaderProjectIntegrityV2" rel="stylesheet" href="${FINAL_INTEGRITY_CSS}">`,
    `<link id="qilyVisualComponentsV1" rel="stylesheet" href="${VISUAL_COMPONENTS_CSS}">`,
    `<link id="qilyBrandHomeFeedbackV1" rel="stylesheet" href="${BRAND_HOME_FEEDBACK_CSS}">`,
    `<link id="qilyTranslationPublicUiV1" rel="stylesheet" href="${TRANSLATION_PUBLIC_CSS}" data-qily-translation-public-ui="google-v1">`,
    `<script defer data-qily-translation-safe-direct="google-v1" src="${TRANSLATION_SAFE_PUBLIC_JS}"></script>`,
    `<script defer data-qily-brand-home-feedback-direct="v1" src="${BRAND_HOME_FEEDBACK_JS}"></script>`
  ].filter(Boolean).join('\n');
  if(/<\/head>/i.test(next))next=next.replace(/<\/head>/i,`${tags}\n</head>`);return next;
}
const changed=[];
for(const relative of trackedHtml()){const target=path.join(root,relative),source=fs.readFileSync(target,'utf8'),next=materialize(source,relative);if(next===source)continue;changed.push(relative);if(!checkOnly)fs.writeFileSync(target,next,'utf8');}
if(checkOnly&&changed.length)throw new Error(`Sitewide Google-Translate single-runtime baseline stale: ${changed.slice(0,30).join(', ')}${changed.length>30?` … +${changed.length-30}`:''}`);
process.stdout.write(`Sitewide public baseline ${checkOnly?'check passed':'materialized'}: ${changed.length} tracked HTML file(s); Google Translate V1.3 single runtime + Interaction Semantics V1.7; baseline ${BASELINE_VERSION}.\n`);
