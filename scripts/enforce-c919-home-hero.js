#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
const IMAGE = '/qilylean/c919-strategy-hero-v13.png';
const PUBLIC = 'https://qilylean.com/qilylean/c919-strategy-hero-v13.png';
let html = fs.readFileSync(target, 'utf8');

const START = '<!-- QILY-C919-STRATEGY-HERO:START -->';
const END = '<!-- QILY-C919-STRATEGY-HERO:END -->';
const STYLE_START = '<!-- QILY-C919-HERO-STYLES:START -->';
const STYLE_END = '<!-- QILY-C919-HERO-STYLES:END -->';

// Always normalize any previous C919 hero/version before inserting the approved v13 baseline.
html = html.replace(/\n?<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\n?/gi, '\n');
html = html.replace(/\n?<!-- QILY-C919-HERO-STYLES:START -->[\s\S]*?<!-- QILY-C919-HERO-STYLES:END -->\n?/gi, '\n');
html = html.replace(/\s*<link[^>]+rel=["']preload["'][^>]+href=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');
html = html.replace(/\s*<meta\s+property=["']og:image["'][^>]*content=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');
html = html.replace(/\s*<meta\s+name=["']twitter:image["'][^>]*content=["'][^"']*c919-strategy-hero[^"']*["'][^>]*>\s*/gi, '\n');

const styles = `${STYLE_START}
<style id="qilyC919HeroStylesV13">
.qily-c919-flightmap{padding:12px clamp(14px,2.4vw,34px) 34px;background:linear-gradient(180deg,#eef8fb 0%,#f7fbfa 100%);border-bottom:1px solid #d5e4e3}.qily-c919-flightmap__inner{width:min(1480px,100%);margin:0 auto}.qily-c919-flightmap__figure{position:relative;aspect-ratio:1693/833;margin:0;overflow:hidden;border:1px solid rgba(15,75,90,.18);border-radius:22px;background:#0e5d8a;box-shadow:0 20px 52px rgba(7,60,71,.16)}.qily-c919-flightmap__figure img{display:block;width:100%;height:auto;transform:translateY(-10.3348%);transform-origin:top center}.qily-c919-flightmap__overview{margin:18px auto 0;padding:22px clamp(20px,3vw,36px);border:1px solid #d9e4df;border-radius:18px;background:#fff;box-shadow:0 10px 28px rgba(7,60,71,.08)}.qily-c919-flightmap__kicker{display:block;color:#9e4a34;font-size:12px;font-weight:950;letter-spacing:.08em}.qily-c919-flightmap__overview h1{margin:7px 0 10px;color:#0f4b5a;font-size:clamp(28px,3vw,46px);line-height:1.16}.qily-c919-flightmap__overview p{margin:0;color:#4f6665;font-size:clamp(16px,1.35vw,19px);line-height:1.75}.qily-c919-flightmap__routes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.qily-c919-flightmap__route{padding:14px 16px;border-left:4px solid #caa15f;background:#f8fbfa;color:#315f64;font-size:15px;line-height:1.65}.qily-c919-flightmap__route strong{display:block;color:#0f4b5a;font-size:17px}.qily-c919-flightmap__energy{margin-top:14px!important;padding-top:14px;border-top:1px solid #e2ece8;font-weight:800;color:#173f47!important}@media(max-width:760px){.qily-c919-flightmap{padding-left:10px;padding-right:10px}.qily-c919-flightmap__figure{border-radius:14px}.qily-c919-flightmap__routes{grid-template-columns:1fr}.qily-c919-flightmap__overview{padding:18px}}
</style>
${STYLE_END}`;

const hero = `${START}
<section class="qily-c919-flightmap" id="qily-c919-strategy" aria-labelledby="qily-c919-strategy-title" data-qily-c919-version="v13-approved-20260818">
  <div class="qily-c919-flightmap__inner">
    <figure class="qily-c919-flightmap__figure" data-crop="remove-embedded-site-header">
      <img src="${IMAGE}?v=20260818-v13-approved" width="1693" height="929" alt="QilyLean启力精益C919战略蓝图：六类核心业务部署于两侧主机翼，技术灵魂与机身内核构成持续改善与价值创造的动力能源" loading="eager" decoding="async" fetchpriority="high">
    </figure>
    <div class="qily-c919-flightmap__overview">
      <small class="qily-c919-flightmap__kicker">QILYLEAN STRATEGIC FLIGHT MAP｜启力精益战略蓝图</small>
      <h1 id="qily-c919-strategy-title">以精益为基 · 以数字为翼 · 价值共创 · 未来共赢</h1>
      <p>这不是一张装饰性的飞机图，而是QilyLean面向制造企业的战略能力模型：六类核心业务部署在两侧主机翼，代表可持续扩展的业务承载；真正推动飞机远航的，是沉淀在机身内核中的精益思想、系统逻辑、数据驱动、标准化、流程优化、持续改善、项目交付与价值创造。</p>
      <div class="qily-c919-flightmap__routes">
        <div class="qily-c919-flightmap__route"><strong>制造／精益工程翼｜1 → 2 → 3</strong>新工厂／新产线规划 → 精益改善项目交付 → 目视化项目设计与交付</div>
        <div class="qily-c919-flightmap__route"><strong>数智化业务翼｜6 → 5 → 4</strong>官网建设 → APP软件开发 → 数字化工厂</div>
      </div>
      <p class="qily-c919-flightmap__energy">业务模块决定“翼展”，职能技术决定“动力”。以制造工程与精益方法打底，以数字化能力放大改善成果，让客户高质量发展与启力精益展翼远航形成同一条价值航线。</p>
    </div>
  </div>
</section>
${END}`;

if (!html.includes('</head>')) throw new Error('Missing </head>');
if (!/<main(?:\s[^>]*)?>/i.test(html)) throw new Error('Missing <main>');

html = html.replace('</head>', `  <link rel="preload" as="image" href="${IMAGE}?v=20260818-v13-approved" type="image/png" fetchpriority="high">\n  <meta property="og:image" content="${PUBLIC}">\n  <meta name="twitter:image" content="${PUBLIC}">\n${styles}\n</head>`);
html = html.replace(/(<main(?:\s[^>]*)?>)/i, `$1\n\n${hero}\n`);
html = html.replace(/\n{4,}/g, '\n\n\n');
fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('C919 v13 approved strategic flight map restored to homepage head position with 6→5→4 digital-wing order and technology-as-energy overview.');
