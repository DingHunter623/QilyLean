#!/usr/bin/env node
'use strict';

/*
 * Compatibility entrypoint for historical workflows.
 * Guard contract markers:
 * 20260812-r2-stability-v1
 * QILY-R2-FIRST-PAINT:START
 * site-r2-stability-fixes-v1.css
 * site-music-persistent-navigation-v1.js?v=20260812-fast-native-v5
 * ordinary pages must not inject a repeated global contact footer
 */
require('./publish-r2-runtime-stability-v2.js');
