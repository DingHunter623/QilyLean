#!/usr/bin/env node
'use strict';
// Stable, idempotent engineering-focus overlays for historically repetitive
// briefs. Preserve original evidence, publication dates, URLs and shared VI.
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/brief-focus-overrides-20261014.json'),'utf8'));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(date,item){
 const url='/qilylean/daily/'+esc(item.related)+'.html';
 return '<section class="brief-training-depth brief-stage-specialization" data-qily-brief-focus="'+esc(date)+'">'+
 '<h3>4. 场景化工程专题｜'+esc(item.title)+'</h3>'+
 '<p><strong>问题边界：</strong>'+esc(item.problem)+'</p>'+
 '<div class="brief-learning-grid"><div class="brief-learning-card"><strong>主责及职能接口</strong><p>'+esc(item.owner)+'</p></div>'+
 '<div class="brief-learning-card"><strong>工程方法与实施次序</strong><p>'+esc(item.method)+'</p></div></div>'+
 '<p><strong>量化口径及可验收证据：</strong>'+esc(item.metric)+'</p>'+
 '<div class="engineering-checklist"><strong>适用边界：</strong>'+esc(item.boundary)+'</div>'+
 '<p><strong>关联学习：</strong><a href="'+url+'">阅读相邻职能专题（'+esc(item.related)+'）</a>，建立工程数据、责任接口与结果验证的完整知识链。</p>'+
 '</section>';
}
let updated=0;
for(const [date,item] of Object.entries(data.items)){
 const file=path.join(root,'qilylean/daily',date+'.html');
 if(!fs.existsSync(file))throw new Error('Brief missing: '+date);
 let html=fs.readFileSync(file,'utf8');
 const marker='<div class="tags">';
 if(!html.includes(marker))throw new Error('Brief has no tags insertion marker: '+date);
 const clean=html.replace(/<section class="brief-training-depth brief-stage-specialization" data-qily-brief-focus="[^"]+">[\s\S]*?<\/section>/g,'');
 const next=clean.replace(marker,render(date,item)+marker);
 if(next!==html){fs.writeFileSync(file,next);updated++;}
}
console.log('Brief functional differentiation materialized:',Object.keys(data.items).length,'targeted editions,',updated,'changed.');
