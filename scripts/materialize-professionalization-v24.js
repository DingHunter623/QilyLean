#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const allMode = process.argv.includes('--all');
const checkOnly = process.argv.includes('--check');
const VERSION = '20260810-footer-one-line-v25';
const NAV_VERSION = '20260811-mobile-layout-v20';
const BUNDLE_FILE = 'site-closure-bundle-v24.css';
const BUNDLE_HREF = `/${BUNDLE_FILE}?v=${VERSION}`;
const RSS_FILE = 'qilylean/daily/feed.xml';
const RSS_HREF = '/qilylean/daily/feed.xml';

const closureCssFiles = [
  'site-number-badge-contrast-v1.css',
  'site-interactive-hover-contrast-v1.css',
  'site-layout-footer-closure-v1.css',
  'site-layout-typography-closure-v20.css',
  'site-tail-gap-hotfix-v22.css'
];

const coreTargets = new Set([
  'index.html',
  'cooperation/index.html',
  'capabilities/index.html',
  'projects/index.html',
  'knowledge/index.html',
  'trust/index.html',
  'experience/index.html',
  'qilylean/daily-insights.html'
]);

function target(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(target(relativePath), 'utf8');
}

function write(relativePath, content) {
  const file = target(relativePath);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current === normalized) return false;
  if (checkOnly) {
    process.stdout.write(`::error file=${relativePath},title=V24 materialization drift::${relativePath} is not in deterministic V24 state\n`);
    throw new Error(`${relativePath}: V24 materialization is not current`);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  })[character]);
}

function decodeEntities(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function buildBundle() {
  const source = closureCssFiles.map((relativePath) => {
    if (!fs.existsSync(target(relativePath))) throw new Error(`Missing closure stylesheet: ${relativePath}`);
    const css = read(relativePath).replace(/^\uFEFF/, '').replace(/@charset\s+["'][^"']+["'];?/gi, '').trim();
    return `/* ===== ${relativePath} ===== */\n${css}`;
  }).join('\n\n');

  const v24 = `
/* ===== QilyLean professionalization V24 =====
 * Goal: preserve the existing visual language while reducing request count,
 * rendering work and long-page cognitive load. Static content remains in DOM.
 */
html { scrollbar-gutter: stable; }
body.qily-pro-v24 main { overflow: clip; }
body.qily-pro-v24 .qily-ia-heading > p,
body.qily-pro-v24 .module-heading > p,
body.qily-pro-v24 .daily-index-heading > div > p,
body.qily-pro-v24 .head > p { max-width: 78ch; }
body.qily-pro-v24 .qily-ia-grid,
body.qily-pro-v24 .qily-ia-delivery-summary,
body.qily-pro-v24 .qily-ia-secondary-links { align-items: stretch; }
body.qily-pro-v24 .qily-ia-card,
body.qily-pro-v24 .qily-ia-delivery-summary > article,
body.qily-pro-v24 .qily-ia-secondary-link { min-width: 0; }
body.qily-pro-v24 :where(section[id], article[id], div[id]) { scroll-margin-top: 92px; }

@supports (content-visibility: auto) {
  body.qily-pro-v24.daily-index-page .brief-index-card {
    content-visibility: auto;
    contain-intrinsic-size: auto 230px;
  }
  body.qily-pro-v24 main > .qily-ia-section:nth-of-type(n + 2),
  body.qily-pro-v24 main > .module-section:nth-of-type(n + 2),
  body.qily-pro-v24 main > .section:nth-of-type(n + 3) {
    content-visibility: auto;
    contain-intrinsic-size: auto 720px;
  }
}

@media (max-width: 760px) {
  body.qily-pro-v24 .qily-ia-heading > p,
  body.qily-pro-v24 .module-heading > p,
  body.qily-pro-v24 .daily-index-heading > div > p,
  body.qily-pro-v24 .head > p { max-width: none; }
  body.qily-pro-v24 .qily-ia-grid,
  body.qily-pro-v24 .qily-ia-delivery-summary,
  body.qily-pro-v24 .qily-ia-secondary-links { gap: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  body.qily-pro-v24 *,
  body.qily-pro-v24 *::before,
  body.qily-pro-v24 *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
  }
}`.trim();

  return `/* QilyLean consolidated closure bundle｜${VERSION}\n * Replaces five historical closure stylesheet requests while preserving source order.\n */\n${source}\n\n${v24}\n`;
}

function listHtmlFiles(directory, relativePrefix = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.wrangler') continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(relativePrefix, entry.name);
    if (entry.isDirectory()) files.push(...listHtmlFiles(absolute, relative));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(relative);
  }
  return files;
}

