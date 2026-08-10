#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const version = '20260810-sitewide-floating-dock-feedback-v13';
const layoutVersion = '20260810-sitewide-layout-footer-v16';
const navVersion = '20260810-sitewide-layout-footer-loader-v16';
const href = `/site-interactive-hover-contrast-v1.css?v=${version}`;
const layoutHref = `/site-layout-footer-closure-v1.css?v=${layoutVersion}`;
const navHref = `/site-navigation.js?v=${navVersion}`;
const managedStart = '<!-- QILY-NUMBER-BADGE-CONTRAST:START -->';
const managedEnd = '<!-- QILY-NUMBER-BADGE-CONTRAST:END -->';
const managedBlock = [
  managedStart,
  '  <link id="qilyNumberBadgeContrastStylesheet" rel="stylesheet" href="/site-number-badge-contrast-v1.css?v=20260805-number-badge-contrast-v1">',
  `  <link id="qilyInteractiveHoverContrastStylesheet" rel="stylesheet" href="${href}">`,
  `  <link id="qilyLayoutFooterClosureStylesheet" rel="stylesheet" href="${layoutHref}">`,
  managedEnd
].join('\n');

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute, callback);
    else callback(absolute);
  }
}

function isPublicPage(html) {
  return /site-navigation\.js\?v=/i.test(html)
    || /homepage-music(?:-v5)?\.js(?:\?v=)?/i.test(html)
    || /qilyCoreServiceDockClosureStylesheet/i.test(html);
}

