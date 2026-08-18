#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const SKIP = new Set(['.git','node_modules','vendor']);
let changed = 0;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    if (SKIP.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(abs);
    else if (ent.isFile() && ent.name.endsWith('.html')) patch(abs);
  }
}

function patch(abs) {
  const before = fs.readFileSync(abs, 'utf8');
  let next = before
    .replaceAll("BUILD='20260817-atomic-first-paint-v3'", "BUILD='20260818-business-hierarchy-v3'")
    .replaceAll('/site-navigation.js?v=20260817-atomic-first-paint-v22', '/site-navigation.js?v=20260818-business-hierarchy-v3')
    .replaceAll('/site-interaction-continuity-v1.css?v=20260817-continuity-v2', '/site-interaction-continuity-v1.css?v=20260818-visual-governance-v3');
  if (next !== before) {
    fs.writeFileSync(abs, next, 'utf8');
    changed += 1;
  }
}

walk(root);
console.log(`Public build/cache contract updated in ${changed} HTML files.`);
