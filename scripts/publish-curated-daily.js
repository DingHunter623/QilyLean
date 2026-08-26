#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const steps = [
  ['curate-weekly-briefs.js'],
  ['publish-npi-four-stage-series-runner.js'],
  ['publish-early-career-history.js'],
  ['remove-daily-directory-consultation.js'],
  ['publish-pph-terminology.js'],
  ['sync-daily-terminology.js'],
  ['sync-daily-terminology.js', '--check'],
  ['audit-daily-terminology.js'],
  ['audit-daily-quality-linkage.js'],
  ['sync-curated-site-metadata.js'],
  ['sync-search-brief-metadata.js'],
  ['sync-trust-brief-metadata.js'],
  ['sync-trust-brief-metadata.js', '--check'],
  ['validate-weekly-brief-curation.js'],
  ['validate-current-daily-publication.js']
];

for (const [script, ...args] of steps) {
  process.stdout.write(`\n[daily-publication] ${script}${args.length ? ` ${args.join(' ')}` : ''}\n`);
  const result = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
    cwd: root,
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

process.stdout.write('\nDaily publication SSOT synchronized and validated.\n');
