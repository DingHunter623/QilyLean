#!/usr/bin/env node
'use strict';

/* QilyLean 一级导视 + 制造运营闭环 + 移动可读性永久物化器｜2026-08-19
 * 目的：消除“静态 HTML / 运行时 / 缓存 / 自动发布器”之间的回退。
 * 一级导视：核心制造运营链保持顺序，友情链接作为长期保留的扩展导航放在末位：
 * 首页 → 履历主线 → 能力体系 → 改善方法 → 代表项目 → 信任中心 → 项目合作 → 知识资产 → 友情链接
 * 制造运营闭环映射：
 * 01 履历主线 → 02 能力体系 → 03 改善方法（代表项目用于验证）→ 04 信任中心 → 05 项目合作 → 06 知识资产
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const BUILD = '20260819-operating-axis-readable-v2';
const NAV_JS_VERSION = '20260819-operating-axis-readable-v26';
const CORE_VERSION = '20260819-operating-axis-nav-v20';
const GOV_VERSION = '20260819-readable-mobile-axis-v3';
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
  ['友情链接', '/links/']
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
  src = src.replace(/font-size:12\.5px!important/g, 'font-size:16.5px!important');
  src = src.replace(/font-size:11\.5px!important/g, 'font-size:16.5px!important');
  src = src.replace(/font-size:17\.5px!important/g, 'font-size:18px!important');
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
  const wrapper = read('site-navigation.js');
  const css = read('site-visual-governance-v2.css');
  const coreArray = (core.match(/var routes = \[\n([\s\S]*?)\n  \];/) || [])[1] || '';
  assert(orderedLabels(coreArray), 'runtime primary navigation order is stale');
  assert(coreArray.includes("['友情链接', '/links/']"), '友情链接 missing from primary navigation');
  assert(!core.includes('font-size:11.5px!important'), '11.5px mobile nav regression detected');
  assert(!core.includes('font-size:12.5px!important'), '12.5px mobile nav regression detected');
  assert(wrapper.includes(`/site-navigation-core.js?v=${CORE_VERSION}`), 'core cache version is stale');
  assert(wrapper.includes(GOV_HREF), 'visual governance runtime version is stale');
  assert(css.includes('--qily-readable-floor:16px'), 'readability floor missing');
  assert(css.includes('font-size:16.5px!important'), 'mobile navigation readability rule missing');
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
    assert(html.includes(GOV_HREF), `${rel}: V2 visual governance link missing`);
    assert(html.includes(`/site-navigation.js?v=${NAV_JS_VERSION}`), `${rel}: navigation cache version stale`);
    const navs = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi) || [];
    for (const nav of navs) {
      if (!/(?:qily-global-nav|site-nav|网站导航|QilyLean核心导视)/i.test(nav)) continue;
      if (!LABELS.every(label => nav.includes(label))) continue;
      navCount += 1;
      assert(orderedLabels(nav), `${rel}: primary navigation order stale`);
      assert(nav.includes('友情链接'), `${rel}: 友情链接 missing from primary navigation`);
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
  process.stdout.write(`PASS: ${publicCount} public pages; ${navCount} primary navs follow ${EXPECTED}; ${axisCount} operating-axis steps retain hover/focus/touch/current visual feedback.\n`);
}

function main() {
  const coreChanged = patchCore();
  const wrapperChanged = patchWrapper();
  const html = patchAllHtml();
  if (APPLY) validate();
  process.stdout.write(`${APPLY ? 'Applied' : 'Would apply'} operating-axis/readability baseline: core=${coreChanged ? 1 : 0}, wrapper=${wrapperChanged ? 1 : 0}, public HTML ${html.changed}/${html.checked}.\n`);
}

main();
