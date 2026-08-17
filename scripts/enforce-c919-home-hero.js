#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'index.html');
let html = fs.readFileSync(target, 'utf8');

const IMAGE = '/qilylean/c919-strategy-hero-v12.webp';
const HERO = `<!-- QILY-C919-STRATEGY-HERO:START -->
<section class="qily-c919-flightmap" id="qily-c919-strategy" aria-labelledby="qily-c919-title">
  <div class="qily-c919-shell">
    <div class="qily-c919-visual">
      <img src="${IMAGE}" width="1672" height="941" fetchpriority="high" decoding="async" alt="启力精益C919战略蓝图：六类核心业务、技术灵魂、助企业高质量发展与启力精益展翼远航">
    </div>
    <div class="qily-c919-soul">
      <span class="qily-c919-kicker">QILYLEAN STRATEGIC FLIGHT MAP｜启力精益战略蓝图</span>
      <h1 id="qily-c919-title">以精益为基 · 以数字为翼 · 价值共创 · 未来共赢</h1>
      <p class="qily-c919-lead">这不是一张装饰性的飞机图，而是一张启力精益面向制造企业的战略蓝图。</p>
      <p class="qily-c919-copy">左翼承载<strong>1～3：新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付</strong>，右翼承载<strong>4～6：数字化工厂、APP软件开发、官网建设</strong>；机身凝聚精益思维、系统逻辑、数据驱动、标准化、流程优化、持续改善、项目交付与价值创造。以六类核心业务为翼，以方法论与工程技术为核，<strong>助企业高质量发展</strong>，也让<strong>启力精益展翼远航</strong>。</p>
      <div class="qily-c919-axis" aria-label="双重发展主旨">
        <div><small>客户价值</small><b>助企业高质量发展</b></div>
        <div><small>品牌事业</small><b>启力精益展翼远航</b></div>
      </div>
      <div class="qily-c919-actions">
        <a class="primary" href="/cooperation/#services">了解六类核心业务</a>
        <a href="/projects/">查看代表项目</a>
        <a href="/cooperation/">立即洽谈合作</a>
      </div>
    </div>
  </div>
</section>
<!-- QILY-C919-STRATEGY-HERO:END -->`;

const STYLE = `<!-- QILY-C919-HERO-STYLES:START -->
<style id="qilyC919HeroStyles">
.qily-c919-flightmap{padding:clamp(20px,2.6vw,34px) clamp(14px,3vw,38px) clamp(38px,5vw,64px);background:linear-gradient(180deg,#e9f7ff 0%,#f6fbff 44%,#fff 100%);border-bottom:1px solid #cfe2e7}.qily-c919-shell{width:min(1500px,100%);margin:auto}.qily-c919-visual{overflow:hidden;border:1px solid rgba(15,75,90,.18);border-radius:clamp(12px,1.5vw,22px);background:#ccecff;box-shadow:0 20px 54px rgba(7,60,71,.18)}.qily-c919-visual img{display:block;width:100%;height:auto;aspect-ratio:1672/941;object-fit:cover}.qily-c919-soul{width:min(1420px,calc(100% - 24px));margin:28px auto 0;position:relative;z-index:2;padding:clamp(24px,3.2vw,40px);border:1px solid rgba(202,161,95,.52);border-radius:18px;background:rgba(255,255,255,.97);box-shadow:0 18px 46px rgba(7,60,71,.14);backdrop-filter:blur(10px)}.qily-c919-kicker{display:block;color:#9e4a34;font-size:13px;font-weight:950;letter-spacing:.08em}.qily-c919-soul h1{margin:8px 0 14px;color:#0f4b5a;font-size:clamp(30px,3.4vw,48px);line-height:1.16}.qily-c919-lead{margin:0 0 8px;color:#244d58;font-size:clamp(18px,1.55vw,22px);font-weight:900}.qily-c919-copy{margin:0;color:#536c70;font-size:17px;line-height:1.9}.qily-c919-copy strong{color:#0f4b5a}.qily-c919-axis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px}.qily-c919-axis>div{padding:14px 16px;border-left:4px solid #caa15f;border-radius:8px;background:#f2f8f7}.qily-c919-axis small{display:block;color:#758c8c;font-size:12px;font-weight:850}.qily-c919-axis b{display:block;margin-top:2px;color:#0f4b5a;font-size:20px}.qily-c919-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.qily-c919-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:9px 17px;border:1px solid #9fc5c4;border-radius:8px;color:#0f4b5a;background:#fff;text-decoration:none;font-weight:900}.qily-c919-actions a.primary{color:#fff;background:#0f4b5a;border-color:#0f4b5a}.qily-c919-actions a:hover,.qily-c919-actions a:focus-visible{transform:translateY(-1px);box-shadow:0 8px 20px rgba(15,75,90,.13)}@media(max-width:760px){.qily-c919-flightmap{padding-left:10px;padding-right:10px}.qily-c919-soul{width:calc(100% - 10px);margin:16px auto 0;padding:22px 18px}.qily-c919-axis{grid-template-columns:1fr}.qily-c919-copy{font-size:15px;line-height:1.8}.qily-c919-actions a{width:100%}}
</style>
<!-- QILY-C919-HERO-STYLES:END -->`;

