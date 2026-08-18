#!/usr/bin/env node
'use strict';

/* Historical filename retained for compatibility.
 * Current invariant: 3 core businesses + digital enablers/products.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const home = read('index.html');
const cooperation = read('cooperation/index.html');
const core = ['新工厂／新产线规划','精益改善项目交付','目视化项目设计与交付'];
for (const name of core) {
  assert(home.includes(name), `homepage core business missing: ${name}`);
  assert(cooperation.includes(name), `cooperation core business missing: ${name}`);
}
assert(home.includes('三大核心业务'), 'homepage must declare three core businesses');
assert(cooperation.includes('三大核心业务'), 'cooperation must declare three core businesses');
assert(home.includes('数智化增强'), 'homepage digital enabler layer missing');
assert(cooperation.includes('数智化增强'), 'cooperation digital enabler layer missing');
assert(!home.includes('两大业务主线 · 六类核心业务'), 'homepage regressed to six-core classification');
assert(!home.includes('六类核心业务｜六类核心能力'), 'homepage regressed to six-core heading');
assert(!cooperation.includes('<h2>六类核心业务</h2>'), 'cooperation regressed to six-core heading');
assert(!home.includes('data-qily-six-core-services="v2"'), 'homepage six-core marker returned');
assert(!cooperation.includes('data-qily-six-core-services="v2"'), 'cooperation six-core marker returned');

process.stdout.write('Business hierarchy guard passed: 3 core + digital enablers/products.\n');
