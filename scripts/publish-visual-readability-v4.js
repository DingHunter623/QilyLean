#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '20260813-visual-readability-v4';
const R2_VERSION = '20260813-r2-clean-v4';
const READABILITY_HREF = `/site-visual-readability-v4.css?v=${VERSION}`;
const READABILITY_TAG = `<link id="qilyVisualReadabilityV4Stylesheet" rel="stylesheet" href="${READABILITY_HREF}">`;

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, content) {
  const abs = path.join(ROOT, rel);
  const out = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.readFileSync(abs, 'utf8') === out) return false;
  fs.writeFileSync(abs, out, 'utf8');
  return true;
}
function assert(ok, msg) { if (!ok) throw new Error(msg); }
function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/).filter(Boolean);
}
function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) && /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}

function installReadabilityStylesheet(html) {
  let out = html.replace(/\s*<link\b[^>]*(?:id=["']qilyVisualReadabilityV4Stylesheet["']|href=["'][^"']*\/site-visual-readability-v4\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n');
  out = out.replace(/<\/head>/i, `  ${READABILITY_TAG}\n</head>`);
  out = out
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g, `/site-navigation.js?v=${R2_VERSION}`)
    .replace(/\/site-r2-stability-fixes-v1\.css\?v=[^"'\s<]+/g, `/site-r2-stability-fixes-v1.css?v=${R2_VERSION}`)
    .replace(/\/site-dark-surface-contrast-v1\.css\?v=[^"'\s<]+/g, '/site-dark-surface-contrast-v1.css?v=20260813-readability-v4')
    .replace(/\/site-hero-primary-contrast-v1\.css\?v=[^"'\s<]+/g, '/site-hero-primary-contrast-v1.css?v=20260813-readability-v4')
    .replace(/\/projects\/project-pages\.css\?v=[^"'\s<]+/g, '/projects/project-pages.css?v=20260813-project-safe-zone-v4');
  return out;
}

function patchSpecialPages() {
  let changed = 0;

  const commercialRel = 'projects/qilylean-commercial-deliveries/index.html';
  let commercial = read(commercialRel);
  commercial = commercial
    .replace('<div class="status"><strong>当前公开记录：0项。</strong>', '<div class="status" data-qily-light-surface="true"><strong>当前公开记录：0项。</strong>')
    .replace(/\.status\{padding:18px 20px;border-left:5px solid var\(--teal\);background:var\(--soft\)\}/, '.status{padding:18px 20px;border:1px solid #c9dedd;border-left:5px solid var(--gold);color:#173d43!important;-webkit-text-fill-color:#173d43!important;background:#fffdf8!important;box-shadow:0 10px 24px rgba(7,60,71,.12)}.status strong{color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;font-weight:950!important}');
  if (write(commercialRel, commercial)) changed += 1;

  const experienceRel = 'experience/index.html';
  let experience = read(experienceRel);
  experience = experience
    .replace('<div class="career-chain"><strong>长期方法链路：</strong>', '<div class="career-chain" data-qily-dark-surface="true"><strong>长期方法链路：</strong>')
    .replace(/\.career-chain\{margin-top:18px;padding:17px 19px;background:var\(--forest,#0f4b5a\);color:#fff;font-size:18\.5px;line-height:1\.75\}/, '.career-chain{margin-top:18px;padding:17px 19px;background:#0f4b5a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:1px solid #0b3f4b;box-shadow:0 8px 20px rgba(7,60,71,.10);font-size:18.5px;line-height:1.75}.career-chain strong{color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;text-shadow:none!important}');
  if (write(experienceRel, experience)) changed += 1;

  return changed;
}

function patchProjectCss() {
  const rel = 'projects/project-pages.css';
  let css = read(rel);
  css = css
    .replace('gap:16px!important;min-height:0!important;padding:16px!important;align-items:start!important;overflow:visible!important;contain-intrinsic-size:auto 250px', 'gap:18px!important;min-height:0!important;padding:18px!important;align-items:start!important;overflow:hidden!important;contain-intrinsic-size:auto 250px')
    .replace('margin:0!important;border:1px solid var(--qily-line)!important;background:#edf4f2!important;box-shadow:0 8px 20px rgba(15,75,90,.1)', 'margin:2px 0 0 2px!important;border:1px solid var(--qily-line)!important;border-radius:8px!important;background:#fff!important;overflow:hidden!important;box-shadow:0 5px 12px rgba(15,75,90,.10)')
    .replace(/\.factory-render-card\{display:grid!important;grid-template-columns:var\(--project-thumb-size\) minmax\(0,1fr\)!important;gap:12px!important;align-items:start!important;width:100%!important;overflow:visible!important;/, '.factory-render-card{display:grid!important;grid-template-columns:var(--project-thumb-size) minmax(0,1fr)!important;gap:12px!important;align-items:start!important;width:100%!important;overflow:hidden!important;')
    .replace(/\.factory-render-card>a\{display:block!important;width:var\(--project-thumb-size\)!important;height:var\(--project-thumb-size\)!important;overflow:hidden!important;border:1px solid var\(--qily-line\);background:#dfeae8\}/, '.factory-render-card>a{display:block!important;width:var(--project-thumb-size)!important;height:var(--project-thumb-size)!important;overflow:hidden!important;border:1px solid var(--qily-line);border-radius:6px!important;background:#fff!important}')
    .replace(/\.factory-render-card figcaption\{display:grid!important;gap:3px!important;padding:0!important;border:0!important;background:transparent!important;font-size:14\.5px!important;line-height:1\.5!important\}/, '.factory-render-card figcaption{display:grid!important;gap:3px!important;padding:0!important;border:0!important;color:#2f4c50!important;-webkit-text-fill-color:#2f4c50!important;background:#fff!important;font-size:14.5px!important;line-height:1.5!important}');
  write(rel, css);
}

function patchContactAndRuntimeSources() {
  const coreRel = 'site-navigation-core.js';
  let core = read(coreRel);
  core = core
    .replace("var PHONE_NUMBERS = ['13450014003', '15168120722', '17681788259'];", "var PHONE_NUMBERS = [{ city: '东莞', number: '13450014003' }, { city: '宁波', number: '15168120722' }, { city: '乐清', number: '17681788259' }];")
    .replace("PHONE_NUMBERS.map(function (phone) { return '<a href=\"tel:' + phone + '\">' + phone + '</a>'; }).join('')", "PHONE_NUMBERS.map(function (item) { return '<a href=\"tel:' + item.number + '\"><span class=\"qily-phone-city\">' + item.city + '：</span><strong class=\"qily-phone-number\">' + item.number + '</strong></a>'; }).join('')");
  assert(core.includes("city: '东莞'") && core.includes('qily-phone-city'), 'contact city/phone mapping was not materialized');
  write(coreRel, core);

  const wrapperRel = 'site-navigation.js';
  let wrapper = read(wrapperRel);
  wrapper = wrapper
    .replace(/var LEGACY_SRC = '\/site-navigation-legacy-20260802\.js\?v=[^']+';/, `var LEGACY_SRC = '/site-navigation-legacy-20260802.js?v=${R2_VERSION}';`)
    .replace(/var PARENT_SRC = '\/site-parent-navigation-v3\.js\?v=[^']+';/, "var PARENT_SRC = '/site-parent-navigation-v3.js?v=20260813-operating-axis-nav-v4';");
  write(wrapperRel, wrapper);

  const legacyRel = 'site-navigation-legacy-20260802.js';
  let legacy = read(legacyRel);
  legacy = legacy.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/, `var CORE_SRC = '/site-navigation-core.js?v=${R2_VERSION}';`);
  write(legacyRel, legacy);

  const cleanRel = 'scripts/publish-r2-clean-runtime-v3.js';
  let clean = read(cleanRel);
  clean = clean
    .replace(/const VERSION = '[^']+';/, `const VERSION = '${R2_VERSION}';`)
    .replace(/const FAST_NATIVE_JS = '[^']+';/, "const FAST_NATIVE_JS = '/site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5';");
  write(cleanRel, clean);
}

function patchRegressionGuard() {
  const rel = 'scripts/site-regression-guard-v2.js';
  let guard = read(rel);
  guard = guard
    .replace("'/site-navigation.js?v=20260812-r2-clean-v3'", "'/site-navigation.js?v=20260813-r2-clean-v4'")
    .replace("'/site-r2-stability-fixes-v1.css?v=20260812-r2-clean-v3'", "'/site-r2-stability-fixes-v1.css?v=20260813-r2-clean-v4'")
    .replace("'/site-navigation-legacy-20260802.js?v=20260812-r2-clean-v3'", "'/site-navigation-legacy-20260802.js?v=20260813-r2-clean-v4'")
    .replace("['首页','能力体系','代表项目','改善方法','知识资产','履历主线','项目合作','信任中心']", "['首页','履历主线','能力体系','改善方法','代表项目','信任中心','项目合作','知识资产']");
  write(rel, guard);
}

function materializeAllHtml() {
  let checked = 0;
  let changed = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    checked += 1;
    const next = installReadabilityStylesheet(html);
    if (next !== html) { write(rel, next); changed += 1; }
  }
  return { checked, changed };
}

function verify() {
  const css = read('site-visual-readability-v4.css');
  ['.career-chain', '.project-list-card', '.factory-render-card', '.qily-phone-city', '.status'].forEach(marker => assert(css.includes(marker), `visual readability CSS missing ${marker}`));

  const commercial = read('projects/qilylean-commercial-deliveries/index.html');
  assert(commercial.includes('data-qily-light-surface="true"'), 'commercial delivery status card lacks light-surface contract');
  assert(commercial.includes(READABILITY_HREF), 'commercial delivery page lacks visual readability v4');

  const experience = read('experience/index.html');
  assert(experience.includes('class="career-chain" data-qily-dark-surface="true"'), 'career chain lacks dark-surface contract');
  assert(experience.includes(READABILITY_HREF), 'experience page lacks visual readability v4');

  const projectsCss = read('projects/project-pages.css');
  assert(/project-thumbnails-v3[\s\S]*?\.project-list-card\{[^}]*overflow:hidden!important/.test(projectsCss), 'project thumbnail v3 still permits card overflow');

  const core = read('site-navigation-core.js');
  ['东莞', '宁波', '乐清', 'qily-phone-city', 'qily-phone-number'].forEach(marker => assert(core.includes(marker), `contact mapping missing ${marker}`));

  const wrapper = read('site-navigation.js');
  const legacy = read('site-navigation-legacy-20260802.js');
  assert(wrapper.includes(`/site-navigation-legacy-20260802.js?v=${R2_VERSION}`), 'navigation wrapper cache version is stale');
  assert(legacy.includes(`/site-navigation-core.js?v=${R2_VERSION}`), 'navigation core cache version is stale');

  let publicCount = 0;
  for (const rel of trackedHtml()) {
    let html;
    try { html = read(rel); } catch (_) { continue; }
    if (!isPublicHtml(html)) continue;
    publicCount += 1;
    assert(html.includes(READABILITY_HREF), `${rel}: visual readability v4 stylesheet missing`);
    if (/site-navigation\.js\?v=/.test(html)) assert(html.includes(`/site-navigation.js?v=${R2_VERSION}`), `${rel}: navigation v4 cache version missing`);
  }

  process.stdout.write(`Visual readability V4 validation passed across ${publicCount} public HTML pages.\n`);
}

function main() {
  patchSpecialPages();
  patchProjectCss();
  patchContactAndRuntimeSources();
  patchRegressionGuard();
  const html = materializeAllHtml();
  verify();
  process.stdout.write(`Visual readability V4 materialized: checked ${html.checked}, refreshed ${html.changed} public pages.\n`);
}

main();
