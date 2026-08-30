#!/usr/bin/env node
'use strict';

/**
 * Compatibility shim for the retired V13/V14 URL policy.
 *
 * Historical policy removed trailing slashes from public URLs. QilyLean now
 * follows the canonical routing contract used by its static host:
 *   - site root and directory-backed pages use a trailing slash;
 *   - real file URLs keep their extension and do not gain a slash;
 *   - runtime/CORS origins remain origin-form without a path slash.
 *
 * Keep this filename because older workflows may still call it. Any such call
 * is redirected to the current authoritative normalizer instead of reverting
 * the site back to the retired policy.
 */

const { spawnSync } = require('child_process');

console.log('NOTICE: legacy URL V14 mutator retired; applying current canonical URL contract.');
const result = spawnSync('python3', ['scripts/normalize-url-contract.py', '--apply'], {
  stdio: 'inherit'
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status == null ? 1 : result.status);