function addBodyClass(html) {
  return html.replace(/<body([^>]*)>/i, (tag, attrs) => {
    const classMatch = attrs.match(/class=["']([^"']*)["']/i);
    if (classMatch) {
      const classes = classMatch[1].split(/\s+/).filter(Boolean);
      if (!classes.includes('qily-pro-v24')) classes.push('qily-pro-v24');
      return `<body${attrs.replace(classMatch[0], `class="${classes.join(' ')}"`)}>`;
    }
    return `<body${attrs} class="qily-pro-v24">`;
  });
}

function insertBundleAtStableAnchor(html, bundleTag) {
  const anchors = [
    '<!-- QILY-NUMBER-BADGE-CONTRAST:START -->',
    '/site-navigation.js?v=',
    '<link id="qilyCoreServiceDockClosureStylesheet"',
    '<link id="qilyFooterStandardV28Stylesheet"'
  ];

  for (const anchor of anchors) {
    const index = html.indexOf(anchor);
    if (index < 0) continue;
    const lineStart = html.lastIndexOf('\n', index) + 1;
    return html.slice(0, lineStart) + `  ${bundleTag}\n` + html.slice(lineStart);
  }

  return html.replace(/<\/head>/i, `  ${bundleTag}\n</head>`);
}

function consolidateClosureLinks(html, relativePath) {
  const bundleTag = `<link id="qilyClosureBundleV24Stylesheet" rel="stylesheet" href="${BUNDLE_HREF}">`;
  const closureNames = new Set(closureCssFiles);
  const existingBundleExpression = /^[ \t]*<link\b[^>]*id=["']qilyClosureBundleV24Stylesheet["'][^>]*>[ \t]*(?:\r?\n)?/gmi;
  let hadBundle = false;
  let hadClosure = false;

  let next = html.replace(existingBundleExpression, () => {
    hadBundle = true;
    return '';
  });

  next = next.replace(/^[ \t]*<link\b[^>]*href=["']([^"']+)["'][^>]*>[ \t]*(?:\r?\n)?/gmi, (tag, href) => {
    const matched = Array.from(closureNames).some((name) => href.includes(name));
    if (!matched) return tag;
    hadClosure = true;
    return '';
  });

  const isDaily = relativePath === 'qilylean/daily-insights.html' || /^qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/.test(relativePath);
  const shouldBundle = hadBundle || hadClosure || coreTargets.has(relativePath) || isDaily;
  if (!shouldBundle || !/<head[\s>]/i.test(next)) return { html: next, bundled: false };

  next = insertBundleAtStableAnchor(next, bundleTag);
  next = addBodyClass(next);
  return { html: next, bundled: true };
}

function optimizeImages(html) {
  let imageIndex = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const currentIndex = imageIndex++;
    let next = tag;
    const priority = currentIndex === 0 || /\b(hero|portrait|avatar|logo|cover)\b/i.test(tag) || /fetchpriority=["']high["']/i.test(tag);
    if (!/\bdecoding=/i.test(next)) next = next.replace(/\s*\/?\s*>$/, (ending) => ` decoding="async"${ending}`);
    if (!priority && !/\bloading=/i.test(next)) next = next.replace(/\s*\/?\s*>$/, (ending) => ` loading="lazy"${ending}`);
    return next;
  });
}

