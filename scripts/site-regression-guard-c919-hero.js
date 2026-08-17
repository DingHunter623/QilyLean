#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const image=path.join(root,'qilylean','c919-strategy-hero.png');
function assert(ok,msg){if(!ok)throw new Error(msg);}
assert((html.match(/<!-- QILY-C919-STRATEGY-HERO:START -->/g)||[]).length===1,'C919 hero start marker must exist once');
assert((html.match(/<!-- QILY-C919-STRATEGY-HERO:END -->/g)||[]).length===1,'C919 hero end marker must exist once');
const mainPos=html.search(/<main\b[^>]*>/i), heroPos=html.indexOf('<!-- QILY-C919-STRATEGY-HERO:START -->'), oldHeroPos=html.indexOf('<section class="hero">');
assert(mainPos>=0&&heroPos>mainPos,'C919 hero must be inside main');
assert(oldHeroPos<0||heroPos<oldHeroPos,'C919 hero must be homepage number-one content');
assert(fs.existsSync(image)&&fs.statSync(image).size>100000,'C919 strategy image missing or too small');
assert(html.includes('src="/qilylean/c919-strategy-hero.png"'),'C919 image path missing');
assert(html.includes('左翼承载<strong>数字化工厂、APP软件开发、官网建设</strong>'),'left wing business mapping incorrect');
assert(html.includes('右翼承载<strong>新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付</strong>'),'right wing business mapping incorrect');
assert(!html.includes('左翼承载<strong>新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付</strong>'),'old reversed left-wing mapping returned');
assert(html.includes('.qily-c919-soul{width:min(1420px,calc(100% - 24px));margin:28px auto 0;'),'C919 soul summary must be widened and moved below image');
assert(html.includes('助企业高质量发展'),'customer strategic axis missing');
assert(html.includes('启力精益展翼远航'),'brand strategic axis missing');
assert(html.includes('这不是一张装饰性的飞机图，而是一张启力精益面向制造企业的战略蓝图。'),'soul summary missing');
['新工厂／新产线规划','精益改善项目交付','目视化项目设计与交付','数字化工厂','APP软件开发','官网建设'].forEach(name=>assert(html.includes(name),`locked business missing: ${name}`));
assert(!html.includes('三大核心业务'),'retired three-core wording returned');
assert(html.includes('content="https://qilylean.com/qilylean/c919-strategy-hero.png"'),'social C919 image missing');
assert(html.includes('rel="preload" as="image" href="/qilylean/c919-strategy-hero.png"'),'C919 preload missing');
console.log('C919 homepage hero guard passed: correct left/right wing mapping and non-overlapping widened summary locked.');