function removeManaged(html) {
  return html
    .replace(/^[ \t]*<!-- QILY-NUMBER-BADGE-CONTRAST:START -->\r?\n[\s\S]*?^[ \t]*<!-- QILY-NUMBER-BADGE-CONTRAST:END -->[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyNumberBadgeContrastStylesheet["']|href=["'][^"']*\/site-number-badge-contrast-v1\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyInteractiveHoverContrastStylesheet["']|href=["'][^"']*\/site-interactive-hover-contrast-v1\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyLayoutFooterClosureStylesheet["']|href=["'][^"']*\/site-layout-footer-closure-v1\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '');
}

function materializeInMemory(html) {
  const cleaned = removeManaged(html)
    .replace(/\/site-navigation\.js\?v=[^"'\\s<]+/gi, navHref);
  const primary = '<!-- QILY-PRIMARY-CONTRAST-MUSIC:START -->';
  const primaryIndex = cleaned.indexOf(primary);
  if (primaryIndex >= 0) {
    const lineStart = cleaned.lastIndexOf('\n', primaryIndex) + 1;
    return cleaned.slice(0, lineStart) + managedBlock + '\n' + cleaned.slice(lineStart);
  }
  const dock = '<link id="qilyCoreServiceDockClosureStylesheet"';
  const dockIndex = cleaned.indexOf(dock);
  if (dockIndex >= 0) {
    const lineStart = cleaned.lastIndexOf('\n', dockIndex) + 1;
    return cleaned.slice(0, lineStart) + managedBlock + '\n' + cleaned.slice(lineStart);
  }
  return cleaned.replace(/<\/head>/i, `${managedBlock}\n</head>`);
}

function rgb(hex) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function channel(value) {
  value /= 255;
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function luminance(color) {
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

function contrast(foreground, background) {
  const first = luminance(rgb(foreground));
  const second = luminance(rgb(background));
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function validateCss() {
  const css = read('site-interactive-hover-contrast-v1.css');
  [
    'QILY-SITEWIDE-INTERACTION-CLARITY-V8-20260809',
    'QILY-SITEWIDE-COLOR-BOUNDARY-V9-20260809',
    'QILY-SITEWIDE-COLOR-BOUNDARY-V10-20260809',
    'QILY-SITEWIDE-COLOR-BOUNDARY-V11-20260810',
    'QILY-FLOAT-DOCK-INTERACTION-V13-20260810',
    '#floatDock.qily-float-dock',
    '--qily-float-hover-bg:#ffd36a',
    '[data-qily-pressed="true"]',
    '-webkit-tap-highlight-color:rgba(255,211,106,.46)',
    'transform:translateX(-5px) scale(1.06)',
    ':not(#qily-boundary-state-priority):not(#qily-boundary-state-override)',
    ':not(#qily-boundary-state-priority)',
    '--qily-boundary-accent:#ffd36a',
    '.qtc-global-trust-links>a[href]',
    'a.moment-link',
    '.qily-latest-brief-button::after',
    'border:2px solid var(--qily-boundary-accent)!important',
    'min-height:44px!important',
    'font-size:12px!important',
    '--qily-control-hover-bg:#ffe39b',
    '--qily-control-hover-ink:#17322d',
    '--qily-control-active-bg:#052a33',
    '--qily-control-active-ink:#ffffff',
    '--qily-control-disabled-bg:#e6eceb',
    '.qily-float-btn',
    '.site-music-toggle',
    '.qily-modal-close',
    ':is(:hover,:focus-visible)',
    ':is(:hover:hover,:focus-visible:focus-visible)',
    ':not(#qily-interaction-state-priority)',
    ':focus-visible',
    ':focus-visible:focus-visible',
    ':active',
    ':active:active',
    ':disabled',
    '[aria-disabled="true"]',
    'background-color:var(--qily-control-hover-bg)!important',
    'background-color:var(--qily-control-active-bg)!important',
    'outline:3px solid var(--qily-control-focus-ring)!important',
    'transition:none!important'
  ].forEach((marker) => assert(css.includes(marker), `Interaction CSS marker missing: ${marker}`));

  assert(css.includes('html:root:root body'), 'Specificity closure must target the real root html element.');
  assert(!css.includes(':root:root html body'), 'Impossible root-descendant selector would prevent the closure from matching.');
  assert(
    !/\.qily-float-btn:not\([^)]*\):not\([^)]*\)\s+:is\(/.test(css),
    'Floating-dock state pseudo-class must attach to the button; descendant whitespace makes the selector impossible.'
  );
  assert(
    css.includes('.qily-float-btn:not(#qily-float-state-priority):not(#qily-float-state-override):is(:hover:hover,:focus-visible:focus-visible)'),
    'Floating-dock hover/focus selector does not attach directly to the button.'
  );
  assert(!/qily-static-card[^\n,{]*:(?:hover|focus-visible|active)/.test(css), 'Static cards must not receive interactive feedback.');

  [
    ['hover', '#17322d', '#ffe39b', 4.5],
    ['active', '#ffffff', '#052a33', 4.5],
    ['dark primary', '#332100', '#ffd36a', 4.5],
    ['disabled', '#465a57', '#e6eceb', 4.5]
  ].forEach(([name, foreground, background, minimum]) => {
    const ratio = contrast(foreground, background);
    assert(ratio >= minimum, `${name} contrast ${ratio.toFixed(2)} is below ${minimum}:1.`);
  });
}

function validateLoadOrder() {
  const navigation = read('site-navigation.js');
  const publisher = read('scripts/publish-number-badge-contrast.js');
  const ndaTemplate = read('scripts/nda-source/nda-preview-template.html');
  const layoutCss = read('site-layout-footer-closure-v1.css');

  assert((navigation.match(new RegExp(version, 'g')) || []).length >= 3, 'Navigation does not load the current interaction stylesheet in every loader path.');
  assert(navigation.includes("'qilyTrustConversionV2Stylesheet','qilyInteractiveHoverContrastStylesheet'"), 'Interaction stylesheet must be promoted after trust conversion styles.');
  assert(navigation.indexOf("['qilyTrustConversionV2Stylesheet'") < navigation.indexOf("['qilyInteractiveHoverContrastStylesheet'"), 'Initial asset order must place interaction closure last.');
  assert((navigation.match(new RegExp(layoutVersion, 'g')) || []).length >= 3, 'Navigation does not load the current layout/footer stylesheet in every loader path.');
  assert(navigation.includes("'qilyInteractiveHoverContrastStylesheet','qilyLayoutFooterClosureStylesheet'"), 'Layout/footer closure must be promoted after interaction styles.');
  assert(publisher.includes(`const HOVER_VERSION = '${version}'`), 'Public-page materializer uses a stale interaction version.');
  assert(ndaTemplate.includes(href), 'NDA preview generator uses a stale interaction version.');
  assert(publisher.includes(`const LAYOUT_VERSION = '${layoutVersion}'`), 'Public-page materializer uses a stale layout/footer version.');
  assert(ndaTemplate.includes(layoutHref), 'NDA preview generator uses a stale layout/footer version.');
  assert(publisher.includes(`const NAV_VERSION = '${navVersion}'`), 'Public-page materializer uses a stale navigation version.');
  assert(ndaTemplate.includes(navHref), 'NDA preview generator uses a stale navigation version.');
  assert(navigation.includes('QILY-FLOAT-DOCK-POINTER-FEEDBACK-V1'), 'Navigation is missing floating-dock pointer feedback binding.');
  assert(navigation.includes('QILY-SITEWIDE-TAIL-COMPACTION-V1'), 'Navigation is missing the sitewide tail compaction guard.');
  assert(navigation.includes("d.body.classList.add('qily-tail-compact')"), 'Navigation does not clear the trailing empty document tail.');
  assert(navigation.includes("d.body.appendChild(trustFooter)"), 'Unified trust footer is not kept as the final flow module.');
  assert(navigation.includes("button.dataset.qilyPressed = 'true'"), 'Navigation does not expose a persistent touch pressed state.');
  assert(
    navigation.includes("var order = ['home','top','back','search','current','share','contact'];"),
    'Navigation does not normalize the seven floating actions to the approved order.'
  );
  assert(
    navigation.includes("dockActions:['data-action=\"home\"','data-action=\"top\"','data-action=\"back\"','data-action=\"search\"','data-action=\"current\"','data-action=\"share\"','data-action=\"contact\"']"),
    'Navigation build contract uses a stale floating-action order.'
  );

  [
    'QILY-SITEWIDE-LAYOUT-FOOTER-CLOSURE-V16-20260810',
    '--qily-site-content-width:var(--qily-wide-content,1560px)',
    '.qily-ia-inner',
    '.qtc-inner',
    '.qily-resource-network__inner',
    'height:auto!important',
    'min-height:0!important',
    'html:root:root body.qily-tail-compact .qtc-global-trust-footer .qtc-global-trust-links > a[href]',
    ':is(:hover:hover,:focus-visible:focus-visible)',
    ':active:active',
    'border:2px solid var(--qily-site-gold)!important',
    'min-height:44px!important'
  ].forEach((marker) => assert(layoutCss.includes(marker), `Layout/footer closure marker missing: ${marker}`));
}

function validatePublicPages() {
  let publicPages = 0;
  let actionControls = 0;
  let staleBeforeMaterialization = 0;
  let staleLayoutBeforeMaterialization = 0;
  let staleNavigationBeforeMaterialization = 0;

  walk(root, (absolute) => {
    if (!absolute.endsWith('.html')) return;
    const html = fs.readFileSync(absolute, 'utf8');
    if (!/<\/head>/i.test(html) || !/<\/body>/i.test(html) || !isPublicPage(html)) return;
    publicPages += 1;
    actionControls += (html.match(/<button\b|<input\b[^>]*type=["'](?:button|submit)["']|<a\b[^>]*class=["'][^"']*(?:button|action|btn|cta)/gi) || []).length;
    if (/site-interactive-hover-contrast-v1\.css\?v=(?!20260810-sitewide-floating-dock-feedback-v13)/i.test(html)) staleBeforeMaterialization += 1;
    if (/site-layout-footer-closure-v1\.css\?v=(?!20260810-sitewide-layout-footer-v16)/i.test(html)) staleLayoutBeforeMaterialization += 1;
    if (/site-navigation\.js\?v=(?!20260810-sitewide-layout-footer-loader-v16)/i.test(html)) staleNavigationBeforeMaterialization += 1;

    const candidate = materializeInMemory(html);
    const currentCount = candidate.split(href).length - 1;
    assert(currentCount === 1, `${path.relative(root, absolute)} would not materialize exactly one current interaction stylesheet.`);
    assert((candidate.match(/id=["']qilyInteractiveHoverContrastStylesheet["']/gi) || []).length === 1, `${path.relative(root, absolute)} would contain duplicate interaction stylesheet IDs.`);
    assert((candidate.split(layoutHref).length - 1) === 1, `${path.relative(root, absolute)} would not materialize exactly one current layout/footer stylesheet.`);
    assert((candidate.match(/id=["']qilyLayoutFooterClosureStylesheet["']/gi) || []).length === 1, `${path.relative(root, absolute)} would contain duplicate layout/footer stylesheet IDs.`);
    assert((candidate.split(navHref).length - 1) === 1, `${path.relative(root, absolute)} would not materialize exactly one current navigation loader.`);
  });

  assert(publicPages >= 2600, `Public-page coverage unexpectedly fell to ${publicPages}.`);
  assert(actionControls >= 100, `Only ${actionControls} action controls were covered; expected a sitewide corpus.`);
  return { publicPages, actionControls, staleBeforeMaterialization, staleLayoutBeforeMaterialization, staleNavigationBeforeMaterialization };
}

function main() {
  validateCss();
  validateLoadOrder();
  const coverage = validatePublicPages();
  process.stdout.write(
    `Interaction clarity validated: ${coverage.publicPages} public pages, ` +
    `${coverage.actionControls} button/action controls, ` +
    `${coverage.staleBeforeMaterialization} interaction style, ` +
    `${coverage.staleLayoutBeforeMaterialization} layout/footer style and ` +
    `${coverage.staleNavigationBeforeMaterialization} navigation cache references queued for deterministic refresh.\n`
  );
}

main();
