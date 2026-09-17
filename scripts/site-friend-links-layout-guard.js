#!/usr/bin/env node
'use strict';

/* QilyLean 友情链接、双站知识关联、完整品牌与内容轴永久回归门禁｜2026-09-17 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const officialBrand='QilyLean | 启力精益';
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok)throw new Error(msg);}

const home=read('index.html');
const links=read('links/index.html');
assert(home.includes('<a href="/links/"><strong>友情链接</strong>'),'friend-links guard: homepage direct entry missing');
assert(!home.includes('<a href="/links/network/"><strong>产业资源协同网络</strong>'),'friend-links guard: homepage module renamed away from 友情链接');
assert(links.includes('<title>友情链接｜全球科技企业100强官网入口｜QilyLean</title>'),'friend-links guard: page title drifted');
assert(links.includes('<h1>友情链接｜全球科技企业100强</h1>'),'friend-links guard: H1 drifted');
assert(links.includes('aria-label="搜索友情链接"'),'friend-links guard: search identity drifted');
assert(links.includes('href="/links/network/"'),'friend-links guard: industry resource network was removed instead of retained as a sub-module');
assert(links.includes(`与 ${officialBrand} 制造业应用价值精选`),'friend-links guard: collection notice lost full official brand');
assert(links.includes(`<strong>网址导航友情链接：</strong>${officialBrand} 已增加主流网址导航官方入口`),'friend-links guard: navigation notice lost full official brand');
assert(links.includes('id="qilyChinaKnowledgeBridge"'),'friend-links guard: China knowledge bridge missing');
assert(links.includes(`<strong>${officialBrand} 中国知识站：</strong>`),'friend-links guard: China knowledge label lost full official brand');
assert(links.includes(`进入 ${officialBrand} 中国知识站 ↗`),'friend-links guard: China knowledge CTA lost full official brand');
assert(links.includes(`qilylean.cn 为 ${officialBrand} 制造知识体系`),'friend-links guard: China knowledge description lost full official brand');
assert(links.includes('href="https://qilylean.cn/"'),'friend-links guard: direct qilylean.cn knowledge entry missing');
assert(links.includes('不作为“全球科技企业100强”的企业收录项或排名依据'),'friend-links guard: China knowledge bridge lost non-ranking boundary');
assert(!/width:min\((?:1240|1360|1560)px,100%\)/.test(links),'layout guard: legacy non-1180 content axis returned on /links/');
assert((links.match(/width:min\(1180px,100%\)/g)||[]).length>=2,'layout guard: /links/ does not use the 1180px content axis consistently');
process.stdout.write(`Friend-links/layout guard passed: ${officialBrand} full-brand contexts, friend-links identity, qilylean.cn knowledge bridge, non-ranking boundary, resource sub-module and 1180px content axis are intact.\n`);