function accelerateShellReveal(html) {
  return html
    .replace(/setTimeout\(window\.__qilyLeanRevealCurrentShell,\s*1800\s*\)/g, 'setTimeout(window.__qilyLeanRevealCurrentShell,180)')
    .replace(/setTimeout\(w\.__qilyLeanRevealCurrentShell,\s*1800\s*\)/g, 'setTimeout(w.__qilyLeanRevealCurrentShell,180)');
}

function normalizeNavigationVersion(html) {
  return html.replace(/\/site-navigation\.js\?v=[^'"\s<]+/g, `/site-navigation.js?v=${NAV_VERSION}`);
}

function upsertNamedMeta(html, name, value) {
  const tag = `<meta name="${escapeHtml(name)}" content="${escapeHtml(value)}">`;
  const expression = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*>`, 'i');
  return expression.test(html) ? html.replace(expression, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertPropertyMeta(html, property, value) {
  const tag = `<meta property="${escapeHtml(property)}" content="${escapeHtml(value)}">`;
  const expression = new RegExp(`<meta\\s+[^>]*property=["']${property}["'][^>]*>`, 'i');
  return expression.test(html) ? html.replace(expression, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function extractBriefs(html, limit = 30) {
  const cards = [];
  const articleExpression = /<article\b([^>]*)>([\s\S]*?)<\/article>/gi;
  let articleMatch;
  while ((articleMatch = articleExpression.exec(html)) && cards.length < limit) {
    const attrs = articleMatch[1];
    if (/data-brief-counted=["']false["']/i.test(attrs)) continue;
    const value = (name) => {
      const match = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
      return match ? decodeEntities(match[1]) : '';
    };
    const date = value('data-brief-date');
    const title = value('data-brief-title');
    if (!date || !title) continue;
    const hrefMatch = articleMatch[2].match(/<h2><a href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    cards.push({
      date,
      theme: value('data-brief-theme'),
      title,
      summary: value('data-brief-summary'),
      href: decodeEntities(hrefMatch[1])
    });
  }
  return cards;
}

function upsertDailyFreshness(html) {
  const briefs = extractBriefs(html, 30);
  const latest = briefs[0];
  if (!latest) throw new Error('qilylean/daily-insights.html: unable to extract latest brief');
  const countMatch = html.match(/data-archive-count="(\d+)"/);
  const total = countMatch ? Number(countMatch[1]) : briefs.length;
  const title = `今日简报｜最新至${latest.date}｜QilyLean`;
  const description = `QilyLean今日简报，最新更新至${latest.date}，共${total}期；围绕PE、IE、NPI、ME、精益运营、质量、数据闭环与数智化工厂持续沉淀制造工程实践。`;

  let next = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  next = upsertNamedMeta(next, 'description', description);
  next = upsertNamedMeta(next, 'date', latest.date);
  next = upsertPropertyMeta(next, 'og:title', title);
  next = upsertPropertyMeta(next, 'og:description', description);
  next = upsertPropertyMeta(next, 'og:updated_time', `${latest.date}T00:00:00+08:00`);

  const rssTag = `<link id="qilyDailyRssLink" rel="alternate" type="application/rss+xml" title="QilyLean 今日简报 RSS" href="${RSS_HREF}">`;
  const rssExpression = /<link\b[^>]*id=["']qilyDailyRssLink["'][^>]*>/i;
  next = rssExpression.test(next) ? next.replace(rssExpression, rssTag) : next.replace(/<\/head>/i, `  ${rssTag}\n</head>`);

  const itemList = briefs.slice(0, 10).map((brief, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `https://qilylean.com${brief.href}`,
    name: brief.title
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'QilyLean 今日简报',
    url: 'https://qilylean.com/qilylean/daily-insights.html',
    description,
    dateModified: latest.date,
    temporalCoverage: `2019-07-10/${latest.date}`,
    isPartOf: { '@type': 'WebSite', name: 'QilyLean｜启力精益', url: 'https://qilylean.com/' },
    mainEntity: { '@type': 'ItemList', numberOfItems: total, itemListElement: itemList }
  };
  const block = `<!-- QILY-DAILY-FRESHNESS-V24:START -->\n<script id="qilyDailyFreshnessV24" type="application/ld+json">${JSON.stringify(schema)}</script>\n<!-- QILY-DAILY-FRESHNESS-V24:END -->`;
  const marker = /<!-- QILY-DAILY-FRESHNESS-V24:START -->[\s\S]*?<!-- QILY-DAILY-FRESHNESS-V24:END -->/i;
  next = marker.test(next) ? next.replace(marker, block) : next.replace(/<\/head>/i, `  ${block}\n</head>`);

  return { html: next, briefs, latest, total };
}

function buildRss(briefs, latest, total) {
  const items = briefs.map((brief) => {
    const link = `https://qilylean.com${brief.href}`;
    return `    <item>\n      <title>${escapeXml(brief.title)}</title>\n      <link>${escapeXml(link)}</link>\n      <guid isPermaLink="true">${escapeXml(link)}</guid>\n      <category>${escapeXml(brief.theme || '制造工程')}</category>\n      <description>${escapeXml(brief.summary)}</description>\n    </item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>QilyLean 今日简报</title>\n    <link>https://qilylean.com/qilylean/daily-insights.html</link>\n    <description>制造工程、精益生产、质量、数智化工厂与项目交付知识档案。页面日期用于知识档案排序与主题定位，不单独作为网页首次公开发布日期证明。</description>\n    <language>zh-cn</language>\n    <atom:link href="https://qilylean.com${RSS_HREF}" rel="self" type="application/rss+xml"/>\n    <lastBuildDate>${new Date(`${latest.date}T00:00:00+08:00`).toUTCString()}</lastBuildDate>\n    <generator>QilyLean professionalization V24</generator>\n    <docs>https://www.rssboard.org/rss-specification</docs>\n    <ttl>720</ttl>\n    <category>制造工程</category>\n    <copyright>QilyLean｜启力精益</copyright>\n    <!-- 当前知识档案总量：${total}；RSS仅提供最新${briefs.length}条。 -->\n${items}\n  </channel>\n</rss>\n`;
}

function materializeHtml(relativePath) {
  if (!fs.existsSync(target(relativePath))) return false;
  let html = read(relativePath);
  const consolidated = consolidateClosureLinks(html, relativePath);
  html = consolidated.html;
  if (!consolidated.bundled && !coreTargets.has(relativePath)) return false;
  html = normalizeNavigationVersion(accelerateShellReveal(html));
  html = optimizeImages(html);
  if (relativePath === 'qilylean/daily-insights.html') {
    const freshness = upsertDailyFreshness(html);
    html = freshness.html;
    write(RSS_FILE, buildRss(freshness.briefs, freshness.latest, freshness.total));
  }
  return write(relativePath, html);
}

const changed = [];
if (write(BUNDLE_FILE, buildBundle())) changed.push(BUNDLE_FILE);

const htmlFiles = allMode
  ? listHtmlFiles(root)
  : [
      ...coreTargets,
      ...fs.existsSync(target('qilylean/daily'))
        ? fs.readdirSync(target('qilylean/daily')).filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name)).map((name) => `qilylean/daily/${name}`)
        : []
    ];

for (const relativePath of htmlFiles) {
  if (materializeHtml(relativePath)) changed.push(relativePath);
}

if (checkOnly) {
  process.stdout.write(`V24 professionalization contract passed (${htmlFiles.length} HTML files checked).\n`);
} else {
  process.stdout.write(`V24 professionalization materialized ${changed.length} file(s).\n`);
}