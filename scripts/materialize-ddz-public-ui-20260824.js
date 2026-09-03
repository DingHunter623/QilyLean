#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const indexFile=path.join(root,'tools','pure-ddz','index.html');
const gameRoot=path.join(root,'tools','pure-ddz','game');
const cssRoot=path.join(gameRoot,'css');
const jsRoot=path.join(gameRoot,'js');
const cssBundleFile=path.join(cssRoot,'ddz-core-v155.css');
const jsBundleFile=path.join(jsRoot,'ddz-core-v155.js');

if(!fs.existsSync(indexFile)) throw new Error('Missing tools/pure-ddz/index.html');
let page=fs.readFileSync(indexFile,'utf8');
const before=page;
const CACHE='20260903-ddz-fast-knowledge-v155';
const FAST_SHELL='<script defer id="qilyDdzFastSiteShellV155" data-qily-ddz-fast-shell="v155" src="/tools/pure-ddz/game/js/fast-site-shell-v155.js?v=20260903-ddz-fast-shell-v155"></script>';
const IOS_VIRTUAL_FALLBACK='<script defer id="qilyDdzIosVirtualLandscapeV154" data-qily-ddz-virtual-landscape="v154" src="/tools/pure-ddz/game/js/ios-virtual-landscape-v154.js?v=20260903-ios-virtual-v154"></script>';

const CSS_SOURCES=[
  'style.css',
  'qilylean-theme.css',
  'visual-v120.css',
  'card-comfort-v122.css',
  'ddz-site-page-v140.css',
  'mobile-landscape-v153.css',
  'card-knowledge-v155.css'
];
const JS_SOURCES=[
  'card-theme.js',
  'ai-expert.js',
  'game.js',
  'visual-v120.js'
];

function readRequired(base,file){
  const full=path.join(base,file);
  if(!fs.existsSync(full)) throw new Error(`Missing DDZ source: ${file}`);
  return fs.readFileSync(full,'utf8').trimEnd();
}
function buildBundle(target,base,sources,header,separator){
  const content=header+'\n'+sources.map(file=>`${separator} ${file} */\n${readRequired(base,file)}`).join('\n\n')+'\n';
  const current=fs.existsSync(target)?fs.readFileSync(target,'utf8'):'';
  if(current!==content)fs.writeFileSync(target,content);
  return Buffer.byteLength(content,'utf8');
}

/* V155 performance closure: the browser receives one game CSS request and one core game JS request. */
const cssBytes=buildBundle(
  cssBundleFile,
  cssRoot,
  CSS_SOURCES,
  '/* QilyLean Pure DDZ V155 generated core CSS bundle. Source files remain authoritative; do not hand-edit this generated file. */',
  '/* ====='
);
const jsBytes=buildBundle(
  jsBundleFile,
  jsRoot,
  JS_SOURCES,
  '/* QilyLean Pure DDZ V155 generated core JS bundle. Source files remain authoritative; do not hand-edit this generated file. */',
  '/* ====='
);
if(cssBytes>180000)throw new Error(`DDZ V155 CSS bundle unexpectedly large: ${cssBytes}`);
if(jsBytes>150000)throw new Error(`DDZ V155 JS bundle unexpectedly large: ${jsBytes}`);

/* V155 cache key owns all locally bundled game resources. */
page=page.replace(/const version='[^']+';/, `const version='${CACHE}';`);
page=page.replace(/window.__PURE_DDZ_CACHE_KEY__\|\|'[^']+'/g, `window.__PURE_DDZ_CACHE_KEY__||'${CACHE}'`);

/* Replace the historical six-request style chain with one generated component bundle. */
page=page.replace(
  /window\.__PURE_DDZ_STYLE_READY__=Promise\.all\(\[[\s\S]*?\]\);/,
  "window.__PURE_DDZ_STYLE_READY__=Promise.all([loadStyle('css/ddz-core-v155.css')]);"
);

/* Replace the historical four-request runtime chain with one deterministic generated bundle. */
page=page.replace(
  /const chain=\[[^\]]*\];/,
  "const chain=['js/ddz-core-v155.js'];"
);

/*
 * DDZ is a performance-sensitive product route, not a governance demo page.
 * Remove render-blocking sitewide governance styles; the dedicated fast shell owns Header geometry,
 * the authoritative Dock runtime owns Dock visual/interaction, and the game bundle owns the game surface.
 */
