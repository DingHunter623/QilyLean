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

assert(home.includes('<h2>三大核心业务</h2>'), 'Homepage three-core business heading is missing.');
assert(home.includes('data-qily-three-core-services="v1"'), 'Homepage three-core service contract is missing.');
assert(home.includes('ENGINEERING ENABLERS｜不计入核心业务'), 'Homepage engineering-enabler tier is missing.');
assert(home.includes('官网本身作为技术实证，不列为核心业务'), 'Website evidence is not clearly excluded from core business.');
assert(!home.includes('data-qily-six-core-services') && !home.includes('六类核心能力'), 'Homepage still exposes a six-core taxonomy.');
assert(cooperation.includes('<h2>三大核心业务</h2>'), 'Cooperation three-core business heading is missing.');
assert(cooperation.includes('data-qily-three-core-services="v1"'), 'Cooperation three-core service contract is missing.');
assert(cooperation.includes('ENGINEERING ENABLERS｜非核心业务'), 'Cooperation engineering-enabler tier is missing.');
assert(!cooperation.includes('data-qily-six-core-services') && !cooperation.includes('六类项目合作能力'), 'Cooperation still exposes a six-service taxonomy.');
assert(!cooperation.includes('<span class="service-number">04</span>'), 'Digital factory is still numbered as a fourth core business.');
assert(!cooperation.includes('<span class="service-number">05</span>') && !cooperation.includes('<span class="service-number">06</span>'), 'Digital works are still numbered as core businesses.');
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
