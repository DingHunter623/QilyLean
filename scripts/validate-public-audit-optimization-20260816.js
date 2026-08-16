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

assert(home.includes('四类制造项目主线，两项数字工程支撑'), 'Homepage capability hierarchy is missing.');
assert(home.includes('制造项目主线｜04'), 'Digital factory must remain in the manufacturing project mainline.');
assert(home.includes('数字工程支撑｜05') && home.includes('数字工程支撑｜06'), 'APP and website support tier is missing.');
assert(cooperation.includes('01—04直接服务制造系统规划、现场改善与数智运营'), 'Cooperation hierarchy is missing.');
assert(cooperation.includes('数字工程支撑</strong><span>Times26001实证作品'), 'APP evidence has not been moved to the support tier.');
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
