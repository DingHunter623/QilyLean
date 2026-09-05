#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'AI-Knowledge', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const runtime = '<script defer data-qily-translation-safe-direct="google-v1" src="/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16&fast=20260902-stable-fast-path-v2"></script>';
const styles = '<link id="qilyTranslationPublicUiV1" rel="stylesheet" href="/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16" data-qily-translation-public-ui="google-v1">';
if (!html.includes('data-qily-translation-safe-direct="google-v1"')) {
  html = html.replace('</head>', `${styles}\n${runtime}\n</head>`);
}
const runtimeCount = (html.match(/data-qily-translation-safe-direct="google-v1"/g) || []).length;
if (runtimeCount !== 1) throw new Error(`AI knowledge page must contain exactly one authoritative translation runtime, found ${runtimeCount}`);
if (!html.includes('qilyTranslationPublicUiV1')) throw new Error('AI knowledge page translation UI stylesheet is missing');
fs.writeFileSync(file, html, 'utf8');
console.log('AI knowledge translation runtime PASS');
