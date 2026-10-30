#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const tea = read('links/anxi-tea/index.html');
const resource = read('links/index.html');

const images = [...tea.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
const captions = [...tea.matchAll(/<figcaption\b[^>]*>/gi)].map((match) => match[0]);
const sections = [...tea.matchAll(/<section\b[^>]*>/gi)];

assert(tea.includes('qily-tea-culture-page'), 'Tea page scope class missing');
assert(resource.includes('qily-resource-collaboration-page'), 'Resource page scope class missing');
assert(sections.length === 8, 'Tea page section structure changed unexpectedly');
assert(images.length >= 18, 'Tea page image set is incomplete');
assert(images.every((img) => /\balt=["'][^"']+["']/i.test(img)), 'Every tea page image must keep descriptive alt text');
assert(images.every((img) => /\bwidth=["']\\d+["']/i.test(img) && /\bheight=["']\\d+["']/i.test(img)), 'Every tea page image must reserve intrinsic dimensions');
assert(images.slice(1).every((img) => /\bloading=["']lazy["']/i.test(img)), 'Non-hero images must remain lazy-loaded');
assert(captions.length >= 10 && captions.every((tag) => /data-qily-dark-surface=["']true["']/i.test(tag)), 'Photo captions must retain dark-overlay contrast ownership');

assert(tea.includes('background-color:#0d261b!important'), 'Deep tea/contact surfaces must override the global even-section background');
assert(tea.includes('background-color:#10251a!important'), 'Lifestyle band must retain its dark surface');
assert(tea.includes('width:min(1180px'), 'Tea page content must follow the sitewide 1180px axis');
assert(tea.includes('header.topbar:not(.qily-global-header)'), 'Tea page must suppress the pre-shell navigation rail flash');
assert(resource.includes('header.topbar:not(.qily-global-header)'), 'Resource directory must suppress the pre-shell navigation rail flash');

assert(resource.includes('data-qily-dark-surface="true"'), 'Tea resource feature must declare its dark gradient surface');
assert(resource.includes('color:#e8eee8!important'), 'Tea resource feature copy must remain high contrast');
assert(tea.includes('Qily259') && tea.includes('/assets/contact/qilylean-wechat-qr.png'), 'Tea contact must retain the approved WeChat ID and QR code');
assert(tea.includes('/assets/tea/02-2026-spring-tea.jpg'), 'Approved spring-tea image must remain in the collection');

const priceText = /(?:¥|￥|\bRMB\b|\bCNY\b|单价|售价|价格|\\d+(?:\\.\\d+)?\\s*元)/i;
assert(!priceText.test(tea), 'Tea page markup must not introduce price or currency copy');

console.log('[Tea Visual Closure] PASS: 8 sections, ' + images.length + ' images, ' + captions.length + ' readable photo captions, 1180px axis, dark-surface ownership, WeChat contact and price-free page copy.');
