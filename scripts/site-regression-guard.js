#!/usr/bin/env node
'use strict';

/* QilyLean production regression guard entrypoint｜R6 / 2026-08-19
 * R6 is the only active production baseline. Historical R2 v22 guard remains for traceability only.
 */
require('./site-regression-guard-r6.js');
require('./site-friend-links-layout-guard.js');
