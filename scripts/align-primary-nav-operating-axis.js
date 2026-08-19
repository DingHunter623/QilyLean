#!/usr/bin/env node
'use strict';

/* QilyLean 一级导视 + 制造运营闭环 + 移动可读性永久物化器｜2026-08-20
 * 目的：消除“静态 HTML / 运行时 / 缓存 / 自动发布器”之间的回退。
 * 一级导视：核心制造运营链保持顺序，/links/ 资源页在一级导航中的显示名统一为“资源协同”并放在末位：
 * 首页 → 履历主线 → 能力体系 → 改善方法 → 代表项目 → 信任中心 → 项目合作 → 知识资产 → 资源协同
 * 说明：/links/ 页面本体仍保留“友情链接｜全球科技企业100强”身份；本次只调整一级导航显示名。
 * 制造运营闭环映射：
 * 01 履历主线 → 02 能力体系 → 03 改善方法（代表项目用于验证）→ 04 信任中心 → 05 项目合作 → 06 知识资产
 * 可读性：全站最小可见字号统一提升到 18px；手机端禁止通过缩字解决布局问题。
 * 内容轴：与 site-content-axis-v1.css 协同，公共页面统一到 1560px 内容窗口。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const BUILD = '20260820-resource-collaboration-v1';
const NAV_JS_VERSION = '20260820-resource-collaboration-v31';
const CORE_VERSION = '20260820-resource-collaboration-v25';
const GOV_VERSION = '20260819-readable-floor-plus1-v6';
const GOV_HREF = `/site-visual-governance-v2.css?v=${GOV_VERSION}`;
const GOV_TAG = `<link id="qilyVisualGovernanceV1" rel="stylesheet" href="${GOV_HREF}">`;

const ROUTES = [
  ['首页', '/'],
  ['履历主线', '/experience/'],
  ['能力体系', '/capabilities/'],
  ['改善方法', '/improvements/'],
  ['代表项目', '/projects/'],
  ['信任中心', '/trust/'],
  ['项目合作', '/cooperation/'],
  ['知识资产', '/knowledge/'],
  ['资源协同', '/links/']
];
const LABELS = ROUTES.map(([label]) => label);
const EXPECTED = LABELS.join(' > ');
const AXIS = new Map([
  ['01｜现场事实', '/experience/'],
  ['02｜工程数据', '/capabilities/'],
  ['03｜精益改善', '/improvements/'],
  ['04｜质量保证', '/trust/'],
  ['05｜数智固化', '/cooperation/'],
  ['06｜知识资产', '/knowledge/']
]);

function abs(rel) { return path.join(ROOT, rel); }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }
function write(rel, content) {
  if (!APPLY) return false;
  const out = content.endsWith('\n') ? content : `${content}\n`;
  const before = fs.readFileSync(abs(rel), 'utf8');
  if (before === out) return false;
  fs.writeFileSync(abs(rel), out, 'utf8');
  return true;
}
function assert(ok, msg) { if (!ok) throw new Error(msg); }
function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  }).split(/\r?\n/).filter(Boolean);
}
function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) &&
    /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}
function anchorLabel(anchor) {
  return anchor.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
function orderedLabels(text) {
  let cursor = -1;
  for (const label of LABELS) {
    const next = text.indexOf(label, cursor + 1);
    if (next < 0) return false;
    cursor = next;
  }
  return true;
}
function routeArray(indent = '    ') {
  return `var routes = [\n${ROUTES.map(([label, href]) => `${indent}['${label}', '${href}']`).join(',\n')}\n  ];`;
}

function patchCore() {
  const rel = 'site-navigation-core.js';
  let src = read(rel);
  const before = src;
  const routePattern = /var routes = \[\n[\s\S]*?\n  \];/;
  assert(routePattern.test(src), 'site-navigation-core.js route array not found');
  src = src.replace(routePattern, routeArray());
  src = src.replace(/font-size:12\.5px!important/g, 'font-size:18px!important');
  src = src.replace(/font-size:11\.5px!important/g, 'font-size:18px!important');
  src = src.replace(/font-size:16\.5px!important/g, 'font-size:18px!important');
  src = src.replace(/font-size:17\.5px!important/g, 'font-size:18px!important');
  if (src !== before) write(rel, src);
  return src !== before;
}

function patchLegacy() {
  const rel = 'site-navigation-legacy-20260802.js';
  let src = read(rel);
  const before = src;
  const corePattern = /var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/;
  assert(corePattern.test(src), 'site-navigation-legacy-20260802.js CORE_SRC not found');
  src = src.replace(corePattern, `var CORE_SRC = '/site-navigation-core.js?v=${CORE_VERSION}';`);
  src = src.replace("link.textContent = '友情链接';", "link.textContent = '资源协同';");
  src = src.replace("link.setAttribute('aria-label', '全球科技企业友情链接与行业资源');", "link.setAttribute('aria-label', '资源协同｜全球科技企业友情链接与行业资源');");
  if (src !== before) write(rel, src);
  return src !== before;
}

function patchWrapper() {
  const rel = 'site-navigation.js';
  let src = read(rel);
  const before = src;
  const corePattern = /var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/;
  const govPattern = /var GOVERNANCE_HREF = '\/site-visual-governance-v[^']+';/;
  assert(corePattern.test(src), 'site-navigation.js CORE_SRC not found');
  assert(govPattern.test(src), 'site-navigation.js GOVERNANCE_HREF not found');
  src = src.replace(corePattern, `var CORE_SRC = '/site-navigation-core.js?v=${CORE_VERSION}';`);
  src = src.replace(govPattern, `var GOVERNANCE_HREF = '${GOV_HREF}';`);
  if (src !== before) write(rel, src);
  return src !== before;
}

function reorderNavBlock(block) {
  const open = block.match(/^<nav\b[^>]*>/i);
  if (!open || !/(?:qily-global-nav|site-nav|网站导航|QilyLean核心导视)/i.test(open[0])) return block;
  const anchors = block.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  const byLabel = new Map();
  for (const anchor of anchors) {
    const label = anchorLabel(anchor);
    if (LABELS.includes(label) && !byLabel.has(label)) byLabel.set(label, anchor.trim());
  }
  const indentMatch = block.match(/\n([ \t]+)<a\b/i);
  const indent = indentMatch ? indentMatch[1] : '      ';
  const closeIndent = indent.slice(0, Math.max(0, indent.length - 2));
  const body = ROUTES.map(([label, href]) => {
    let anchor = byLabel.get(label) || `<a href="${href}">${label}</a>`;
    if (/\bhref=["'][^"']*["']/i.test(anchor)) anchor = anchor.replace(/\bhref=["'][^"']*["']/i, `href="${href}"`);
    return `${indent}${anchor}`;
  }).join('\n');
  return `${open[0]}\n${body}\n${closeIndent}</nav>`;
}

function patchAxis(html) {
  return html.replace(/<a\b[^>]*class=["'][^"']*qily-system-axis__step[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, block => {
    for (const [label, href] of AXIS) {
      if (!block.includes(`<strong>${label}</strong>`)) continue;
      if (/\bhref=["'][^"']*["']/i.test(block)) return block.replace(/\bhref=["'][^"']*["']/i, `href="${href}"`);
      return block.replace(/^<a\b/i, `<a href="${href}"`);
    }
    return block;
  });
}

function installGovernance(html) {
  let out = html.replace(/\s*<link\b[^>]*(?:id=["']qilyVisualGovernanceV1["']|href=["'][^"']*\/site-visual-governance-v2\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n');
  assert(/<\/head>/i.test(out), 'public HTML head closing tag missing');
  return out.replace(/<\/head>/i, `  ${GOV_TAG}\n</head>`);
}

function patchPublicHtml(rel) {
  let html = read(rel);
  if (!isPublicHtml(html)) return false;
  const before = html;
  html = html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, reorderNavBlock);
  html = patchAxis(html);
  html = html.replace(/\/site-navigation\.js\?v=[^"']+/g, `/site-navigation.js?v=${NAV_JS_VERSION}`);
  html = html.replace(/(<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?\bvar BUILD=')[^']+('[\s\S]*?<\/script>)/gi, `$1${BUILD}$2`);
  html = installGovernance(html);
  if (html !== before) write(rel, html);
  return html !== before;
}

function patchAllHtml() {
  let checked = 0;
  let changed = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    checked += 1;
    if (patchPublicHtml(rel)) changed += 1;
  }
  return { checked, changed };
}

function validate() {
  const core = read('site-navigation-core.js');
  const legacy = read('site-navigation-legacy-20260802.js');
  const wrapper = read('site-navigation.js');
  const css = read('site-visual-governance-v2.css');
  const contentAxis = read('site-content-axis-v1.css');
  const coreArray = (core.match(/var routes = \[\n([\s\S]*?)\n  \];/) || [])[1] || '';
  assert(orderedLabels(coreArray), 'runtime primary navigation order is stale');
  assert(coreArray.includes("['资源协同', '/links/']"), '资源协同 missing from primary navigation');
  assert(!coreArray.includes("['友情链接', '/links/']"), 'legacy 友情链接 primary-navigation label returned');
  assert(!core.includes('font-size:11.5px!important'), '11.5px mobile nav regression detected');
  assert(!core.includes('font-size:12.5px!important'), '12.5px mobile nav regression detected');
  assert(!core.includes('font-size:16.5px!important'), '16.5px mobile nav regression detected');
  assert(!core.includes('font-size:17.5px!important'), '17.5px mobile nav regression detected');
  assert(wrapper.includes(`/site-navigation-core.js?v=${CORE_VERSION}`), 'core cache version is stale');
  assert(legacy.includes(`/site-navigation-core.js?v=${CORE_VERSION}`), 'legacy runtime core cache version is stale');
  assert(!legacy.includes("link.textContent = '友情链接';"), 'legacy runtime may not recreate 友情链接 as the primary label');
  assert(legacy.includes("link.textContent = '资源协同';") || !legacy.includes("link.textContent = '"), 'legacy runtime resource-collaboration fallback missing');
  assert(wrapper.includes(GOV_HREF), 'visual governance runtime version is stale');
  assert(wrapper.includes('CONTENT_AXIS_HREF'), 'unified content-axis runtime loader missing');
  assert(css.includes('--qily-readable-floor:18px'), '18px readability floor missing');
  assert(css.includes('--qily-readable-small:18px'), '18px small-text baseline missing');
  assert(css.includes('@import url("/site-content-axis-v1.css?v=20260819-unified-content-axis-v1")'), 'content-axis import missing from final visual governance');
  assert(contentAxis.includes('--qily-content-axis:1560px'), '1560px unified content-axis token missing');
  assert(contentAxis.includes('.qily-asset-inner'), 'asset-inner content-axis coverage missing');
  assert(contentAxis.includes('.qily-system-axis__inner'), 'operating-axis content-axis coverage missing');
  assert(contentAxis.includes('.qily-ia-inner'), 'information-architecture content-axis coverage missing');
  assert(css.includes('.qily-principle span'), 'competitive-value card small-text uplift missing');
  assert(css.includes('.qily-system-axis__step span'), 'operating-axis detail typography rule missing');
  assert(css.includes('.trust-strip span'), 'cooperation small-text gap missing');
  assert(css.includes('.attachment-size'), 'digital-product small-text gap missing');
  assert(css.includes('.core-contract-viewer-note'), 'contract viewer small-text gap missing');
  assert(css.includes('.qily-system-axis__step:hover'), 'operating-axis hover feedback missing');
  assert(css.includes('.qily-system-axis__step:focus-visible'), 'operating-axis focus feedback missing');
  assert(css.includes('.qily-system-axis__step:active'), 'operating-axis touch/active feedback missing');
  assert(css.includes('header a[href="/trust/"][aria-current="page"]'), 'operating-axis current-module visual mapping missing');

  let publicCount = 0;
  let navCount = 0;
  let axisCount = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    publicCount += 1;
    assert(html.includes(GOV_HREF), `${rel}: V4 visual governance link missing`);
    assert(html.includes(`/site-navigation.js?v=${NAV_JS_VERSION}`), `${rel}: navigation cache version stale`);
    const navs = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi) || [];
    for (const nav of navs) {
      if (!/(?:qily-global-nav|site-nav|网站导航|QilyLean核心导视)/i.test(nav)) continue;
      if (!LABELS.every(label => nav.includes(label))) continue;
      navCount += 1;
      assert(orderedLabels(nav), `${rel}: primary navigation order stale`);
      assert(nav.includes('资源协同'), `${rel}: 资源协同 missing from primary navigation`);
      assert(!/<a\b[^>]*href=["']\/links\/?["'][^>]*>\s*友情链接\s*<\/a>/i.test(nav), `${rel}: legacy 友情链接 primary label returned`);
    }
    const steps = html.match(/<a\b[^>]*class=["'][^"']*qily-system-axis__step[^"']*["'][^>]*>[\s\S]*?<\/a>/gi) || [];
    for (const step of steps) {
      for (const [label, href] of AXIS) {
        if (!step.includes(`<strong>${label}</strong>`)) continue;
        axisCount += 1;
        assert(step.includes(`href="${href}"`) || step.includes(`href='${href}'`), `${rel}: ${label} target must be ${href}`);
      }
    }
  }
  assert(publicCount > 0, 'No public HTML pages discovered');
  assert(navCount > 0, 'No primary navigation blocks validated');
  assert(axisCount > 0, 'No operating-axis steps validated');
  process.stdout.write(`PASS: ${publicCount} public pages; ${navCount} primary navs follow ${EXPECTED}; /links/ primary label is 资源协同 while the page identity remains 友情链接; minimum visible typography is 18px; unified content axis is 1560px; ${axisCount} operating-axis steps retain hover/focus/touch/current visual feedback.\n`);
}

function main() {
  const coreChanged = patchCore();
  const legacyChanged = patchLegacy();
  const wrapperChanged = patchWrapper();
  const html = patchAllHtml();
  if (APPLY) validate();
  process.stdout.write(`${APPLY ? 'Applied' : 'Would apply'} operating-axis/readability/content-axis baseline: core=${coreChanged ? 1 : 0}, legacy=${legacyChanged ? 1 : 0}, wrapper=${wrapperChanged ? 1 : 0}, public HTML ${html.changed}/${html.checked}.\n`);
}

main();
