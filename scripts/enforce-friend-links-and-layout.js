#!/usr/bin/env node
'use strict';

/* QilyLean 友情链接 + 版式永久防回退｜2026-09-17
 * 1) /links/ 保留为独立资源模块；一级导航显示名统一为“资源协同”；
 * 2) 首页辅助资产继续保留“友情链接”直达 /links/，用于明确全球科技企业官网入口属性；
 * 3) /links/ 页面保留“友情链接｜全球科技企业100强”身份，同时继续承载产业资源协同内容；
 * 4) 本页内容轴统一到全站 1180px 主内容宽度；禁止 1240/1360/1560px 回退；
 * 5) hao123 作为正式友情链接收录并由永久规则保护，避免后续发布器覆盖回退；
 * 6) 国际站 /links/ 显式关联 QilyLean | 启力精益 中国知识站 qilylean.cn，但该入口独立于“全球科技企业100强”企业收录与排名；
 * 7) /links/ 中文语境中的官网品牌统一显示完整名称“QilyLean | 启力精益”；
 * 8) 该脚本为友情链接与中国知识站关联的唯一物化入口，CI 推送后自动生成公开页面。
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const officialBrand='QilyLean | 启力精益';
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){const file=path.join(root,rel);const out=content.endsWith('\n')?content:`${content}\n`;if(fs.readFileSync(file,'utf8')===out)return false;fs.writeFileSync(file,out,'utf8');return true;}
function assert(ok,msg){if(!ok)throw new Error(msg);}

function patchHome(){
  let html=read('index.html');
  const desired='<a href="/links/"><strong>友情链接</strong><span>全球科技企业100强官网入口，并保留产业资源协同网络与入驻服务。</span></a>';
  if(!html.includes(desired)){
    const old=/<a href="\/links\/network\/"><strong>产业资源协同网络<\/strong><span>[\s\S]*?<\/span><\/a>/;
    assert(old.test(html),'index.html: missing current产业资源协同网络 card; refusing blind rewrite');
    html=html.replace(old,desired);
  }
  assert(html.includes(desired),'index.html: 友情链接 home entry missing');
  assert(!/<a href="\/links\/network\/"><strong>产业资源协同网络<\/strong>/.test(html),'index.html: renamed friend-link card returned');
  write('index.html',html);
}

function patchLinks(){
  let html=read('links/index.html');
  html=html
    .replace(/<title>产业资源目录｜全球科技企业与跨行业协同资源｜QilyLean<\/title>/,'<title>友情链接｜全球科技企业100强官网入口｜QilyLean</title>')
    .replace(/<meta property="og:title" content="产业资源目录｜QilyLean">/,'<meta property="og:title" content="友情链接｜全球科技企业100强官网入口｜QilyLean">')
    .replace(/<span class="eyebrow">GLOBAL TECHNOLOGY & INDUSTRY RESOURCE DIRECTORY<\/span><h1>产业资源目录｜全球科技企业与跨行业资源<\/h1><p class="lead">[\s\S]*?<\/p>/,'<span class="eyebrow">GLOBAL TECHNOLOGY DIRECTORY</span><h1>友情链接｜全球科技企业100强</h1><p class="lead">汇集人工智能、云计算、半导体、工业自动化、智能硬件、商业航天、新能源、中国硬科技及优质网址导航入口，为技术研究、行业洞察、项目对标与供应链学习提供高效入口。</p>')
    .replace(/width:min\((?:1240|1360|1560)px,100%\)/g,'width:min(1180px,100%)')
    .replace('与QilyLean制造业应用价值精选',`与 ${officialBrand} 制造业应用价值精选`)
    .replace('与 QilyLean 制造业应用价值精选',`与 ${officialBrand} 制造业应用价值精选`)
    .replace('<strong>网址导航友情链接：</strong>QilyLean 已增加主流网址导航官方入口，便于访问与站点收录核验。',`<strong>网址导航友情链接：</strong>${officialBrand} 已增加主流网址导航官方入口，便于访问与站点收录核验。`);

  const chinaKnowledgeBlock=`<!-- QILY-CHINA-KNOWLEDGE-BRIDGE:START -->
      <div class="notice" id="qilyChinaKnowledgeBridge"><strong>${officialBrand} 中国知识站：</strong> <a class="resource-action" href="https://qilylean.cn/" target="_blank" rel="noopener" aria-label="进入 ${officialBrand} 中国知识站">进入 ${officialBrand} 中国知识站 ↗</a> <span>qilylean.cn 为 ${officialBrand} 制造知识体系的中国大陆个人知识与实践分享站，聚焦精益生产、工业工程、标准化、工厂规划与数智工厂知识；该入口属于知识体系关联，不作为“全球科技企业100强”的企业收录项或排名依据。</span></div>
      <!-- QILY-CHINA-KNOWLEDGE-BRIDGE:END -->`;
  const bridgeRe=/<!-- QILY-CHINA-KNOWLEDGE-BRIDGE:START -->[\s\S]*?<!-- QILY-CHINA-KNOWLEDGE-BRIDGE:END -->/;
  if(bridgeRe.test(html)){
    html=html.replace(bridgeRe,chinaKnowledgeBlock);
  }else{
    const anchor='<div class="toolbar"><input id="searchInput"';
    assert(html.includes(anchor),'links/index.html: toolbar anchor missing; refusing blind China knowledge bridge insertion');
    html=html.replace(anchor,`${chinaKnowledgeBlock}\n      ${anchor}`);
  }

  const haoRow='hao123|hao123 上网导航|网址导航|中国|https://www.hao123.com/';
  if(!html.includes(haoRow)){
    const rowsAnchor='var rows=`Google / Alphabet|谷歌 / Alphabet|AI云软件|美国|https://about.google/';
    assert(html.includes(rowsAnchor),'links/index.html: company rows anchor missing; refusing blind hao123 insertion');
    html=html.replace(rowsAnchor,`var rows=\`${haoRow}\nGoogle / Alphabet|谷歌 / Alphabet|AI云软件|美国|https://about.google/`);
  }

  html=html
    .replace("var categories=['全部','AI云软件','半导体','硬件工业','前沿科技','中国硬科技'];","var categories=['全部','网址导航','AI云软件','半导体','硬件工业','前沿科技','中国硬科技'];")
    .replace('<strong id="totalCount">100</strong><span>科技企业官网</span></div><div class="stat"><strong>5</strong><span>产业分类</span>','<strong id="totalCount">101</strong><span>官网与导航入口</span></div><div class="stat"><strong>6</strong><span>产业分类</span>')
    .replace('<p class="result" id="resultText">当前显示 100 家企业</p>','<p class="result" id="resultText">当前显示 101 个官网与导航入口</p>');

  assert(html.includes('<title>友情链接｜全球科技企业100强官网入口｜QilyLean</title>'),'links/index.html: friend-link title missing');
  assert(html.includes('<h1>友情链接｜全球科技企业100强</h1>'),'links/index.html: friend-link H1 missing');
  assert(html.includes('aria-label="搜索友情链接"'),'links/index.html: friend-link search identity missing');
  assert(html.includes('href="/links/network/"'),'links/index.html: industry resource network must remain available inside friend-links module');
  assert(html.includes(`与 ${officialBrand} 制造业应用价值精选`),'links/index.html: collection notice lost full official brand');
  assert(html.includes(`<strong>网址导航友情链接：</strong>${officialBrand} 已增加主流网址导航官方入口`),'links/index.html: navigation notice lost full official brand');
  assert(html.includes('id="qilyChinaKnowledgeBridge"'),'links/index.html: China knowledge bridge missing');
  assert(html.includes(`<strong>${officialBrand} 中国知识站：</strong>`),'links/index.html: China knowledge bridge label lost full official brand');
  assert(html.includes(`进入 ${officialBrand} 中国知识站 ↗`),'links/index.html: China knowledge CTA lost full official brand');
  assert(html.includes(`qilylean.cn 为 ${officialBrand} 制造知识体系`),'links/index.html: China knowledge description lost full official brand');
  assert(html.includes('href="https://qilylean.cn/"'),'links/index.html: qilylean.cn direct knowledge entry missing');
  assert(html.includes('不作为“全球科技企业100强”的企业收录项或排名依据'),'links/index.html: non-ranking boundary for China knowledge bridge missing');
  assert(html.includes(haoRow),'links/index.html: hao123 friend link missing');
  assert(html.includes("'网址导航'"),'links/index.html: hao123 category missing');
  assert(html.includes('https://www.hao123.com/'),'links/index.html: hao123 official URL missing');
  assert(!/width:min\((?:1240|1360|1560)px,100%\)/.test(html),'links/index.html: non-1180 legacy content axis returned');
  assert((html.match(/width:min\(1180px,100%\)/g)||[]).length>=2,'links/index.html: unified 1180px content axis incomplete');
  write('links/index.html',html);
}

patchHome();
patchLinks();
process.stdout.write(`Friend-links preserved; ${officialBrand} is explicit in Chinese brand contexts; qilylean.cn China knowledge bridge is visible and non-ranking; hao123 remains included; /links/ 1180px content axis is protected.\n`);
