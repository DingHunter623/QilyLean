#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const runtimeVersion = '20260805-pricing-role-boundary-v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
}

function replaceLiteral(content, from, to, relativePath) {
  if (!content.includes(from) && !content.includes(to)) {
    throw new Error(`${relativePath}: source and normalized phrase are both missing: ${from}`);
  }
  return content.split(from).join(to);
}

function collectHtmlFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  const results = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) results.push(...collectHtmlFiles(relativePath));
    else if (entry.isFile() && entry.name.endsWith('.html')) results.push(relativePath);
  }
  return results;
}

const outputs = new Map();

const legacyPath = 'site-navigation-legacy-20260802.js';
let legacy = read(legacyPath);
legacy = replaceLiteral(
  legacy,
  '围绕设备、工位、产能、人流、物流、仓储、WIP及安全通道形成可落地布局方案。',
  '围绕设备、工位、产能、人流、物流、仓储、WIP及安全通道形成可执行、可评审的布局方案。',
  legacyPath
);
legacy = replaceLiteral(
  legacy,
  "code: 'DELIVERY｜整体落地', title: '智能工厂整体规划与落地'",
  "code: 'DELIVERY｜协同实施', title: '智能工厂整体规划与协同实施'",
  legacyPath
);
legacy = replaceLiteral(
  legacy,
  '覆盖规划深化、多专业协同、供应商接口、搬迁建设、投产爬坡、现场验证和阶段验收。',
  '覆盖规划深化、多专业协同、供应商接口、实施推进、投产爬坡、现场验证和阶段验收；施工、设备、软件与专业工程由相应供应商或外协方实施。',
  legacyPath
);
legacy = replaceLiteral(
  legacy,
  '整体规划与落地参考3.0～5.0万元/亩',
  '整体规划与协同实施参考3.0～5.0万元/亩',
  legacyPath
);
legacy = replaceLiteral(
  legacy,
  '整体规划与落地约3.0～5.0万元/亩',
  '整体规划与协同实施约3.0～5.0万元/亩',
  legacyPath
);
outputs.set(legacyPath, legacy);

const navigationPath = 'site-navigation.js';
let navigation = read(navigationPath);
navigation = navigation.replace(
  /\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g,
  `/site-navigation-legacy-20260802.js?v=${runtimeVersion}`
);
assert(
  navigation.includes(`/site-navigation-legacy-20260802.js?v=${runtimeVersion}`),
  `${navigationPath}: legacy runtime cache version was not updated`
);
outputs.set(navigationPath, navigation);

for (const relativePath of collectHtmlFiles('cooperation')) {
  let content = read(relativePath);
  if (!content.includes('/site-navigation.js?v=')) continue;
  content = content.replace(
    /\/site-navigation\.js\?v=[^'"\s<]+/g,
    `/site-navigation.js?v=${runtimeVersion}`
  );
  outputs.set(relativePath, content);
}

assert(outputs.has('cooperation/index.html'), 'cooperation/index.html must receive the new cache version');
assert(legacy.includes("code: 'DELIVERY｜协同实施'"), 'pricing runtime: delivery code must show collaborative implementation');
assert(legacy.includes("title: '智能工厂整体规划与协同实施'"), 'pricing runtime: title must show collaborative implementation');
assert(legacy.includes('由相应供应商或外协方实施'), 'pricing runtime: external execution boundary must be explicit');
assert(legacy.includes('可执行、可评审的布局方案'), 'pricing runtime: layout wording must be executable and reviewable');

const forbidden = [
  'DELIVERY｜整体落地',
  '智能工厂整体规划与落地',
  '形成可落地布局方案',
  '整体规划与落地参考3.0～5.0万元/亩',
  '整体规划与落地约3.0～5.0万元/亩'
];
for (const phrase of forbidden) {
  assert(!legacy.includes(phrase), `${legacyPath}: stale risky wording remains: ${phrase}`);
}

const changed = [];
for (const [relativePath, content] of outputs.entries()) {
  const original = read(relativePath);
  if (original !== content) changed.push(relativePath);
}

if (checkOnly) {
  if (changed.length) {
    throw new Error(`Pricing runtime role-boundary normalization is not current: ${changed.join(', ')}`);
  }
  process.stdout.write(`Pricing runtime role-boundary audit passed for ${outputs.size} files.\n`);
  process.exit(0);
}

for (const relativePath of changed) write(relativePath, outputs.get(relativePath));
process.stdout.write(`Pricing runtime role-boundary wording normalized in ${changed.length} file(s): ${changed.join(', ') || 'none'}.\n`);
