#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const CSS_VERSION = '20260804-hero-primary-contrast-v1';
const MUSIC_VERSION = '20260804-continuity-v5';
const NAV_VERSION = '20260804-persistent-music-nav-v1';
const AUDIO_SRC = '/%E6%88%91%E7%9A%84%E6%A2%A6%EF%BC%88%E5%BC%A0%E9%9D%93%E9%A2%96%EF%BC%89.mp3';
const CSS_HREF = `/site-hero-primary-contrast-v1.css?v=${CSS_VERSION}`;
const MUSIC_SRC = `/homepage-music-v5.js?v=${MUSIC_VERSION}`;
const NAV_SRC = `/site-music-persistent-navigation-v1.js?v=${NAV_VERSION}`;
const BLOCK_START = '<!-- QILY-PRIMARY-CONTRAST-MUSIC:START -->';
const BLOCK_END = '<!-- QILY-PRIMARY-CONTRAST-MUSIC:END -->';

const cssTag = `  <link id="qilyHeroPrimaryContrastStylesheet" rel="stylesheet" href="${CSS_HREF}">`;
const preloadTag = `  <link id="qilyBackgroundMusicPreload" rel="preload" href="${AUDIO_SRC}" as="audio" type="audio/mpeg">`;
const musicTag = `  <script defer id="qilyBackgroundMusicScript" data-qily-background-music="v5" src="${MUSIC_SRC}"></script>`;
const navigationTag = `  <script defer id="qilyPersistentMusicNavigationScript" data-qily-persistent-music-navigation="v1" src="${NAV_SRC}"></script>`;
const managedBlock = [BLOCK_START, cssTag, preloadTag, musicTag, navigationTag, BLOCK_END].join('\n');

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
    'TRANSIT_COMPENSATION_CAP = 0.25',
    'playNow().then',
    "'/links/'",
    'window.setInterval(writeState, 400)'
  ].forEach((marker) => {
    if (!music.includes(marker)) throw new Error(`Music-continuity marker missing: ${marker}`);
  });

  [
    'window.__qilyPersistentNavigationV1 = true',
    "frame.contentWindow.location.replace(url.href)",
    "window.history.pushState(state, '', url.href)",
    "window.top !== window.self",
    "navigate('/', 'push')",
    "window.__qilyPersistentNavigate"
  ].forEach((marker) => {
    if (!navigation.includes(marker)) throw new Error(`Persistent-navigation marker missing: ${marker}`);
  });
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

  const keyPages = ['index.html', 'ai.html', 'cooperation/index.html', 'links/index.html', 'links/onboarding/index.html'];
  keyPages.forEach((relative) => {
    const html = read(path.join(root, relative));
    if (!html.includes(BLOCK_START) || !html.includes(BLOCK_END)) throw new Error(`${relative} missing managed block markers.`);
    if (!html.includes(CSS_HREF)) throw new Error(`${relative} missing hero-primary contrast asset.`);
    if (!html.includes(MUSIC_SRC)) throw new Error(`${relative} missing background-music v5 asset.`);
    if (!html.includes(NAV_SRC)) throw new Error(`${relative} missing persistent music navigation asset.`);
    if (!html.includes(`href="${AUDIO_SRC}"`)) throw new Error(`${relative} missing early audio preload.`);
    if (/homepage-music\.js(?:\?v=)?/i.test(html)) throw new Error(`${relative} still loads legacy music bootstrap.`);
    const contrastIndex = html.indexOf(CSS_HREF);
    const dockIndex = html.indexOf('qilyCoreServiceDockClosureStylesheet');
    if (dockIndex >= 0 && contrastIndex > dockIndex) throw new Error(`${relative} managed assets must remain before dock closure assets.`);
  });

  process.stdout.write(`Primary contrast, music and persistent navigation materialized in ${checked} public pages; refreshed ${changed}.\n`);
}

main();
