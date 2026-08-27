#!/usr/bin/env node
'use strict';
/* Homepage aircraft authority: 官网首图.png is the sole approved visual SSOT. Browser derivatives may optimize transport only; they must never redefine the model. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),target=path.join(root,'index.html');
let html=fs.readFileSync(target,'utf8');
const START='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->',END='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->';
const PNG='/assets/qilylean-aircraft-hero-approved-20260826.png?v=20260827-home-original-approved-v3';
const WEBP='/assets/qilylean-aircraft-hero-latest-q98.webp?v=20260827-home-original-approved-v3';
const CSS='/styles/qily-aircraft-brand-hero-v1.css?v=20260826-aircraft-hero-v1';
const ALT='QilyLean｜启力精益飞机品牌主视觉，左右机翼展示新工厂与新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六项业务能力';
const hero=[START,'<section class="qily-aircraft-brand-hero" aria-label="QilyLean｜启力精益飞机品牌主视觉">','  <figure>','    <picture>',`      <source type="image/webp" srcset="${WEBP}">`,`      <img src="${PNG}" alt="${ALT}" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">`,'    </picture>','  </figure>','</section>',END].join('\n');
for(const re of [/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->\n?/gi,/\n?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->\n?/gi])html=html.replace(re,'\n');
html=html.replace(/\s*<link\b[^>]*(?:id=["']qily(?:C919|Aircraft)(?:DigitalFlagshipHero|HeroPreload|HeroStylesheet)[^"']*["']|href=["'][^"']*(?:qily-c919-digital-flagship-hero-v1\.css|c919-strategy-hero-v14\.(?:webp|png)|qilylean-aircraft-hero-v1\.webp|qilylean-aircraft-hero-approved-20260826\.png|qilylean-aircraft-hero-latest-q98\.webp|qily-aircraft-brand-hero-v1\.css)(?:\?[^"']*)?["'])[^>]*>\s*/gi,'\n');
html=html.replace('</head>',`<link id="qilyAircraftHeroStylesheetV1" rel="stylesheet" href="${CSS}">\n<link id="qilyAircraftHeroPreloadV1" rel="preload" as="image" href="${WEBP}" type="image/webp" fetchpriority="high">\n</head>`);
html=html.replace(/(<main\b[^>]*>)/i,`$1\n${hero}`);
fs.writeFileSync(target,html.endsWith('\n')?html:html+'\n','utf8');
const validatorPath=path.join(root,'scripts','validate-sitewide-remediation-20260822.js');
if(fs.existsSync(validatorPath)){
  let v=fs.readFileSync(validatorPath,'utf8');
  v=v.replace(/\/assets\/qilylean-aircraft-hero-approved-20260826\.png\?v=202608(?:26-aircraft-approved-v1|27-home-original-approved-v[23])/g,PNG);
  v=v.replace('/assets/qilylean-aircraft-hero-v1.webp?v=20260826-aircraft-hero-v1',PNG);
  fs.writeFileSync(validatorPath,v,'utf8');
}
console.log('QilyLean homepage aircraft hero materialized from canonical 官网首图.png with a Q98 WebP transport derivative and untouched PNG fallback.');
