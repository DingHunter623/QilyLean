#!/usr/bin/env node
'use strict';

// Legacy filename retained because multiple publication workflows call it.
// Canonical public presentation: three core businesses + digital engineering
// enhancement + autonomous digital works/evidence. User-facing copy must explain
// value positively instead of using exclusionary wording such as “not core business”.

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const file = (rel) => path.join(root, rel);
const read = (rel) => fs.readFileSync(file(rel), 'utf8');
const write = (rel, content) => {
  const target = file(rel);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.readFileSync(target, 'utf8') === normalized) return false;
  fs.writeFileSync(target, normalized, 'utf8');
  return true;
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const replacements = [
  ['ENGINEERING ENABLERS｜不计入核心业务', 'ENGINEERING ENABLERS｜数智化增强'],
  ['ENGINEERING ENABLERS｜非核心业务', 'ENGINEERING ENABLERS｜数智化增强'],
  ['官网本身作为技术实证，不列为核心业务', '官网本身作为技术实证与专业数字资产'],
  ['三大核心业务均明确范围、交付物与验收边界；数智化增强能力按具体项目需要嵌入，不另行包装成核心业务。', '三大核心业务均明确范围、交付物与验收边界；数智化增强能力按具体项目需要组合应用。'],
  ['本页只把能够独立定义项目范围、交付资产、阶段节点和验收标准的三类制造项目列为核心业务。数字化工厂按需要嵌入项目，APP与官网仅作为自主数字作品和技术实证，不再与核心业务并列。', '本页以能够独立定义项目范围、交付资产、阶段节点和验收标准的三类制造项目为主线；数字化工厂按需要嵌入项目，APP与官网用于展示自主数字作品与技术实证。'],
  ['以下内容用于增强制造项目交付或证明技术实现能力，不作为第四、第五、第六项核心业务，也不在本页按标准独立业务报价。', '以下内容用于增强制造项目交付并证明技术实现能力，按项目场景与业务需求组合应用。'],
  ['作品实证，不列为标准核心业务。', '保留版本、测试、安装包与发布记录，作为软件化能力实证。'],
  ['官网自身即技术实证，不列为标准核心业务。', '官网自身作为专业内容资产化与互联网工程能力实证。'],
  ['新工厂／新产线规划、精益改善、目视化项目的输入条件、专业责任和验收口径不同，须按项目类型分别定义范围。数智化工厂按项目需要嵌入对应业务；APP与官网作品不在此处作为标准合作业务展开。', '新工厂／新产线规划、精益改善、目视化项目的输入条件、专业责任和验收口径不同，须按项目类型分别定义范围；数智化工厂、APP与官网能力按实际项目需求组合应用。']
];

function normalize(rel) {
  let content = read(rel);
  for (const [from, to] of replacements) content = content.split(from).join(to);
  return write(rel, content);
}

// Fix both the currently published static HTML and the canonical materializer so
// later publication jobs cannot re-introduce the rejected negative wording.
normalize('index.html');
normalize('cooperation/index.html');
normalize('scripts/materialize-static-core-pages.js');

// Keep the public taxonomy specification positive as well; hierarchy is expressed
// by placement and labels, not by devaluing adjacent capabilities.
let taxonomy = read('docs/QilyLean全站业务口径规范_20260809.md');
taxonomy = taxonomy
  .replace('**自主数字作品与技术实证**：QilyLean AI／APP与官网，不列为第四、第五、第六项核心业务。', '**自主数字作品与技术实证**：QilyLean AI／APP与官网，用于公开证明制造逻辑软件化、知识资产化与互联网工程能力。')
  .replace('禁止把增强能力和自主作品与三大核心业务并列编号。', '对外呈现采用“核心业务主线 + 数智化增强 + 自主数字作品与技术实证”的分层结构，用正向价值文案表达层级。')
  .replace('QilyLean AI／APP与官网不在该模块作为04–06标准业务报价。', 'QilyLean AI／APP与官网在作品与技术实证板块展示，报价模块聚焦01–03三大核心业务。')
  .replace('**非核心业务边界**：数字化工厂按具体制造项目作为工程增强能力嵌入；QilyLean AI／APP与官网属于自主数字作品和技术实证，不单列标准业务报价。', '**增强能力与作品边界**：数字化工厂按具体制造项目作为工程增强能力嵌入；QilyLean AI／APP与官网作为自主数字作品和技术实证展示，标准项目报价聚焦01–03三大核心业务。');
write('docs/QilyLean全站业务口径规范_20260809.md', taxonomy);

const home = read('index.html');
const cooperation = read('cooperation/index.html');

assert(home.includes('<h2>三大核心业务</h2>'), 'Homepage three-core business heading is missing.');
assert(home.includes('data-qily-three-core-services="v1"'), 'Homepage three-core service marker is missing.');
assert(home.includes('ENGINEERING ENABLERS｜数智化增强'), 'Homepage engineering-enabler heading is missing.');
assert(home.includes('QilyLean AI／APP') && home.includes('QilyLean官网'), 'Homepage digital-work evidence is incomplete.');
assert(!home.includes('data-qily-six-core-services'), 'Legacy six-core homepage marker remains.');
assert(!home.includes('六类核心能力') && !home.includes('六类项目合作能力'), 'Legacy six-core homepage wording remains.');

const homeCore = home.slice(home.indexOf('data-qily-three-core-services'), home.indexOf('ENGINEERING ENABLERS｜数智化增强'));
assert((homeCore.match(/data-qily-business-line="core"/g) || []).length === 3, 'Homepage must contain exactly three core-business cards.');
assert(!homeCore.includes('数字化工厂') && !homeCore.includes('APP软件开发') && !homeCore.includes('官网建设'), 'A digital enabler or work remains inside the homepage core-business group.');

assert(cooperation.includes('<h2>三大核心业务</h2>'), 'Cooperation three-core business heading is missing.');
assert(cooperation.includes('data-qily-three-core-services="v1"'), 'Cooperation three-core service marker is missing.');
assert(cooperation.includes('ENGINEERING ENABLERS｜数智化增强'), 'Cooperation engineering-enabler section is missing.');
assert(cooperation.includes('<h2>三大核心业务合作边界</h2>'), 'Cooperation three-core boundary is missing.');
assert(!cooperation.includes('data-qily-six-core-services') && !cooperation.includes('data-qily-six-service-boundary'), 'Legacy six-service cooperation marker remains.');
assert(!cooperation.includes('六类项目合作能力') && !cooperation.includes('六类核心能力'), 'Legacy six-service cooperation wording remains.');
assert(!/<span class="service-number">0[456]<\/span>/.test(cooperation), 'Digital enabler or work is still numbered as a core business.');
assert(!/<span class="boundary-type">0[456]｜/.test(cooperation), 'Digital enabler or work still appears in the core-business boundary grid.');

const rejectedVisibleFraming = [
  '不计入核心业务', '非核心业务', '不列为核心业务', '不列为标准核心业务',
  '不另行包装成核心业务', '不再与核心业务并列', '不作为第四、第五、第六项核心业务'
];
for (const phrase of rejectedVisibleFraming) {
  assert(!home.includes(phrase), `Homepage rejected negative framing returned: ${phrase}`);
  assert(!cooperation.includes(phrase), `Cooperation rejected negative framing returned: ${phrase}`);
}

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

process.stdout.write('Three-core architecture normalized: positive value framing is enforced and rejected exclusionary copy is blocked from public pages and generators.\n');
