#!/usr/bin/env node
'use strict';

/* QilyLean aircraft brand hero — approved single-source authority */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'index.html');
let html=fs.readFileSync(target,'utf8');

const START='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->';
const END='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->';
const ASSET='/assets/qilylean-aircraft-hero-approved-20260826.png?v=20260826-aircraft-approved-v1';
const STYLESHEET='/styles/qily-aircraft-brand-hero-v1.css?v=20260826-aircraft-hero-v1';
const ALT='QilyLean｜启力精益飞机品牌主视觉，左右机翼展示新工厂与新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六项业务能力';
const preload=`<link id="qilyAircraftHeroPreloadV1" rel="preload" as="image" href="${ASSET}" type="image/png" fetchpriority="high">`;
const stylesheet=`<link id="qilyAircraftHeroStylesheetV1" rel="stylesheet" href="${STYLESHEET}">`;
const hero=[START,'<section class="qily-aircraft-brand-hero" aria-label="QilyLean｜启力精益飞机品牌主视觉">','  <figure>',`    <img src="${ASSET}" alt="${ALT}" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">`,'  </figure>','</section>',END].join('\n');
const retiredBlocks=[/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->\n?/gi,/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->\n?/gi,/\n?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->\n?/gi];
for(const re of retiredBlocks)html=html.replace(re,'\n');
html=html.replace(/\s*<link\b[^>]*(?:id=["']qily(?:C919|Aircraft)(?:DigitalFlagshipHero|HeroPreload|HeroStylesheet)[^"']*["']|href=["'][^"']*(?:qily-c919-digital-flagship-hero-v1\.css|c919-strategy-hero-v14\.(?:webp|png)|qilylean-aircraft-hero-v1\.webp|qilylean-aircraft-hero-approved-20260826\.png|qily-aircraft-brand-hero-v1\.css)(?:\?[^"']*)?["'])[^>]*>\s*/gi,'\n');
if(!html.includes('</head>'))throw new Error('Homepage </head> missing');
html=html.replace('</head>',`${stylesheet}\n${preload}\n</head>`);
if(!/<main\b[^>]*>/i.test(html))throw new Error('Homepage <main> missing');
html=html.replace(/(<main\b[^>]*>)/i,`$1\n${hero}`);
fs.writeFileSync(target,html.endsWith('\n')?html:html+'\n','utf8');
const validatorPath=path.join(root,'scripts','validate-sitewide-remediation-20260822.js');
if(fs.existsSync(validatorPath)){
 let validator=fs.readFileSync(validatorPath,'utf8');
 const current=`assert(home.includes('<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->'),'Homepage aircraft brand hero start marker missing.');\nassert(home.indexOf('QILY-AIRCRAFT-BRAND-HERO-V1:START')<home.indexOf('<section class="hero">'),'Aircraft brand visual is not the first homepage content visual.');\nassert(home.includes('/assets/qilylean-aircraft-hero-v1.webp?v=20260826-aircraft-hero-v1'),'Homepage canonical aircraft visual asset/cache key missing.');\nassert(!/<img\\b[^>]+c919-strategy-hero-v14.(?:png|webp)/i.test(home),'A retired aircraft image is still rendered on homepage.');`;
 const approved=`assert(home.includes('<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->'),'Homepage aircraft brand hero start marker missing.');\nassert(home.indexOf('QILY-AIRCRAFT-BRAND-HERO-V1:START')<home.indexOf('<section class="hero">'),'Aircraft brand visual is not the first homepage content visual.');\nassert(home.includes('/assets/qilylean-aircraft-hero-approved-20260826.png?v=20260826-aircraft-approved-v1'),'Homepage approved aircraft visual asset/cache key missing.');\nassert(!/<(?:img|source)\\b[^>]+(?:c919-strategy-hero|qilylean-aircraft-hero-v1\\.webp)/i.test(home),'A retired aircraft image source is still rendered on homepage.');`;
 if(validator.includes(current))validator=validator.replace(current,approved);
 fs.writeFileSync(validatorPath,validator.endsWith('\n')?validator:validator+'\n','utf8');
}
console.log('QilyLean approved aircraft hero materialized from one canonical PNG asset.');
