const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'global-knowledge');
const publicStylesheets = new Set([
  '/site-visual-authority-r8.css?v=20260831-r8-authority-v2-redline-closure',
  '/site-public-footer-type-v1.css?v=20261005-public-footer-v3',
]);
const forbiddenSchemes = /^(?:mailto:|tel:|weixin:|whatsapp:)/i;
const forbiddenRoutes = /\/(?:cooperation|links|projects|contact|trust|capabilities|experience|improvements|lean-production)(?:\/|$)/i;

function walk(p) {
  return fs.readdirSync(p, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(p, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(dir)) {
  fail('global-knowledge directory is missing');
  process.exit(1);
}

const htmlFiles = walk(dir).filter((f) => /\.html?$/i.test(f));
const referenceFooter=fs.readFileSync(path.join(dir,'briefs/index.html'),'utf8').match(/<footer class="cn-bridge-footer">[\s\S]*?<\/footer>/)[0];
if (htmlFiles.length < 4) fail('Global Knowledge isolation pages are incomplete');

for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(referenceFooter)) fail(`${rel} must use the exact selected-briefs footer`);
  if (html.includes('cn-bridge-footer-brand')) fail(`${rel} international bridge footer must not display mainland filing site name`);

  if (!html.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20261007-international-home-v7')) fail(`${rel} shared footer actions are missing`);
  if (/knowledge-dock-v1\.js|site-dock-share-runtime-v1\.js|site-contact-route-v1\.js|湘ICP备|湘公网安备/.test(html)) fail(`${rel} must not restore old Dock actions or China filing records`);
  if (rel!=='global-knowledge/briefs/index.html'&&!html.includes('/global-knowledge/cn-bridge-footer-v1.css?v=20261007-two-actions-no-filing-v4')) fail(`${rel} shared reference footer stylesheet missing`);
  const hrefs = [...html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);

  for (const href of hrefs) {
    if (forbiddenSchemes.test(href)) fail(`${rel} contains direct contact link: ${href}`);
    if (forbiddenRoutes.test(href)) fail(`${rel} links to a commercial/main-site route: ${href}`);

    if (/^https?:\/\//i.test(href)) {
      if (href === 'https://qilylean.com/' || /^https:\/\/qilylean\.cn\/(?:|lean\/|notes\/|knowledge\/|briefs\/|resources\/|about\/)$/i.test(href) || /^https:\/\/qilylean\.com\/global-knowledge\//i.test(href) || href === 'https://beian.miit.gov.cn/' || /^https:\/\/beian\.mps\.gov\.cn\/#\/query\/webSearch\?code=43020002000443$/i.test(href)) continue;
      fail(`${rel} contains non-isolated external link: ${href}`);
      continue;
    }

    // Shared presentation assets are allowed as stylesheets, never as navigation links.
    if (publicStylesheets.has(href) && [...html.matchAll(/<link\b[^>]*>/gi)].some(m=>/\brel=[\"']stylesheet[\"']/i.test(m[0]) && m[0].includes('href=\"'+href+'\"'))) continue;
    if (href.startsWith('#')) continue;
    if (href.startsWith('/global-knowledge/')) continue;
    if (href === '/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16') continue;
    fail(`${rel} contains a direct non-isolated href: ${href}`);
  }

  if (/\b(?:mailto:|tel:|weixin:|whatsapp:)/i.test(html)) fail(`${rel} contains a direct contact scheme`);
  if (rel === 'global-knowledge/briefs/index.html') {
    if (!html.includes('<a class="cn-bridge-brand" href="https://qilylean.com/" aria-label="返回国际站" title="返回国际站"><img src="/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5" alt="QilyLean｜启力精益"></a>')) fail(`${rel} bridge logo must return to international homepage`);
    if (html.includes('class="cn-bridge-brand" href="https://qilylean.cn/"')) fail(`${rel} bridge logo must not return to China site`);
    for (const route of ['https://qilylean.cn/','https://qilylean.cn/lean/','https://qilylean.cn/notes/','https://qilylean.cn/knowledge/','https://qilylean.cn/briefs/','https://qilylean.cn/resources/','https://qilylean.cn/about/']) {
      if (!html.includes(`href="${route}"`)) fail(`${rel} China-parity header missing: ${route}`);
    }
    if (!html.includes('/global-knowledge/cn-bridge-shell-v1.css?v=20260928-cn-parity-shell-v6-footer-nav-parity')) fail(`${rel} China-parity bridge shell stylesheet missing`);
    if (!html.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20261007-international-home-v7')) fail(`${rel} China-parity bridge footer runtime missing`);
    if (!html.includes('bridge-hero-eyebrow')) fail(`${rel} bridge hero eyebrow must use the shared gold VI class`);
    if (html.includes('/global-knowledge/knowledge-dock-v1.js')) fail(`${rel} retired seven-action knowledge dock returned`);
  } else {
    if (!html.includes('<a class="brand" href="https://qilylean.com/" aria-label="返回国际站" title="返回国际站">QilyLean Global Knowledge</a>')) fail(`${rel} brand must return to the canonical qilylean.com homepage`);
    if (!html.includes('href="https://qilylean.cn/" rel="noopener">China Knowledge / 精益制造经验分享</a>')) fail(`${rel} must expose the filed China knowledge route`);
  }
}

const leanKnowledge = fs.readFileSync(path.join(root, 'qilylean', 'lean-knowledge.html'), 'utf8');
if ((leanKnowledge.match(/<article class="article" id="lean-tools-feature">[\s\S]*?<ul class="tag-row">([\s\S]*?)<\/ul>/)||[])[1]?.match(/<li>/g)?.length !== 10) fail('lean knowledge ten-tool source list must contain exactly 10 visible tools');

const reader = fs.readFileSync(path.join(dir, 'view', 'index.html'), 'utf8');
if (!reader.includes('var ALLOWED=[')) fail('isolated reader allowlist is missing');
if (forbiddenRoutes.test(reader.match(/var ALLOWED=\[[\s\S]*?\];/)?.[0] || '')) fail('isolated reader allowlist contains a commercial route');
if (!reader.includes("root.querySelectorAll('script,style,header,footer,nav,form,button,input,textarea,select,iframe,object,embed")) fail('isolated reader sanitizer is missing structural removal');
if (!reader.includes('Presentation firewall: white-listed documents contribute content, never source-page visual skin.')) {
  fail('generic knowledge reader presentation firewall marker is missing');
}
if (!reader.includes("a.name==='class'||a.name==='style'")) {
  fail('generic knowledge reader must strip imported class/style attributes to prevent source-page VI leakage');
}
if (!reader.includes("a.setAttribute('data-qily-reader-source','weibo')") || !reader.includes("weibo\\.com")) {
  fail('generic knowledge reader must preserve approved Weibo source links as isolated external references');
}
if (!reader.includes('.content article[id^="lean-"]>small') || !reader.includes('font-size:18px!important')) fail('Weibo module badge visual hierarchy is missing');
if (!reader.includes('.content #lean-tools-feature>ul:first-of-type>li')) fail('ten-tool reader visual grid is missing');

const briefs = fs.readFileSync(path.join(dir, 'briefs', 'index.html'), 'utf8');
if (!briefs.includes('Presentation firewall: legacy imported briefs contribute knowledge content without source-page skin.')) {
  fail('brief reader presentation firewall marker is missing');
}
if (!briefs.includes("a.name==='style'||(a.name==='class'&&!preserveVi)")) {
  fail('brief reader must keep legacy class stripping while allowing the governed VI-parity exception');
}
if (!briefs.includes("doc.body.classList.contains('plan-closure-brief')") || !briefs.includes("data-qily-imported-brief-css")) {
  fail('Sep 28 bridge reader must load the approved issue stylesheet under an explicit VI scope');
}
if (!briefs.includes('qilyBridgeBriefReaderTypeGuardV1') || !briefs.includes('html body main #readerHead.reader-head h1{font-size:clamp(30px,2.05vw,36px)!important')) {
  fail('brief reader H1 must override the sitewide R8 scale with the restrained curated-brief title scale');
}
if (!briefs.includes('.reader[data-source-vi="true"] .article{padding:0;border:0;background:transparent}')) {
  fail('governed bridge reader must remove the duplicate outer article card');
}
if (!briefs.includes("data-qily-imported-visual','normalized-v1'") || !briefs.includes("el.namespaceURI==='http://www.w3.org/2000/svg'")) {
  fail('brief reader must preserve SVG-local metadata and normalize imported diagrams instead of browser-default rendering');
}
if (!briefs.includes('.vi-feedback-return{fill:none;stroke:var(--gold);stroke-width:6')) {
  fail('brief reader must explicitly normalize feedback rails to the Global Knowledge VI');
}
if (!briefs.includes("root.querySelectorAll('script,style,header,footer,nav,form,button,input,textarea,select,iframe')")) {
  fail('brief reader sanitizer is missing structural removal');
}

const cn = fs.readFileSync(path.join(root, 'cn-site', 'index.html'), 'utf8');
if (!cn.includes('https://qilylean.com/global-knowledge/')) fail('CN homepage no longer points to the isolated Global Knowledge bridge');
if (/https:\/\/qilylean\.com\/(?!global-knowledge\/|links\/cn-public\/)/i.test(cn)) fail('CN homepage contains a non-isolated qilylean.com route');
const deepDiveSection = (cn.match(/<section class="section alt"><div class="content"><div class="section-head"><small>DEEP DIVES｜专题文章<\/small>[\s\S]*?<\/div><\/div><\/section>/) || [])[0] || '';
if (!deepDiveSection) fail('CN homepage deep-dive module is missing');
if (/\d{4}-\d{2}-\d{2}｜/.test(deepDiveSection)) fail('CN deep-dive module must remain evergreen and must not mix brief dates into article titles');
if (/最新精选知识/.test(deepDiveSection)) fail('CN deep-dive module must not masquerade as the latest-brief feed');

if (process.exitCode) process.exit(process.exitCode);
console.log(`Global Knowledge isolation gate passed: ${htmlFiles.length} HTML pages checked.`);