const heroRe = /<!-- QILY-C919-STRATEGY-HERO:START -->[\s\S]*?<!-- QILY-C919-STRATEGY-HERO:END -->\s*/m;
html = html.replace(heroRe, '');
if (!/<main\b[^>]*>/i.test(html)) throw new Error('Homepage <main> not found');
html = html.replace(/(<main\b[^>]*>)/i, `$1\n${HERO}\n`);

const styleRe = /<!-- QILY-C919-HERO-STYLES:START -->[\s\S]*?<!-- QILY-C919-HERO-STYLES:END -->\s*/m;
html = html.replace(styleRe, '');
if (!/<\/head>/i.test(html)) throw new Error('Homepage </head> not found');
html = html.replace(/<\/head>/i, `${STYLE}\n</head>`);

const preload = `<link rel="preload" as="image" href="${IMAGE}" type="image/webp" fetchpriority="high">`;
html = html.replace(/<link[^>]+rel=["']preload["'][^>]+href=["']\/qilylean\/c919-strategy-hero(?:-v\d+)?\.(?:png|svg|webp)["'][^>]*>\s*/gi, '');
html = html.replace(/(<link rel="canonical"[^>]*>)/i, `$1\n${preload}`);

function setMeta(property, value, attr='property') {
  const re = new RegExp(`<meta\\s+${attr}=["']${property.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${property}" content="${value}">`;
  if (re.test(html)) html = html.replace(re, tag);
  else html = html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}
setMeta('og:image','https://qilylean.com/qilylean/c919-strategy-hero-v12.webp');
setMeta('og:title','QilyLean｜启力精益｜六类核心业务战略蓝图');
setMeta('og:description','以精益为基、以数字为翼：六类核心业务构建制造工程与数智化交付闭环，助企业高质量发展，启力精益展翼远航。');
setMeta('twitter:card','summary_large_image','name');
setMeta('twitter:image','https://qilylean.com/qilylean/c919-strategy-hero-v12.webp','name');
setMeta('twitter:description','以六类核心业务为翼、以方法论与工程技术为核，助企业高质量发展，启力精益展翼远航。','name');

html = html.replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="QilyLean｜启力精益：新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六类核心业务，助企业高质量发展。">');
html = html.replace(/聚焦新工厂／新产线规划、精益改善、目视化项目三大核心业务，以数智化工厂与自主数字作品增强制造工程交付。/g, '聚焦新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设六类核心业务，贯通制造工程与数智化产品交付。');
html = html.replace(/三大核心业务/g, '六类核心业务');

fs.writeFileSync(target, html.endsWith('\n') ? html : html + '\n', 'utf8');
console.log('C919 homepage flight map enforced: final approved v12 WebP is homepage number-one visual; semantic left wing 1-3/right wing 4-6 locked.');
