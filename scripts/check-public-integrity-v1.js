#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { throw new Error(message); };

const siteData = JSON.parse(read('qilylean/site-data.json'));
const terminology = read('knowledge/terminology.html');
const capabilities = read('capabilities/index.html');
const navigation = read('site-navigation.js');
const integrity = read('site-integrity-hotfix-v1.js');
const trust = read('trust/index.html');

const total = Number(siteData && siteData.terminology && siteData.terminology.total);
if (!Number.isInteger(total) || total < 1) fail('Invalid terminology total in site-data.json');

const countPattern = new RegExp(`共收录\\s*${total}\\s*项术语\\s*·\\s*${total}\\s*份单点培训课件`);
if (!countPattern.test(terminology)) fail(`Terminology page visible count is not synchronized to ${total}`);
if (/收录\s*79\s*个核心术语/.test(terminology)) fail('Legacy hard-coded 79 terminology count reappeared');
if (/收录\s*191\s*个核心术语/.test(terminology)) fail('Legacy hard-coded 191 terminology count reappeared');

if (!capabilities.includes('id="ai-certificate"')) fail('AI certificate section missing');
if (!integrity.includes('data-qily-certificate-verification')) fail('Certificate verification matrix runtime missing');
if (!integrity.includes('不表述为政府资质、行业权威认证、OpenAI官方认证或授权')) fail('Certificate public-boundary wording missing');
if (!integrity.includes('/qilylean/site-data.json')) fail('Terminology live source binding missing');
if (!navigation.includes('/site-integrity-hotfix-v1.js?v=20260824-public-integrity-v1')) fail('Sitewide integrity runtime is not loaded');
if (!trust.includes('搜索引擎外部摘要的刷新时间仍由各搜索平台决定')) fail('External search freshness boundary missing');

console.log(JSON.stringify({
  ok: true,
  terminologyTotal: total,
  terminologyLiveBound: true,
  certificateVerificationBoundary: true,
  externalSearchBoundary: true
}, null, 2));
