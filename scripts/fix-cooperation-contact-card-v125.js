#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

function rw(rel, fn){const p=path.join(root,rel);let s=fs.readFileSync(p,'utf8');const n=fn(s);if(n!==s)fs.writeFileSync(p,n,'utf8');}

// 1) Static cooperation card: two-character contact labels and explicit four-row action classes.
rw('cooperation/index.html', s=>{
  s=s.replace(/<span class="contact-action-label">官网邮箱：<\/span>/g,'<span class="contact-action-label">邮箱：</span>');
  s=s.replace(/<span>官网邮箱：<\/span>/g,'<span class="contact-action-label">邮箱：</span>');

  // Attribute-order independent normalization of the mail row.
  s=s.replace(/<a\b[^>]*href="mailto:admin@qilylean\.com"[^>]*>[\s\S]*?<\/a>/g,
    '<a class="contact-action contact-email-action" href="mailto:admin@qilylean.com"><span class="contact-action-label">邮箱：</span><strong class="contact-action-value">admin@qilylean.com</strong></a>');

  // Evidence row must be the same bordered action block.
  s=s.replace(/<a\b[^>]*href="\/projects\/"[^>]*>\s*先查看项目证据\s*<\/a>/g,
    '<a class="contact-action contact-evidence-action" href="/projects/">先查看项目证据</a>');

  // Normalize WeChat class order without touching its copy hook.
  s=s.replace(/class="wechat-contact-action contact-action"/g,'class="contact-action wechat-contact-action"');
  return s;
});

// 2) Runtime normalizers must not reintroduce 官网邮箱.
for(const rel of ['site-navigation.js','site-navigation-core.js']){
  if(!fs.existsSync(path.join(root,rel))) continue;
  rw(rel,s=>s
    .replace(/replace\(\/\^\\s\*官网邮箱/g,'replace(/^\\s*邮箱')
    .replace(/el\.textContent='官网邮箱：'/g,"el.textContent='邮箱：'")
  );
}

// 3) Maintenance source must preserve the same terminology.
if(fs.existsSync(path.join(root,'scripts/contact-v124-resilient.py'))){
  rw('scripts/contact-v124-resilient.py',s=>s
    .replace(/官网邮箱：/g,'邮箱：')
    .replace(/官网邮箱/g,'邮箱')
  );
}

// 4) Strong final visual layer. Four rows share the same border/surface; only phone & WeChat values remain underlined.
rw('site-shell.css', s=>{
  const start='/* QILY-COOPERATION-CONTACT-V12.5:START */';
  const end='/* QILY-COOPERATION-CONTACT-V12.5:END */';
  const block=`${start}\n.contact-card .contact-action,.contact-card .wechat-contact-action,.contact-card .contact-evidence-action{display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;width:100%!important;min-height:46px!important;margin-top:10px!important;padding:9px 14px!important;box-sizing:border-box!important;border:1px solid rgba(255,227,155,.52)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(255,255,255,.08)!important;text-decoration:none!important;border-radius:0!important;cursor:pointer!important;font:inherit!important;font-weight:900!important;transition:transform .16s ease,box-shadow .16s ease,background-color .16s ease,border-color .16s ease!important}\n.contact-card .contact-action:hover,.contact-card .contact-action:focus-visible,.contact-card .wechat-contact-action:hover,.contact-card .wechat-contact-action:focus-visible,.contact-card .contact-evidence-action:hover,.contact-card .contact-evidence-action:focus-visible{transform:translateY(-2px)!important;border-color:#ffe39b!important;background:rgba(255,255,255,.16)!important;box-shadow:0 8px 20px rgba(0,0,0,.16)!important;outline:2px solid rgba(255,227,155,.28)!important;outline-offset:2px!important}\n.contact-card .contact-action:active,.contact-card .wechat-contact-action:active,.contact-card .contact-evidence-action:active{transform:scale(.988)!important;background:#073c47!important}\n.contact-card .contact-action-label,.contact-card .contact-action>span,.contact-card .wechat-contact-action>span{text-decoration:none!important;text-decoration-line:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important}\n.contact-card .contact-action-value,.contact-card .contact-action>strong,.contact-card .wechat-contact-action>strong{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important;font-weight:950!important}\n.contact-card .contact-email-action .contact-action-value,.contact-card .contact-email-action strong{text-decoration:none!important;text-decoration-line:none!important}\n.contact-card .contact-evidence-action{text-decoration:none!important}\n${end}`;
  const re=new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\s\\S]*?'+end.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  if(re.test(s)) return s.replace(re,block);
  return s+'\n\n'+block+'\n';
});

// QA
const coop=fs.readFileSync(path.join(root,'cooperation/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'site-shell.css'),'utf8');
if(!coop.includes('>邮箱：</span>')) throw new Error('邮箱 label not normalized');
if(coop.includes('>官网邮箱：</span>')) throw new Error('官网邮箱 label remains in cooperation card');
if(!coop.includes('contact-email-action')) throw new Error('email action class missing');
if(!coop.includes('contact-evidence-action')) throw new Error('evidence action class missing');
if(!css.includes('QILY-COOPERATION-CONTACT-V12.5:START')) throw new Error('V12.5 CSS missing');
if(!css.includes('.contact-email-action .contact-action-value')) throw new Error('email underline override missing');
console.log('PASS: cooperation contact card V12.5 — four uniform bordered rows, 邮箱 label, email value no underline.');
