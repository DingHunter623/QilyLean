#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const file = rel => path.join(root, rel);
const read = rel => fs.readFileSync(file(rel), 'utf8');
const write = (rel, content) => fs.writeFileSync(file(rel), content.endsWith('\n') ? content : content + '\n', 'utf8');

let home = read('index.html');
home = home.replace(
  '"description":"聚焦新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付、数字化工厂、APP软件开发、官网建设三大核心业务，贯通制造工程与数智化产品交付。"',
  '"description":"聚焦新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付三大核心业务；以数字化工厂、APP软件开发与官网建设作为数智化增强和数字产品能力。"'
);
write('index.html', home);

const cooperation = read('cooperation/index.html');
if (!cooperation.includes('<h2>三大核心业务</h2>')) throw new Error('Cooperation core hierarchy missing');
if (!cooperation.includes('DIGITAL ENABLERS｜数智化增强与数字产品能力')) throw new Error('Cooperation digital-enabler layer missing');
if (cooperation.includes('<h2>六类核心业务</h2>')) throw new Error('Six-core cooperation regression');
if (home.includes('六类核心业务')) throw new Error('Six-core homepage regression');
if (!home.includes('"name":"QilyLean三大核心业务"')) throw new Error('Homepage Service schema hierarchy missing');

process.stdout.write('Business hierarchy SEO/schema verified.\n');
