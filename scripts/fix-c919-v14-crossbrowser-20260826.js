#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const ASSET_PATH='qilylean/c919-strategy-hero-v14.png';
const ASSET_URL='/qilylean/c919-strategy-hero-v14.png?v=20260826-c919-crossbrowser-v1';
const PRELOAD=`<link id="qilyC919HeroPreloadV1" rel="preload" as="image" href="${ASSET_URL}" type="image/png" fetchpriority="high">`;
const START='<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->';
const END='<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->';
const ALT='QilyLean 最新飞机主视觉，俯视爬升机型的左右机翼展示新工厂和新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六项业务，右下角为官网二维码';

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8')}
function write(rel,text){fs.writeFileSync(path.join(root,rel),text.endsWith('\n')?text:text+'\n','utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

function validatePng(){
  const p=path.join(root,ASSET_PATH);
  assert(fs.existsSync(p),'C919 PNG authority asset missing');
  const b=fs.readFileSync(p);
  assert(b.length>500000,`C919 PNG unexpectedly small: ${b.length}`);
  assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'C919 authority asset is not a valid PNG signature');
  const width=b.readUInt32BE(16),height=b.readUInt32BE(20);
  assert(width===1672&&height===941,`C919 PNG dimensions changed: ${width}x${height}`);
}

function materializeHome(){
  const file='index.html';
  let html=read(file);
  html=html.replace(/\s*<link\b[^>]*(?:id=["']qilyC919HeroPreloadV1["']|href=["'][^"']*c919-strategy-hero-v14\.(?:webp|png)(?:\?[^"']*)?["'])[^>]*>\s*/gi,'\n');
  assert(html.includes('</head>'),'Homepage head close tag missing');
  html=html.replace('</head>',`${PRELOAD}\n</head>`);
  const hero=`${START}\n<section class="qily-c919-digital-flagship-hero" aria-label="QilyLean 最新飞机数字品牌旗舰主视觉">\n  <figure>\n    <img src="${ASSET_URL}" alt="${ALT}" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">\n    <figcaption><strong>QilyLean 最新飞机数字品牌旗舰</strong><span>制造／精益工程直接交付 × 数字化／智能化能力增强</span></figcaption>\n  </figure>\n</section>\n${END}`;
  const re=new RegExp(`${START}[\\s\\S]*?${END}`,'g');
  assert(re.test(html),'Homepage C919 V4 block missing');
  html=html.replace(re,hero);
  write(file,html);
}

function materializeEnforcer(){
  const content=`#!/usr/bin/env node\n'use strict';\n\n/* QilyLean C919 Digital Flagship Hero V4 — single-source cross-browser baseline */\nconst fs=require('fs');\nconst path=require('path');\nconst root=path.resolve(__dirname,'..');\nconst target=path.join(root,'index.html');\nlet html=fs.readFileSync(target,'utf8');\nconst start='${START}';\nconst end='${END}';\nconst asset='${ASSET_URL}';\nconst preload='<link id="qilyC919HeroPreloadV1" rel="preload" as="image" href="'+asset+'" type="image/png" fetchpriority="high">';\nconst stylesheet='<link id="qilyC919DigitalFlagshipHeroV4" rel="stylesheet" href="/styles/qily-c919-digital-flagship-hero-v1.css?v=20260822-latest-aircraft-v7">';\nconst hero=\\`\\${start}\n<section class="qily-c919-digital-flagship-hero" aria-label="QilyLean 最新飞机数字品牌旗舰主视觉">\n  <figure>\n    <img src="\\${asset}" alt="${ALT}" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high">\n    <figcaption><strong>QilyLean 最新飞机数字品牌旗舰</strong><span>制造／精益工程直接交付 × 数字化／智能化能力增强</span></figcaption>\n  </figure>\n</section>\n\\${end}\\`;\nhtml=html.replace(/\\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\\s\\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\\n?/gi,'\\n');\nhtml=html.replace(/\\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:START -->[\\s\\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V1:END -->\\n?/gi,'\\n');\nhtml=html.replace(/\\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:START -->[\\s\\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V2:END -->\\n?/gi,'\\n');\nhtml=html.replace(/\\n?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START -->[\\s\\S]*?<!-- QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:END -->\\n?/gi,'\\n');\nhtml=html.replace(/\\s*<link\\b[^>]*(?:id=["']qilyC919DigitalFlagshipHero[^"']*["']|href=["'][^"']*\\/styles\\/qily-c919-digital-flagship-hero-v1\\.css(?:\\?v=[^"']*)?["'])[^>]*>\\s*/gi,'\\n');\nhtml=html.replace(/\\s*<link\\b[^>]*(?:id=["']qilyC919HeroPreloadV1["']|href=["'][^"']*c919-strategy-hero-v14\\.(?:webp|png)(?:\\?[^"']*)?["'])[^>]*>\\s*/gi,'\\n');\nhtml=html.replace('</head>',stylesheet+'\\n'+preload+'\\n</head>');\nif(!html.includes(start))html=html.replace(/(<main\\b[^>]*>)/i,'$1\\n'+hero);\nfs.writeFileSync(target,html.endsWith('\\n')?html:html+'\\n','utf8');\nconsole.log('QilyLean C919 V4 single-source PNG hero materialized.');\n`;
  write('scripts/enforce-c919-home-hero.js',content);
}

function materializeGuard(){
  const content=`#!/usr/bin/env node\n'use strict';\nconst fs=require('fs');\nconst path=require('path');\nconst root=path.resolve(__dirname,'..');\nconst html=fs.readFileSync(path.join(root,'index.html'),'utf8');\nconst asset=path.join(root,'${ASSET_PATH}');\nconst css=fs.readFileSync(path.join(root,'styles','qily-c919-digital-flagship-hero-v1.css'),'utf8');\nfunction assert(ok,msg){if(!ok)throw new Error(msg)}\nconst b=fs.readFileSync(asset);\nassert(html.includes('${START}'),'C919 V4 homepage start marker missing');\nassert(html.includes('${END}'),'C919 V4 homepage end marker missing');\nassert(html.includes('/styles/qily-c919-digital-flagship-hero-v1.css?v=20260822-latest-aircraft-v7'),'Latest-aircraft V7 stylesheet cache key missing');\nassert(html.includes('src="${ASSET_URL}"'),'C919 single-source PNG is not rendered');\nassert(html.includes('href="${ASSET_URL}" type="image/png"'),'C919 PNG preload/cache key missing');\nassert(!html.includes('c919-strategy-hero-v14.webp'),'Retired V14 WebP source returned to homepage');\nassert(!/<picture>[\\s\\S]*?c919-strategy-hero-v14/i.test(html),'Competing picture/source chain returned to C919 hero');\nassert(html.indexOf('QILY-C919-DIGITAL-FLAGSHIP-HERO-V4:START')<html.indexOf('<section class="hero">'),'C919 is not the first homepage content visual');\nassert(b.length>500000,'C919 PNG asset is unexpectedly small');\nassert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'C919 PNG signature invalid');\nassert(b.readUInt32BE(16)===1672&&b.readUInt32BE(20)===941,'C919 PNG dimensions invalid');\nassert(css.includes('C919 Digital Flagship Hero V6'),'C919 stylesheet is not V6');\nconsole.log('PASS: C919 homepage uses one validated PNG authority asset with cache-busting and no competing WebP source.');\n`;
  write('scripts/site-regression-guard-c919-hero.js',content);
}

function patchValidators(){
  const validator='scripts/validate-sitewide-remediation-20260822.js';
  let v=read(validator);
  v=v.replace("assert(home.includes('/qilylean/c919-strategy-hero-v14.png'),'Homepage latest V14 aircraft visual asset missing.');",`assert(home.includes('${ASSET_URL}'),'Homepage latest V14 aircraft visual asset/cache key missing.');\nassert(!home.includes('c919-strategy-hero-v14.webp'),'Homepage still references retired V14 WebP source.');`);
  write(validator,v);

  const audit='.github/workflows/apply-sitewide-audit-performance-visual-20260824.yml';
  let y=read(audit);
  y=y.replace('c919-strategy-hero-v14.webp?v=20260824-sitewide-perf-v1','c919-strategy-hero-v14.png?v=20260826-c919-crossbrowser-v1');
  write(audit,y);
}

validatePng();
materializeHome();
materializeEnforcer();
materializeGuard();
patchValidators();
validatePng();
console.log('C919_CROSS_BROWSER_SINGLE_SOURCE_MATERIALIZED');
