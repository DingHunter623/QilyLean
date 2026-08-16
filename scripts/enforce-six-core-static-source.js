#!/usr/bin/env node
'use strict';

// Legacy filename retained because multiple publication workflows call it.
// The canonical public taxonomy is now three core businesses, with digital
// factory as an engineering enabler and QilyLean AI/APP + website as evidence.

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const home = read('index.html');
const cooperation = read('cooperation/index.html');

assert(home.includes('<h2>三大核心业务</h2>'), 'Homepage three-core business heading is missing.');
assert(home.includes('data-qily-three-core-services="v1"'), 'Homepage three-core service marker is missing.');
assert(home.includes('ENGINEERING ENABLERS｜不计入核心业务'), 'Homepage engineering-enabler boundary is missing.');
assert(home.includes('QilyLean AI／APP') && home.includes('QilyLean官网'), 'Homepage digital-work evidence is incomplete.');
assert(!home.includes('data-qily-six-core-services'), 'Legacy six-core homepage marker remains.');
assert(!home.includes('六类核心能力') && !home.includes('六类项目合作能力'), 'Legacy six-core homepage wording remains.');

const homeCore = home.slice(home.indexOf('data-qily-three-core-services'), home.indexOf('ENGINEERING ENABLERS｜不计入核心业务'));
assert((homeCore.match(/data-qily-business-line="core"/g) || []).length === 3, 'Homepage must contain exactly three core-business cards.');
assert(!homeCore.includes('数字化工厂') && !homeCore.includes('APP软件开发') && !homeCore.includes('官网建设'), 'A digital enabler or work remains inside the homepage core-business group.');

assert(cooperation.includes('<h2>三大核心业务</h2>'), 'Cooperation three-core business heading is missing.');
assert(cooperation.includes('data-qily-three-core-services="v1"'), 'Cooperation three-core service marker is missing.');
assert(cooperation.includes('ENGINEERING ENABLERS｜非核心业务'), 'Cooperation engineering-enabler section is missing.');
assert(cooperation.includes('<h2>三大核心业务合作边界</h2>'), 'Cooperation three-core boundary is missing.');
assert(!cooperation.includes('data-qily-six-core-services') && !cooperation.includes('data-qily-six-service-boundary'), 'Legacy six-service cooperation marker remains.');
assert(!cooperation.includes('六类项目合作能力') && !cooperation.includes('六类核心能力'), 'Legacy six-service cooperation wording remains.');
assert(!/<span class="service-number">0[456]<\/span>/.test(cooperation), 'Digital enabler or work is still numbered as a core business.');
assert(!/<span class="boundary-type">0[456]｜/.test(cooperation), 'Digital enabler or work still appears in the core-business boundary grid.');

const pricingRuntime = read('site-navigation-legacy-20260802.js');
assert(pricingRuntime.includes("title.textContent = '三大核心业务报价参考'"), 'Pricing module heading is not aligned to the three core businesses.');
assert(pricingRuntime.includes("pricingGateMarkup('三大核心业务报价方案')"), 'Pricing access gate is not aligned to the three core businesses.');
assert(pricingRuntime.includes('<strong>三大核心业务</strong>'), 'Pricing family heading is not aligned to the three core businesses.');
assert(pricingRuntime.includes('本模块只覆盖三大核心业务'), 'Pricing scope boundary is missing.');
assert(!/var\s+(?:digitalPricing|appPricing|websitePricing)\s*=/.test(pricingRuntime), 'A retired non-core pricing array remains in the runtime.');
assert(!/<h3>0[456]｜/.test(pricingRuntime), 'A retired 04–06 pricing group remains in the runtime.');
assert(!pricingRuntime.includes('六类项目合作能力报价'), 'Legacy six-capability pricing wording remains in the runtime.');

const cooperationCore = cooperation.slice(cooperation.indexOf('data-qily-three-core-services'), cooperation.indexOf('id="engineering-enablers"'));
assert((cooperationCore.match(/class="service-number"/g) || []).length === 3, 'Cooperation must contain exactly three numbered core-business cards.');

for (const name of ['新工厂／新产线规划', '精益改善项目交付', '目视化项目设计与交付']) {
  assert(homeCore.includes(name) && cooperationCore.includes(name), `Core business is missing: ${name}`);
}

const schemas = Array.from(home.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))
  .map((match) => { try { return JSON.parse(match[1]); } catch (error) { return null; } })
  .filter(Boolean);
const graph = schemas.find((schema) => Array.isArray(schema['@graph']));
const service = graph && graph['@graph'].find((item) => item['@type'] === 'Service');
assert(service && Array.isArray(service.serviceType) && service.serviceType.length === 3, 'Homepage Service schema must expose exactly three core businesses.');

process.stdout.write('Three-core business architecture validated; legacy enforcer filename retained for workflow compatibility.\n');
