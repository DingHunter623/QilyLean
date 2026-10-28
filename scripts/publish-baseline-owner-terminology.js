#!/usr/bin/env node
'use strict';
// Idempotent terminology SSOT. Existing PPH publisher maintains visible
// dictionary totals, social metadata and site-data after these cards are inserted.
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const file=path.join(root,'knowledge/terminology.html');
function write(p,next){const prev=fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';if(prev!==next)fs.writeFileSync(p,next,'utf8');}
const cards=[
{key:'baseline',after:'term-kpi',html:'<article class="term-card" data-term-card id="term-baseline" data-term-slug="baseline" data-keywords="基线 基线数据 改善前数据 现状数据 Baseline 比较基准"><div class="term-code">BASELINE</div><div class="term-en">Baseline / Baseline Data</div><h3>基线／基线数据</h3><p class="term-formula"><strong>定义：</strong>基线是衡量后续变化的参照；基线数据是改善前按固定对象、统计口径、时间窗口与条件采集的实际数据，不能把改善目标、理论产能或最好的一天当成基线。</p><p><strong>应用场景：</strong>用于IE测时、精益改善和PQCD指标的改善前后验证。应标明数据来源、样本、异常记录与版本，保证同口径比较。</p><div class="term-opl-actions"><a class="term-opl-open" href="/knowledge/terminology/baseline.html"><span class="term-opl-open-label-v9">查看单点培训课件</span></a></div></article>'},
{key:'owner',after:'term-raci',html:'<article class="term-card" data-term-card id="term-owner" data-term-slug="owner" data-keywords="OWNER Owner 主理人 负责人 责任人 所有者 流程责任人 项目责任人 RACI"><div class="term-code">OWNER</div><div class="term-en">Owner / Process Owner / Project Owner</div><h3>主理人／业务、流程与项目责任人</h3><p><strong>定义：</strong>Owner为英语单词，并非缩写。QilyLean首页“OWNER &amp; COLLABORATION”表示主理人与合作能力；制造管理中的Owner强调对流程或成果的责任归属，未必是股东或法人。</p><p><strong>应用场景：</strong>用于ERP数据治理、自动化设备移交、项目验收和流程治理。具体职责须结合RACI矩阵分清最终负责人与直接执行者。</p><div class="term-opl-actions"><a class="term-opl-open" href="/knowledge/terminology/owner.html"><span class="term-opl-open-label-v9">查看单点培训课件</span></a></div></article>'}
];
let html=fs.readFileSync(file,'utf8');
for(const c of cards){
 if(!fs.existsSync(path.join(root,'knowledge/terminology',c.key+'.html')))throw Error('OPL missing '+c.key);
 if(html.includes('id="term-'+c.key+'"'))continue;
 const a=html.indexOf('id="'+c.after+'"');if(a<0)throw Error('dictionary anchor missing '+c.after);
 const b=html.indexOf('</article>',a);if(b<0)throw Error('dictionary anchor not closed '+c.after);
 html=html.slice(0,b+10)+'\n'+c.html+'\n'+html.slice(b+10);
}
write(file,html);
for(const p of ['sitemap.xml','sitemap-core.xml']){
 const f=path.join(root,p);if(!fs.existsSync(f))continue;let s=fs.readFileSync(f,'utf8');if(!s.includes('</urlset>'))throw Error('sitemap malformed '+p);
 for(const c of cards){const u='https://qilylean.com/knowledge/terminology/'+c.key+'.html';if(!s.includes(u))s=s.replace('</urlset>','  <url><loc>'+u+'</loc><lastmod>2026-10-28</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>');}write(f,s);
}
console.log('PASS: BASELINE and OWNER dictionary cards and OPL links; PPH publisher maintains total counts.');
