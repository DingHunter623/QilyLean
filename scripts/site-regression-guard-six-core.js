#!/usr/bin/env node
'use strict';

/* QilyLean six-core business + Friend Links regression guard｜2026-08-17 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok)throw new Error(msg);}

const SIX=[
  '新工厂／新产线规划','精益改善项目交付','目视化项目设计与交付',
  '数字化工厂','APP软件开发','官网建设'
];

const home=read('index.html');
const cooperation=read('cooperation/index.html');
for(const name of SIX){
  assert(home.includes(`<h3>${name}</h3>`),`homepage six-core business missing: ${name}`);
  assert(cooperation.includes(`<h3>${name}</h3>`),`cooperation six-core business missing: ${name}`);
}
assert(home.includes('data-qily-six-core-services="v2"'),'homepage six-core marker missing');
assert(cooperation.includes('data-qily-six-core-services="v2"'),'cooperation six-core marker missing');
assert(!home.includes('<h2>三大核心业务</h2>'),'homepage reverted to three-core classification');
assert(!cooperation.includes('<h2>三大核心业务</h2>'),'cooperation reverted to three-core classification');
assert(!cooperation.includes('id="engineering-enablers"'),'APP/website business was downgraded to engineering enablers again');

const legacy=read('site-navigation-legacy-20260802.js');
['var digitalPricing = [','var appPricing = [','var websitePricing = [','05｜APP软件开发','06｜官网建设'].forEach(token=>assert(legacy.includes(token),`six-core pricing missing: ${token}`));
assert(!legacy.includes('本模块只覆盖三大核心业务'),'pricing reverted to three-core scope');

const core=read('site-navigation-core.js');
const order=["['首页', '/']","['能力体系', '/capabilities/']","['代表项目', '/projects/']","['改善方法', '/improvements/']","['知识资产', '/knowledge/']","['履历主线', '/experience/']","['友情链接', '/links/']","['项目合作', '/cooperation/']","['信任中心', '/trust/']"];
let cursor=-1;for(const token of order){const at=core.indexOf(token);assert(at>cursor,`primary navigation missing or out of order: ${token}`);cursor=at;}
assert(core.includes("if (path.indexOf('/links/') === 0) return '/links/';"),'Friend Links current-module route missing');

const consistency=read('site-ui-consistency-v1.js');
assert(consistency.includes("if(path.indexOf('/links/')===0)return '/links/';"),'UI consistency does not recognize Friend Links as primary module');
assert(consistency.includes("'/links/'"),'UI consistency primary route list missing Friend Links');
assert(!consistency.includes("if(path.indexOf('/links/')!==0)link.remove();"),'runtime still removes Friend Links from primary navigation');

const primary=['index.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
for(const rel of primary){
  const html=read(rel);const header=(html.match(/<header\b[\s\S]*?<\/header>/i)||[])[0]||'';
  assert(/href="\/links\/"[^>]*>\s*友情链接\s*<\/a>/.test(header),`${rel}: Friend Links primary navigation missing`);
  assert(header.indexOf('href="/links/"')<header.indexOf('href="/cooperation/"'),`${rel}: Friend Links must appear before Project Cooperation`);
}
const links=read('links/index.html');
const linksHeader=(links.match(/<header\b[\s\S]*?<\/header>/i)||[])[0]||'';
assert(/href="\/links\/"[^>]*aria-current="page"[^>]*>友情链接<\/a>/.test(linksHeader),'links page current-state Friend Links marker missing');
assert(links.includes('<title>友情链接｜全球科技企业100强官网入口｜QilyLean</title>'),'Friend Links identity drifted');
assert(home.includes('<a href="/links/"><strong>友情链接</strong>'),'homepage Friend Links direct entry missing');

const native=read('site-music-persistent-navigation-v1.js');
['w.__qilyFastNativeNavigationV7','location.assign(url.href)',"mode: 'native-only-v7'",'domSwap: false','runtimeContentRewrite: false','visualMutation: false'].forEach(token=>assert(native.includes(token),`native navigation baseline missing: ${token}`));
assert(!/\bfetch\s*\(/.test(native),'duplicate HTML fetch/prefetch returned');

const wrapper=read('site-navigation.js');
["mode: 'atomic-first-paint-v22'",'staticHtmlAuthority: true','atomicFirstPaint: true','runtimeDependencyWaterfall: false','dynamicContentShapers: false','routeScopedLegacy: true'].forEach(token=>assert(wrapper.includes(token),`atomic first-paint baseline missing: ${token}`));

process.stdout.write('Six-core/Friend Links regression guard passed: six businesses, six pricing groups, primary navigation and performance baseline are intact.\n');
