#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const ROUTES = [
  ['首页', '/'],
  ['履历主线', '/experience/'],
  ['能力体系', '/capabilities/'],
  ['改善方法', '/improvements/'],
  ['代表项目', '/projects/'],
  ['信任中心', '/trust/'],
  ['项目合作', '/cooperation/'],
  ['知识资产', '/knowledge/']
];

const LABELS = ROUTES.map(([label]) => label);
const EXPECTED = LABELS.join(' > ');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, 'utf8');
}

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  }).split(/\r?\n/).filter(Boolean);
}

function routeArray(indent, compact) {
  const lines = ROUTES.map(([label, href]) => `${indent}['${label}', '${href}']`);
  return compact
    ? `var PRIMARY_ROUTES=[\n${lines.join(',\n')}\n  ];`
    : `var routes = [\n${lines.join(',\n')}\n  ];`;
}

function patchCentralSources() {
  let changed = 0;

  const corePath = 'site-navigation-core.js';
  let core = read(corePath);
  const nextCore = core.replace(
    /var routes = \[\n[\s\S]*?\n  \];/,
    routeArray('    ', false)
  );
  if (nextCore === core) throw new Error('site-navigation-core.js route array was not located');
  if (nextCore !== core) {
    if (APPLY) write(corePath, nextCore);
    changed += 1;
  }

  const parentPath = 'site-parent-navigation-v3.js';
  let parent = read(parentPath);
  const nextParent = parent.replace(
    /var PRIMARY_ROUTES=\[\n[\s\S]*?\n  \];/,
    routeArray('    ', true)
  );
  if (nextParent === parent) throw new Error('site-parent-navigation-v3.js PRIMARY_ROUTES was not located');
  if (nextParent !== parent) {
    if (APPLY) write(parentPath, nextParent);
    changed += 1;
  }

  const wrapperPath = 'site-navigation.js';
  let wrapper = read(wrapperPath);
  const nextWrapper = wrapper.replace(
    /var PARENT_SRC = '\/site-parent-navigation-v3\.js\?v=[^']+';/,
    "var PARENT_SRC = '/site-parent-navigation-v3.js?v=20260813-operating-axis-nav-v4';"
  );
  if (nextWrapper === wrapper) throw new Error('site-navigation.js parent-navigation cache version was not located');
  if (nextWrapper !== wrapper) {
    if (APPLY) write(wrapperPath, nextWrapper);
    changed += 1;
  }

  return changed;
}

function anchorLabel(anchor) {
  return anchor
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function reorderNavBlock(block) {
  const open = block.match(/^<nav\b[^>]*>/i);
  if (!open) return block;
  if (!/(?:qily-global-nav|site-nav)/i.test(open[0])) return block;
  if (!LABELS.every(label => block.includes(`>${label}<`) || block.includes(`>${label}</a>`))) return block;

  const anchors = block.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  const byLabel = new Map();
  anchors.forEach(anchor => {
    const label = anchorLabel(anchor);
    if (LABELS.includes(label) && !byLabel.has(label)) byLabel.set(label, anchor.trim());
  });
  if (byLabel.size !== ROUTES.length) return block;

  const close = '</nav>';
  const indentMatch = block.match(/\n([ \t]+)<a\b/i);
  const indent = indentMatch ? indentMatch[1] : '      ';
  const body = ROUTES.map(([label]) => `${indent}${byLabel.get(label)}`).join('\n');
  return `${open[0]}\n${body}\n${indent.slice(0, Math.max(0, indent.length - 2))}${close}`;
}

function patchHtmlNavs() {
  let changedFiles = 0;
  let touchedNavs = 0;

  for (const rel of trackedHtml()) {
    const abs = path.join(ROOT, rel);
    let html;
    try { html = fs.readFileSync(abs, 'utf8'); } catch (_) { continue; }
    let localTouched = 0;
    const next = html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, block => {
      const reordered = reorderNavBlock(block);
      if (reordered !== block) localTouched += 1;
      return reordered;
    });
    if (next !== html) {
      if (APPLY) fs.writeFileSync(abs, next, 'utf8');
      changedFiles += 1;
      touchedNavs += localTouched;
    }
  }

  return { changedFiles, touchedNavs };
}

