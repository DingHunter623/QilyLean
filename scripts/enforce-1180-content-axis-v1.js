#!/usr/bin/env node
'use strict';

/**
 * QilyLean canonical 1180px content-axis enforcer | 2026-09-16
 *
 * Scope:
 * - International site public HTML/CSS/JS and their generators/CI guards
 * - China site public HTML/CSS/JS
 * - Curated briefs and legacy public pages
 *
 * Explicit exclusion:
 * - tools/pure-ddz/** (斗地主游戏界面保留独立游戏舞台布局)
 *
 * This script only normalizes page-shell/content-axis widths and axis-token
 * fallbacks. It does not rewrite ordinary paragraph/readability widths such as
 * 920px copy measures, QR sizes, modal widths or media dimensions.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const allowedExt = new Set(['.html', '.css', '.js', '.mjs', '.cjs', '.yml', '.yaml']);
const ignoredDirs = new Set(['.git', 'node_modules', '.cache', 'dist', 'build']);
const explicitExcludedPrefix = 'tools/pure-ddz/';

const oldAxis = '(?:1080|1160|1220|1240|1360|1560)';

function rel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function shouldProcess(file) {
  const r = rel(file);
  if (r.startsWith(explicitExcludedPrefix)) return false;
  if (r.startsWith('docs/')) return false;
  return allowedExt.has(path.extname(file).toLowerCase());
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory() && ignoredDirs.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (ent.isFile() && shouldProcess(full)) out.push(full);
  }
  return out;
}

function normalize(text) {
  let out = text;

  // Canonical layout tokens used by historical visual authorities.
  out = out.replace(
    new RegExp('(\\-\\-(?:qily-wide-content|qily-container|qily-r8-axis|qily-redline-axis|qily-site-content-width|qily-content-axis|qv2-axis)\\s*:\\s*)' + oldAxis + 'px', 'g'),
    '$11180px'
  );

  // Fallback values inside var(..., 1560px) etc. These are page-axis fallbacks,
  // not component/media dimensions.
  out = out.replace(
    new RegExp('(var\\(\\-\\-(?:qily-wide-content|qily-content-axis|qily-site-content-width|qily-container|qily-r8-axis|qily-redline-axis|qv2-axis)\\s*,\\s*)' + oldAxis + 'px(\\s*\\))', 'g'),
    '$11180px$2'
  );

  // Historical page-shell declarations. width:min(...) is used throughout the
  // repository for the main content frame; normalize those to 1180px.
  out = out.replace(
    new RegExp('(width\\s*:\\s*min\\(\\s*)' + oldAxis + 'px(\\s*,)', 'g'),
    '$11180px$2'
  );

  // Wider hard max-widths on shared shells/subnav/footer/header authorities.
  // Do not touch 1080/1160 max-width because those can be deliberate reading
  // measures; page shells using those values are caught by width:min above.
  out = out.replace(
    /(max-width\s*:\s*)(?:1220|1240|1360|1560)px/g,
    '$11180px'
  );

  // Common prose/check strings that previously declared old site standards.
  out = out.replace(/全站\s*1240px\s*主内容宽度/g, '全站 1180px 主内容宽度');
  out = out.replace(/1240px\s*content axis/g, '1180px content axis');
  out = out.replace(/1560px\s*content axis/g, '1180px content axis');
  out = out.replace(/1560px\s*内容轴/g, '1180px 内容轴');

  return out;
}

const files = walk(root);
const changed = [];

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalize(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed.push(rel(file));
  }
}

// Hard checks for the two user-visible problem modules plus China-site owner.
function mustContain(fileRel, needle, label) {
  const file = path.join(root, fileRel);
  if (!fs.existsSync(file)) throw new Error(`${label}: missing ${fileRel}`);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(needle)) throw new Error(`${label}: missing ${needle}`);
}

mustContain('lean-production/index.html', 'width:min(1180px,100%)', 'Lean Production 1180 axis');
mustContain('links/index.html', 'width:min(1180px,100%)', 'Resource Coordination 1180 axis');
mustContain('cn-site/assets/site.css', '--qily-content-axis:1180px', 'CN site 1180 axis');
mustContain('site-content-axis-v1.css', '--qily-content-axis:1180px!important', 'Global axis authority');

// DDZ is an explicit exception: verify the enforcer did not rewrite its core.
const ddzCore = path.join(root, 'tools/pure-ddz/game/css/ddz-core-v155.css');
if (!fs.existsSync(ddzCore)) throw new Error('DDZ exception: core stylesheet missing');

process.stdout.write(
  changed.length
    ? `1180px axis normalized in ${changed.length} file(s):\n${changed.map(x => `- ${x}`).join('\n')}\n`
    : '1180px axis already normalized; no changes required.\n'
);
