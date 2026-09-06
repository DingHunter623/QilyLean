#!/usr/bin/env node
'use strict';

/* Global language/runtime compatibility gate | V35 | 2026-09-06
 * Production V32 compatibility + formal VI v4 overlay + isolated DDZ V155/V164 route.
 */
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const baseline=JSON.parse(read('data/site-system-v4.json')).runtimeBaseline;

const safe=read('site-translation-safe-runtime-v1.js');
for(const [t,m] of [
  ['Google Translate Header Runtime V1.4','Google translation authority'],
  ["addOption(select,'zh-CN','中文简体')",'Simplified Chinese'],
  ["addOption(select,'zh-TW','中文繁体')",'Traditional Chinese'],
  ["addOption(select,'en','English')",'English'],
  ["addOption(select,MORE_VALUE,'其他')",'More languages entry'],
  ['function populateMoreLanguages()','More languages picker'],
  ['__qilyGoogleTranslateElementInitialized','Single initialization guard'],
  ['function recoverRetainedControlOnce()','Bounded Header recovery'],
  ['data-qily-header-utility','Header translation ownership'],
  ['translate.google.com/translate_a/element.js','Official Google element']
])must(safe,t,m);
for(const t of ['includedLanguages:','createTreeWalker','setInterval('])forbid(safe,t,'Google translation redline');
if(/new\s+MutationObserver\s*\(/.test(safe))throw new Error('Translation MutationObserver forbidden');

const navigation=read('site-navigation.js');
must(navigation,'navigation runtime v45','Navigation V45');
must(navigation,'r7DockSingleAuthority:true','Navigation/Dock split');
must(navigation,'r7NoNavigationDockMutation:true','Navigation cannot mutate Dock');
if(!new RegExp(`atomic-first-paint-${String(baseline).toLowerCase()}`).test(navigation))throw new Error('Static first-paint baseline missing');

const shell=read('site-ui-consistency-v1.js');
must(shell,'__qilyUiConsistencyV11','Shared shell V11');
must(shell,'Translation ownership is intentionally outside this shell','Translation authority split');
forbid(shell,'uninstallTranslationArtifacts','Legacy translator removal');
forbid(shell,'normalizeDockButton','Shell Dock mutation');

const dock=read('site-dock-share-runtime-v1.js');
must(dock,'Floating Dock Authoritative Runtime V5.8','Dock V5.8');
must(dock,'__qilyFloatingDockUnifiedV58','Dock V58 guard');
must(dock,'setOwnedLabel','Dock label ownership');
must(dock,"w.open(url,'_blank','noopener,noreferrer')",'Contact new tab');
must(dock,'function isExcluded(){return false;}','Canonical Dock availability');
forbid(dock,"mask.classList.add('show')",'Dock modal');
if(/new\s+MutationObserver\s*\(/.test(dock))throw new Error('Dock MutationObserver forbidden');

const route=read('site-contact-route-v1.js');
must(route,'Contact Route V13.4','Contact Route V13.4');
must(route,'__qilyFloatingDockUnifiedV54','Contact backward compatibility guard');

const header=read('site-header-axis-v1.css');
must(header,'Global Header Axis V1.2','Header Axis');
must(header,'overflow-x:scroll!important','Mobile nav native scroll');
must(header,'white-space:nowrap!important','Full nav labels');

const semanticCss=read('site-interaction-semantics-v1.css');
const semanticJs=read('site-interaction-semantics-v1.js');
must(semanticCss,'Interaction Semantics V1.4','Semantics CSS');
must(semanticCss,'.qily-primary-nav-scroll-rail','Pre-v4 range compatibility source');
must(semanticJs,'Interaction Semantics Runtime V1.7','Semantics JS V1.7');
must(semanticJs,"rail.type='range'",'Pre-v4 native range source');
must(semanticJs,'PROJECT_EVIDENCE','Evidence map');
forbid(semanticJs,'qily-primary-nav-scroll-thumb','Retired synthetic thumb');

/* Formal VI v4 is the public visual authority. It may retire the old visual rail while preserving native nav scrolling. */
const viCss=read('site-vi-standard-v4.css');
const viRuntime=read('site-vi-runtime-v4.js');
must(viCss,'--qily-container:1240px','Formal 1240 axis');
must(viCss,'linear-gradient(118deg','Formal 118-degree Hero');
must(viCss,'.qily-primary-nav-scroll-rail','Formal retired rail rule');
must(viRuntime,'retireLegacyNavRail','Formal rail retirement');
must(viRuntime,'Translation lifecycle and translator DOM remain exclusively owned','Translation single-owner boundary');
forbid(viRuntime,'.qily-web-translate','Formal VI must not own translator DOM');

/* DDZ V155/V164 is the explicit performance-route exception. Its interior is bundled; the canonical Dock remains shared. */
const ddzIndex=read('tools/pure-ddz/index.html');
const ddzCoreCss=read('tools/pure-ddz/game/css/ddz-core-v155.css');
const ddzCoreJs=read('tools/pure-ddz/game/js/ddz-core-v155.js');
for(const [t,m] of [
  ["const version='20260903-ddz-fast-knowledge-v155-v158-v159-v160-v161-v162-v163-v164'",'DDZ V155/V164 cache'],
  ['data-qily-ddz-core="v158"','DDZ bundled CSS owner'],
  ['window.__PURE_DDZ_STYLE_READY__=Promise.resolve();','DDZ static style readiness'],
  ["const chain=['js/ddz-core-v155.js'];",'DDZ single JS bundle'],
  ['data-qily-ddz-fast-shell="v155"','DDZ fast shell'],
  ['data-qily-ddz-virtual-landscape="v154"','DDZ iOS landscape fallback'],
  ['id="v120-landscape-toggle"','DDZ landscape toolbar'],
  ['id="welcome-landscape"','DDZ landscape welcome'],
  ['/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom','DDZ canonical Dock']
])must(ddzIndex,t,m);
for(const t of ["loadStyle('css/ddz-core-v155.css')",'/site-navigation.js?','qilyPureDdzR8ClosureV128','ddz-site-shell-v140.js','name="screen-orientation"','name="x5-orientation"'])forbid(ddzIndex,t,'DDZ retired shell');
must(ddzCoreCss,'--ddz-game-max:var(--qily-content-axis,1560px)','DDZ content axis compatibility');
must(ddzCoreCss,'overflow-x:clip!important','DDZ containment');
must(ddzCoreCss,'justify-content:safe center!important','DDZ safe card centering');
must(ddzCoreJs,"const VERSION = '1.5.2'",'DDZ game core');
must(ddzCoreJs,"auto?'不要':'您不要'",'DDZ auto-pass narration');
must(ddzCoreJs,"version:'1.2.4-mobile-landscape-adaptive'",'DDZ adaptive landscape runtime');
must(ddzCoreJs,'function syncViewportProfile()','DDZ viewport profile');
must(ddzCoreJs,'screen.orientation?.lock','DDZ landscape lock');
must(ddzCoreJs,'window.PureDDZTest.hint()','DDZ single hint owner');

const mat=read('scripts/materialize-global-language-v3.js');
for(const [t,m] of [
  ["const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'V32 baseline'],
  ["const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20260906-mobile-compact-fixed-r1'",'Dock V58 materializer'],
  ["const HEADER_AXIS='/site-header-axis-v1.css?v=20260901-primary-navigation-native-scroll-v8'",'Header native-scroll materializer'],
  ["const TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'",'Translation materializer'],
  ["const VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Visual components materializer'],
  ["const INTERACTION_SEMANTICS_JS='/site-interaction-semantics-v1.js?v=20260831-r11-semantics-v17-native-range'",'Semantics materializer']
])must(mat,t,m);
forbid(mat,'DDZ_CLOSURE_CSS','Retired DDZ closure materialization');
forbid(mat,'const PUBLIC_UI_JS=','Retired picker injection');

const cn=read('cn-site/index.html');
must(cn,'name="robots" content="noindex,nofollow,noarchive"','CN preproduction indexing lock');
must(cn,'/site-vi-standard-v4.css?v=20260906-vi-v4-formal-closure','CN formal VI CSS');
must(cn,'/site-vi-runtime-v4.js?v=20260906-vi-v4-formal-closure','CN formal VI runtime');

console.log(`PASS: ${baseline} compatibility preserves one Google Translate V1.4 owner, native navigation, Dock V5.8, formal VI v4, CN noindex preproduction, and the isolated DDZ V155/V164 fast route.`);
