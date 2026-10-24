'use strict';
/* QILY-CONTINUOUS-LINK-UNDERLINE-20261024: read-only regression gate. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const read = rel => fs.readFileSync(rel, 'utf8');

const shared = read('site-content-axis-v1.css');
const legacy = read('site-link-standard-v1.css');
const cnAbout = read('cn-site/about/index.html');
const intlAbout = read('about/index.html');
const marker = 'QILY-CONTINUOUS-LINK-UNDERLINE-20261024';
const rules = shared.slice(shared.indexOf('/* '+marker));
assert(shared.includes('/* '+marker), 'Shared dual-site underline rule is missing.');
assert(/text-decoration-skip-ink\s*:\s*none\s*!important/.test(rules), 'Ink-skip must be disabled.');
assert(/body\s*\*\s*,/.test(rules), 'All underlined elements, not just links, must be included.');
assert(/\*::before/.test(rules) && /\*::after/.test(rules), 'Pseudo-element coverage must be explicit.');
for(const path of ['site-link-standard-v1.css','cn-site/assets/qilylean-vi-v2.css']){
  const styles=read(path);
  assert(styles.includes('QILY-ALL-UNDERLINED-TEXT-CONTINUOUS-20261024'),path+' global inline-text continuity guard is missing.');
  assert(/body\s*\*\s*,/.test(styles),path+' must include non-link text elements.');
}

assert(/-webkit-text-decoration-skip\s*:\s*none\s*!important/.test(rules), 'WebKit ink-skip must be disabled.');
assert(/text-underline-offset\s*:\s*\.22em\s*!important/.test(rules), 'About-domain underline spacing must match VI.');
assert(!/text-decoration-line\s*:/.test(rules), 'Do not change navigation/button underline semantics.');
assert(!/text-decoration-skip-ink\s*:\s*auto\s*!important/.test(legacy), 'Legacy standard reintroduced interrupted underlines.');
assert(!/-webkit-text-decoration-skip\s*:\s*ink\s*!important/.test(legacy), 'Legacy WebKit ink-skip remains.');
for (const [label, html, hostname] of [
  ['international About', intlAbout, 'qilylean.com'],
  ['China About', cnAbout, 'qilylean.cn'],
]) {
  assert(html.includes('/site-content-axis-v1.css?v=20261024-continuous-link-underline-v1'),
    label+' must load cache-busted shared VI rules.');
  const link = new RegExp('<p\\b[^>]*class="brand-domain"[^>]*>[\\s\\S]*?<a\\b[^>]*>\\s*'+hostname.replace('.', '\\.')+'\\s*<\\/a>', 'i');
  assert(link.test(html), label+' must retain one semantic anchor per domain.');
}
console.log('PASS continuous dual-site text underlines: shared CSS, legacy CSS, both About pages.');
