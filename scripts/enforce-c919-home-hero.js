#!/usr/bin/env node
'use strict';

/* QilyLean C919 Digital Flagship Hero V4 — single-source cross-browser baseline */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'index.html');
let html=fs.readFileSync(target,'utf8');
const start="<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->";
const end="<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->";
const asset="/qilylean/c919-strategy-hero-v14.png?v=20260826-c919-crossbrowser-v1";
const alt="QilyLean 最新飞机主视觉，俯视爬升机型的左右机翼展示新工厂和新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六项业务，右下角为官网二维码";
const preload='<link id="qilyC919HeroPreloadV1" rel="preload" as="image" href="'+asset+'" type="image/png" fetchpriority="high">';
const stylesheet='<link id="qilyC919DigitalFlagshipHeroV4" rel="stylesheet" href="/styles/qily-c919-digital-flagship-hero-v1.css?v=20260822-latest-aircraft-v7">';
const hero=[
  start,
  '<section class="qily-c919-digital-flagship-hero" aria-label="QilyLean 最新飞机数字品牌旗舰主视觉">',
  '  <figure>',
  '    <img src="'+asset+'" alt="'+alt+'" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">',
  '    <figcaption><strong>QilyLean 最新飞机数字品牌旗舰</strong><span>制造／精益工程直接交付 × 数字化／智能化能力增强</span></figcaption>',
  '  </figure>',
  '</section>',
  end
].join('\n');
html=html.replace(/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi,'\n');
html=html.replace(/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\n?/gi,'\n');
html=html.replace(/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->\n?/gi,'\n');
html=html.replace(/\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->[\s\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->\n?/gi,'\n');
html=html.replace(/\s*<link\b[^>]*(?:id=["']qilyC919DigitalFlagshipHero[^"']*["']|href=["'][^"']*\/styles\/qily-c919-digital-flagship-hero-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n');
html=html.replace(/\s*<link\b[^>]*(?:id=["']qilyC919HeroPreloadV1["']|href=["'][^"']*c919-strategy-hero-v14\.(?:webp|png)(?:\?v=[^"']*)?["'])[^>]*>\s*/gi,'\n');
html=html.replace('</head>',stylesheet+'\n'+preload+'\n</head>');
if(!html.includes(start))html=html.replace(/(<main\b[^>]*>)/i,'$1\n'+hero);
fs.writeFileSync(target,html.endsWith('\n')?html:html+'\n','utf8');
console.log('QilyLean C919 V4 single-source PNG hero materialized.');
