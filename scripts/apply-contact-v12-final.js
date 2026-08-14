#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const OLD_WECHAT='\u5fae\u4fe1\u53f7';
const NEW_WECHAT='\u5fae\u4fe1';
const OLD_URL='\u5b98\u7f51\u7f51\u5740';
const NEW_URL='\u5b98\u65b9\u7f51\u5740';
const PROMPT='微信号Qily259已复制，是否开启微信主程序';
const exts=new Set(['.html','.js','.css','.json','.md','.py','.txt','.xml','.kt','.kts','.java']);
const skipDirs=new Set(['.git','.github','node_modules','docs','build','.gradle']);
const skipFiles=new Set(['apply-contact-v12-final.js','unify-wechat-official-url-contact-v12.js','preflight-contact-v12-cooperation.js']);
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isDirectory()&&skipDirs.has(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())walk(f,out);else if(exts.has(path.extname(e.name).toLowerCase())&&!skipFiles.has(e.name))out.push(f);}return out;}
function replaceBetween(text,startNeedle,endNeedle,replacement){const s=text.indexOf(startNeedle);if(s<0)return text;const e=text.indexOf(endNeedle,s);if(e<0)return text;return text.slice(0,s)+replacement+text.slice(e);}
function write(file,text){fs.writeFileSync(file,text,'utf8');}

let touched=0;
for(const file of walk(root)){
  let t;try{t=fs.readFileSync(file,'utf8');}catch{continue;}
  let n=t.split(OLD_URL).join(NEW_URL).split(OLD_WECHAT).join(NEW_WECHAT);
  n=n.replaceAll('site-shell.css?v=20260812-r2-stability-v1','site-shell.css?v=20260814-contact-v12');
  if(n!==t){write(file,n);touched++;}
}

// Global floating contact source.
const navPath=path.join(root,'site-navigation-core.js');
let nav=fs.readFileSync(navPath,'utf8');
nav=nav.replace("var SHARED_ASSET_VERSION = '20260812-r2-stability-v1';","var SHARED_ASSET_VERSION = '20260814-contact-v12';");
const wxStart='<p class=\\"qily-wechat\\">';
const phoneStart='<div class=\\"qily-phone-list\\">';
const wxReplacement='<div class=\\"qily-wechat-row\\"><button class=\\"qily-wechat-action\\" type=\\"button\\" data-qily-wechat-copy=\\"Qily259\\" aria-label=\\"复制微信 Qily259\\"><span>微信</span><strong>Qily259</strong></button></div>';
nav=replaceBetween(nav,wxStart,phoneStart,wxReplacement+phoneStart);
const oldHandlerStart="    contactMask.querySelector('.qily-copy-wechat')";
const emailHandlerStart="    contactMask.querySelector('.qily-copy-email')";
if(nav.includes(oldHandlerStart)&&nav.includes(emailHandlerStart)) nav=replaceBetween(nav,oldHandlerStart,emailHandlerStart,emailHandlerStart);
const marker='/* QILY-WECHAT-COPY-PROMPT-V12 */';
if(!nav.includes(marker)){
  const helper=`\n  ${marker}\n  function ensureWechatCopyPrompt(){\n    var p=document.getElementById('qilyWechatCopyPrompt');if(p)return p;\n    p=document.createElement('div');p.id='qilyWechatCopyPrompt';p.className='qily-wechat-copy-prompt';p.setAttribute('role','status');p.setAttribute('aria-live','polite');\n    p.innerHTML='<span>${PROMPT}</span><button type="button" data-qily-open-wechat>开启微信</button>';document.body.appendChild(p);\n    p.querySelector('[data-qily-open-wechat]').addEventListener('click',function(){p.classList.remove('show');try{window.location.href='weixin://';}catch(e){}setTimeout(function(){if(document.visibilityState==='visible')showToast('如未自动打开微信，请手动打开微信并粘贴Qily259');},1400);});\n    return p;\n  }\n  function positionWechatCopyPrompt(a,p){var r=a&&a.getBoundingClientRect?a.getBoundingClientRect():{right:innerWidth/2,left:innerWidth/2,top:innerHeight/2};p.style.left='12px';p.style.top='12px';requestAnimationFrame(function(){var b=p.getBoundingClientRect(),x=r.right+10;if(x+b.width>innerWidth-12)x=Math.max(12,r.left-b.width-10);var y=Math.max(12,Math.min(r.top,innerHeight-b.height-12));p.style.left=Math.round(x)+'px';p.style.top=Math.round(y)+'px';});}\n  function copyWechatAndPrompt(a){return copyText('Qily259').then(function(){var p=ensureWechatCopyPrompt();p.querySelector('span').textContent='${PROMPT}';positionWechatCopyPrompt(a,p);p.classList.add('show');clearTimeout(copyWechatAndPrompt.timer);copyWechatAndPrompt.timer=setTimeout(function(){p.classList.remove('show');},9000);});}\n  window.__qilyCopyWechatAndPrompt=copyWechatAndPrompt;\n  document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-qily-wechat-copy]');if(!t)return;e.preventDefault();copyWechatAndPrompt(t);});\n\n`;
  const anchor='  function shareUrl(';
  if(!nav.includes(anchor))throw new Error('shareUrl anchor missing');
  nav=nav.replace(anchor,helper+anchor);
}
if(!nav.includes('data-qily-wechat-copy=\\"Qily259\\"'))throw new Error('global clickable WeChat row missing');
if(nav.includes('qily-copy-wechat'))throw new Error('global dedicated copy button still present');
write(navPath,nav);

