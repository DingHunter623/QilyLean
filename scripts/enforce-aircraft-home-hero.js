#!/usr/bin/env node
'use strict';

/* QilyLean aircraft brand hero — neutral single-source authority */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'index.html');
let html=fs.readFileSync(target,'utf8');

const START='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->';
const END='<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->';
const ASSET='/assets/qilylean-aircraft-hero-v1.webp?v=20260826-aircraft-hero-v1';
const STYLESHEET='/styles/qily-aircraft-brand-hero-v1.css?v=20260826-aircraft-hero-v1';
const ALT='QilyLean｜启力精益飞机品牌主视觉，左右机翼展示新工厂与新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六项业务能力';
const preload=`<link id="qilyAircraftHeroPreloadV1" rel="preload" as="image" href="${ASSET}" type="image/webp" fetchpriority="high">`;
const stylesheet=`<link id="qilyAircraftHeroStylesheetV1" rel="stylesheet" href="${STYLESHEET}">`;
const hero=[
  START,
  '<section class="qily-aircraft-brand-hero" aria-label="QilyLean｜启力精益飞机品牌主视觉">',
  '  <figure>',
  `    <img src="${ASSET}" alt="${ALT}" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">`,
  '  </figure>',
  '</section>',
  END
].join('\n');

// Remove every retired aircraft hero generation to prevent old artwork from resurfacing.
const retiredBlocks=[
  /\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi,
  /\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\n?/gi,
  /\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->\n?/gi,
  /\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->\n?/gi,
  /\n?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->[\s\S]*?<!-- QILY-AIRCRAFT-BRAND-HERO-V1:END -->\n?/gi
];
for(const re of retiredBlocks) html=html.replace(re,'\n');

// Remove stale stylesheet/preload chains, including all historical C919-named hero references.
html=html.replace(/\s*<link\b[^>]*(?:id=["']qily(?:C919|Aircraft)(?:DigitalFlagshipHero|HeroPreload|HeroStylesheet)[^"']*["']|href=["'][^"']*(?:qily-c919-digital-flagship-hero-v1\.css|c919-strategy-hero-v14\.(?:webp|png)|qilylean-aircraft-hero-v1\.webp|qily-aircraft-brand-hero-v1\.css)(?:\?[^"']*)?["'])[^>]*>\s*/gi,'\n');

if(!html.includes('</head>')) throw new Error('Homepage </head> missing');
html=html.replace('</head>',`${stylesheet}\n${preload}\n</head>`);
if(!/<main\b[^>]*>/i.test(html)) throw new Error('Homepage <main> missing');
html=html.replace(/(<main\b[^>]*>)/i,`$1\n${hero}`);

fs.writeFileSync(target,html.endsWith('\n')?html:html+'\n','utf8');

// Keep shared visual regression validation aligned with the neutral aircraft authority.
const validatorPath=path.join(root,'scripts','validate-sitewide-remediation-20260822.js');
if(fs.existsSync(validatorPath)){
  let validator=fs.readFileSync(validatorPath,'utf8');
  const legacy=`assert(home.includes('<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->'),'Homepage C919 V4 start marker missing.');
assert(home.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START')<home.indexOf('<section class="hero">'),'C919 is not the first homepage content visual.');
assert(home.includes('/qilylean/c919-strategy-hero-v14.png?v=20260826-c919-crossbrowser-v1'),'Homepage latest V14 aircraft visual asset/cache key missing.');
assert(!home.includes('c919-strategy-hero-v14.webp'),'Homepage still references retired V14 WebP source.');`;
  const neutral=`assert(home.includes('<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->'),'Homepage aircraft brand hero start marker missing.');
assert(home.indexOf('QILY-AIRCRAFT-BRAND-HERO-V1:START')<home.indexOf('<section class="hero">'),'Aircraft brand visual is not the first homepage content visual.');
assert(home.includes('/assets/qilylean-aircraft-hero-v1.webp?v=20260826-aircraft-hero-v1'),'Homepage canonical aircraft visual asset/cache key missing.');
assert(!/<img\b[^>]+c919-strategy-hero-v14\.(?:png|webp)/i.test(home),'A retired aircraft image is still rendered on homepage.');`;
  if(validator.includes(legacy)) validator=validator.replace(legacy,neutral);
  fs.writeFileSync(validatorPath,validator.endsWith('\n')?validator:validator+'\n','utf8');
}
console.log('QilyLean neutral aircraft hero materialized from one canonical WebP asset.');
