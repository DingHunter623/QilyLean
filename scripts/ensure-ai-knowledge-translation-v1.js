#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'AI-Knowledge', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const styles = '<link id="qilyTranslationPublicUiV1" rel="stylesheet" href="/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16" data-qily-translation-public-ui="google-v1">';
const redline = '<script defer data-qily-public-redline-v2-direct="annotated-v2" src="/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23"></script>';
const runtime = '<script defer data-qily-translation-safe-direct="google-v1" src="/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16&fast=20260902-stable-fast-path-v2"></script>';
if (!html.includes('qilyTranslationPublicUiV1')) html = html.replace('</head>', `${styles}\n</head>`);
if (!html.includes('/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23')) html = html.replace('</head>', `${redline}\n</head>`);
if (!html.includes('data-qily-translation-safe-direct="google-v1"')) html = html.replace('</head>', `${runtime}\n</head>`);
const runtimeCount = (html.match(/site-translation-safe-runtime-v1\.js/g) || []).length;
if (runtimeCount !== 1) throw new Error(`AI knowledge page must contain exactly one authoritative translation runtime, found ${runtimeCount}`);
if (!html.includes('/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16')) throw new Error('AI knowledge page translation runtime cache is stale');
if (!html.includes('/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16')) throw new Error('AI knowledge page translation UI cache is stale');
if (!html.includes('/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23')) throw new Error('AI knowledge page public redline cache is stale');
fs.writeFileSync(file, html, 'utf8');
console.log('AI knowledge translation and public redline runtime PASS');