// Shared visual layer.
const shellPath=path.join(root,'site-shell.css');
let shell=fs.readFileSync(shellPath,'utf8');
const cStart='/* QILY-CONTACT-INTERACTION-V12:START */',cEnd='/* QILY-CONTACT-INTERACTION-V12:END */';
const block=`${cStart}\n.qily-contact-panel{width:min(94vw,520px)!important;padding:22px 25px 24px!important}\n.qily-contact-panel h3{margin:5px 0 8px!important;font-size:27px!important;line-height:1.15!important}\n.qily-contact-panel .qily-contact-qr{width:min(54vw,220px)!important;max-width:220px!important;margin:7px auto 9px!important}\n.qily-wechat-row{display:flex!important;justify-content:center!important;margin:7px 0 11px!important}\n.qily-wechat-action{display:flex!important;width:min(100%,390px)!important;min-height:48px!important;align-items:center!important;justify-content:center!important;gap:12px!important;padding:9px 14px!important;border:1px solid #b8d9d4!important;border-radius:11px!important;color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;background:#f6fbfa!important;cursor:pointer!important;font:inherit!important;font-size:18px!important;font-weight:850!important;box-shadow:none!important}\n.qily-wechat-action strong{color:#073c47!important;-webkit-text-fill-color:#073c47!important;font-size:22px!important;font-weight:950!important;text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important}\n.qily-wechat-action:hover,.qily-wechat-action:focus-visible{border-color:#caa15f!important;background:#fff8e8!important;outline:3px solid rgba(202,161,95,.2)!important;outline-offset:2px!important}\n.qily-contact-panel .qily-phone-list{gap:9px!important;margin:13px 0 2px!important;padding-top:13px!important}\n.qily-contact-panel .qily-phone-list>div,.qily-contact-panel .qily-email-list>div{font-size:17px!important;font-weight:900!important;line-height:1.35!important}\n.qily-contact-panel .qily-phone-list a{min-height:48px!important;padding:9px 13px!important;font-size:19px!important;line-height:1.3!important}\n.qily-contact-panel .qily-phone-city{font-size:17px!important}.qily-contact-panel .qily-phone-number{font-size:21px!important}\n.qily-contact-panel .qily-email-list{padding-top:13px!important;margin-top:13px!important}.qily-contact-panel .qily-contact-email{font-size:19px!important;line-height:1.35!important}\n.qily-contact-panel .qily-email-actions{margin-top:9px!important}.qily-contact-panel .qily-email-actions button,.qily-contact-panel .qily-email-actions a{min-height:44px!important;font-size:17px!important}\n.qily-wechat-copy-prompt{position:fixed;z-index:12050;display:flex;max-width:min(430px,calc(100vw - 24px));align-items:center;gap:9px;padding:10px 12px;border:1px solid #caa15f;border-radius:12px;color:#17322d;background:#fff8e8;box-shadow:0 14px 34px rgba(7,60,71,.22);font-size:14px;font-weight:850;line-height:1.45;opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .16s ease,transform .16s ease,visibility .16s ease}\n.qily-wechat-copy-prompt.show{opacity:1;visibility:visible;transform:translateY(0)}.qily-wechat-copy-prompt button{flex:0 0 auto;min-height:36px;padding:6px 10px;border:0;border-radius:8px;color:#fff;background:#0f4b5a;cursor:pointer;font:inherit;font-weight:900}\n@media(max-width:620px){.qily-contact-panel{width:min(96vw,460px)!important;padding:20px 18px!important}.qily-contact-panel h3{font-size:25px!important}.qily-contact-panel .qily-contact-qr{width:min(58vw,210px)!important}.qily-wechat-action{font-size:17px!important}.qily-wechat-action strong{font-size:20px!important}.qily-wechat-copy-prompt{left:12px!important;right:12px!important;top:auto!important;bottom:18px!important;max-width:none!important;justify-content:space-between}}\n${cEnd}`;
if(shell.includes(cStart)&&shell.includes(cEnd)) shell=replaceBetween(shell,cStart,cEnd,block+cEnd); else shell+='\n\n'+block+'\n';
write(shellPath,shell);