function patchDocs() {
  const rel = 'docs/QILYLEAN_SITE_SYSTEM_V3.md';
  const source = read(rel);
  const start = '一级导航只保留核心专业认知路径：';
  const after = 'QilyLean AI、行走印记、产业资源协同网络、友情链接及其他扩展内容保留可达，但归入二级或内容内导视，避免与主专业链路争夺注意力。';
  const replacement = `${start}\n\n- 首页\n- 履历主线（01｜现场事实）\n- 能力体系（02｜工程数据）\n- 改善方法（03｜精益改善）\n- 代表项目（03｜改善验证与项目证据）\n- 信任中心（04｜质量保证／证据边界）\n- 项目合作（05｜机制固化与项目承接）\n- 知识资产（06｜标准、模板、证据与复制）\n\n> 导航排序必须与“现场事实 → 工程数据 → 精益改善 → 质量保证 → 数智固化 → 知识资产”的制造运营资产闭环保持同向认知，不允许把知识资产、履历或信任模块重新打乱到闭环前后。\n\n${after}`;
  const pattern = /一级导航只保留核心专业认知路径：\n\n(?:- .*\n)+\nQilyLean AI、行走印记、产业资源协同网络、友情链接及其他扩展内容保留可达，但归入二级或内容内导视，避免与主专业链路争夺注意力。/;
  const next = source.replace(pattern, replacement);
  if (next === source) throw new Error('Site System V3 navigation section was not located');
  if (APPLY) write(rel, next);
  return 1;
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

function validate() {
  const errors = [];
  const core = read('site-navigation-core.js');
  const parent = read('site-parent-navigation-v3.js');
  const wrapper = read('site-navigation.js');

  const coreArray = (core.match(/var routes = \[\n([\s\S]*?)\n  \];/) || [])[1] || '';
  const parentArray = (parent.match(/var PRIMARY_ROUTES=\[\n([\s\S]*?)\n  \];/) || [])[1] || '';
  if (!orderedLabels(coreArray)) errors.push('site-navigation-core.js route order is not aligned with the manufacturing operating axis');
  if (!orderedLabels(parentArray)) errors.push('site-parent-navigation-v3.js route order is not aligned with the manufacturing operating axis');
  if (!wrapper.includes('20260813-operating-axis-nav-v4')) errors.push('site-navigation.js cache-bust version was not updated');

  const expectedMapping = [
    "if(path.indexOf('/experience/')===0)return 0;",
    "if(path.indexOf('/capabilities/')===0)return 1;",
    "if(path.indexOf('/projects/')===0||path.indexOf('/improvements/')===0)return 2;",
    "if(path.indexOf('/trust/')===0)return 3;",
    "if(path.indexOf('/cooperation/')===0)return 4;",
    "if(path.indexOf('/knowledge/')===0||path.indexOf('/qilylean/daily')===0)return 5;"
  ];
  expectedMapping.forEach(marker => {
    if (!parent.includes(marker)) errors.push(`operating-axis mapping missing: ${marker}`);
  });

  let navCount = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    const navs = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi) || [];
    for (const nav of navs) {
      if (!/(?:qily-global-nav|site-nav)/i.test(nav)) continue;
      if (!LABELS.every(label => nav.includes(`>${label}<`) || nav.includes(`>${label}</a>`))) continue;
      navCount += 1;
      if (!orderedLabels(nav)) errors.push(`${rel}: primary navigation order is stale`);
    }
  }

  const docs = read('docs/QILYLEAN_SITE_SYSTEM_V3.md');
  if (!docs.includes('- 履历主线（01｜现场事实）') || !docs.includes('- 知识资产（06｜标准、模板、证据与复制）')) {
    errors.push('Site System V3 documentation does not contain the operating-axis navigation mapping');
  }

  if (errors.length) throw new Error(errors.join('\n'));
  process.stdout.write(`Navigation operating-axis validation passed. ${navCount} static primary navigation blocks follow: ${EXPECTED}.\n`);
}

function main() {
  const central = patchCentralSources();
  const html = patchHtmlNavs();
  const docs = patchDocs();
  if (APPLY) validate();
  process.stdout.write(`${APPLY ? 'Applied' : 'Would apply'} operating-axis navigation alignment: ${central + docs} central/doc files, ${html.changedFiles} HTML files, ${html.touchedNavs} primary nav blocks.\n`);
}

main();
