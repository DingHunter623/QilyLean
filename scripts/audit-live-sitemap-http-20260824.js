#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), match => match[1].trim());
const concurrency = 12;
const failures = [];
const redirects = [];
let cursor = 0;

async function inspect(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) failures.push({ url, status: response.status, finalUrl: response.url });
    else if (response.url !== url && response.url !== `${url}/`) redirects.push({ url, finalUrl: response.url });
  } catch (error) {
    failures.push({ url, error: error.name === 'AbortError' ? 'timeout' : error.message });
  } finally {
    clearTimeout(timer);
  }
}

async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor];
    cursor += 1;
    await inspect(url);
  }
}

Promise.all(Array.from({ length: concurrency }, worker)).then(() => {
  console.log(JSON.stringify({ checked: urls.length, failures, redirects }, null, 2));
  if (failures.length) process.exit(1);
});