// Cooperation whole-row button.
const coopPath=path.join(root,'cooperation','index.html');
let coop=fs.readFileSync(coopPath,'utf8');
const bStart='<button type="button" id="copyWechat"';
if(coop.includes(bStart)){
  const s=coop.indexOf(bStart),e=coop.indexOf('</button>',s);
  if(e<0)throw new Error('cooperation WeChat closing button missing');
  const btn='<button type="button" id="copyWechat" class="wechat-contact-action" data-qily-wechat-copy="Qily259" aria-label="复制微信 Qily259"><span>微信：</span><strong>Qily259</strong></button>';
  coop=coop.slice(0,s)+btn+coop.slice(e+'</button>'.length);
}
const whStart="      wechatButton.addEventListener('click'";
if(coop.includes(whStart)){
  const s=coop.indexOf(whStart),e=coop.indexOf('\n    })();',s);if(e>0)coop=coop.slice(0,s)+coop.slice(e);
}
if(!coop.includes('class="wechat-contact-action" data-qily-wechat-copy="Qily259"'))throw new Error('cooperation whole-row WeChat button missing');
write(coopPath,coop);

// OPL/terminology.
const termPath=path.join(root,'knowledge','terminology.html');
let term=fs.readFileSync(termPath,'utf8');
if(term.includes('data-opl-copy-wechat="Qily259"')&&!term.includes('data-qily-wechat-copy="Qily259"'))term=term.replace('data-opl-copy-wechat="Qily259"','data-opl-copy-wechat="Qily259" data-qily-wechat-copy="Qily259"');
const twStart='  if(wechatCopy){',twEnd="  if(event.target.closest('[data-opl-link]'))";
if(term.includes(twStart)&&term.includes(twEnd)){
  const rep=`  if(wechatCopy){\n    event.preventDefault();event.stopPropagation();\n    if(window.__qilyCopyWechatAndPrompt)window.__qilyCopyWechatAndPrompt(wechatCopy);\n    else copyText(wechatCopy.getAttribute('data-opl-copy-wechat')||wechatCopy.textContent||'Qily259').then(function(){toast('${PROMPT}');}).catch(function(){toast('复制失败，请手动复制微信');});\n    return;\n  }\n`;
  term=replaceBetween(term,twStart,twEnd,rep+twEnd);
}
if(!term.includes('微信：<a href="#copy-wechat"'))throw new Error('OPL WeChat label missing');
write(termPath,term);

// Legacy panel, if any.
const legacyPath=path.join(root,'qilylean','contact-wechat-open.js');
if(fs.existsSync(legacyPath)){
  let legacy=fs.readFileSync(legacyPath,'utf8');
  legacy=legacy.replace("oldCopy.textContent='复制微信并打开微信';","oldCopy.textContent='微信：Qily259';");
  legacy=legacy.replace("oldCopy.textContent='复制微信打开微信';","oldCopy.textContent='微信：Qily259';");
  const ls='      oldCopy.onclick=function(e){',le='\n      };';
  if(legacy.includes(ls)){
    const rep=`      oldCopy.onclick=function(e){e.preventDefault();e.stopPropagation();if(window.__qilyCopyWechatAndPrompt){window.__qilyCopyWechatAndPrompt(oldCopy);return;}copyText(WECHAT_ID).then(function(){var toast=document.getElementById('floatToast');if(toast){toast.textContent='${PROMPT}';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},3000);}});`;
    legacy=replaceBetween(legacy,ls,le,rep+le);
  }
  write(legacyPath,legacy);
}

// Key QA.
const key=[navPath,coopPath,termPath];
for(const f of key){const t=fs.readFileSync(f,'utf8'),c=t.split(PROMPT).join('');if(c.includes(OLD_URL))throw new Error(path.basename(f)+' still has old URL label');if(c.includes(OLD_WECHAT))throw new Error(path.basename(f)+' still has old WeChat label');}
if(!fs.readFileSync(shellPath,'utf8').includes(cStart))throw new Error('V12 CSS missing');
console.log('FINAL V12 PASS; generic text sources touched:',touched);
