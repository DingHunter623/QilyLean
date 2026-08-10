#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const CSS_VERSION = '20260804-hero-primary-contrast-v1';
const MUSIC_VERSION = '20260810-gesture-music-v27';
const CSS_HREF = `/site-hero-primary-contrast-v1.css?v=${CSS_VERSION}`;
const MUSIC_SRC = `/homepage-music-v5.js?v=${MUSIC_VERSION}`;
const BLOCK_START = '<!-- QILY-PRIMARY-CONTRAST-MUSIC:START -->';
const BLOCK_END = '<!-- QILY-PRIMARY-CONTRAST-MUSIC:END -->';

const cssTag = `  <link id="qilyHeroPrimaryContrastStylesheet" rel="stylesheet" href="${CSS_HREF}">`;
const musicTag = `  <script defer id="qilyBackgroundMusicScript" data-qily-background-music="v27" src="${MUSIC_SRC}"></script>`;
const managedBlock = [BLOCK_START, cssTag, musicTag, BLOCK_END].join('\n');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function removeManagedAssets(html) {
  let cleaned = html;

  cleaned = cleaned.replace(
    /^[ \t]*<!-- QILY-PRIMARY-CONTRAST-MUSIC:START -->\r?\n[\s\S]*?^[ \t]*<!-- QILY-PRIMARY-CONTRAST-MUSIC:END -->[ \t]*(?:\r?\n)?/gmi,
    ''
  );

  cleaned = cleaned
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyHeroPrimaryContrastStylesheet["']|href=["'][^"']*\/site-hero-primary-contrast-v1\.css(?:\?v=[^"']*)?["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '')
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyBackgroundMusicPreload["']|href=["'][^"']*%E6%88%91%E7%9A%84%E6%A2%A6[^"']*["'][^>]*\bas=["']audio["'])[^>]*>[ \t]*(?:\r?\n)?/gmi, '');

  cleaned = cleaned.replace(
    /<script\b[^>]*(?:id=["']qilyBackgroundMusicScript["']|data-qily-background-music=["'][^"']+["']|src=["'][^"']*\/homepage-music(?:-v5)?\.js(?:\?v=[^"']*)?["'])[^>]*>[ \t\r\n]*<\/script>/gi,
    ''
  );

  cleaned = cleaned.replace(
    /<script\b[^>]*(?:id=["']qilyPersistentMusicNavigationScript["']|data-qily-persistent-music-navigation=["'][^"']+["']|src=["'][^"']*\/site-music-persistent-navigation-v1\.js(?:\?v=[^"']*)?["'])[^>]*>[ \t\r\n]*<\/script>/gi,
    ''
  );

  return cleaned.replace(/^[ \t]+$/gm, '');
}

function isPublicPage(html) {
  return /site-navigation\.js\?v=/i.test(html) || /homepage-music(?:-v5)?\.js(?:\?v=)?/i.test(html) || /site-music-persistent-navigation-v1\.js(?:\?v=)?/i.test(html);
}

function insertBeforeDockOrHead(html) {
  const dockNeedle = '<link id="qilyCoreServiceDockClosureStylesheet"';
  const dockIndex = html.indexOf(dockNeedle);
  if (dockIndex >= 0) {
    const lineStart = html.lastIndexOf('\n', dockIndex) + 1;
    return html.slice(0, lineStart) + managedBlock + '\n' + html.slice(lineStart);
  }
  return html.replace(/<\/head>/i, `${managedBlock}\n</head>`);
}

function install(html) {
  if (!/<\/head>/i.test(html) || !/<\/body>/i.test(html) || !isPublicPage(html)) return html;
  return insertBeforeDockOrHead(removeManagedAssets(html));
}

function verifySourceContracts() {
  const css = read(path.join(root, 'site-hero-primary-contrast-v1.css'));
  const music = read(path.join(root, 'homepage-music-v5.js'));
  const navigation = read(path.join(root, 'site-music-persistent-navigation-v1.js'));

  [
    '.hero-actions > :is(a,button).primary',
    '-webkit-text-fill-color:var(--qily-hero-primary-text)!important',
    '--qily-hero-primary-bg:#ffd36a',
    ':is(:hover,:focus-visible,:active)'
  ].forEach((marker) => {
    if (!css.includes(marker)) throw new Error(`Primary-button contrast marker missing: ${marker}`);
  });

  [
    'window.__qilyLeanBackgroundMusicV5 = true',
    "return path === '/' || path === '/index.html'",
    'armBrowsingGestures()',
    "document.addEventListener('wheel', gestureStart",
    "document.addEventListener('scroll', gestureStart",
    'manualPaused',
    'snapControlHome()',
    "audio.preload = 'none'",
    'ensureAudioSource()',
    "audio.addEventListener('timeupdate', writeState"
  ].forEach((marker) => {
    if (!music.includes(marker)) throw new Error(`Music-continuity marker missing: ${marker}`);
  });

  ['window.__qilyNativeNavigationFallbackV2', 'window.location.assign', 'window.__qilyPersistentNavigate'].forEach((marker) => {
    if (!navigation.includes(marker)) throw new Error(`Native-navigation marker missing: ${marker}`);
  });
  if (/createElement\(['"]iframe['"]\)|qilyPersistentNavigationFrame|页面加载中/.test(navigation)) {
    throw new Error('The cached navigation fallback still contains iframe/spinner navigation.');
  }
}

function main() {
  verifySourceContracts();
  let checked = 0;
  let changed = 0;

  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    const before = read(file);
    if (!/<\/head>/i.test(before) || !isPublicPage(before)) return;
    checked += 1;
    const after = install(before);
    if (after !== before && write(file, after)) changed += 1;
  });

  const keyPages = ['index.html', 'ai.html', 'capabilities/index.html', 'cooperation/index.html', 'links/index.html', 'knowledge/index.html'];
  keyPages.forEach((relative) => {
    const html = read(path.join(root, relative));
    if (!html.includes(BLOCK_START) || !html.includes(BLOCK_END)) throw new Error(`${relative} missing managed block markers.`);
    if (!html.includes(CSS_HREF)) throw new Error(`${relative} missing hero-primary contrast asset.`);
    if (!html.includes(MUSIC_SRC)) throw new Error(`${relative} missing sitewide gesture-music asset.`);
    if (!html.includes('data-qily-background-music="v27"')) throw new Error(`${relative} missing V27 music contract marker.`);
    if (/qilyBackgroundMusicPreload/i.test(html)) throw new Error(`${relative} still preloads background audio.`);
    if (/site-music-persistent-navigation-v1\.js/i.test(html)) throw new Error(`${relative} still loads iframe navigation.`);
    if (/homepage-music\.js(?:\?v=)?/i.test(html)) throw new Error(`${relative} still loads legacy music bootstrap.`);
    const contrastIndex = html.indexOf(CSS_HREF);
    const dockIndex = html.indexOf('qilyCoreServiceDockClosureStylesheet');
    if (dockIndex >= 0 && contrastIndex > dockIndex) throw new Error(`${relative} managed assets must remain before dock closure assets.`);
  });

  process.stdout.write(`Primary contrast and V27 sitewide gesture music materialized in ${checked} public pages; refreshed ${changed}.\n`);
}

main();
