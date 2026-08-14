#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

function rw(rel, fn){const p=path.join(root,rel);let s=fs.readFileSync(p,'utf8');const n=fn(s);if(n!==s)fs.writeFileSync(p,n,'utf8');}

// 1) Static cooperation card: normalize all four rows into one component family.
rw('cooperation/index.html', s=>{
  s=s.replace(/<span class="contact-action-label">官网邮箱：<\/span>/g,'<span class="contact-action-label">邮箱：</span>');
  s=s.replace(/<span>官网邮箱：<\/span>/g,'<span class="contact-action-label">邮箱：</span>');

  s=s.replace(/<a\b[^>]*href="mailto:admin@qilylean\.com"[^>]*>[\s\S]*?<\/a>/g,
    '<a class="contact-action contact-email-action qily-uniform-contact-row" href="mailto:admin@qilylean.com"><span class="contact-action-label">邮箱：</span><strong class="contact-action-value">admin@qilylean.com</strong></a>');

  s=s.replace(/class="contact-action contact-phone-action(?! qily-uniform-contact-row)"/g,'class="contact-action contact-phone-action qily-uniform-contact-row"');
  s=s.replace(/class="contact-action wechat-contact-action(?! qily-uniform-contact-row)"/g,'class="contact-action wechat-contact-action qily-uniform-contact-row"');
  s=s.replace(/class="wechat-contact-action contact-action"/g,'class="contact-action wechat-contact-action qily-uniform-contact-row"');

  s=s.replace(/<a\b[^>]*href="\/projects\/"[^>]*>\s*先查看项目证据\s*<\/a>/g,
    '<a class="contact-action contact-evidence-action qily-uniform-contact-row" href="/projects/">先查看项目证据</a>');

  // Cache-bust the common shell so public browsers cannot remain on an older visual layer.
  s=s.replace(/\/site-shell\.css\?v=[^"']+/g,'/site-shell.css?v=20260814-cooperation-uniform-v127');

  // Page-level hard stop. This sits after every external stylesheet, so later global link/button rules cannot
  // make email/evidence lighter than phone/WeChat. Use an OPAQUE surface: translucent fills over the parent gradient
  // were the root cause of apparent row-to-row color differences.
  const pageStart='<!-- QILY-COOPERATION-CONTACT-PAGE-V12.7:START -->';
  const pageEnd='<!-- QILY-COOPERATION-CONTACT-PAGE-V12.7:END -->';
  const pageBlock=`${pageStart}\n<style id="qilyCooperationContactUniformV127">\nbody.cooperation-page .contact-card .qily-uniform-contact-row,\nbody.cooperation-page .contact-card button.qily-uniform-contact-row,\nbody.cooperation-page .contact-card a.qily-uniform-contact-row:link,\nbody.cooperation-page .contact-card a.qily-uniform-contact-row:visited{\n  display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;\n  width:100%!important;min-height:46px!important;margin-top:10px!important;padding:9px 14px!important;\n  box-sizing:border-box!important;border:1px solid #caa15f!important;border-radius:0!important;\n  background:#105564!important;background-color:#105564!important;background-image:none!important;\n  color:#fff!important;-webkit-text-fill-color:#fff!important;text-decoration:none!important;\n  cursor:pointer!important;font:inherit!important;font-weight:900!important;appearance:none!important;-webkit-appearance:none!important;\n  box-shadow:none!important;\n}\nbody.cooperation-page .contact-card .qily-uniform-contact-row:hover,\nbody.cooperation-page .contact-card .qily-uniform-contact-row:focus-visible,\nbody.cooperation-page .contact-card .qily-uniform-contact-row:active{\n  background:#105564!important;background-color:#105564!important;background-image:none!important;\n  border-color:#ffe39b!important;color:#fff!important;-webkit-text-fill-color:#fff!important;\n}\nbody.cooperation-page .contact-card .qily-uniform-contact-row:focus-visible{outline:2px solid #ffe39b!important;outline-offset:2px!important}\nbody.cooperation-page .contact-card .contact-action-label{color:#fff!important;-webkit-text-fill-color:#fff!important;text-decoration:none!important}\nbody.cooperation-page .contact-card .contact-action-value{color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:950!important}\nbody.cooperation-page .contact-card .contact-evidence-action{text-decoration:none!important}\n</style>\n${pageEnd}`;
  const pageRe=new RegExp(pageStart.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\s\\S]*?'+pageEnd.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  if(pageRe.test(s)) s=s.replace(pageRe,pageBlock);
  else s=s.replace(/<\/head>/,pageBlock+'\n</head>');
  return s;
});

// 2) Runtime normalizers must not reintroduce old email wording.
for(const rel of ['site-navigation.js','site-navigation-core.js']){
  if(!fs.existsSync(path.join(root,rel))) continue;
  rw(rel,s=>s
    .replace(/replace\(\/\^\\s\*官网邮箱/g,'replace(/^\\s*邮箱')
    .replace(/el\.textContent='官网邮箱：'/g,"el.textContent='邮箱：'")
  );
}

// 3) Maintenance source preserves the same terminology.
if(fs.existsSync(path.join(root,'scripts/contact-v124-resilient.py'))){
  rw('scripts/contact-v124-resilient.py',s=>s
    .replace(/官网邮箱：/g,'邮箱：')
    .replace(/官网邮箱/g,'邮箱')
  );
}

// 4) Common shell fallback: identical OPAQUE background + identical SOLID border for the four rows.
rw('site-shell.css', s=>{
  const start='/* QILY-COOPERATION-CONTACT-V12.5:START */';
  const end='/* QILY-COOPERATION-CONTACT-V12.5:END */';
  const block=`${start}\n.contact-card .qily-uniform-contact-row,.contact-card .contact-action,.contact-card .wechat-contact-action,.contact-card .contact-evidence-action,.contact-card a.qily-uniform-contact-row:link,.contact-card a.qily-uniform-contact-row:visited{display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;width:100%!important;min-height:46px!important;margin-top:10px!important;padding:9px 14px!important;box-sizing:border-box!important;border:1px solid #caa15f!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:#105564!important;background-color:#105564!important;background-image:none!important;text-decoration:none!important;border-radius:0!important;cursor:pointer!important;font:inherit!important;font-weight:900!important;appearance:none!important;-webkit-appearance:none!important;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important}\n.contact-card .qily-uniform-contact-row:hover,.contact-card .qily-uniform-contact-row:focus-visible,.contact-card .contact-action:hover,.contact-card .contact-action:focus-visible,.contact-card .wechat-contact-action:hover,.contact-card .wechat-contact-action:focus-visible,.contact-card .contact-evidence-action:hover,.contact-card .contact-evidence-action:focus-visible{background:#105564!important;background-color:#105564!important;background-image:none!important;border-color:#ffe39b!important;box-shadow:0 8px 20px rgba(0,0,0,.18)!important;outline:2px solid rgba(255,227,155,.34)!important;outline-offset:2px!important;transform:translateY(-2px)!important}\n.contact-card .qily-uniform-contact-row:active,.contact-card .contact-action:active,.contact-card .wechat-contact-action:active,.contact-card .contact-evidence-action:active{background:#105564!important;background-color:#105564!important;background-image:none!important;border-color:#ffe39b!important;box-shadow:0 4px 12px rgba(0,0,0,.16)!important;transform:scale(.988)!important}\n.contact-card .contact-action-label,.contact-card .contact-action>span,.contact-card .wechat-contact-action>span{text-decoration:none!important;text-decoration-line:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important}\n.contact-card .contact-action-value,.contact-card .contact-action>strong,.contact-card .wechat-contact-action>strong{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important;font-weight:950!important}\n.contact-card .contact-email-action .contact-action-value,.contact-card .contact-email-action strong{text-decoration:none!important;text-decoration-line:none!important}\n.contact-card .contact-evidence-action{text-decoration:none!important}\n${end}`;
  const re=new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\s\\S]*?'+end.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  if(re.test(s)) return s.replace(re,block);
  return s+'\n\n'+block+'\n';
});

// QA: fail publication if any one of the four rows can fall out of the unified visual contract.
const coop=fs.readFileSync(path.join(root,'cooperation/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'site-shell.css'),'utf8');
if(!coop.includes('>邮箱：</span>')) throw new Error('邮箱 label not normalized');
if(coop.includes('>官网邮箱：</span>')) throw new Error('官网邮箱 label remains in cooperation card');
if(!coop.includes('contact-email-action qily-uniform-contact-row')) throw new Error('email uniform row class missing');
if(!coop.includes('contact-phone-action qily-uniform-contact-row')) throw new Error('phone uniform row class missing');
if(!coop.includes('wechat-contact-action qily-uniform-contact-row')) throw new Error('wechat uniform row class missing');
if(!coop.includes('contact-evidence-action qily-uniform-contact-row')) throw new Error('evidence uniform row class missing');
if(!coop.includes('site-shell.css?v=20260814-cooperation-uniform-v127')) throw new Error('V12.7 shell cache bust missing');
if(!coop.includes('QILY-COOPERATION-CONTACT-PAGE-V12.7:START')) throw new Error('V12.7 page hard-stop missing');
if(!coop.includes('background:#105564!important')) throw new Error('opaque uniform page surface missing');
if(!coop.includes('border:1px solid #caa15f!important')) throw new Error('solid uniform page border missing');
if(!css.includes('background:#105564!important')) throw new Error('opaque uniform shell surface missing');
if(!css.includes('border:1px solid #caa15f!important')) throw new Error('solid uniform shell border missing');
console.log('PASS: cooperation contact V12.7 — 电话/邮箱/微信/项目证据 use one opaque background and one solid four-side border.');
