#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const a=read('about/index.html'),b=read('cn-site/about/index.html');
for(const [name,html,detail] of [['intl',a,'/experience/'],['cn',b,'/archive/profile/experience/']]){
 for(const token of ['data-qily-contact-parity="dual-v1"','qilylean-com-qr.svg','qilylean-cn-qr.svg','qilylean-wechat-qr.png','Qily259','admin@qilylean.com','href="'+detail+'"','id="experience"'])
   assert(html.includes(token),name+' missing '+token);
 assert.equal((html.match(/qily-unified-qr-card/g)||[]).length,3,name+' must show three QR cards');
 for(const phone of ['13450014003','15168120722','17681788259'])assert(html.includes('tel:'+phone));
}
for(const p of ['assets/contact/qilylean-com-qr.svg','assets/contact/qilylean-cn-qr.svg','assets/contact/qilylean-wechat-qr.png','cn-site/assets/contact/qilylean-com-qr.svg','cn-site/assets/contact/qilylean-cn-qr.svg','cn-site/assets/contact/qilylean-wechat-qr.png'])assert(fs.statSync(p).size>1000,p+' missing');
assert.equal(read('assets/contact/qily-about-contact-v1.css'),read('cn-site/assets/contact/qily-about-contact-v1.css'),'dual VI mismatch');
assert(read('site-navigation-core.js').includes("if (path.indexOf('/experience/') === 0) return '/about/';"));
assert(!read('cn-site/assets/cn-nav-rail-v1.js').includes("key:'experience',href:"));
assert(read('site-dock-share-runtime-v1.js').includes("var ORDER=['home','top','back','previous','search','current'];"));
for(const p of ['index.html','about/index.html','cn-site/index.html','cn-site/about/index.html']){
 const s=read(p),nav=[...s.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)].map(x=>x[0]).filter(t=>/aria-label=["'](?:主导航|QilyLean核心导视)["']|qily-global-nav/.test(t));
 for(const n of nav)assert(!/<a\b[^>]*href=["']\/(?:archive\/profile\/)?experience\/["'][^>]*>\s*履历主线\s*<\/a>/i.test(n),p+' top-level career remains');
 if(p.startsWith('cn-site/'))assert(s.includes('湘ICP备2026041143号-1')&&s.includes('湘公网安备43020002000443号'));
 else assert(!/<button\b[^>]*data-action=["']contact["']/.test(s),p+' footer Contact remains');
}
console.log('PASS: unified contact, both QRs, career module, navigation hierarchy, no footer Contact, China filings');
