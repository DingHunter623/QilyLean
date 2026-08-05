#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const version = '20260805-resource-network-v4';
const marker = 'QILY-NETWORK-DARK-SECONDARY-ACTION-CONTRAST-V4';

function file(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(file(relativePath), 'utf8');
}

function write(relativePath, content) {
  const target = file(relativePath);
  const normalized = content.trimEnd() + '\n';
  const current = fs.readFileSync(target, 'utf8');
  if (current === normalized) return false;
  fs.writeFileSync(target, normalized, 'utf8');
  process.stdout.write(`updated ${relativePath}\n`);
  return true;
}

let changed = false;

const cssPath = 'site-resource-network-v1.css';
let css = read(cssPath);
if (!css.includes(marker)) {
  css += `\n/* ${marker}
 * 深色合作治理模块的次按钮：常态及已访问状态保持白字、透明浅层底和清晰白色描边；
 * 悬停/聚焦切换为浅金底深色字，按下切换为深青底白字，防止全站链接规则覆盖。
 */
html body .qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary),
html body .qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary):visited{
  position:relative!important;
  z-index:1!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  background-color:rgba(255,255,255,.06)!important;
  border:2px solid rgba(255,255,255,.88)!important;
  text-decoration:none!important;
  text-decoration-color:var(--qlrn-light-gold)!important;
  font-weight:900!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  text-shadow:none!important;
}
html body .qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary):hover,
html body .qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary):focus-visible{
  color:#17322d!important;
  -webkit-text-fill-color:#17322d!important;
  background-color:var(--qlrn-light-gold)!important;
  border-color:#c99a3e!important;
  text-decoration:none!important;
  box-shadow:0 9px 22px rgba(5,42,51,.32)!important;
  transform:translateY(-2px)!important;
  outline:3px solid rgba(255,227,155,.28)!important;
  outline-offset:2px!important;
}
html body .qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary):active{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  background-color:var(--qlrn-deep)!important;
  border-color:var(--qlrn-light-gold)!important;
  text-decoration:none!important;
  transform:translateY(0) scale(.98)!important;
}
`;
}
changed = write(cssPath, css) || changed;

for (const pagePath of ['index.html', 'links/index.html', 'links/onboarding/index.html', 'links/network/index.html']) {
  let html = read(pagePath);
  html = html.replace(
    /\/site-resource-network-v1\.css\?v=[^"'\s>]+/g,
    `/site-resource-network-v1.css?v=${version}`
  );
  changed = write(pagePath, html) || changed;
}

const materializerPath = 'scripts/materialize-industry-resource-network.js';
let materializer = read(materializerPath);
materializer = materializer.replace(
  /(const stylesheet = '<link id="qilyResourceNetworkStylesheet" rel="stylesheet" href="\/site-resource-network-v1\.css\?v=)[^"]+(">';)/,
  `$1${version}$2`
);
changed = write(materializerPath, materializer) || changed;

const validatorPath = 'scripts/validate-industry-resource-network.js';
let validator = read(validatorPath);
validator = validator.replace(
  /href="\/site-resource-network-v1\.css\?v=[^"]+"/g,
  `href="/site-resource-network-v1.css?v=${version}"`
);
if (!validator.includes(marker)) {
  const anchor = "  'visibility:visible!important'\n].forEach((token) => requireToken(stylesheet, token, 'resource-network button contrast stylesheet'));";
  const replacement = `  'visibility:visible!important',\n  '${marker}',\n  '.qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary):visited',\n  'background-color:rgba(255,255,255,.06)!important',\n  'border:2px solid rgba(255,255,255,.88)!important',\n  '.qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary):hover',\n  '.qily-resource-network.dark .qily-resource-network__actions a.qily-resource-network__button:not(.primary):active'\n].forEach((token) => requireToken(stylesheet, token, 'resource-network button contrast stylesheet'));`;
  if (!validator.includes(anchor)) {
    throw new Error('Unable to locate resource-network validation token anchor');
  }
  validator = validator.replace(anchor, replacement);
}
changed = write(validatorPath, validator) || changed;

process.stdout.write(changed
  ? 'Dark secondary action contrast materialized and cache version advanced.\n'
  : 'Dark secondary action contrast already current.\n');
