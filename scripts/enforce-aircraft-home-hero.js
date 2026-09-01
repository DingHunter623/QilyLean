#!/usr/bin/env node
'use strict';
/* Homepage visual authority: 官网首图.png remains the sole approved aircraft artwork SSOT,
 * but the aircraft is now a brand-extension asset, not the homepage first-screen conversion visual.
 * The homepage conversion module and owner-profile supplement are materialized as direct, cache-versioned dependencies.
 * First-paint contract: index.html must already contain the approved conversion Hero; runtime only enhances the remaining homepage structure.
 */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),target=path.join(root,'index.html');
const sourcePath=path.join(root,'官网首图.png');
const source=fs.readFileSync(sourcePath);
const PNG_SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);
if(!source.subarray(0,8).equals(PNG_SIGNATURE))throw new Error('官网首图.png is not a valid PNG');
const sourceWidth=source.readUInt32BE(16),sourceHeight=source.readUInt32BE(20);
if(sourceWidth<1200||sourceHeight<675)throw new Error(`官网首图.png resolution is too small: ${sourceWidth}x${sourceHeight}`);
let html=fs.readFileSync(target,'utf8');
const START='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->',END='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->';
const PNG='/assets/qilylean-aircraft-hero-approved-20260826.png?v=20260831-aircraft-latest-v5';
const WEBP='/assets/qilylean-aircraft-hero-latest-q98.webp?v=20260831-aircraft-latest-v5';
const AIRCRAFT_CSS='/styles/qily-aircraft-brand-hero-v1.css?v=20260826-aircraft-hero-v1';
const HOME_CSS='/styles/qily-home-conversion-v1.css?v=20260901-home-conversion-axis-v2';
const HOME_VISUAL_FIX='/styles/qily-home-conversion-visual-fix-v2.css?v=20260901-home-capability-building-v4';
const HOME_JS='/site-home-conversion-v1.js?v=20260901-home-first-paint-v6';
const OWNER_PROFILE_CSS='/styles/qily-home-owner-profile-v1.css?v=20260901-owner-profile-v3';
const OWNER_PROFILE_JS='/site-home-owner-profile-v1.js?v=20260901-owner-profile-v3';
const ALT='QilyLean｜启力精益飞机品牌延伸视觉，左右机翼展示新工厂与新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六项业务能力';
const aircraft=[START,'<section class="qily-aircraft-brand-hero" aria-label="QilyLean｜启力精益品牌延伸视觉资产" data-qily-home-aircraft-position="extended">','  <figure>','    <picture>',`      <source type="image/webp" srcset="${WEBP}">`,`      <img src="${PNG}" alt="${ALT}" width="${sourceWidth}" height="${sourceHeight}" loading="lazy" decoding="async" fetchpriority="low">`,'    </picture>','  </figure>','</section>',END].join('\n');
const staticHero=[
  '<section class="hero qily-home-conversion-hero" data-qily-home-conversion-hero="v1">',
  '  <div class="qily-home-conversion-hero__inner">',
  '    <div class="qily-home-conversion-hero__copy">',
  '      <span class="qily-home-conversion-hero__kicker">QILYLEAN｜制造工程 · 精益改善 · 工厂规划</span>',
  '      <h1>用工程数据解决工厂效率、质量、交付与布局问题</h1>',
  '      <p class="qily-home-conversion-hero__lead">并把有效改善固化为组织能力。QilyLean以现场事实、工程数据、Pilot验证和标准交付为主线，让方案能落地、结果可验证、经验可复制。</p>',
  '      <div class="qily-home-conversion-hero__chips"><span>新工厂／新产线规划</span><span>精益改善项目交付</span><span>目视化设计与交付</span></div>',
  '      <div class="qily-home-conversion-actions"><a class="primary" href="/cooperation/#diagnosis">免费60分钟沟通诊断</a><a href="/projects/">查看代表案例</a></div>',
  '      <p class="qily-home-conversion-hero__route">标准启动路径：免费60分钟沟通诊断 → 1天现场诊断 → 2周诊断／冲刺 → Pilot项目（按项目范围调整）</p>',
  '    </div>',
  '    <figure class="qily-home-project-visual" aria-label="QilyLean工厂项目与改善方案视觉">',
  '      <a href="/projects/factory-layout/" aria-label="查看新工厂与Factory Layout代表项目"><img src="/园区.png?v=20260901-home-conversion-v1" alt="新工厂与工业园区总体规划项目效果图" loading="eager" decoding="async" fetchpriority="high"><figcaption>新工厂／新产线｜Factory Layout与园区规划</figcaption></a>',
  '      <a href="/projects/" aria-label="查看汽车电子精益改善项目"><img src="/media/projects/vsm-smed.webp?v=20260901-home-conversion-v1" alt="汽车电子精益改善、VSM与SMED项目现场资料" loading="eager" decoding="async"><figcaption>汽车电子｜VSM、单件流与SMED</figcaption></a>',
  '      <a href="/projects/mold-warehouse/" aria-label="查看智能模具库代表项目"><img src="/media/projects/mold-before.webp?v=20260901-home-conversion-v1" alt="智能模具库Layout规划与库位设计项目资料" loading="eager" decoding="async"><figcaption>智能模具库｜Layout、库位与追溯</figcaption></a>',
  '    </figure>',
  '  </div>',
  '</section>'
].join('\n');

