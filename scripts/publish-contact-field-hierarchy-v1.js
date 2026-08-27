#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HREF = '/site-contact-field-hierarchy-v1.css?v=20260827-resource-contact-data-v3';
// V3 rollout owner: this tracked publisher change intentionally triggers main-side static materialization.
const TAG = `<link id="qilyContactFieldHierarchyV1Stylesheet" rel="stylesheet" href="${HREF}">`;

function trackedHtml() {
  return execFileSync('git', ['ls-files', '*.html'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  }).split(/\r?\n/).filter(Boolean);
}

function isPublicQilyPage(html) {
  return /<html\b/i.test(html) && /<\/head>/i.test(html) &&
    /(?:site-navigation\.js|site-navigation-core\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}

function install(html) {
  let out = html.replace(/\s*<link\b[^>]*(?:id=["']qilyContactFieldHierarchyV1Stylesheet["']|href=["'][^"']*\/site-contact-field-hierarchy-v1\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gi, '\n');
  return out.replace(/<\/head>/i, `  ${TAG}\n</head>`);
}

let checked = 0;
let changed = 0;
for (const rel of trackedHtml()) {
  const abs = path.join(ROOT, rel);
  let html;
  try { html = fs.readFileSync(abs, 'utf8'); } catch (_) { continue; }
  if (!isPublicQilyPage(html)) continue;
  checked += 1;
  const next = install(html);
  if (next !== html) {
    fs.writeFileSync(abs, next.endsWith('\n') ? next : next + '\n', 'utf8');
    changed += 1;
  }
}

const css = fs.readFileSync(path.join(ROOT, 'site-contact-field-hierarchy-v1.css'), 'utf8');
const must = (ok, msg) => { if (!ok) throw new Error(msg); };
must(css.includes('.qily-phone-city'), 'city label guard missing');
must(css.includes('border-bottom: 0 !important'), 'city label must have no underline/bottom border');
must(css.includes('.qily-phone-number'), 'phone number emphasis rule missing');
must(css.includes('border-bottom: 1.5px solid currentColor !important'), 'phone number-only emphasis missing');
must(css.includes('text-decoration-line: none !important'), 'parent/label text-decoration hard stop missing');

/* Existing cooperation visual selectors remain protected, but current page markup may be runtime-owned. */
must(css.includes('.qily-uniform-contact-row'), 'cooperation contact-row visual contract missing');
must(css.includes('border: 1.5px solid #f5c766 !important'), 'cooperation contact-row visible border missing');
must(css.includes('.contact-action-value'), 'cooperation contact value emphasis rule missing');
must(css.includes('border-bottom: 2px solid currentColor !important'), 'cooperation contact value emphasis missing');
must(css.includes('.contact-evidence-action'), 'cooperation evidence-row border guard missing');

/* Resource onboarding screenshot closure: fixed data rows are information modules, not decorated navigation links. */
must(css.includes('QILY-RESOURCE-ONBOARDING-CONTACT-DATA-V3'), 'resource onboarding contact-data V3 marker missing');
must(css.includes('.contact-card > a.contact-card__data'), 'resource phone/email data-row selector missing');
must(css.includes('.contact-card > button#copyWechat'), 'resource WeChat data-row selector missing');
must(css.includes('text-decoration-thickness: 0 !important'), 'resource fixed-data underline hard stop missing');
must(css.includes('border: 1.5px solid rgba(255,227,155,.72) !important'), 'resource three-row complete rectangle border missing');
must(css.includes('transform: translateY(-1px) !important'), 'resource three-row hover/focus feedback missing');
must(css.includes('transform: translateY(0) scale(.985) !important'), 'resource three-row active feedback missing');

const onboarding = fs.readFileSync(path.join(ROOT, 'links/onboarding/index.html'), 'utf8');
must(onboarding.includes('class="contact-card__data" href="tel:13450014003"'), 'resource onboarding phone data row missing');
must(onboarding.includes('class="contact-card__data" href="mailto:admin@qilylean.com"'), 'resource onboarding email data row missing');
must(onboarding.includes('id="copyWechat"'), 'resource onboarding WeChat data row missing');

let publicCount = 0;
for (const rel of trackedHtml()) {
  let html;
  try { html = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (_) { continue; }
  if (!isPublicQilyPage(html)) continue;
  publicCount += 1;
  must(html.includes(HREF), `${rel}: contact field hierarchy stylesheet missing or stale`);
}

process.stdout.write(`Contact field hierarchy V3 PASS: ${publicCount} public pages checked; ${changed} refreshed.\n`);