const INITIAL_SITE_CSS_IDS=[
  'qilyGlobalLinkStandardStylesheet','qilyNavigationFourBorderStylesheet','qilyCoreVisualBundleV1',
  'qilyInteractionContinuityV2','qilyVisualGovernanceV1','qilyContentAxisV1',
  'qilyFloatingDockStandardV1','qilyFloatingDockGoldV1','qilyViStandardStylesheet',
  'qilyVisualReadabilityV5Stylesheet','qilyHeaderAxisV1','qilyInteractionContrastGuardV1Stylesheet',
  'qilyContentContrastGuardV1Stylesheet','qilyUnifiedVisualGovernanceV1Stylesheet',
  'qilyVisualRegressionClosureV1Stylesheet','qilyStabilityRecoveryV1Stylesheet',
  'qilyPublicRedlineClosureV1','qilyPublicRedlineClosureV2','qilyInteractionSemanticsV1Stylesheet',
  'qilyVisualSystemV2','qilyResponsiveContainmentV1','qilyHeaderProjectIntegrityV2',
  'qilyVisualComponentsV1','qilyBrandHomeFeedbackV1','qilyTranslationPublicUiV1'
];
INITIAL_SITE_CSS_IDS.forEach(id=>{
  page=page.replace(new RegExp(`\\s*<link\\b[^>]*id=["']${id}["'][^>]*>\\s*`,'gi'),'\n');
});

/* Retire the heavyweight general navigation / governance runtime waterfall on this one route only. */
const INITIAL_SITE_JS=[
  'site-native-prefetch-v1.js',
  'site-navigation.js',
  'site-public-redline-closure-v2.js',
  'site-interaction-contrast-guard-v1.js',
  'site-content-contrast-guard-v1.js',
  'site-interaction-semantics-v1.js',
  'site-contact-route-v1.js',
  'site-translation-safe-runtime-v1.js',
  'site-brand-home-feedback-v1.js'
];
INITIAL_SITE_JS.forEach(file=>{
  page=page.replace(new RegExp(`\\s*<script\\b[^>]*src=["'][^"']*\\/${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}[^"']*["'][^>]*><\\/script>\\s*`,'gi'),'\n');
});

