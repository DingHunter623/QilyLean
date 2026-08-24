#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'data', 'site-system-v4.json'), 'utf8'));
const file = path.join(root, 'meta', 'build.json');

function gitHead() {
  return cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
}

const sourceCommit = process.env.QILY_SOURCE_COMMIT || gitHead();
const state = process.env.QILY_BUILD_STATE || 'CI_PASS';
const now = process.env.QILY_BUILD_TIME || new Date().toISOString();
const compactDate = now.slice(0, 10).replace(/-/g, '');
const build = process.env.QILY_BUILD_ID || `${compactDate}-${sourceCommit.slice(0, 12)}`;

if (!/^[0-9a-f]{40}$/i.test(sourceCommit)) throw new Error('QILY_SOURCE_COMMIT must be a full 40-character Git SHA');
if (!['SOURCE_READY', 'CI_PASS', 'DEPLOYED', 'PUBLIC_VERIFIED'].includes(state)) throw new Error(`Unsupported build state: ${state}`);

const payload = {
  schemaVersion: 1,
  site: 'QilyLean',
  build,
  sourceCommit,
  materializedAt: now,
  publishedAt: ['DEPLOYED', 'PUBLIC_VERIFIED'].includes(state) ? now : null,
  state,
  standard: config.standard,
  dataSource: '/qilylean/site-data.json',
  notes: state === 'PUBLIC_VERIFIED'
    ? 'Public verification confirmed the configured production routes and this source baseline.'
    : 'Production state is staged; PUBLIC_VERIFIED requires the independent public verifier.'
};

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`[V4] Materialized meta/build.json: ${payload.build} ${payload.state} ${payload.sourceCommit}`);
