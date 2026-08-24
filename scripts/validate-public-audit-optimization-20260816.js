#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const home = read('index.html');
const cooperation = read('cooperation/index.html');
const improvements = read('improvements/index.html');
const terminology = read('knowledge/terminology.html');
const data = JSON.parse(read('qilylean/site-data.json'));

assert(home.includes('三大核心业务｜先解决制造现场真正影响交付的问题'), 'Homepage three-core business heading is missing.');
assert(home.includes('data-qily-core-business="three-v3"'), 'Homepage three-core service contract is missing.');
assert(home.includes('DIGITAL ENABLERS｜数智化增强与数字产品能力'), 'Homepage digital-enabler tier is missing.');
assert(home.includes('而不是把它们与核心制造项目混为一类'), 'Homepage does not separate digital enablers from core business.');
assert(!home.includes('data-qily-six-core-services'), 'Homepage still exposes a six-core taxonomy contract.');
assert(cooperation.includes('<h2>三大核心业务</h2>'), 'Cooperation three-core business heading is missing.');
assert(cooperation.includes('data-qily-core-business="three-v3"'), 'Cooperation three-core service contract is missing.');
assert(cooperation.includes('DIGITAL ENABLERS｜数智化增强与数字产品能力'), 'Cooperation digital-enabler tier is missing.');
assert(cooperation.includes('三项增强能力，不与三大核心业务同级'), 'Cooperation does not separate digital enablers from core business.');
assert(!cooperation.includes('data-qily-six-core-services'), 'Cooperation still exposes a six-service taxonomy contract.');
assert(cooperation.includes('<small>Engineering Enabler</small>'), 'Digital factory is not labeled as an engineering enabler.');
assert((cooperation.match(/<small>Digital Product<\/small>/g) || []).length === 2, 'APP and website capabilities are not labeled as digital products.');
assert(improvements.includes('制造改善实践方法专栏') && improvements.includes('方法文章目录'), 'Academic overstatement remains in method index.');
assert(!improvements.includes('制造改善实践论文合集') && !improvements.includes('论文目录'), 'Legacy paper naming remains.');

const cards = (terminology.match(/<article\b[^>]*\bdata-term-card\b[^>]*>/gi) || []).length;
assert(cards === data.terminology.total, `Terminology source mismatch: cards=${cards}, metadata=${data.terminology.total}`);
assert(data.terminology.total === data.terminology.lessonTotal, 'Terminology and lesson totals are inconsistent.');
assert(terminology.includes('<div class="term-code">Sponsor</div>'), 'Sponsor terminology must be present in static HTML, not runtime-only.');

for (const rel of [
  'projects/automotive-lean/index.html',
  'projects/smed-300t/index.html',
  'projects/mold-warehouse/index.html',
  'projects/fuse-improvement/index.html',
  'projects/factory-layout/index.html',
  'projects/digital-factory/index.html'
]) {
  const html = read(rel);
  assert(html.includes('PUBLIC VERIFICATION｜公开口径与核验边界'), `${rel} lacks verification boundary.`);
  assert(html.includes('公开摘要不替代原始数据'), `${rel} lacks non-substitution statement.`);
}

const projects = read('projects/index.html');
assert(projects.includes('代表项目统一采用四段式公开口径'), 'Project-list verification structure is missing.');
assert(projects.includes('事实基线') && projects.includes('验证方法') && projects.includes('受控证据'), 'Project verification fields are incomplete.');

process.stdout.write('Public audit optimization validation passed.\n');