/* Fast Header remains visually consistent, but Google Translate is intentionally idle-loaded by this shell. */
page=page.replace(/\s*<script\b[^>]*data-qily-ddz-fast-shell=["']v155["'][^>]*><\/script>\s*/gi,'\n');
page=page.replace(/\s*<script\b[^>]*id=["']qilyDdzFastSiteShellV155["'][^>]*><\/script>\s*/gi,'\n');
page=page.replace(/<\/head>/i,`  ${FAST_SHELL}\n</head>`);

/* Keep one authoritative six-action Dock runtime. It self-contains its critical Dock styles. */
if(!page.includes('/site-dock-share-runtime-v1.js?')){
  page=page.replace(/<\/head>/i,'  <script defer data-qily-dock-share-runtime="v1" src="/site-dock-share-runtime-v1.js?v=20260902-public-dock-v55"></script>\n</head>');
}

/* Preserve V154 iPhone/WeChat virtual-landscape compatibility while the V155 route becomes lighter. */
if(!page.includes('data-qily-ddz-virtual-landscape="v154"')){
  page=page.replace(/<\/head>/i,`  ${IOS_VIRTUAL_FALLBACK}\n</head>`);
}else{
  page=page.replace(/<script\b[^>]*data-qily-ddz-virtual-landscape=["']v154["'][^>]*><\/script>/i,IOS_VIRTUAL_FALLBACK);
}

/* Mobile landscape entry points remain explicit user gestures. */
if(!page.includes('id="v120-landscape-toggle"')){
  page=page.replace('<button id="start"','<button id="v120-landscape-toggle" class="icon-btn" type="button" hidden aria-hidden="true" aria-label="切换横屏斗地主">↔ 横屏</button>\n        <button id="start"');
}
if(!page.includes('id="welcome-landscape"')){
  page=page.replace('<button id="welcome-settings"','<button id="welcome-landscape" class="text-btn mobile-landscape-entry" type="button" hidden aria-hidden="true">↔ 横屏游玩</button><button id="welcome-settings"');
}

/* Screenshot-annotated maintenance copy is not a public module. Keep the internal hint node only as a silent runtime target. */
page=page.replace(/\s*<div class="ddz-page-note">[\s\S]*?<\/div>\s*/g,'\n');
page=page.replace(/<p id="hint-message" class="hint-message">[\s\S]*?<\/p>/g,'<p id="hint-message" class="hint-message" aria-hidden="true"></p>');
page=page.replace(/<span>企业邮箱<\/span>/g,'<span>官网邮箱</span>');

/* Product governance: unreleased Android status is not a public-game control or copy block. */
page=page.replace(/\s*<span class="apk-inline apk-hold">[\s\S]*?<\/span>\s*/gi,'\n');
page=page.replace(/打开即玩[；;]\s*Android版(?:暂未开放|待网页版验证确认后开放)/g,'打开即玩');
page=page.replace(/<span>Android：(?:暂未开放下载|待验证后发布)<\/span>/g,'');
page=page.replace(/Android 可离线使用/g,'');
page=page.replace(/Android版暂未开放下载/g,'');
page=page.replace(/Android版暂未开放/g,'');
page=page.replace(/Android版待网页版验证确认后开放/g,'');
page=page.replace(/Android安装包待网页版验证确认OK后再发布/g,'');
page=page.replace(/Android 安装包待验证/g,'');
page=page.replace(/Android安装包待验证/g,'');
page=page.replace(/安装包待验证后发布/g,'');
page=page.replace(/安装包待验证/g,'');

/* V155 hard gates. */
if(!page.includes(`const version='${CACHE}';`)) throw new Error('DDZ V155 cache key not updated');
if(!page.includes(`window.__PURE_DDZ_CACHE_KEY__||'${CACHE}'`)) throw new Error('DDZ V155 fallback cache key not updated');
if(!page.includes("loadStyle('css/ddz-core-v155.css')")) throw new Error('DDZ V155 single CSS bundle is missing');
if(!page.includes("const chain=['js/ddz-core-v155.js'];")) throw new Error('DDZ V155 single JS bundle is missing');
if(page.includes("loadStyle('css/style.css')")||page.includes("loadStyle('css/mobile-landscape-v153.css')")) throw new Error('DDZ historical multi-CSS chain is still public');
if(page.includes("const chain=['js/card-theme.js','js/ai-expert.js','js/game.js','js/visual-v120.js'];")) throw new Error('DDZ historical multi-JS chain is still public');
if(!page.includes(FAST_SHELL)) throw new Error('DDZ V155 fast Header shell is missing');
if(!page.includes(IOS_VIRTUAL_FALLBACK)) throw new Error('DDZ V154 iOS virtual-landscape fallback is missing');
if(!page.includes('/site-dock-share-runtime-v1.js?')) throw new Error('Canonical QilyLean Dock runtime is missing');
if(page.includes('/site-navigation.js?')) throw new Error('Heavy general navigation runtime must stay unloaded on DDZ V155');
if(page.includes('/site-translation-safe-runtime-v1.js?')) throw new Error('Google Translate runtime must not compete with DDZ initial load');
if(page.includes('qilyTranslationPublicUiV1')) throw new Error('Google Translate CSS must be deferred by the fast shell');
if(page.includes('qilyPureDdzR8ClosureV128')) throw new Error('Legacy DDZ R8 closure must stay unloaded');
if(page.includes('ddz-site-shell-v140.js')||page.includes('js/qilylean-theme.js')||page.includes('js/elder-assist-v140.js')) throw new Error('Legacy DDZ observer runtimes must stay unloaded');
if(!page.includes('id="v120-landscape-toggle"')||!page.includes('id="welcome-landscape"')) throw new Error('DDZ landscape entry controls are missing');
if(page.includes('class="ddz-page-note"')) throw new Error('Maintenance page-note must stay removed');
if(!page.includes('<p id="hint-message" class="hint-message" aria-hidden="true"></p>')) throw new Error('Silent hint runtime target is missing');
if(page.includes('<footer class="site-footer">')) throw new Error('Game-specific fixed footer must stay removed');
if(page.includes('name="screen-orientation"')||page.includes('name="x5-orientation"')) throw new Error('DDZ forced-orientation metadata must stay removed');
if(!page.includes('__PURE_DDZ_MOBILE_DEVICE__')||!page.includes('__PURE_DDZ_WECHAT_WEBVIEW__')||!page.includes('__PURE_DDZ_MANAGED_LOADER__')) throw new Error('DDZ mobile managed-loader markers are missing');
if(page.includes('<span>企业邮箱</span>')||!page.includes('<span>官网邮箱</span>')) throw new Error('DDZ contact label contract is not current');
if(page.includes('apk-inline apk-hold')||page.includes('Android版暂未开放')||page.includes('Android：暂未开放下载')) throw new Error('Unreleased Android status must stay absent from DDZ public UI');

const cssBundle=fs.readFileSync(cssBundleFile,'utf8');
const jsBundle=fs.readFileSync(jsBundleFile,'utf8');
for(const token of ['card-knowledge-v155.css','IE七大手法','数智工厂'])if(!cssBundle.includes(token)&&token==='card-knowledge-v155.css')throw new Error('DDZ V155 card knowledge CSS was not bundled');
for(const token of ['IE 7 Tools','Kaizen','ECRS','VSM','6S','TPS','FMEA','CPK','ERP','MES','APS','PQCD','PDCA','5M2E','Smart Factory'])if(!jsBundle.includes(token))throw new Error(`DDZ V155 terminology missing from JS bundle: ${token}`);

if(page!==before)fs.writeFileSync(indexFile,page.endsWith('\n')?page:page+'\n');
console.log(`Pure DDZ V155 materialized: CSS ${cssBytes} bytes / JS ${jsBytes} bytes / fast Header + deferred translation / no unreleased Android status.`);