/* First paint must never expose the retired homepage Hero. Materialize the approved Hero directly into HTML. */
const heroRe=/<section\b[^>]*class=["'][^"']*\bhero\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i;
if(!heroRe.test(html))throw new Error('Homepage Hero source block missing');
html=html.replace(heroRe,staticHero);

/* Remove all legacy/current aircraft blocks before placing the one governed extension block. */
for(const re of [/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->\n?/gi,/\n?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->\n?/gi])html=html.replace(re,'\n');

/* Remove retired aircraft assets plus previous generated homepage direct dependencies. */
html=html.replace(/\s*<link\b[^>]*(?:id=["']qily(?:C919|Aircraft)(?:DigitalFlagshipHero|HeroPreload|HeroStylesheet)[^"']*["']|href=["'][^"']*(?:qily-c919-digital-flagship-hero-v1\.css|c919-strategy-hero-v14\.(?:webp|png)|qilylean-aircraft-hero-v1\.webp|qilylean-aircraft-hero-approved-20260826\.png|qilylean-aircraft-hero-latest-q98\.webp|qily-aircraft-brand-hero-v1\.css)(?:\?[^"']*)?["'])[^>]*>\s*/gi,'\n');
html=html.replace(/\s*<link\b[^>]*id=["']qilyHomeConversionV1Stylesheet["'][^>]*>\s*/gi,'\n');
html=html.replace(/\s*<link\b[^>]*id=["']qilyHomeConversionVisualFixV2["'][^>]*>\s*/gi,'\n');
html=html.replace(/\s*<link\b[^>]*id=["']qilyHomeOwnerProfileV1Stylesheet["'][^>]*>\s*/gi,'\n');
html=html.replace(/\s*<script\b[^>]*id=["']qilyHomeConversionV1Runtime["'][^>]*>[\s\S]*?<\/script>\s*/gi,'\n');
html=html.replace(/\s*<script\b[^>]*id=["']qilyHomeOwnerProfileV1Runtime["'][^>]*>[\s\S]*?<\/script>\s*/gi,'\n');

/* Conversion runtime is parser-blocking in <head> only long enough to register the parser-complete hook.
 * It no longer waits behind the deferred navigation/translation stack before transforming the remaining homepage.
 */
const homeHead=[
  `<link id="qilyAircraftHeroStylesheetV1" rel="stylesheet" href="${AIRCRAFT_CSS}">`,
  `<link id="qilyHomeConversionV1Stylesheet" rel="stylesheet" href="${HOME_CSS}">`,
  `<link id="qilyHomeConversionVisualFixV2" rel="stylesheet" href="${HOME_VISUAL_FIX}">`,
  `<link id="qilyHomeOwnerProfileV1Stylesheet" rel="stylesheet" href="${OWNER_PROFILE_CSS}">`,
  `<script id="qilyHomeConversionV1Runtime" src="${HOME_JS}"></script>`,
  `<script defer id="qilyHomeOwnerProfileV1Runtime" src="${OWNER_PROFILE_JS}"></script>`,
  ''
].join('\n');
const baselineAnchor=/<script\b[^>]*data-qily-translation-safety-bootstrap=/i;
html=baselineAnchor.test(html)?html.replace(baselineAnchor,homeHead+'$&'):html.replace('</head>',homeHead+'</head>');

/* Static fallback position is the end of <main>. JS enhances this into the labelled brand-extension region.
 * This guarantees the aircraft never owns the first screen even if JS is unavailable.
 */
html=html.replace(/<\/main>/i,`${aircraft}\n</main>`);
html=html.replace(/[ \t]+$/gm,'');

fs.writeFileSync(target,html.endsWith('\n')?html:html+'\n','utf8');
const validatorPath=path.join(root,'scripts','validate-sitewide-remediation-20260822.js');
if(fs.existsSync(validatorPath)){
  let v=fs.readFileSync(validatorPath,'utf8');
  v=v.replace(/\/assets\/qilylean-aircraft-hero-approved-20260826\.png\?v=202608(?:26-aircraft-approved-v1|27-home-original-approved-v[23]|29-official-qr-v4|31-aircraft-latest-v5)/g,PNG);
  v=v.replace('/assets/qilylean-aircraft-hero-v1.webp?v=20260826-aircraft-hero-v1',PNG);
  fs.writeFileSync(validatorPath,v,'utf8');
}
console.log(`QilyLean first-paint Hero materialized; aircraft SSOT preserved (${sourceWidth}x${sourceHeight}) as a lazy brand-extension asset; remaining homepage conversion runs at parser-complete.`);
