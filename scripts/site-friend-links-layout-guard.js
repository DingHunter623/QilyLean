#!/usr/bin/env node
'use strict';

/* QilyLean 友情链接与内容轴永久回归门禁｜2026-08-17 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
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
assert(!links.includes('width:min(1360px,100%)'),'layout guard: 1360px legacy content axis returned on /links/');
assert((links.match(/width:min\(1240px,100%\)/g)||[]).length>=2,'layout guard: /links/ does not use the 1240px content axis consistently');
process.stdout.write('Friend-links/layout guard passed: 友情链接 identity, homepage entry, resource sub-module and 1240px content axis are intact.\n');
