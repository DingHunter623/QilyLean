#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stylesheet = '/site-link-standard-v2.css?v=20260801-global-link-v4';
const linkTag = `  <link id="qilyGlobalLinkStandardStylesheet" rel="stylesheet" href="${stylesheet}">`;
const loaderMarker = 'qily-global-link-standard-loader-v1';

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, value) {
  const normalized = value.endsWith('\n') ? value : `${value}\n`;
  if (fs.existsSync(file) && read(file) === normalized) return false;
  fs.writeFileSync(file, normalized, 'utf8');
  return true;
}

function walk(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.cache') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function installHtmlLink(page) {
  if (!/<\/head>/i.test(page)) return page;
  const expression = /\s*<link\b[^>]*id=["']qilyGlobalLinkStandardStylesheet["'][^>]*>\s*/gi;
  let next = page.replace(expression, '\n');
  next = next.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-link-standard-v(?:1|2)\.css\?v=[^"']+["'][^>]*>\s*/gi, '\n');
  return next.replace(/<\/head>/i, `${linkTag}\n</head>`);
}

function patchNavigationLoader() {
  const file = path.join(root, 'site-navigation.js');
  let page = read(file);
  const loader = `/* ${loaderMarker} */\n(function(d){\n  'use strict';\n  var id='qilyGlobalLinkStandardStylesheet';\n  var href='${stylesheet}';\n  var current=d.getElementById(id);\n  if(current){if(current.getAttribute('href')!==href)current.setAttribute('href',href);return;}\n  var link=d.createElement('link');\n  link.id=id;link.rel='stylesheet';link.href=href;\n  (d.head||d.documentElement).appendChild(link);\n})(document);\n\n`;
  if (page.includes(loaderMarker)) {
    page = page.replace(/\/\* qily-global-link-standard-loader-v1 \*\/[\s\S]*?\}\)\(document\);\s*/m, loader);
  } else {
    page = loader + page;
  }
  return write(file, page);
}

function main() {
  let htmlChanged = 0;
  let htmlChecked = 0;
  walk(root, (file) => {
    if (!file.endsWith('.html')) return;
    htmlChecked += 1;
    const before = read(file);
    const after = installHtmlLink(before);
    if (after !== before) {
      write(file, after);
      htmlChanged += 1;
    }
  });
  const navigationChanged = patchNavigationLoader();
  process.stdout.write(`Published QilyLean global link standard v4 to ${htmlChecked} HTML files; refreshed ${htmlChanged}; navigation loader changed=${navigationChanged}.\n`);
}

main();
