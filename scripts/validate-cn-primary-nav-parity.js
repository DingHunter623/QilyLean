#!/usr/bin/env node
'use strict';
/*
 * QILY-CN-PRIMARY-NAV-PARITY-20261113
 *
 * Mistake-proofing (防呆) for the 2026-11-13 China-site nav rollback.
 *
 * What happened: the CN primary nav wrapped to TWO lines while the
 * international site stays on ONE line (horizontal scroll on overflow).
 * Root cause: commit acc6aa9 (2026-11-09 15:38 UTC, "build(r8): materialize
 * single visual authority [skip ci]") created cn-site/assets/site.css — the
 * CN destination-shell base CSS — with
 *   .nav{display:flex;...;flex-wrap:wrap;...}
 * and flex-wrap:nowrap only inside @media(max-width:720px), so on desktop
 * the nine CN nav links wrap. .com instead sets flex-wrap:nowrap!important
 * on the header nav (site-header-axis-v1.css). The same materialization
 * also added the counter-measure in cn-site/assets/qilylean-vi-v2.css:516,
 *   html:root body .site-header .qily-cn-nav-shell .nav{...flex-wrap:nowrap!important...}
 * but that rule ONLY matches when the nav sits inside a
 * .qily-cn-nav-shell wrapper div — and the wrapper is NOT in the source
 * HTML. It is created only by the materialize step
 * (scripts/materialize-cn-footer-actions-v2.js) or at runtime by
 * cn-site/assets/cn-nav-rail-v1.js. So the single-line behaviour was
 * fragile: it depended on a wrapper that the source does not contain. When
 * that step does not happen (or the VI CSS does not load), the base wrap
 * rule wins and the nav wraps. PR #832 added a second, wrapper-independent
 * layer (the #qilyCnPrimaryNavigation rule) so the nav no longer depends
 * solely on the wrapper. NO check in the chain compared the CN nav to .com
 * — the R8 browser audit targets only .com, the CN deploy step 27 checks
 * VI/traffic/etc. but not nav parity, and
 * scripts/header-shell-parity.spec.js measures header geometry but never
 * asserts nav items or single-line. So the drift shipped.
 *
 * The fix (PR #832, 18d0e80) restores the single line with an override in
 * cn-site/assets/cn-sitewide-visual-parity-v1.css scoped to
 * #qilyCnPrimaryNavigation (the id is assigned at runtime by
 * cn-site/assets/cn-nav-rail-v1.js and statically by the materialize
 * script). This script guards that the CN nav can never drift from .com
 * again, statically, without a browser:
 *
 *   1. Nav item parity: every representative CN page carries exactly the
 *      .com primary-nav items, in the same order, minus the ONE deliberate
 *      omission — 项目合作 — which has no CN target page (/cooperation/ is
 *      404 on CN). Any other addition, removal, reorder or rename fails.
 *   2. Single-line overrides intact (BOTH layers, defence in depth):
 *      (a) the #qilyCnPrimaryNavigation rule with flex-wrap:nowrap +
 *          overflow-x:auto in the parity CSS, loaded AFTER the base shell
 *          CSS, with the runtime id assignment that gives the rule its
 *          target present and loaded; and
 *      (b) the .qily-cn-nav-shell .nav rule with flex-wrap:nowrap!important
 *          in cn-site/assets/qilylean-vi-v2.css (the rule that actually wins
 *          the cascade today), plus the shell-creation code that makes it
 *          match (materialize script and cn-nav-rail-v1.js).
 *   3. Pseudo-label line-height parity (added 2026-11-14 after deploy run
 *      43538457714 failed the VI step and rolled back, taking PR #832 off
 *      production): the /lean/ link renders its label through a ::before
 *      pseudo-element (font-size:0 on the link itself, QILY-CN-TRANSLATED-
 *      NAV-V1 in qilylean-vi-v2.css). That ::before used line-height:1.22
 *      while every sibling link inherits the body line-height 1.72, so
 *      /lean/ rendered 10px shorter and 5px lower — and the deploy
 *      pipeline's Playwright guard (all nav link tops equal, at 1600/1280)
 *      failed on the HOME page and rolled the deploy back. Neither PR #832
 *      (nav wrap only) nor this guard (flex-wrap/overflow-x only) covered
 *      it, so the loop never closed. Both layers below pin the ::before
 *      line-height to 1.72; either layer regressing fails this guard.
 *
 * This script is invoked by scripts/validate-visual-authority-r8.js, which
 * the enforce-visual-authority-r8 workflow runs on every PR to main and on
 * every push to main — so a nav drift fails CI before it can merge. The
 * live rendered behaviour is additionally guarded by the Playwright test in
 * scripts/redline-navigation-footer-parity.spec.js, which runs in the CN
 * deploy pipeline (deploy-cn-preprod.yml step 27, "Verify CN production VI")
 * and fails the deploy (rollback) if the live nav wraps or its items differ.
 *
 * Exit code: 0 = pass, 1 = fail (prints exactly what drifted).
 * No network, no browser, reads only files under the repo root.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const failures = [];
const fail = m => failures.push(m);

// The ONE deliberate difference: 项目合作 is a commercial route with no CN
// target page. It must be the only item missing on CN.
const DELIBERATE_OMISSION = '项目合作';

// --- 1. Nav item parity (static HTML) -------------------------------------
function primaryNavItems(html, label) {
  const headerStart = html.indexOf('<header');
  if (headerStart === -1) { fail(`${label}: no <header> found`); return []; }
  const header = html.slice(headerStart);
  const navStart = header.indexOf('<nav');
  if (navStart === -1) { fail(`${label}: no <nav> inside <header>`); return []; }
  const navEnd = header.indexOf('</nav>', navStart);
  if (navEnd === -1) { fail(`${label}: unclosed <nav> inside <header>`); return []; }
  const nav = header.slice(navStart, navEnd);
  const items = [];
  const re = /<a\b[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(nav)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text) items.push(text);
  }
  return items;
}

const comItems = primaryNavItems(read('index.html'), '.com index.html');
if (!comItems.includes(DELIBERATE_OMISSION)) {
  fail(`.com index.html: expected primary nav to contain "${DELIBERATE_OMISSION}" (baseline changed — update this guard deliberately, do not just delete the check)`);
}
if (comItems.length !== 10) {
  fail(`.com index.html: expected 10 primary nav items, got ${comItems.length}: ${JSON.stringify(comItems)}`);
}
const expectedCnItems = comItems.filter(x => x !== DELIBERATE_OMISSION);

const cnPages = [
  'cn-site/index.html',
  'cn-site/about/index.html',
  'cn-site/links/hometown-manufacturing/index.html',
];
for (const page of cnPages) {
  const items = primaryNavItems(read(page), page);
  if (JSON.stringify(items) !== JSON.stringify(expectedCnItems)) {
    fail(`${page}: primary nav items differ from .com (minus "${DELIBERATE_OMISSION}").\n  .com (minus omission): ${JSON.stringify(expectedCnItems)}\n  ${page}: ${JSON.stringify(items)}`);
  }
}

// --- 2. Single-line override intact ----------------------------------------
const parityCss = read('cn-site/assets/cn-sitewide-visual-parity-v1.css');
const ruleMatch = parityCss.match(/#qilyCnPrimaryNavigation\{([^}]*)\}/);
if (!ruleMatch) {
  fail('cn-site/assets/cn-sitewide-visual-parity-v1.css: missing #qilyCnPrimaryNavigation rule (PR #832 single-line override is gone — the CN nav will wrap to two lines)');
} else {
  const rule = ruleMatch[1];
  if (!/flex-wrap\s*:\s*nowrap/.test(rule)) {
    fail('cn-site/assets/cn-sitewide-visual-parity-v1.css: #qilyCnPrimaryNavigation rule lost flex-wrap:nowrap — the CN nav will wrap to two lines');
  }
  if (!/overflow-x\s*:\s*auto/.test(rule)) {
    fail('cn-site/assets/cn-sitewide-visual-parity-v1.css: #qilyCnPrimaryNavigation rule lost overflow-x:auto — the CN nav cannot scroll horizontally like .com');
  }
}

// The override must load AFTER the base shell CSS, or the base wrap wins.
const cnIndex = read('cn-site/index.html');
const basePos = cnIndex.indexOf('/assets/destination-shell/assets/site.css');
const overridePos = cnIndex.indexOf('cn-sitewide-visual-parity-v1.css');
if (basePos === -1) fail('cn-site/index.html: base shell CSS /assets/destination-shell/assets/site.css not linked');
if (overridePos === -1) fail('cn-site/index.html: single-line override cn-sitewide-visual-parity-v1.css not linked');
if (basePos !== -1 && overridePos !== -1 && overridePos < basePos) {
  fail('cn-site/index.html: single-line override CSS loads BEFORE the base shell CSS — the base .nav{flex-wrap:wrap} will win and the CN nav will wrap');
}

// The override targets an id that is assigned at runtime by cn-nav-rail-v1.js
// (most CN pages do not carry the id statically). If that assignment or the
// script tag disappears, the override has no target and the nav wraps.
const railJs = read('cn-site/assets/cn-nav-rail-v1.js');
if (!/nav\.id\s*=\s*['"]qilyCnPrimaryNavigation['"]/.test(railJs)) {
  fail('cn-site/assets/cn-nav-rail-v1.js: runtime id assignment nav.id=\'qilyCnPrimaryNavigation\' missing — the single-line override has no target and the CN nav will wrap');
}
if (!cnIndex.includes('cn-nav-rail-v1.js')) {
  fail('cn-site/index.html: cn-nav-rail-v1.js not loaded — the primary nav never gets its id and the single-line override cannot apply');
}

// Layer (b): the .qily-cn-nav-shell .nav nowrap!important rule in the VI CSS
// is the rule that actually wins the cascade today (verified in a browser via
// CDP getMatchedStylesForNode). It only matches when the nav sits inside a
// .qily-cn-nav-shell wrapper, which is created by the materialize script and
// by cn-nav-rail-v1.js — so check the rule AND both creators.
const viCss = read('cn-site/assets/qilylean-vi-v2.css');
const shellRule = viCss.match(/\.qily-cn-nav-shell\s+\.nav\s*\{([^}]*)\}/);
if (!shellRule) {
  fail('cn-site/assets/qilylean-vi-v2.css: missing .qily-cn-nav-shell .nav rule — the cascade-winning single-line rule is gone');
} else if (!/flex-wrap\s*:\s*nowrap\s*!important/.test(shellRule[1])) {
  fail('cn-site/assets/qilylean-vi-v2.css: .qily-cn-nav-shell .nav rule lost flex-wrap:nowrap!important — the rule that wins the cascade no longer keeps the CN nav on one line');
}
const materializeJs = read('scripts/materialize-cn-footer-actions-v2.js');
if (!materializeJs.includes('qily-cn-nav-shell')) {
  fail('scripts/materialize-cn-footer-actions-v2.js: no longer creates the .qily-cn-nav-shell wrapper — the VI single-line rule has nothing to match');
}
if (!railJs.includes("className='qily-cn-nav-shell'") && !railJs.includes('className="qily-cn-nav-shell"')) {
  fail('cn-site/assets/cn-nav-rail-v1.js: no longer creates the .qily-cn-nav-shell wrapper at runtime — the VI single-line rule has nothing to match when the materialize step is bypassed');
}

// --- 3. Pseudo-label line-height parity -------------------------------------
// The /lean/ link hides its DOM text (font-size:0) and shows a ::before
// pseudo-label. If the ::before line-height differs from the siblings'
// inherited body line-height (1.72), that link sits lower than the rest and
// the deploy pipeline's Playwright guard (all nav link tops equal) fails the
// VI step and rolls the deploy back — as run 43538457714 did on 2026-11-14.
const beforeRule = viCss.match(/\.nav>a\[href="\/lean\/"\]::before,[\s\S]*?\{([\s\S]*?)\}/);
if (!beforeRule) {
  fail('cn-site/assets/qilylean-vi-v2.css: missing pseudo-label ::before rule for /lean/ (QILY-CN-TRANSLATED-NAV-V1 is gone)');
} else if (!/line-height\s*:\s*1\.72\s*!important/.test(beforeRule[1])) {
  fail('cn-site/assets/qilylean-vi-v2.css: pseudo-label ::before line-height is not 1.72 — the /lean/ link will sit 5px lower than its siblings and the deploy VI guard (equal nav link tops) will fail and roll back');
}
if (!parityCss.includes('QILY-CN-PRIMARY-NAV-PSEUDO-LABEL-LINE-HEIGHT-20261114')) {
  fail('cn-site/assets/cn-sitewide-visual-parity-v1.css: missing QILY-CN-PRIMARY-NAV-PSEUDO-LABEL-LINE-HEIGHT-20261114 override — the home page (whose vi-v2 is a materialized transform) has no second-layer line-height pin');
} else {
  const parityBefore = parityCss.match(/#qilyCnPrimaryNavigation>a\[href="\/lean\/"\]::before,[\s\S]*?line-height\s*:\s*([0-9.]+)\s*!important/);
  if (!parityBefore || parityBefore[1] !== '1.72') {
    fail('cn-site/assets/cn-sitewide-visual-parity-v1.css: pseudo-label ::before override line-height is not 1.72 — the home page nav will fail the deploy VI guard (equal nav link tops)');
  }
}

if (failures.length) {
  console.error('FAIL: CN primary nav parity guard\n' + failures.map(f => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log(`PASS: CN primary nav parity — ${cnPages.length} CN pages carry the .com nav items in order (minus "${DELIBERATE_OMISSION}"), and the single-line override (#qilyCnPrimaryNavigation flex-wrap:nowrap + overflow-x:auto, loaded after the base shell CSS, id assigned by cn-nav-rail-v1.js) is intact.`);
